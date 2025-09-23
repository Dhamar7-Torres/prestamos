import apiService from './api';
import type { Pago, PagoFormData, Prestamo, ApiResponse, PaginatedResponse } from '@/types';

interface PagoConDetalles extends Pago {
  montoFormateado: string;
  fechaFormateada: string;
  metodoPagoFormateado: string;
  esReciente: boolean;
}

interface EstadisticasPeriodo {
  totalPagos: number;
  montoTotal: number;
  promedioPago: number;
  pagoMayor: number;
  pagoMenor: number;
  porMetodo: Record<string, { cantidad: number; monto: number }>;
}

interface DistribucionPago {
  capital: number;
  interes: number;
  mora: number;
}

class PagoService {
  // ====================================================
  // OPERACIONES BÁSICAS CRUD
  // ====================================================

  async obtenerTodos(params: Record<string, any> = {}): Promise<ApiResponse<PaginatedResponse<Pago>>> {
    try {
      const response = await apiService.obtenerPagos(params);
      return response;
    } catch (error) {
      console.error('Error obteniendo pagos:', error);
      throw error;
    }
  }

  async obtenerPorId(id: number): Promise<ApiResponse<Pago>> {
    if (!id) {
      throw new Error('ID de pago requerido');
    }

    try {
      const response = await apiService.obtenerPago(id);
      return response;
    } catch (error) {
      console.error(`Error obteniendo pago ${id}:`, error);
      throw error;
    }
  }

  async crear(data: PagoFormData): Promise<ApiResponse<any>> {
    if (!data || !data.prestamoId || !data.monto) {
      throw new Error('Datos de pago inválidos');
    }

    try {
      const pagoData = this.sanitizePagoData(data);
      const validation = this.validatePagoData(pagoData as PagoFormData);
      
      if (!validation.isValid) {
        throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
      }

      const response = await apiService.crearPago(pagoData);
      return response;
    } catch (error) {
      console.error('Error creando pago:', error);
      throw error;
    }
  }

  async actualizar(id: number, data: Partial<PagoFormData>): Promise<ApiResponse<Pago>> {
    if (!id) {
      throw new Error('ID de pago requerido');
    }

    if (!data || Object.keys(data).length === 0) {
      throw new Error('Datos para actualizar requeridos');
    }

    try {
      const pagoData = this.sanitizePagoData(data);
      const response = await apiService.actualizarPago(id, pagoData);
      return response;
    } catch (error) {
      console.error(`Error actualizando pago ${id}:`, error);
      throw error;
    }
  }

  async eliminar(id: number): Promise<ApiResponse<null>> {
    if (!id) {
      throw new Error('ID de pago requerido');
    }

    try {
      const response = await apiService.eliminarPago(id);
      return response;
    } catch (error) {
      console.error(`Error eliminando pago ${id}:`, error);
      throw error;
    }
  }

  // ====================================================
  // OPERACIONES ESPECÍFICAS
  // ====================================================

  async obtenerEstadisticasPorMetodo(): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiService.obtenerEstadisticasPagosPorMetodo();
      return response;
    } catch (error) {
      console.error('Error obteniendo estadísticas por método:', error);
      throw error;
    }
  }

  async obtenerPagosPorPeriodo(fechaInicio: string, fechaFin: string): Promise<ApiResponse<any>> {
    if (!fechaInicio || !fechaFin) {
      throw new Error('Fechas de inicio y fin requeridas');
    }

    try {
      const response = await apiService.obtenerPagosPorPeriodo(fechaInicio, fechaFin);
      return response;
    } catch (error) {
      console.error('Error obteniendo pagos por período:', error);
      throw error;
    }
  }

  async obtenerHistorialPersona(personaId: number, limite: number = 10): Promise<ApiResponse<Pago[]>> {
    if (!personaId) {
      throw new Error('ID de persona requerido');
    }

    try {
      const response = await apiService.obtenerHistorialPagosPersona(personaId, limite);
      return response;
    } catch (error) {
      console.error(`Error obteniendo historial de persona ${personaId}:`, error);
      throw error;
    }
  }

  async obtenerPagosPorPrestamo(prestamoId: number, opciones: Record<string, any> = {}): Promise<ApiResponse<PaginatedResponse<Pago>>> {
    if (!prestamoId) {
      throw new Error('ID de préstamo requerido');
    }

    const params = {
      prestamoId,
      limit: opciones.limite || 50,
      ordenarPor: opciones.ordenarPor || 'fechaPago',
      orden: opciones.orden || 'desc',
      ...opciones
    };

    try {
      const response = await this.obtenerTodos(params);
      return response;
    } catch (error) {
      console.error(`Error obteniendo pagos del préstamo ${prestamoId}:`, error);
      throw error;
    }
  }

  // ====================================================
  // VALIDACIONES Y SANITIZACIÓN
  // ====================================================

  private sanitizePagoData(data: Partial<PagoFormData>): Record<string, any> {
    const sanitized: Record<string, any> = { ...data };

    // Convertir números - verificar que existan antes de convertir
    if (data.monto !== undefined) {
      sanitized.monto = parseFloat(String(data.monto));
    }
    if (data.montoCapital !== undefined) {
      sanitized.montoCapital = parseFloat(String(data.montoCapital));
    }
    if (data.montoInteres !== undefined) {
      sanitized.montoInteres = parseFloat(String(data.montoInteres));
    }
    if (data.montoMora !== undefined) {
      sanitized.montoMora = parseFloat(String(data.montoMora));
    }
    if (data.numeroCuota !== undefined) {
      sanitized.numeroCuota = parseInt(String(data.numeroCuota));
    }
    if (data.prestamoId !== undefined) {
      sanitized.prestamoId = Number(data.prestamoId);
    }

    // Limpiar strings
    if (data.descripcion) {
      sanitized.descripcion = data.descripcion.trim();
    }
    if (data.numeroTransaccion) {
      sanitized.numeroTransaccion = data.numeroTransaccion.trim();
    }

    // Convertir fechas
    if (data.fechaProgramada && typeof data.fechaProgramada === 'string') {
      sanitized.fechaProgramada = new Date(data.fechaProgramada).toISOString().split('T')[0];
    }

    // Remover campos vacíos (excepto números que pueden ser 0)
    Object.keys(sanitized).forEach(key => {
      const value = sanitized[key];
      if (value === '' || value === null || value === undefined) {
        delete sanitized[key];
      }
    });

    return sanitized;
  }

  private validatePagoData(data: PagoFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.prestamoId || data.prestamoId <= 0) {
      errors.push('ID de préstamo inválido');
    }

    if (!data.monto || data.monto <= 0) {
      errors.push('El monto debe ser mayor a cero');
    }

    if (data.monto && data.monto > 9999999.99) {
      errors.push('El monto excede el límite permitido');
    }

    if (data.montoCapital !== undefined && data.montoCapital < 0) {
      errors.push('El monto de capital no puede ser negativo');
    }

    if (data.montoInteres !== undefined && data.montoInteres < 0) {
      errors.push('El monto de interés no puede ser negativo');
    }

    if (data.montoMora !== undefined && data.montoMora < 0) {
      errors.push('El monto de mora no puede ser negativo');
    }

    const capital = Number(data.montoCapital || 0);
    const interes = Number(data.montoInteres || 0);
    const mora = Number(data.montoMora || 0);
    const sumaComponentes = capital + interes + mora;

    if (sumaComponentes > 0 && Math.abs(sumaComponentes - Number(data.monto)) > 0.01) {
      errors.push('La suma de capital, interés y mora debe coincidir con el monto total');
    }

    if (data.numeroCuota !== undefined && data.numeroCuota <= 0) {
      errors.push('El número de cuota debe ser mayor a cero');
    }

    if (data.fechaProgramada) {
      const fecha = new Date(data.fechaProgramada);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fecha < hoy) {
        errors.push('La fecha programada no puede ser anterior a hoy');
      }
    }

    const metodosValidos = ['efectivo', 'transferencia', 'tarjeta', 'cheque', 'otro'];
    if (data.metodoPago && !metodosValidos.includes(data.metodoPago)) {
      errors.push('Método de pago inválido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ====================================================
  // UTILIDADES Y CÁLCULOS
  // ====================================================

  calcularDistribucionPago(monto: number, prestamo: Prestamo): DistribucionPago {
    const montoTotal = Number(monto);
    const montoRestante = Number(prestamo.montoRestante);
    const tasaInteres = Number(prestamo.tasaInteres) || 0;

    if (tasaInteres <= 0) {
      return {
        capital: montoTotal,
        interes: 0,
        mora: 0
      };
    }

    const diasVencidos = this.calcularDiasVencimiento(prestamo);
    const interesAcumulado = this.calcularInteres(montoRestante, tasaInteres, diasVencidos);

    let restantePorDistribuir = montoTotal;
    let mora = 0;
    let interes = 0;
    let capital = 0;

    if (diasVencidos > 0) {
      mora = Math.min(restantePorDistribuir, interesAcumulado * 0.1);
      restantePorDistribuir -= mora;
    }

    if (restantePorDistribuir > 0) {
      interes = Math.min(restantePorDistribuir, interesAcumulado);
      restantePorDistribuir -= interes;
    }

    capital = restantePorDistribuir;

    return { capital, interes, mora };
  }

  private calcularDiasVencimiento(prestamo: Prestamo): number {
    if (!prestamo.fechaVencimiento) return 0;

    const hoy = new Date();
    const vencimiento = new Date(prestamo.fechaVencimiento);
    const diffTime = hoy.getTime() - vencimiento.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }

  private calcularInteres(capital: number, tasaAnual: number, dias: number): number {
    if (!tasaAnual || tasaAnual <= 0 || !dias || dias <= 0) return 0;

    const tasaDiaria = tasaAnual / 100 / 365;
    return capital * tasaDiaria * dias;
  }

  formatearPagoParaMostrar(pago: Pago): PagoConDetalles {
    return {
      ...pago,
      montoFormateado: this.formatearMoneda(Number(pago.monto)),
      fechaFormateada: this.formatearFecha(pago.fechaPago),
      metodoPagoFormateado: this.formatearMetodoPago(pago.metodoPago),
      esReciente: this.esPagoReciente(pago.fechaPago)
    };
  }

  private formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(monto);
  }

  private formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CO');
  }

  private formatearMetodoPago(metodo: string): string {
    const metodos: Record<string, string> = {
      efectivo: 'Efectivo',
      transferencia: 'Transferencia',
      tarjeta: 'Tarjeta',
      cheque: 'Cheque',
      otro: 'Otro'
    };
    return metodos[metodo] || metodo;
  }

  private esPagoReciente(fechaPago: string, diasLimite: number = 7): boolean {
    const fecha = new Date(fechaPago);
    const hoy = new Date();
    const diffTime = hoy.getTime() - fecha.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= diasLimite;
  }

  // ====================================================
  // REPORTES Y EXPORTACIÓN
  // ====================================================

  async generarReportePagos(periodo: string, filtros: Record<string, any> = {}): Promise<any> {
    try {
      const fechaFin = new Date();
      let fechaInicio = new Date();

      switch (periodo) {
        case 'hoy':
          fechaInicio = new Date();
          break;
        case 'semana':
          fechaInicio.setDate(fechaFin.getDate() - 7);
          break;
        case 'mes':
          fechaInicio.setMonth(fechaFin.getMonth() - 1);
          break;
        case 'trimestre':
          fechaInicio.setMonth(fechaFin.getMonth() - 3);
          break;
        case 'año':
          fechaInicio.setFullYear(fechaFin.getFullYear() - 1);
          break;
        default:
          fechaInicio.setMonth(fechaFin.getMonth() - 1);
      }

      const response = await this.obtenerPagosPorPeriodo(
        fechaInicio.toISOString().split('T')[0],
        fechaFin.toISOString().split('T')[0]
      );

      return {
        periodo,
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString(),
        pagos: response.data.pagos,
        resumen: response.data.resumen,
        estadisticas: this.calcularEstadisticasPeriodo(response.data.pagos)
      };
    } catch (error) {
      console.error('Error generando reporte de pagos:', error);
      throw error;
    }
  }

  private calcularEstadisticasPeriodo(pagos: Pago[]): EstadisticasPeriodo {
    if (!pagos || pagos.length === 0) {
      return {
        totalPagos: 0,
        montoTotal: 0,
        promedioPago: 0,
        pagoMayor: 0,
        pagoMenor: 0,
        porMetodo: {}
      };
    }

    const montos = pagos.map(p => Number(p.monto));
    const montoTotal = montos.reduce((sum, monto) => sum + monto, 0);

    const porMetodo = pagos.reduce((acc, pago) => {
      const metodo = pago.metodoPago;
      if (!acc[metodo]) {
        acc[metodo] = { cantidad: 0, monto: 0 };
      }
      acc[metodo].cantidad++;
      acc[metodo].monto += Number(pago.monto);
      return acc;
    }, {} as Record<string, { cantidad: number; monto: number }>);

    return {
      totalPagos: pagos.length,
      montoTotal,
      promedioPago: montoTotal / pagos.length,
      pagoMayor: Math.max(...montos),
      pagoMenor: Math.min(...montos),
      porMetodo
    };
  }

  async exportarPagos(formato: 'json' | 'csv' = 'json', filtros: Record<string, any> = {}): Promise<string> {
    try {
      const response = await this.obtenerTodos({ ...filtros, limit: 1000 });
      const pagos = response.data.data || [];

      switch (formato.toLowerCase()) {
        case 'csv':
          return this.convertirACSV(pagos);
        case 'json':
          return JSON.stringify(pagos, null, 2);
        default:
          throw new Error('Formato no soportado');
      }
    } catch (error) {
      console.error('Error exportando pagos:', error);
      throw error;
    }
  }

  private convertirACSV(pagos: Pago[]): string {
    if (!pagos || pagos.length === 0) {
      return 'No hay datos para exportar';
    }

    const headers = [
      'ID', 'Préstamo ID', 'Persona', 'Monto', 'Método Pago',
      'Descripción', 'Fecha Pago', 'Número Transacción', 'Es Cuota'
    ];

    const filas = pagos.map(pago => [
      pago.id,
      pago.prestamoId,
      pago.prestamo?.persona ? `${pago.prestamo.persona.nombre} ${pago.prestamo.persona.apellido || ''}`.trim() : '',
      pago.monto,
      pago.metodoPago,
      pago.descripcion || '',
      new Date(pago.fechaPago).toLocaleDateString(),
      pago.numeroTransaccion || '',
      pago.esCuota ? 'Sí' : 'No'
    ]);

    return [headers, ...filas]
      .map(fila => fila.map(campo => `"${campo}"`).join(','))
      .join('\n');
  }
}

export default new PagoService();