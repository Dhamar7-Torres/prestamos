import apiService from './api';
import type { Persona, PersonaFormData, ApiResponse, PaginatedResponse } from '@/types';

interface BuscarPersonasOptions {
  limite?: number;
  incluirInactivas?: boolean;
  [key: string]: any;
}

class PersonaService {
  private readonly baseEndpoint = '/personas';

  // ====================================================
  // OPERACIONES BÁSICAS CRUD
  // ====================================================

  async obtenerTodas(params: Record<string, any> = {}): Promise<ApiResponse<PaginatedResponse<Persona>>> {
    try {
      const response = await apiService.obtenerPersonas(params);
      return response;
    } catch (error) {
      console.error('Error obteniendo personas:', error);
      throw error;
    }
  }

  async obtenerPorId(id: number): Promise<ApiResponse<Persona>> {
    if (!id) {
      throw new Error('ID de persona requerido');
    }

    try {
      const response = await apiService.obtenerPersona(id);
      return response;
    } catch (error) {
      console.error(`Error obteniendo persona ${id}:`, error);
      throw error;
    }
  }

  async crear(data: PersonaFormData): Promise<ApiResponse<Persona>> {
    if (!data || !data.nombre) {
      throw new Error('Datos de persona inválidos');
    }

    try {
      const personaData = this.sanitizePersonaData(data);
      const response = await apiService.crearPersona(personaData);
      return response;
    } catch (error) {
      console.error('Error creando persona:', error);
      throw error;
    }
  }

  async actualizar(id: number, data: Partial<PersonaFormData>): Promise<ApiResponse<Persona>> {
    if (!id) {
      throw new Error('ID de persona requerido');
    }

    if (!data || Object.keys(data).length === 0) {
      throw new Error('Datos para actualizar requeridos');
    }

    try {
      const personaData = this.sanitizePersonaData(data);
      const response = await apiService.actualizarPersona(id, personaData);
      return response;
    } catch (error) {
      console.error(`Error actualizando persona ${id}:`, error);
      throw error;
    }
  }

  async eliminar(id: number): Promise<ApiResponse<null>> {
    if (!id) {
      throw new Error('ID de persona requerido');
    }

    try {
      const response = await apiService.eliminarPersona(id);
      return response;
    } catch (error) {
      console.error(`Error eliminando persona ${id}:`, error);
      throw error;
    }
  }

  // ====================================================
  // OPERACIONES ESPECÍFICAS
  // ====================================================

  async obtenerEstadisticas(id: number): Promise<ApiResponse<any>> {
    if (!id) {
      throw new Error('ID de persona requerido');
    }

    try {
      const response = await apiService.obtenerEstadisticasPersona(id);
      return response;
    } catch (error) {
      console.error(`Error obteniendo estadísticas de persona ${id}:`, error);
      throw error;
    }
  }

  async buscarPersonas(termino: string, opciones: BuscarPersonasOptions = {}): Promise<ApiResponse<PaginatedResponse<Persona>>> {
    const params = {
      buscar: termino,
      limit: opciones.limite || 10,
      incluirInactivas: opciones.incluirInactivas || false,
      ...opciones
    };

    try {
      const response = await this.obtenerTodas(params);
      return response;
    } catch (error) {
      console.error('Error buscando personas:', error);
      throw error;
    }
  }

  async obtenerPersonasConPrestamosActivos(): Promise<ApiResponse<PaginatedResponse<Persona>>> {
    try {
      const params = { conPrestamosActivos: true };
      const response = await this.obtenerTodas(params);
      return response;
    } catch (error) {
      console.error('Error obteniendo personas con préstamos activos:', error);
      throw error;
    }
  }

  // ====================================================
  // VALIDACIONES Y SANITIZACIÓN
  // ====================================================

  sanitizePersonaData(data: Partial<PersonaFormData>): Partial<PersonaFormData> {
    const sanitized = { ...data };

    // Limpiar strings
    if (sanitized.nombre) {
      sanitized.nombre = sanitized.nombre.trim();
    }
    if (sanitized.apellido) {
      sanitized.apellido = sanitized.apellido.trim();
    }
    if (sanitized.email) {
      sanitized.email = sanitized.email.toLowerCase().trim();
    }
    if (sanitized.telefono) {
      sanitized.telefono = sanitized.telefono.replace(/\s+/g, '');
    }

    // Remover campos vacíos
    Object.keys(sanitized).forEach(key => {
      const value = sanitized[key as keyof PersonaFormData];
      if (value === '' || value === null) {
        delete sanitized[key as keyof PersonaFormData];
      }
    });

    return sanitized;
  }

  validatePersonaData(data: PersonaFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.nombre || data.nombre.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Email inválido');
    }

    if (data.telefono && !/^[+]?[\d\s\-\$\$]{7,15}$/.test(data.telefono)) {
      errors.push('Teléfono inválido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ====================================================
  // UTILIDADES
  // ====================================================

  formatPersonaParaMostrar(persona: Persona): Persona & { 
    nombreCompleto: string; 
    iniciales: string;
  } {
    return {
      ...persona,
      nombreCompleto: `${persona.nombre} ${persona.apellido || ''}`.trim(),
      iniciales: this.obtenerIniciales(persona.nombre, persona.apellido)
    };
  }

  obtenerIniciales(nombre: string, apellido?: string): string {
    const inicial1 = nombre ? nombre.charAt(0).toUpperCase() : '';
    const inicial2 = apellido ? apellido.charAt(0).toUpperCase() : '';
    return inicial1 + inicial2;
  }

  // ====================================================
  // EXPORTACIÓN Y REPORTES
  // ====================================================

  async exportarPersonas(formato: 'json' | 'csv' = 'json', filtros: Record<string, any> = {}): Promise<string> {
    try {
      const response = await this.obtenerTodas({ ...filtros, limit: 1000 });
      const personas = response.data.data || [];

      switch (formato.toLowerCase()) {
        case 'csv':
          return this.convertirACSV(personas);
        case 'json':
          return JSON.stringify(personas, null, 2);
        default:
          throw new Error('Formato no soportado');
      }
    } catch (error) {
      console.error('Error exportando personas:', error);
      throw error;
    }
  }

  convertirACSV(personas: Persona[]): string {
    if (!personas || personas.length === 0) {
      return 'No hay datos para exportar';
    }

    const headers = [
      'ID', 'Nombre', 'Apellido', 'Teléfono', 'Email', 
      'Dirección', 'Activo', 'Fecha Creación'
    ];

    const filas = personas.map(persona => [
      persona.id,
      persona.nombre,
      persona.apellido || '',
      persona.telefono || '',
      persona.email || '',
      persona.direccion || '',
      persona.activo ? 'Sí' : 'No',
      new Date(persona.createdAt).toLocaleDateString()
    ]);

    return [headers, ...filas]
      .map(fila => fila.map(campo => `"${campo}"`).join(','))
      .join('\n');
  }
}

export default new PersonaService();