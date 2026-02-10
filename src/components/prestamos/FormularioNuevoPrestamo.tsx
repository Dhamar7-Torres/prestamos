import React, { useState, useEffect } from 'react';
import { validatePersona } from '@/utils/validators';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Card from '@/components/common/Card';
import ErrorMessage from '@/components/common/ErrorMessage';
import apiService from '@/services/api';
import { usePersona } from '@/context/PersonaContext'; 
import type { PrestamoFormData } from '@/types';
import { Persona } from '@prisma/client';

// Tipo específico para el formulario de persona SIN cedula
interface PersonaFormDataSinCedula {
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  // Campos adicionales opcionales que NO incluyen cedula
  direccion?: string;
  notas?: string;
}

interface FormularioNuevoPrestamoProps {
  onSuccess: (prestamo: any) => void;
  onCancel: () => void;
}

const FormularioNuevoPrestamo: React.FC<FormularioNuevoPrestamoProps> = ({
  onSuccess,
  onCancel
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loadingPersonas, setLoadingPersonas] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Usar contexto de personas
  const { crearPersona: crearPersonaEnContexto } = usePersona();

  // Datos del formulario - SIN campo cedula
  const [personaData, setPersonaData] = useState<PersonaFormDataSinCedula>({
    nombre: '',
    apellido: '',
    telefono: '',
    email: ''
  });

  const [prestamoData, setPrestamoData] = useState<Partial<PrestamoFormData>>({
    personaId: undefined,
    montoTotal: undefined,
    tasaInteres: 0,
    tipoPrestamo: 'personal',
    fechaPrestamo: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [useExistingPersona, setUseExistingPersona] = useState(false);

  // Cargar personas existentes
  useEffect(() => {
    const cargarPersonas = async () => {
      try {
        setLoadingPersonas(true);
        const response = await apiService.obtenerPersonas({ 
          limit: 50
        });
        setPersonas(response.data.data || []);
      } catch (err) {
        console.error('Error cargando personas:', err);
        setPersonas([]);
      } finally {
        setLoadingPersonas(false);
      }
    };

    cargarPersonas();
  }, []);

  const tiposPrestamoOptions = [
    { value: 'personal', label: 'Personal' },
    { value: 'comercial', label: 'Comercial' },
    { value: 'emergencia', label: 'Emergencia' },
    { value: 'otro', label: 'Otro' }
  ];

  const personasOptions = personas.map(persona => ({
    value: persona.id,
    label: `${persona.nombre} ${persona.apellido || ''}`.trim()
  }));

  // NUEVA FUNCIÓN: Buscar persona existente por criterios similares
  const buscarPersonaExistente = (datos: PersonaFormDataSinCedula): Persona | null => {
    const nombreCompleto = `${datos.nombre.trim()} ${datos.apellido.trim()}`.toLowerCase();
    
    // Buscar por nombre completo exacto
    let personaExistente = personas.find(p => 
      `${p.nombre} ${p.apellido || ''}`.toLowerCase().trim() === nombreCompleto.trim()
    );

    // Si no encuentra, buscar por email (si está disponible)
    if (!personaExistente && datos.email?.trim()) {
      personaExistente = personas.find(p => 
        p.email?.toLowerCase() === datos.email.toLowerCase()
      );
    }

    // Si no encuentra, buscar por teléfono (si está disponible)
    if (!personaExistente && datos.telefono?.trim()) {
      personaExistente = personas.find(p => 
        p.telefono === datos.telefono.trim()
      );
    }

    return personaExistente || null;
  };

  // Validación personalizada SIN cedula
  const validatePersonaData = (data: PersonaFormDataSinCedula): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    if (!data.nombre || data.nombre.trim().length < 2) {
      errors.nombre = 'El nombre es requerido y debe tener al menos 2 caracteres';
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'El email no tiene un formato válido';
    }

    if (data.telefono && data.telefono.length > 0 && data.telefono.length < 7) {
      errors.telefono = 'El teléfono debe tener al menos 7 dígitos';
    }

    // NUEVA VALIDACIÓN: Verificar duplicados
    if (!useExistingPersona) {
      const personaExistente = buscarPersonaExistente(data);
      if (personaExistente) {
        errors.duplicado = `Ya existe una persona con datos similares: ${personaExistente.nombre} ${personaExistente.apellido || ''}. Use la opción "Seleccionar persona existente".`;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (useExistingPersona) {
      if (!prestamoData.personaId) {
        newErrors.personaId = 'Debe seleccionar una persona';
      }
    } else {
      const personaValidation = validatePersonaData(personaData);
      if (!personaValidation.isValid) {
        Object.assign(newErrors, personaValidation.errors);
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!prestamoData.montoTotal || prestamoData.montoTotal <= 0) {
      newErrors.montoTotal = 'El monto total es requerido y debe ser mayor a cero';
    }

    if (prestamoData.tasaInteres && (prestamoData.tasaInteres < 0 || prestamoData.tasaInteres > 100)) {
      newErrors.tasaInteres = 'La tasa de interés debe estar entre 0% y 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  // NUEVA FUNCIÓN: Registrar en historial de cambios
  const registrarEnHistorial = async (accion: string, tablaAfectada: string, registroId: number, datosNuevos: any, datosAnteriores?: any) => {
    try {
      const historialData = {
        tablaAfectada,
        registroId,
        accion,
        datosAnteriores: datosAnteriores || null,
        datosNuevos,
        usuario: 'usuario',
        timestampCambio: new Date().toISOString()
      };
      
      console.log('📝 Registrando en historial:', historialData);
    } catch (error) {
      console.warn('⚠️ Error registrando en historial:', error);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2() || submitting) return;

    setSubmitting(true);
    setLoading(true);
    setError('');

    try {
      let personaId = prestamoData.personaId;

      // Crear persona si es necesario - SIN enviar campo cedula
      if (!useExistingPersona) {
        try {
          const responsePersonasActualizadas = await apiService.obtenerPersonas({ limit: 100 });
          const personasActualizadas = responsePersonasActualizadas.data.data || [];
          
          // Buscar duplicado en la lista actualizada
          const nombreCompleto = `${personaData.nombre.trim()} ${personaData.apellido.trim()}`.toLowerCase();
          
          let personaExistente = personasActualizadas.find(p => 
            `${p.nombre} ${p.apellido || ''}`.toLowerCase().trim() === nombreCompleto.trim()
          );

          // Buscar por email si no se encontró por nombre
          if (!personaExistente && personaData.email?.trim()) {
            personaExistente = personasActualizadas.find(p => 
              p.email?.toLowerCase() === personaData.email.toLowerCase()
            );
          }

          // Buscar por teléfono si no se encontró por email
          if (!personaExistente && personaData.telefono?.trim()) {
            personaExistente = personasActualizadas.find(p => 
              p.telefono === personaData.telefono.trim()
            );
          }
          
          if (personaExistente) {
            // Si encontramos duplicado, usamos la existente
            personaId = personaExistente.id;
            console.log('✅ Usando persona existente encontrada:', personaExistente);
          } else {
            // Preparar datos de persona sin cedula
            const personaParaCrear = {
              nombre: personaData.nombre.trim(),
              apellido: personaData.apellido.trim() || undefined,
              telefono: personaData.telefono.trim() || undefined,
              email: personaData.email.trim() || undefined,
              activo: true
            };

            console.log('🔍 Creando persona con datos:', personaParaCrear);

            // Crear en la base de datos - ESTA ES LA ÚNICA CREACIÓN
            const responsePersona = await apiService.crearPersona(personaParaCrear);
            const nuevaPersona = responsePersona.data;
            personaId = nuevaPersona.id;
            
            console.log('✅ Persona creada exitosamente con ID:', personaId);
            
            // Registrar en historial de cambios
            await registrarEnHistorial('CREATE', 'personas', nuevaPersona.id, nuevaPersona);
            
            // Actualizar la lista local de personas para el UI
            setPersonas(prevPersonas => [...prevPersonas, nuevaPersona]);
          }
        } catch (errorBusqueda) {
          console.error('❌ Error verificando duplicados:', errorBusqueda);
          throw new Error('Error verificando personas existentes');
        }
      }

      // Crear préstamo
      const prestamoCompleto: PrestamoFormData = {
        personaId: personaId!,
        montoTotal: prestamoData.montoTotal!,
        tasaInteres: prestamoData.tasaInteres || 0,
        tipoPrestamo: prestamoData.tipoPrestamo || 'personal'
      };

      console.log('🔍 Creando préstamo con datos:', prestamoCompleto);

      const responsePrestamo = await apiService.crearPrestamo(prestamoCompleto);
      
      // Registrar préstamo en historial de cambios
      await registrarEnHistorial('CREATE', 'prestamos', responsePrestamo.data.id, responsePrestamo.data);
      
      console.log('✅ Préstamo creado exitosamente:', responsePrestamo.data);
      
      onSuccess(responsePrestamo.data);
    } catch (err: any) {
      console.error('❌ Error en handleSubmit:', err);
      setError(err.message || 'Error al crear el préstamo');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Nuevo Préstamo
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
              disabled={submitting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
          </div>
          
          <div className="flex justify-between mt-2">
            <span className="text-sm text-gray-600">Persona</span>
            <span className="text-sm text-gray-600">Préstamo</span>
          </div>
        </div>

        {error && (
          <ErrorMessage
            message={error}
            variant="error"
            onDismiss={() => setError('')}
            className="mb-6"
          />
        )}

        {/* Mostrar advertencia de duplicado si existe */}
        {errors.duplicado && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">{errors.duplicado}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Persona - SIN campo cedula */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!useExistingPersona}
                  onChange={() => {
                    setUseExistingPersona(false);
                    setErrors({});
                  }}
                  className="mr-2"
                  disabled={submitting}
                />
                <span className="text-sm font-medium">Crear nueva persona</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={useExistingPersona}
                  onChange={() => {
                    setUseExistingPersona(true);
                    setErrors({});
                  }}
                  className="mr-2"
                  disabled={submitting}
                />
                <span className="text-sm font-medium">Seleccionar persona existente</span>
              </label>
            </div>

            {useExistingPersona ? (
              <Select
                label="Seleccionar Persona"
                options={personasOptions}
                placeholder="Seleccione una persona..."
                value={prestamoData.personaId || ''}
                onChange={(e) => setPrestamoData({
                  ...prestamoData,
                  personaId: Number(e.target.value)
                })}
                error={errors.personaId}
                fullWidth
                disabled={loadingPersonas || submitting}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre *"
                  value={personaData.nombre}
                  onChange={(e) => {
                    setPersonaData({
                      ...personaData,
                      nombre: e.target.value
                    });
                    if (errors.duplicado) {
                      const { duplicado, ...otherErrors } = errors;
                      setErrors(otherErrors);
                    }
                  }}
                  error={errors.nombre}
                  placeholder="Juan"
                  fullWidth
                  disabled={submitting}
                />

                <Input
                  label="Apellido"
                  value={personaData.apellido}
                  onChange={(e) => {
                    setPersonaData({
                      ...personaData,
                      apellido: e.target.value
                    });
                    if (errors.duplicado) {
                      const { duplicado, ...otherErrors } = errors;
                      setErrors(otherErrors);
                    }
                  }}
                  error={errors.apellido}
                  placeholder="Pérez"
                  fullWidth
                  disabled={submitting}
                />

                <Input
                  label="Teléfono"
                  type="tel"
                  value={personaData.telefono}
                  onChange={(e) => {
                    setPersonaData({
                      ...personaData,
                      telefono: e.target.value
                    });
                    if (errors.duplicado) {
                      const { duplicado, ...otherErrors } = errors;
                      setErrors(otherErrors);
                    }
                  }}
                  error={errors.telefono}
                  placeholder="300 123 4567"
                  fullWidth
                  disabled={submitting}
                />

                <Input
                  label="Email"
                  type="email"
                  value={personaData.email}
                  onChange={(e) => {
                    setPersonaData({
                      ...personaData,
                      email: e.target.value
                    });
                    if (errors.duplicado) {
                      const { duplicado, ...otherErrors } = errors;
                      setErrors(otherErrors);
                    }
                  }}
                  error={errors.email}
                  placeholder="juan@email.com"
                  fullWidth
                  disabled={submitting}
                />
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button
                variant="secondary"
                onClick={onCancel}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleNext}
                disabled={loadingPersonas || submitting}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Préstamo */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Información del Préstamo
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Monto Total *"
                type="number"
                step="0.01"
                min="0"
                value={prestamoData.montoTotal || ''}
                onChange={(e) => setPrestamoData({
                  ...prestamoData,
                  montoTotal: Number(e.target.value)
                })}
                error={errors.montoTotal}
                placeholder="1000000.00"
                fullWidth
                disabled={submitting}
              />

              <Input
                label="Tasa de Interés (%)"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={prestamoData.tasaInteres || ''}
                onChange={(e) => setPrestamoData({
                  ...prestamoData,
                  tasaInteres: Number(e.target.value)
                })}
                error={errors.tasaInteres}
                placeholder="5.00"
                helperText="Opcional: Deja en 0 si no aplica interés"
                fullWidth
                disabled={submitting}
              />

              <Select
                label="Tipo de Préstamo"
                options={tiposPrestamoOptions}
                value={prestamoData.tipoPrestamo || 'personal'}
                onChange={(e) => setPrestamoData({
                  ...prestamoData,
                  tipoPrestamo: e.target.value as any
                })}
                fullWidth
                disabled={submitting}
              />

              <Input
                label="Fecha de Entrega *"
                type="date"
                value={prestamoData.fechaPrestamo || new Date().toISOString().split('T')[0]}
                onChange={(e) => setPrestamoData({
                  ...prestamoData,
                  fechaPrestamo: e.target.value
                })}
                helperText="Fecha en que se entregó el dinero"
                fullWidth
                disabled={submitting}
              />
            </div>

            <div className="flex justify-between">
              <Button
                variant="secondary"
                onClick={handleBack}
                disabled={loading || submitting}
              >
                Anterior
              </Button>
              
              <div className="space-x-4">
                <Button
                  variant="secondary"
                  onClick={onCancel}
                  disabled={loading || submitting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  loading={loading || submitting}
                  disabled={submitting}
                >
                  {submitting ? 'Creando...' : 'Crear Préstamo'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default FormularioNuevoPrestamo;