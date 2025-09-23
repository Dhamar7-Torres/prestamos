import apiService from './api';
import type { Prestamo, PrestamoFormData, ApiResponse, PaginatedResponse } from '@/types';

interface BuscarPrestamosOptions {
  limite?: number;
  completado?: boolean;
  estado?: string;
  personaId?: number;
  [key: string]: any;
}

interface PaymentSuggestion {
  etiqueta: string;
  monto: number;
}

class PrestamoService {
  // ====================================================
  // OPERACIONES BÁSICAS CRUD
  // ====================================================

  async obtenerTodos(params: Record<string, any> = {}): Promise<ApiResponse<PaginatedResponse<Prestamo>>> {
    try {
      const response = await apiService.obtenerPrestamos(params);
      return response;
    } catch (error) {
      console.error('Error obteniendo préstamos:', error);
      throw error;
    }
  }

  async obtenerPorId(id: number): Promise<ApiResponse<Prestamo>> {
    if (!id) {
      throw new Error('ID de préstamo requerido');
    }

    try {
      const response = await apiService.obtenerPrestamo(id);
      return response;
    } catch (error) {
      console.error(`Error obteniendo préstamo ${id}:`, error);
      throw error;
    }
  }

  async crear(data: PrestamoFormData): Promise<ApiResponse<Prestamo>> {
    if (!data || !data.personaId || !data.montoTotal) {
      throw new Error('Datos de préstamo inválidos');
    }

    try {
      const prestamoData = this.sanitizePrestamoData(data);
      const validation = this.validatePrestamoData(prestamoData as PrestamoFormData);
      
      if (!validation.isValid) {
        throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
      }

      const response = await apiService.crearPrestamo(prestamoData);
      return response;
    } catch (error) {
      console.error('Error creando préstamo:', error);
      throw error;
    }
  }

  async actualizar(id: number, data: Partial<PrestamoFormData>): Promise<ApiResponse<Prestamo>> {
    if (!id) {
      throw new Error('ID de préstamo requerido');
    }

    if (!data || Object.keys(data).length === 0) {
      throw new Error('Datos para actualizar requeridos');
    }

    try {
      const prestamoData = this.sanitizePrestamoData(data);
      const response = await apiService.actualizarPrestamo(id, prestamoData);
      return response;
    } catch (error) {
      console.error(`Error actualizando préstamo ${id}:`, error);
      throw error;
    }
  }

  async eliminar(id: number): Promise<ApiResponse<null>> {
    if (!id) {
      throw new Error('ID de préstamo requerido');
    }

    try {
      const response = await apiService.eliminarPrestamo(id);
      return response;
    } catch (error) {
      console.error(`Error eliminando préstamo ${id}:`, error);
      throw error;
    }
  }

  // ====================================================
  // OPERACIONES ESPECÍFICAS
  // ====================================================

  async obtenerEstadisticas(): Promise<ApiResponse<any>> {
    try {
      const response = await apiService.obtenerEstadisticasPrestamos();
      return response;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  async obtenerProximosVencimientos(dias: number = 7): Promise<ApiResponse<Prestamo[]>> {
    try {
      const response = await apiService.obtenerProximosVencimientos(dias);
      return response;
    } catch (error) {
      console.error('Error obteniendo próximos vencimientos:', error);
      throw error;
    }
  }

  async recalcularTotales(id: number): Promise<ApiResponse<Prestamo>> {
    if (!id) {
      throw new Error('ID de préstamo requerido');
    }

    try {
      const response = await apiService.recalcularTotalesPrestamo(id);
      return response;
    } catch (error) {
      console.error(`Error recalculando totales del préstamo ${id}:`, error);
      throw error;
    }
  }

  async buscarPrestamos(termino: string, opciones: BuscarPrestamosOptions = {}): Promise<ApiResponse<PaginatedResponse<Prestamo>>> {
    const params = {
      buscar: termino,
      limit: opciones.limite || 10,
      completado: opciones.completado,
      estado: opciones.estado,
      personaId: opciones.personaId,
      ...opciones
    };

    try {
      const response = await this.obtenerTodos(params);
      return response;
    } catch (error) {
      console.error('Error buscando préstamos:', error);
      throw error;
    }
  }

  async obtenerPrestamosPorPersona(personaId: number, opciones: Record<string, any> = {}): Promise<ApiResponse<PaginatedResponse<Prestamo>>> {
    if (!personaId) {
      throw new Error('ID de persona requerido');
    }

    const params = {
      personaId,
      limit: opciones.limite || 50,
      ...opciones
    };

    try {
      const response = await this.obtenerTodos(params);
      return response;
    } catch (error) {
      console.error(`Error obteniendo préstamos de persona ${personaId}:`, error);
      throw error;
    }
  }

  // ====================================================
  // VALIDACIONES Y SANITIZACIÓN
  // ====================================================

  private sanitizePrestamoData(data: Partial<PrestamoFormData>): Record<string, any> {
    const sanitized: Record<string, any> = { ...data };

    // Convertir números - verificar que existan antes de convertir
    if (data.montoTotal !== undefined) {
      sanitized.montoTotal = parseFloat(String(data.montoTotal));
    }
    if (data.tasaInteres !== undefined) {
      sanitized.tasaInteres = parseFloat(String(data.tasaInteres));
    }
    if (data.plazoDias !== undefined) {
      sanitized.plazoDias = parseInt(String(data.plazoDias));
    }
    if (data.cuotasPactadas !== undefined) {
      sanitized.cuotasPactadas = parseInt(String(data.cuotasPactadas));
    }
    if (data.personaId !== undefined) {
      sanitized.personaId = Number(data.personaId);
    }

    // Limpiar strings
    if (data.descripcion) {
      sanitized.descripcion = data.descripcion.trim();
    }

    // Convertir fechas
    if (data.fechaVencimiento && typeof data.fechaVencimiento === 'string') {
      sanitized.fechaVencimiento = new Date(data.fechaVencimiento).toISOString().split('T')[0];
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

  private validatePrestamoData(data: PrestamoFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.personaId || data.personaId <= 0) {
      errors.push('ID de persona inválido');
    }

    if (!data.montoTotal || data.montoTotal <= 0) {
      errors.push('El monto total debe ser mayor a cero');
    }

    if (data.montoTotal && data.montoTotal > 999999999.99) {
      errors.push('El monto total excede el límite permitido');
    }

    if (data.tasaInteres !== undefined && (data.tasaInteres < 0 || data.tasaInteres > 100)) {
      errors.push('La tasa de interés debe estar entre 0 y 100%');
    }

    if (data.fechaVencimiento) {
      const fecha = new Date(data.fechaVencimiento);
      if (fecha <= new Date()) {
        errors.push('La fecha de vencimiento debe ser futura');
      }
    }

    if (data.plazoDias !== undefined && data.plazoDias <= 0) {
      errors.push('El plazo en días debe ser mayor a cero');
    }

    if (data.cuotasPactadas !== undefined && data.cuotasPactadas <= 0) {
      errors.push('Las cuotas pactadas deben ser mayor a cero');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ====================================================
  // CÁLCULOS Y UTILIDADES
  // ====================================================

  calcularProgresoPago(prestamo: Prestamo): number {
    if (!prestamo || !prestamo.montoTotal || prestamo.montoTotal <= 0) {
      return 0;
    }

    const progreso = (Number(prestamo.montoPagado) / Number(prestamo.montoTotal)) * 100;
    return Math.min(Math.max(progreso, 0), 100);
  }

  calcularDiasHastaVencimiento(fechaVencimiento?: string): number | null {
    if (!fechaVencimiento) return null;

    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diffTime = vencimiento.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  estaVencido(prestamo: Prestamo): boolean {
    if (!prestamo || prestamo.completado || !prestamo.fechaVencimiento) {
      return false;
    }

    return new Date(prestamo.fechaVencimiento) < new Date();
  }

  calcularInteresAcumulado(prestamo: Prestamo, dias: number): number {
    if (!prestamo || !prestamo.tasaInteres || prestamo.tasaInteres <= 0) {
      return 0;
    }

    const capital = Number(prestamo.montoRestante);
    const tasaAnual = Number(prestamo.tasaInteres) / 100;
    const tasaDiaria = tasaAnual / 365;

    return capital * tasaDiaria * dias;
  }

  sugerirMontosPago(prestamo: Prestamo): PaymentSuggestion[] {
    if (!prestamo || !prestamo.montoRestante) {
      return [];
    }

    const restante = Number(prestamo.montoRestante);
    
    return [
      { etiqueta: '25%', monto: restante * 0.25 },
      { etiqueta: '50%', monto: restante * 0.5 },
      { etiqueta: '75%', monto: restante * 0.75 },
      { etiqueta: 'Total', monto: restante }
    ].filter(sugerencia => sugerencia.monto > 0);
  }

  // ====================================================
  // REPORTES Y EXPORTACIÓN
  // ====================================================

  async generarReporteEstadisticas(periodo: string = 'mes'): Promise<any> {
    try {
      const estadisticas = await this.obtenerEstadisticas();
      const proximosVencimientos = await this.obtenerProximosVencimientos(30);

      return {
        periodo,
        fechaGeneracion: new Date().toISOString(),
        estadisticas: estadisticas.data,
        proximosVencimientos: proximosVencimientos.data,
        resumen: this.calcularResumenReporte(estadisticas.data)
      };
    } catch (error) {
      console.error('Error generando reporte:', error);
      throw error;
    }
  }

  private calcularResumenReporte(estadisticas: any): any {
    if (!estadisticas) return {};

    const { totales, estados } = estadisticas;

    return {
      totalCapitalPrestado: totales.montoTotal,
      totalRecuperado: totales.montoPagado,
      capitalEnRiesgo: totales.montoRestante,
      tasaRecuperacion: totales.montoTotal > 0 
        ? (totales.montoPagado / totales.montoTotal) * 100 
        : 0,
      prestamosActivos: estados.activos,
      prestamosCompletados: estados.completados,
      prestamosVencidos: estados.vencidos
    };
  }

  async exportarPrestamos(formato: 'json' | 'csv' = 'json', filtros: Record<string, any> = {}): Promise<string> {
    try {
      const response = await this.obtenerTodos({ ...filtros, limit: 1000 });
      const prestamos = response.data.data || [];

      switch (formato.toLowerCase()) {
        case 'csv':
          return this.convertirACSV(prestamos);
        case 'json':
          return JSON.stringify(prestamos, null, 2);
        default:
          throw new Error('Formato no soportado');
      }
    } catch (error) {
      console.error('Error exportando préstamos:', error);
      throw error;
    }
  }

  private convertirACSV(prestamos: Prestamo[]): string {
    if (!prestamos || prestamos.length === 0) {
      return 'No hay datos para exportar';
    }

    const headers = [
      'ID', 'Persona', 'Monto Total', 'Monto Pagado', 'Monto Restante',
      'Tasa Interés', 'Tipo', 'Estado', 'Completado', 'Fecha Préstamo',
      'Fecha Vencimiento', 'Descripción'
    ];

    const filas = prestamos.map(prestamo => [
      prestamo.id,
      prestamo.persona ? `${prestamo.persona.nombre} ${prestamo.persona.apellido || ''}`.trim() : '',
      prestamo.montoTotal,
      prestamo.montoPagado,
      prestamo.montoRestante,
      prestamo.tasaInteres,
      prestamo.tipoPrestamo,
      prestamo.estado,
      prestamo.completado ? 'Sí' : 'No',
      new Date(prestamo.fechaPrestamo).toLocaleDateString(),
      prestamo.fechaVencimiento ? new Date(prestamo.fechaVencimiento).toLocaleDateString() : '',
      prestamo.descripcion || ''
    ]);

    return [headers, ...filas]
      .map(fila => fila.map(campo => `"${campo}"`).join(','))
      .join('\n');
  }
}

export default new PrestamoService();