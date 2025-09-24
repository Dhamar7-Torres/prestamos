import prisma from '../config/database.js';
import { MESSAGES } from '../utils/constants.js';
import { parseDecimal } from '../utils/helpers.js';
import prestamoService from './prestamoService.js';

class PagoService {
  // Filtrar campos válidos para el modelo Pago
  #filtrarCamposPago(data) {
    return {
      prestamoId: data.prestamoId,
      monto: parseDecimal(data.monto),
      montoCapital: parseDecimal(data.montoCapital || 0),
      montoInteres: parseDecimal(data.montoInteres || 0),
      montoMora: parseDecimal(data.montoMora || 0),
      metodoPago: data.metodoPago || 'efectivo',
      esCuota: Boolean(data.esCuota),
      numeroCuota: data.numeroCuota ? parseInt(data.numeroCuota) : null,
      // NO incluir numeroTransaccion ni descripcion
    };
  }

  async obtenerTodos(opciones = {}) {
    const { 
      page = 1, 
      limit = 10, 
      prestamoId, 
      personaId,
      metodoPago,
      fechaDesde,
      fechaHasta,
      ordenarPor = 'fechaPago',
      orden = 'desc'
    } = opciones;
    
    const skip = (page - 1) * limit;

    const where = {
      ...(prestamoId && { prestamoId: parseInt(prestamoId) }),
      ...(personaId && { 
        prestamo: { 
          personaId: parseInt(personaId) 
        } 
      }),
      ...(metodoPago && { metodoPago }),
      ...(fechaDesde || fechaHasta) && {
        fechaPago: {
          ...(fechaDesde && { gte: new Date(fechaDesde) }),
          ...(fechaHasta && { lte: new Date(fechaHasta) })
        }
      }
    };

    const [pagos, total] = await Promise.all([
      prisma.pago.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [ordenarPor]: orden },
        include: {
          prestamo: {
            include: {
              persona: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true,
                  telefono: true
                }
              }
            }
          }
        }
      }),
      prisma.pago.count({ where })
    ]);

    return { pagos, total };
  }

  async obtenerPorId(id) {
    const pago = await prisma.pago.findUnique({
      where: { id },
      include: {
        prestamo: {
          include: {
            persona: true
          }
        }
      }
    });

    if (!pago) {
      throw new Error('Pago no encontrado');
    }

    return pago;
  }

  async crear(data) {
    return await prisma.$transaction(async (tx) => {
      // Verificar que el préstamo existe y obtener datos actuales
      const prestamo = await tx.prestamo.findUnique({
        where: { id: data.prestamoId }
      });

      if (!prestamo) {
        throw new Error(MESSAGES.PRESTAMO.NOT_FOUND);
      }

      if (prestamo.completado) {
        throw new Error(MESSAGES.PRESTAMO.ALREADY_COMPLETED);
      }

      const montoPago = parseDecimal(data.monto);
      const montoRestante = parseDecimal(prestamo.montoRestante);

      // Validar que el pago no exceda la deuda restante
      if (montoPago > montoRestante) {
        throw new Error(MESSAGES.PRESTAMO.PAYMENT_EXCEEDS_DEBT);
      }

      // Filtrar datos antes de crear el pago
      const datosPago = this.#filtrarCamposPago(data);
      
      console.log('🔍 Datos filtrados para Prisma:', datosPago);

      // Crear el pago con datos filtrados
      const pago = await tx.pago.create({
        data: datosPago,
        include: {
          prestamo: {
            include: {
              persona: true
            }
          }
        }
      });

      // Recalcular totales del préstamo
      const nuevoMontoPagado = parseDecimal(prestamo.montoPagado) + montoPago;
      const nuevoMontoRestante = parseDecimal(prestamo.montoTotal) - nuevoMontoPagado;
      const completado = nuevoMontoRestante <= 0;

      // Actualizar préstamo
      const prestamoActualizado = await tx.prestamo.update({
        where: { id: data.prestamoId },
        data: {
          montoPagado: nuevoMontoPagado,
          montoRestante: Math.max(0, nuevoMontoRestante),
          completado,
          fechaCompletado: completado && !prestamo.fechaCompletado ? new Date() : prestamo.fechaCompletado,
          estado: completado ? 'completado' : prestamo.estado,
          cuotasPagadas: data.esCuota ? prestamo.cuotasPagadas + 1 : prestamo.cuotasPagadas
        }
      });

      return {
        pago,
        prestamo: prestamoActualizado
      };
    });
  }

  async actualizar(id, data) {
    return await prisma.$transaction(async (tx) => {
      // Obtener el pago actual
      const pagoActual = await tx.pago.findUnique({
        where: { id },
        include: { prestamo: true }
      });

      if (!pagoActual) {
        throw new Error('Pago no encontrado');
      }

      // Filtrar datos para actualización
      const datosActualizacion = this.#filtrarCamposPago(data);
      
      console.log('🔍 Datos de actualización filtrados:', datosActualizacion);

      // Actualizar el pago
      const pagoActualizado = await tx.pago.update({
        where: { id },
        data: datosActualizacion,
        include: {
          prestamo: {
            include: {
              persona: true
            }
          }
        }
      });

      // Si cambió el monto, recalcular totales del préstamo
      if (data.monto && parseDecimal(data.monto) !== parseDecimal(pagoActual.monto)) {
        await this.recalcularPrestamoTrasModificacionPago(pagoActual.prestamoId, tx);
      }

      return pagoActualizado;
    });
  }

  async eliminar(id) {
    return await prisma.$transaction(async (tx) => {
      // Obtener el pago a eliminar
      const pago = await tx.pago.findUnique({
        where: { id }
      });

      if (!pago) {
        throw new Error('Pago no encontrado');
      }

      // Eliminar el pago
      await tx.pago.delete({
        where: { id }
      });

      // Recalcular totales del préstamo
      await this.recalcularPrestamoTrasModificacionPago(pago.prestamoId, tx);

      return true;
    });
  }

  async recalcularPrestamoTrasModificacionPago(prestamoId, tx = prisma) {
    // Obtener todos los pagos del préstamo
    const pagos = await tx.pago.findMany({
      where: { prestamoId }
    });

    const totalPagado = pagos.reduce((sum, pago) => sum + parseDecimal(pago.monto), 0);
    const cuotasPagadas = pagos.filter(pago => pago.esCuota).length;

    // Obtener el préstamo
    const prestamo = await tx.prestamo.findUnique({
      where: { id: prestamoId }
    });

    if (!prestamo) {
      throw new Error(MESSAGES.PRESTAMO.NOT_FOUND);
    }

    const montoTotal = parseDecimal(prestamo.montoTotal);
    const montoRestante = Math.max(0, montoTotal - totalPagado);
    const completado = montoRestante <= 0;

    // Actualizar préstamo
    await tx.prestamo.update({
      where: { id: prestamoId },
      data: {
        montoPagado: totalPagado,
        montoRestante,
        completado,
        cuotasPagadas,
        fechaCompletado: completado && !prestamo.fechaCompletado ? new Date() : 
                        !completado ? null : prestamo.fechaCompletado,
        estado: completado ? 'completado' : 
                !completado && prestamo.estado === 'completado' ? 'activo' : prestamo.estado
      }
    });
  }

  async obtenerEstadisticasPorMetodo() {
    const estadisticas = await prisma.pago.groupBy({
      by: ['metodoPago'],
      _sum: {
        monto: true
      },
      _count: {
        id: true
      }
    });

    return estadisticas.map(stat => ({
      metodo: stat.metodoPago,
      totalMonto: stat._sum.monto || 0,
      cantidadPagos: stat._count.id
    }));
  }

  async obtenerPagosPorPeriodo(fechaInicio, fechaFin) {
    const pagos = await prisma.pago.findMany({
      where: {
        fechaPago: {
          gte: new Date(fechaInicio),
          lte: new Date(fechaFin)
        }
      },
      include: {
        prestamo: {
          include: {
            persona: {
              select: {
                nombre: true,
                apellido: true
              }
            }
          }
        }
      },
      orderBy: { fechaPago: 'desc' }
    });

    const totalMonto = pagos.reduce((sum, pago) => sum + parseDecimal(pago.monto), 0);

    return {
      pagos,
      resumen: {
        totalPagos: pagos.length,
        montoTotal: totalMonto,
        fechaInicio,
        fechaFin
      }
    };
  }

  async obtenerHistorialPersona(personaId, limite = 10) {
    const pagos = await prisma.pago.findMany({
      where: {
        prestamo: {
          personaId: parseInt(personaId)
        }
      },
      include: {
        prestamo: {
          select: {
            id: true,
            descripcion: true,
            montoTotal: true
          }
        }
      },
      orderBy: { fechaPago: 'desc' },
      take: limite
    });

    return pagos;
  }
}

export default new PagoService();