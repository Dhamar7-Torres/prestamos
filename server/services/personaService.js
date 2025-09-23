// personaService.js

import prisma from '../config/database.js';

class PersonaService {
  // Filtrar campos permitidos - SIN cedula
  #filtrarCamposPermitidos(data) {
    const camposPermitidos = {
      nombre: data.nombre,
      apellido: data.apellido,
      telefono: data.telefono,
      email: data.email,
      direccion: data.direccion,
      notas: data.notas,
      activo: data.activo
      // NO incluir cedula
    };

    // Remover campos undefined para no enviarlos a Prisma
    const camposFiltrados = {};
    Object.keys(camposPermitidos).forEach(key => {
      if (camposPermitidos[key] !== undefined) {
        camposFiltrados[key] = camposPermitidos[key];
      }
    });

    return camposFiltrados;
  }

  async obtenerTodas(opciones = {}) {
    const { page = 1, limit = 10, buscar, incluirInactivas = false } = opciones;
    
    // Asegurar que page y limit sean números válidos
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = Math.max(0, (pageNum - 1) * limitNum);

    const whereClause = {
      ...(buscar && {
        OR: [
          { nombre: { contains: buscar, mode: 'insensitive' } },
          { apellido: { contains: buscar, mode: 'insensitive' } },
          { email: { contains: buscar, mode: 'insensitive' } },
          { telefono: { contains: buscar } }
        ]
      }),
      ...(incluirInactivas ? {} : { activo: true })
    };

    const [personas, total] = await Promise.all([
      prisma.persona.findMany({
        where: whereClause,
        skip: skip,
        take: limitNum, // AGREGAR el parámetro take que faltaba
        include: {
          _count: {
            select: {
              prestamos: true
            }
          }
        },
        orderBy: [
          { activo: 'desc' },
          { nombre: 'asc' }
        ]
      }),
      prisma.persona.count({ where: whereClause })
    ]);

    return { personas, total };
  }

  async obtenerPorId(id) {
    if (!id || isNaN(id)) {
      const error = new Error('ID de persona inválido');
      error.status = 400;
      throw error;
    }

    const persona = await prisma.persona.findUnique({
      where: { id },
      include: {
        prestamos: {
          include: {
            pagos: true
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
      const error = new Error('Persona no encontrada');
      error.status = 404;
      throw error;
    }

    return persona;
  }

  async crear(data) {
    // Validaciones básicas
    if (!data.nombre || data.nombre.trim().length < 2) {
      const error = new Error('El nombre es requerido y debe tener al menos 2 caracteres');
      error.status = 400;
      throw error;
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      const error = new Error('El email no tiene un formato válido');
      error.status = 400;
      throw error;
    }

    // Verificar email único si se proporciona
    if (data.email) {
      const emailExistente = await prisma.persona.findFirst({
        where: { 
          email: data.email,
          activo: true 
        }
      });

      if (emailExistente) {
        const error = new Error('Ya existe una persona activa con este email');
        error.status = 400;
        throw error;
      }
    }

    // FILTRAR CAMPOS - AQUÍ ESTÁ LA CLAVE
    const datosPermitidos = this.#filtrarCamposPermitidos({
      ...data,
      nombre: data.nombre.trim(),
      apellido: data.apellido?.trim(),
      email: data.email?.trim(),
      telefono: data.telefono?.trim(),
      activo: data.activo !== false // Por defecto true
    });

    console.log('🔍 Datos enviados a Prisma:', datosPermitidos);

    try {
      const persona = await prisma.persona.create({
        data: datosPermitidos,
        include: {
          _count: {
            select: {
              prestamos: true
            }
          }
        }
      });

      return persona;
    } catch (error) {
      console.error('❌ Error en Prisma al crear persona:', error);
      
      if (error.code === 'P2002') {
        const validationError = new Error('Ya existe una persona con estos datos únicos');
        validationError.status = 400;
        throw validationError;
      }
      
      const generalError = new Error(`Error al crear persona: ${error.message}`);
      generalError.status = 500;
      throw generalError;
    }
  }

  async actualizar(id, data) {
    if (!id || isNaN(id)) {
      const error = new Error('ID de persona inválido');
      error.status = 400;
      throw error;
    }

    // Verificar que la persona existe
    const personaExistente = await this.obtenerPorId(id);

    // Validaciones
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      const error = new Error('El email no tiene un formato válido');
      error.status = 400;
      throw error;
    }

    // Verificar email único si se está cambiando
    if (data.email && data.email !== personaExistente.email) {
      const emailExistente = await prisma.persona.findFirst({
        where: { 
          email: data.email,
          activo: true,
          id: { not: id }
        }
      });

      if (emailExistente) {
        const error = new Error('Ya existe una persona activa con este email');
        error.status = 400;
        throw error;
      }
    }

    // FILTRAR CAMPOS TAMBIÉN EN ACTUALIZACIÓN
    const datosPermitidos = this.#filtrarCamposPermitidos({
      ...data,
      nombre: data.nombre?.trim(),
      apellido: data.apellido?.trim(),
      email: data.email?.trim(),
      telefono: data.telefono?.trim()
    });

    console.log('🔍 Datos de actualización enviados a Prisma:', datosPermitidos);

    try {
      const persona = await prisma.persona.update({
        where: { id },
        data: datosPermitidos,
        include: {
          _count: {
            select: {
              prestamos: true
            }
          }
        }
      });

      return persona;
    } catch (error) {
      console.error('❌ Error en Prisma al actualizar persona:', error);
      
      if (error.code === 'P2002') {
        const validationError = new Error('Ya existe una persona con estos datos únicos');
        validationError.status = 400;
        throw validationError;
      }
      
      const generalError = new Error(`Error al actualizar persona: ${error.message}`);
      generalError.status = 500;
      throw generalError;
    }
  }

  async eliminar(id) {
    if (!id || isNaN(id)) {
      const error = new Error('ID de persona inválido');
      error.status = 400;
      throw error;
    }

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
      const error = new Error('No se puede eliminar una persona con préstamos activos');
      error.status = 400;
      throw error;
    }

    // Eliminación suave (marcar como inactivo)
    await prisma.persona.update({
      where: { id },
      data: { activo: false }
    });
  }

  async obtenerEstadisticas(id) {
    if (!id || isNaN(id)) {
      const error = new Error('ID de persona inválido');
      error.status = 400;
      throw error;
    }

    const persona = await this.obtenerPorId(id);

    const estadisticas = await prisma.prestamo.aggregate({
      where: { personaId: id },
      _sum: {
        montoTotal: true,
        montoRestante: true
      },
      _count: {
        id: true
      }
    });

    const prestamosCompletados = await prisma.prestamo.count({
      where: {
        personaId: id,
        completado: true
      }
    });

    return {
      persona,
      totalPrestamos: estadisticas._count.id || 0,
      prestamosCompletados,
      prestamosActivos: (estadisticas._count.id || 0) - prestamosCompletados,
      montoTotalPrestado: estadisticas._sum.montoTotal || 0,
      montoRestante: estadisticas._sum.montoRestante || 0
    };
  }
}

export default new PersonaService();