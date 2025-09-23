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

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setLoading(true);
    setError('');

    try {
      let personaId = prestamoData.personaId;

      // Crear persona si es necesario - SIN enviar campo cedula
      if (!useExistingPersona) {
        // Preparar datos de persona sin cedula
        const personaParaCrear = {
          nombre: personaData.nombre.trim(),
          apellido: personaData.apellido.trim() || undefined,
          telefono: personaData.telefono.trim() || undefined,
          email: personaData.email.trim() || undefined,
          activo: true
          // NO incluir cedula
        };

        console.log('🔍 Creando persona con datos:', personaParaCrear);

        // Crear en la base de datos
        const responsePersona = await apiService.crearPersona(personaParaCrear);
        personaId = responsePersona.data.id;
        
        // Actualizar el contexto de personas
        try {
          await crearPersonaEnContexto(personaParaCrear);
          console.log('✅ Persona sincronizada con contexto');
        } catch (contextError) {
          console.warn('⚠️ Error sincronizando persona con contexto:', contextError);
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
      onSuccess(responsePrestamo.data);
    } catch (err: any) {
      console.error('❌ Error en handleSubmit:', err);
      setError(err.message || 'Error al crear el préstamo');
    } finally {
      setLoading(false);
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

        {/* Step 1: Persona - SIN campo cedula */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!useExistingPersona}
                  onChange={() => setUseExistingPersona(false)}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Crear nueva persona</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={useExistingPersona}
                  onChange={() => setUseExistingPersona(true)}
                  className="mr-2"
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
                disabled={loadingPersonas}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre *"
                  value={personaData.nombre}
                  onChange={(e) => setPersonaData({
                    ...personaData,
                    nombre: e.target.value
                  })}
                  error={errors.nombre}
                  placeholder="Juan"
                  fullWidth
                />

                <Input
                  label="Apellido"
                  value={personaData.apellido}
                  onChange={(e) => setPersonaData({
                    ...personaData,
                    apellido: e.target.value
                  })}
                  error={errors.apellido}
                  placeholder="Pérez"
                  fullWidth
                />

                <Input
                  label="Teléfono"
                  type="tel"
                  value={personaData.telefono}
                  onChange={(e) => setPersonaData({
                    ...personaData,
                    telefono: e.target.value
                  })}
                  error={errors.telefono}
                  placeholder="300 123 4567"
                  fullWidth
                />

                <Input
                  label="Email"
                  type="email"
                  value={personaData.email}
                  onChange={(e) => setPersonaData({
                    ...personaData,
                    email: e.target.value
                  })}
                  error={errors.email}
                  placeholder="juan@email.com"
                  fullWidth
                />
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button
                variant="secondary"
                onClick={onCancel}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleNext}
                disabled={loadingPersonas}
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
              />
            </div>

            <div className="flex justify-between">
              <Button
                variant="secondary"
                onClick={handleBack}
                disabled={loading}
              >
                Anterior
              </Button>
              
              <div className="space-x-4">
                <Button
                  variant="secondary"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  loading={loading}
                >
                  Crear Préstamo
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