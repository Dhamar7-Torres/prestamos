import type { ApiResponse, PaginatedResponse } from '@/types';

const API_BASE_URL = '/api';

interface RequestOptions {
  method?: string;
  params?: Record<string, string | number | boolean>;
  body?: any;
  headers?: Record<string, string>;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { method = 'GET', params, body, headers = {} } = options;
    
    // Construir URL con parámetros de consulta
    let finalUrl = `${API_BASE_URL}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        finalUrl += `?${queryString}`;
      }
    }

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    // Convertir body a JSON string si es necesario
    if (body) {
      config.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    try {
      const response = await fetch(finalUrl, config);
      
      // Si es 204 (No Content), no intentar parsear JSON
      if (response.status === 204) {
        return { 
          success: true, 
          message: 'Success', 
          data: null as any, 
          timestamp: new Date().toISOString() 
        };
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error: any) {
      console.error(`Error en ${endpoint}:`, error);
      throw error;
    }
  }

  // ====================================================
  // PERSONAS
  // ====================================================
  
  async obtenerPersonas(params: Record<string, any> = {}): Promise<ApiResponse<PaginatedResponse<any>>> {
    return this.request('/personas', { method: 'GET', params });
  }

  async obtenerPersona(id: number): Promise<ApiResponse<any>> {
    return this.request(`/personas/${id}`, { method: 'GET' });
  }

  async crearPersona(data: Record<string, any>): Promise<ApiResponse<any>> {
    return this.request('/personas', {
      method: 'POST',
      body: data,
    });
  }

  async actualizarPersona(id: number, data: Record<string, any>): Promise<ApiResponse<any>> {
    return this.request(`/personas/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async eliminarPersona(id: number): Promise<ApiResponse<null>> {
    return this.request(`/personas/${id}`, {
      method: 'DELETE',
    });
  }

  async obtenerEstadisticasPersona(id: number): Promise<ApiResponse<any>> {
    return this.request(`/personas/${id}/estadisticas`, { method: 'GET' });
  }

  // ====================================================
  // PRÉSTAMOS
  // ====================================================
  
  async obtenerPrestamos(params: Record<string, any> = {}): Promise<ApiResponse<PaginatedResponse<any>>> {
    return this.request('/prestamos', { method: 'GET', params });
  }

  async obtenerPrestamo(id: number): Promise<ApiResponse<any>> {
    return this.request(`/prestamos/${id}`, { method: 'GET' });
  }

  async crearPrestamo(data: Record<string, any>): Promise<ApiResponse<any>> {
    return this.request('/prestamos', {
      method: 'POST',
      body: data,
    });
  }

  async actualizarPrestamo(id: number, data: Record<string, any>): Promise<ApiResponse<any>> {
    return this.request(`/prestamos/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async eliminarPrestamo(id: number): Promise<ApiResponse<null>> {
    return this.request(`/prestamos/${id}`, {
      method: 'DELETE',
    });
  }

  async obtenerEstadisticasPrestamos(): Promise<ApiResponse<any>> {
    return this.request('/prestamos/estadisticas', { method: 'GET' });
  }

  async obtenerProximosVencimientos(dias: number = 7): Promise<ApiResponse<any[]>> {
    return this.request('/prestamos/proximos-vencimientos', {
      method: 'GET',
      params: { dias }
    });
  }

  async recalcularTotalesPrestamo(id: number): Promise<ApiResponse<any>> {
    return this.request(`/prestamos/${id}/recalcular`, {
      method: 'POST',
    });
  }

  // ====================================================
  // PAGOS
  // ====================================================
  
  async obtenerPagos(params: Record<string, any> = {}): Promise<ApiResponse<PaginatedResponse<any>>> {
    return this.request('/pagos', { method: 'GET', params });
  }

  async obtenerPago(id: number): Promise<ApiResponse<any>> {
    return this.request(`/pagos/${id}`, { method: 'GET' });
  }

  async crearPago(data: Record<string, any>): Promise<ApiResponse<any>> {
    return this.request('/pagos', {
      method: 'POST',
      body: data,
    });
  }

  async actualizarPago(id: number, data: Record<string, any>): Promise<ApiResponse<any>> {
    return this.request(`/pagos/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async eliminarPago(id: number): Promise<ApiResponse<null>> {
    return this.request(`/pagos/${id}`, {
      method: 'DELETE',
    });
  }

  async obtenerEstadisticasPagosPorMetodo(): Promise<ApiResponse<any[]>> {
    return this.request('/pagos/estadisticas/metodos', { method: 'GET' });
  }

  async obtenerPagosPorPeriodo(fechaInicio: string, fechaFin: string): Promise<ApiResponse<any>> {
    return this.request('/pagos/periodo', {
      method: 'GET',
      params: { fechaInicio, fechaFin }
    });
  }

  async obtenerHistorialPagosPersona(personaId: number, limite: number = 10): Promise<ApiResponse<any[]>> {
    return this.request(`/pagos/persona/${personaId}/historial`, {
      method: 'GET',
      params: { limite }
    });
  }

  // ====================================================
  // UTILIDADES
  // ====================================================
  
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.request('/health', { method: 'GET' });
  }
}

export default new ApiService();