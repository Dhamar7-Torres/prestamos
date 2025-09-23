import prisma from '../config/database.js';
import { MESSAGES } from '../utils/constants.js';
import { sanitizeString } from '../utils/helpers.js';

class PersonaService {
  async obtenerTodas(opciones = {}) {
    const { page = 1, limit = 10, buscar = '', incluirInactivas = false } = opciones;
    const skip = (page - 1) * limit;

    const where = {
      ...(buscar && {
        OR: [
          { nombre: { contains: buscar, mode: 'insensitive' } },
          { apellido: { contains: buscar, mode: 'insensitive' } },
          { email: { contains: buscar, mode: 'insensitive' } },
          { telefono: { contains: buscar } },
          { cedula: { contains: buscar } }
        ]
      }),
      ...((!incluirInactivas) && { activo: true })
    };

    const [personas, total] = await Promise.all([
      prisma.persona.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              prestamos: true
            }
          }
        }
      }),
      prisma.persona.count({ where })
    ]);

    return { personas, total };
  }

  async obtenerPorId(id) {
    const persona = await prisma.persona.findUnique({
      where: { id },
      include: {
        prestamos: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { pagos: true }
            }
          }
        },
        _count: {
          select: {
            prestamos: true
          }
        }
      }
    });

    if (!persona) {
      throw new Error(MESSAGES.PERSONA.NOT_FOUND);
    }

    return persona;
  }

  async crear(data) {
    // Sanitizar datos de entrada
    const dataSanitizada = {
      ...data,
      nombre: sanitizeString(data.nombre),
      apellido: data.apellido ? sanitizeString(data.apellido) : null,
      email: data.email ? data.email.toLowerCase().trim() : null,
      telefono: data.telefono ? data.telefono.replace(/\s/g, '') : null,
      cedula: data.cedula ? data.cedula.replace(/\s/g, '') : null
    };

    // Verificar si ya existe una persona con la misma cédula
    if (dataSanitizada.cedula) {
      const personaExistente = await prisma.persona.findUnique({
        where: { cedula: dataSanitizada.cedula }
      });

      if (personaExistente) {
        throw new Error(MESSAGES.PERSONA.DUPLICATE_CEDULA);
      }
    }

    const persona = await prisma.persona.create({
      data: dataSanitizada,
      include: {
        _count: {
          select: {
            prestamos: true
          }
        }
      }
    });

    return persona;
  }

  async actualizar(id, data) {
    // Verificar que la persona existe
    await this.obtenerPorId(id);

    // Sanitizar datos
    const dataSanitizada = {
      ...data,
      ...(data.nombre && { nombre: sanitizeString(data.nombre) }),
      ...(data.apellido && { apellido: sanitizeString(data.apellido) }),
      ...(data.email && { email: data.email.toLowerCase().trim() }),
      ...(data.telefono && { telefono: data.telefono.replace(/\s/g, '') }),
      ...(data.cedula && { cedula: data.cedula.replace(/\s/g, '') })
    };

    // Verificar cédula única si se está actualizando
    if (dataSanitizada.cedula) {
      const personaConCedula = await prisma.persona.findUnique({
        where: { cedula: dataSanitizada.cedula }
      });

      if (personaConCedula && personaConCedula.id !== id) {
        throw new Error(MESSAGES.PERSONA.DUPLICATE_CEDULA);
      }
    }

    const persona = await prisma.persona.update({
      where: { id },
      data: dataSanitizada,
      include: {
        _count: {
          select: {
            prestamos: true
          }
        }
      }
    });

    return persona;
  }

  async eliminar(id) {
    // Verificar que la persona existe
    await this.obtenerPorId(id);

    // Verificar si tiene préstamos activos
    const prestamosActivos = await prisma.prestamo.count({
      where: {
        personaId: id,
        completado: false
      }
    });

    if (prestamosActivos > 0) {
      throw new Error('No se puede eliminar una persona con préstamos activos');
    }

    await prisma.persona.delete({
      where: { id }
    });

    return true;
  }

  async obtenerEstadisticas(id) {
    const persona = await this.obtenerPorId(id);

    const estadisticas = await prisma.prestamo.aggregate({
      where: { personaId: id },
      _sum: {
        montoTotal: true,
        montoPagado: true,
        montoRestante: true
      },
      _count: {
        id: true
      }
    });

    const prestamosActivos = await prisma.prestamo.count({
      where: {
        personaId: id,
        completado: false
      }
    });

    const prestamosCompletados = await prisma.prestamo.count({
      where: {
        personaId: id,
        completado: true
      }
    });

    return {
      persona: {
        id: persona.id,
        nombre: persona.nombre,
        apellido: persona.apellido
      },
      totales: {
        montoTotal: estadisticas._sum.montoTotal || 0,
        montoPagado: estadisticas._sum.montoPagado || 0,
        montoRestante: estadisticas._sum.montoRestante || 0,
        totalPrestamos: estadisticas._count.id || 0,
        prestamosActivos,
        prestamosCompletados
      }
    };
  }
}

export default new PersonaService();