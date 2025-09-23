import prisma from '../config/database.js';

// Modelos extendidos con métodos personalizados
class ExtendedModels {
  constructor() {
    this.prisma = prisma;
  }

  // ====================================================
  // MODELO PERSONA EXTENDIDO
  // ====================================================
  get persona() {
    return {
      ...this.prisma.persona,
      
      // Buscar persona por cédula
      async findByCedula(cedula) {
        return await prisma.persona.findUnique({
          where: { cedula }
        });
      },

      // Buscar personas por nombre (búsqueda flexible)
      async searchByName(searchTerm) {
        return await prisma.persona.findMany({
          where: {
            OR: [
              { nombre: { contains: searchTerm, mode: 'insensitive' } },
              { apellido: { contains: searchTerm, mode: 'insensitive' } }
            ]
          },
          include: {
            _count: { select: { prestamos: true } }
          }
        });
      },

      // Obtener personas con préstamos activos
      async findWithActivePrestamos() {
        return await prisma.persona.findMany({
          where: {
            prestamos: {
              some: { completado: false }
            }
          },
          include: {
            prestamos: {
              where: { completado: false }
            }
          }
        });
      },

      // Obtener resumen financiero de una persona
      async getFinancialSummary(personaId) {
        const persona = await prisma.persona.findUnique({
          where: { id: personaId },
          include: {
            prestamos: {
              include: {
                pagos: true
              }
            }
          }
        });

        if (!persona) return null;

        const summary = persona.prestamos.reduce((acc, prestamo) => {
          acc.totalPrestado += Number(prestamo.montoTotal);
          acc.totalPagado += Number(prestamo.montoPagado);
          acc.totalPendiente += Number(prestamo.montoRestante);
          acc.prestamosActivos += prestamo.completado ? 0 : 1;
          acc.prestamosCompletados += prestamo.completado ? 1 : 0;
          return acc;
        }, {
          totalPrestado: 0,
          totalPagado: 0,
          totalPendiente: 0,
          prestamosActivos: 0,
          prestamosCompletados: 0,
          totalPrestamos: persona.prestamos.length
        });

        return { persona, summary };
      }
    };
  }

  // ====================================================
  // MODELO PRÉSTAMO EXTENDIDO
  // ====================================================
  get prestamo() {
    return {
      ...this.prisma.prestamo,

      // Encontrar préstamos vencidos
      async findOverdue() {
        return await prisma.prestamo.findMany({
          where: {
            AND: [
              { completado: false },
              { fechaVencimiento: { lt: new Date() } }
            ]
          },
          include: {
            persona: true
          }
        });
      },

      // Encontrar préstamos que vencen pronto
      async findDueSoon(days = 7) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);

        return await prisma.prestamo.findMany({
          where: {
            AND: [
              { completado: false },
              { fechaVencimiento: { lte: futureDate } },
              { fechaVencimiento: { gte: new Date() } }
            ]
          },
          include: {
            persona: true
          },
          orderBy: { fechaVencimiento: 'asc' }
        });
      },

      // Obtener préstamos con pagos recientes
      async findWithRecentPayments(days = 30) {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - days);

        return await prisma.prestamo.findMany({
          where: {
            pagos: {
              some: {
                fechaPago: { gte: pastDate }
              }
            }
          },
          include: {
            persona: true,
            pagos: {
              where: { fechaPago: { gte: pastDate } },
              orderBy: { fechaPago: 'desc' }
            }
          }
        });
      },

      // Calcular estadísticas globales
      async getGlobalStats() {
        const stats = await prisma.prestamo.aggregate({
          _sum: {
            montoTotal: true,
            montoPagado: true,
            montoRestante: true
          },
          _count: {
            id: true
          }
        });

        const activeCount = await prisma.prestamo.count({
          where: { completado: false }
        });

        const completedCount = await prisma.prestamo.count({
          where: { completado: true }
        });

        const overdueCount = await prisma.prestamo.count({
          where: {
            AND: [
              { completado: false },
              { fechaVencimiento: { lt: new Date() } }
            ]
          }
        });

        return {
          totales: {
            montoTotal: stats._sum.montoTotal || 0,
            montoPagado: stats._sum.montoPagado || 0,
            montoRestante: stats._sum.montoRestante || 0,
            cantidad: stats._count.id || 0
          },
          estados: {
            activos: activeCount,
            completados: completedCount,
            vencidos: overdueCount
          }
        };
      }
    };
  }

  // ====================================================
  // MODELO PAGO EXTENDIDO
  // ====================================================
  get pago() {
    return {
      ...this.prisma.pago,

      // Obtener pagos de un período específico
      async findByPeriod(startDate, endDate) {
        return await prisma.pago.findMany({
          where: {
            fechaPago: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          },
          include: {
            prestamo: {
              include: {
                persona: true
              }
            }
          },
          orderBy: { fechaPago: 'desc' }
        });
      },

      // Estadísticas por método de pago
      async getStatsByMethod() {
        return await prisma.pago.groupBy({
          by: ['metodoPago'],
          _sum: { monto: true },
          _count: { id: true }
        });
      },

      // Pagos más grandes del período
      async findLargestPayments(limit = 10, days = 30) {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - days);

        return await prisma.pago.findMany({
          where: {
            fechaPago: { gte: pastDate }
          },
          include: {
            prestamo: {
              include: {
                persona: true
              }
            }
          },
          orderBy: { monto: 'desc' },
          take: limit
        });
      },

      // Obtener historial de pagos de una persona
      async findByPersona(personaId, limit = 50) {
        return await prisma.pago.findMany({
          where: {
            prestamo: {
              personaId: personaId
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
          take: limit
        });
      }
    };
  }

  // ====================================================
  // OPERACIONES TRANSACCIONALES COMPLEJAS
  // ====================================================

  // Crear préstamo con persona nueva (si no existe)
  async createPrestamoWithPersona(personaData, prestamoData) {
    return await this.prisma.$transaction(async (tx) => {
      // Buscar o crear persona
      let persona = await tx.persona.findFirst({
        where: {
          OR: [
            { cedula: personaData.cedula },
            { email: personaData.email }
          ].filter(Boolean)
        }
      });

      if (!persona) {
        persona = await tx.persona.create({
          data: personaData
        });
      }

      // Crear préstamo
      const prestamo = await tx.prestamo.create({
        data: {
          ...prestamoData,
          personaId: persona.id,
          montoRestante: prestamoData.montoTotal
        },
        include: {
          persona: true
        }
      });

      return { persona, prestamo };
    });
  }

  // Transferir préstamo a otra persona
  async transferirPrestamo(prestamoId, nuevaPersonaId) {
    return await this.prisma.$transaction(async (tx) => {
      const prestamo = await tx.prestamo.update({
        where: { id: prestamoId },
        data: { personaId: nuevaPersonaId },
        include: {
          persona: true,
          pagos: true
        }
      });

      return prestamo;
    });
  }

  // Liquidar préstamo completamente
  async liquidarPrestamo(prestamoId, pagoData) {
    return await this.prisma.$transaction(async (tx) => {
      const prestamo = await tx.prestamo.findUnique({
        where: { id: prestamoId }
      });

      if (!prestamo) {
        throw new Error('Préstamo no encontrado');
      }

      // Crear pago de liquidación
      const pago = await tx.pago.create({
        data: {
          ...pagoData,
          prestamoId,
          monto: prestamo.montoRestante
        }
      });

      // Marcar préstamo como completado
      const prestamoActualizado = await tx.prestamo.update({
        where: { id: prestamoId },
        data: {
          montoPagado: prestamo.montoTotal,
          montoRestante: 0,
          completado: true,
          fechaCompletado: new Date(),
          estado: 'completado'
        },
        include: {
          persona: true,
          pagos: true
        }
      });

      return { pago, prestamo: prestamoActualizado };
    });
  }
}

// Instancia singleton
const models = new ExtendedModels();

export default models;

// Exportar también los modelos individuales
export const { persona, prestamo, pago } = models;