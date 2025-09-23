import prisma from '../config/database.js';
import { MESSAGES } from '../utils/constants.js';
import { parseDecimal } from '../utils/helpers.js';

class PrestamoService {
  async obtenerTodos(opciones = {}) {
    const { 
      page = 1, 
      limit = 10, 
      personaId, 
      estado, 
      completado,
      ordenarPor = 'createdAt',
      orden = 'desc'
    } = opciones;
    
    const skip = (page - 1) * limit;

    const where = {
      ...(personaId && { personaId: parseInt(personaId) }),
      ...(estado && { estado }),
      ...(completado !== undefined && { completado: completado === 'true' })
    };

    const [prestamos, total] = await Promise.all([
      prisma.prestamo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [ordenarPor]: orden },
        include: {
          persona: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              telefono: true,
              email: true
            }
          },
          pagos: {
            orderBy: { fechaPago: 'desc' },
            take: 5
          },
          _count: {
            select: { pagos: true }
          }
        }
      }),
      prisma.prestamo.count({ where })
    ]);

    return { prestamos, total };
  }

  async obtenerPorId(id) {
    const prestamo = await prisma.prestamo.findUnique({
      where: { id },
      include: {
        persona: true,
        pagos: {
          orderBy: { fechaPago: 'desc' }
        },
        recordatorios: {
          where: { activo: true },
          orderBy: { fechaRecordatorio: 'asc' }
        }
      }
    });

    if (!prestamo) {
      throw new Error(MESSAGES.PRESTAMO.NOT_FOUND);
    }

    return prestamo;
  }

  async crear(data) {
    // Verificar que la persona existe
    const persona = await prisma.persona.findUnique({
      where: { id: data.personaId }
    });

    if (!persona) {
      throw new Error(MESSAGES.PERSONA.NOT_FOUND);
    }

    // Calcular montoRestante
    const montoTotal = parseDecimal(data.montoTotal);
    const dataPrestamo = {
      ...data,
      montoTotal,
      montoRestante: montoTotal,
      montoPagado: 0
    };

    const prestamo = await prisma.prestamo.create({
      data: dataPrestamo,
      include: {
        persona: true,
        pagos: true
      }
    });

    return prestamo;
  }

  async actualizar(id, data) {
    // Verificar que el préstamo existe
    const prestamoExistente = await this.obtenerPorId(id);

    // Si se actualiza montoTotal, recalcular montoRestante
    const dataActualizada = { ...data };
    if (data.montoTotal !== undefined) {
      const nuevoMontoTotal = parseDecimal(data.montoTotal);
      const montoPagado = parseDecimal(prestamoExistente.montoPagado);
      dataActualizada.montoTotal = nuevoMontoTotal;
      dataActualizada.montoRestante = Math.max(0, nuevoMontoTotal - montoPagado);
      dataActualizada.completado = dataActualizada.montoRestante <= 0;
    }

    const prestamo = await prisma.prestamo.update({
      where: { id },
      data: dataActualizada,
      include: {
        persona: true,
        pagos: {
          orderBy: { fechaPago: 'desc' }
        }
      }
    });

    return prestamo;
  }

  async eliminar(id) {
    // Verificar que el préstamo exists
    await this.obtenerPorId(id);

    await prisma.prestamo.delete({
      where: { id }
    });

    return true;
  }

  async obtenerEstadisticas() {
    const [
      totales,
      prestamosActivos,
      prestamosCompletados,
      prestamosVencidos
    ] = await Promise.all([
      prisma.prestamo.aggregate({
        _sum: {
          montoTotal: true,
          montoPagado: true,
          montoRestante: true
        },
        _count: { id: true }
      }),
      prisma.prestamo.count({
        where: { completado: false }
      }),
      prisma.prestamo.count({
        where: { completado: true }
      }),
      prisma.prestamo.count({
        where: {
          AND: [
            { completado: false },
            { fechaVencimiento: { lt: new Date() } }
          ]
        }
      })
    ]);

    return {
      totales: {
        montoTotal: totales._sum.montoTotal || 0,
        montoPagado: totales._sum.montoPagado || 0,
        montoRestante: totales._sum.montoRestante || 0,
        totalPrestamos: totales._count.id || 0
      },
      estados: {
        activos: prestamosActivos,
        completados: prestamosCompletados,
        vencidos: prestamosVencidos
      }
    };
  }

  async obtenerProximosVencimientos(dias = 7) {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + dias);

    const prestamos = await prisma.prestamo.findMany({
      where: {
        AND: [
          { completado: false },
          { fechaVencimiento: { lte: fechaLimite } },
          { fechaVencimiento: { gte: new Date() } }
        ]
      },
      include: {
        persona: {
          select: {
            nombre: true,
            apellido: true,
            telefono: true,
            email: true
          }
        }
      },
      orderBy: { fechaVencimiento: 'asc' }
    });

    return prestamos;
  }

  async recalcularTotales(prestamoId) {
    // Obtener todos los pagos del préstamo
    const pagos = await prisma.pago.findMany({
      where: { prestamoId }
    });

    const totalPagado = pagos.reduce((sum, pago) => sum + parseDecimal(pago.monto), 0);

    // Obtener el préstamo actual
    const prestamo = await prisma.prestamo.findUnique({
      where: { id: prestamoId }
    });

    if (!prestamo) {
      throw new Error(MESSAGES.PRESTAMO.NOT_FOUND);
    }

    const montoTotal = parseDecimal(prestamo.montoTotal);
    const montoRestante = Math.max(0, montoTotal - totalPagado);
    const completado = montoRestante <= 0;

    // Actualizar el préstamo
    const prestamoActualizado = await prisma.prestamo.update({
      where: { id: prestamoId },
      data: {
        montoPagado: totalPagado,
        montoRestante,
        completado,
        fechaCompletado: completado && !prestamo.fechaCompletado ? new Date() : prestamo.fechaCompletado,
        estado: completado ? 'completado' : prestamo.estado
      },
      include: {
        persona: true,
        pagos: {
          orderBy: { fechaPago: 'desc' }
        }
      }
    });

    return prestamoActualizado;
  }
}

export default new PrestamoService();