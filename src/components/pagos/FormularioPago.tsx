import React, { useState } from 'react';
import { formatCurrency } from '@/utils/formatters';
import { validatePaymentAmount } from '@/utils/helpers';
import { METODOS_PAGO } from '@/utils/constants';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Textarea from '@/components/common/Textarea';
import Card from '@/components/common/Card';
import ErrorMessage from '@/components/common/ErrorMessage';
import type { Prestamo, PagoFormData, MetodoPago } from '@/types';

interface FormularioPagoProps {
  prestamo: Prestamo;
  onPagoRegistrado: (dataPago: Omit<PagoFormData, 'prestamoId'>) => Promise<void>;
  onCancelar: () => void;
}

const FormularioPago: React.FC<FormularioPagoProps> = ({
  prestamo,
  onPagoRegistrado,
  onCancelar
}) => {
  const [formData, setFormData] = useState<Omit<PagoFormData, 'prestamoId'>>({
    monto: 0,
    montoCapital: 0,
    montoInteres: 0,
    montoMora: 0,
    metodoPago: 'efectivo',
    numeroTransaccion: '',
    descripcion: '',
    esCuota: false,
    numeroCuota: undefined
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const metodosOptions = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'tarjeta', label: 'Tarjeta' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'otro', label: 'Otro' }
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    setError('');

    // Validar monto
    const montoValidation = validatePaymentAmount(formData.monto, prestamo.montoRestante);
    if (!montoValidation.isValid) {
      newErrors.monto = montoValidation.message;
    }

    // Validar componentes del pago si están definidos
    const capital = Number(formData.montoCapital || 0);
    const interes = Number(formData.montoInteres || 0);
    const mora = Number(formData.montoMora || 0);
    const sumaComponentes = capital + interes + mora;

    if (sumaComponentes > 0 && Math.abs(sumaComponentes - Number(formData.monto)) > 0.01) {
      newErrors.componentes = 'La suma de capital, interés y mora debe coincidir con el monto total';
    }

    // Validar número de cuota si es una cuota
    if (formData.esCuota && (!formData.numeroCuota || formData.numeroCuota <= 0)) {
      newErrors.numeroCuota = 'Debe especificar el número de cuota';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      await onPagoRegistrado(formData);
    } catch (err: any) {
      setError(err.message || 'Error al registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  const sugerirMontos = [
    { label: '25%', monto: Number(prestamo.montoRestante) * 0.25 },
    { label: '50%', monto: Number(prestamo.montoRestante) * 0.5 },
    { label: '75%', monto: Number(prestamo.montoRestante) * 0.75 },
    { label: 'Total', monto: Number(prestamo.montoRestante) }
  ];

  const handleSugerencia = (monto: number) => {
    setFormData({
      ...formData,
      monto,
      montoCapital: monto // Por defecto, todo va a capital
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-900">
            Registrar Pago
          </h3>
          <button
            onClick={onCancelar}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2">
            {prestamo.persona?.nombre} {prestamo.persona?.apellido}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Deuda restante:</span>
              <span className="font-semibold text-warning-600 ml-2">
                {formatCurrency(prestamo.montoRestante)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Total pagado:</span>
              <span className="font-semibold text-success-600 ml-2">
                {formatCurrency(prestamo.montoPagado)}
              </span>
            </div>
          </div>
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

      {errors.componentes && (
        <ErrorMessage
          message={errors.componentes}
          variant="warning"
          className="mb-6"
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Input
            label="Monto del pago *"
            type="number"
            step="0.01"
            min="0"
            max={Number(prestamo.montoRestante)}
            value={formData.monto || ''}
            onChange={(e) => setFormData({
              ...formData,
              monto: Number(e.target.value)
            })}
            error={errors.monto}
            placeholder="0.00"
            fullWidth
          />
          
          {/* Montos sugeridos */}
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">Montos sugeridos:</p>
            <div className="flex flex-wrap gap-2">
              {sugerirMontos.map((sugerido, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSugerencia(sugerido.monto)}
                  className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                  disabled={loading}
                >
                  {sugerido.label} - {formatCurrency(sugerido.monto)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Método de Pago"
            options={metodosOptions}
            value={formData.metodoPago || ''}
            onChange={(e) => setFormData({
              ...formData,
              metodoPago: e.target.value as MetodoPago
            })}
            error={errors.metodoPago}
            fullWidth
          />

          <Input
            label="Número de Transacción"
            value={formData.numeroTransaccion || ''}
            onChange={(e) => setFormData({
              ...formData,
              numeroTransaccion: e.target.value
            })}
            error={errors.numeroTransaccion}
            placeholder="Referencia o número"
            fullWidth
          />
        </div>

        {/* Componentes del pago (avanzado) */}
        <details className="border border-gray-200 rounded-lg">
          <summary className="p-4 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-50">
            Distribución del pago (avanzado)
          </summary>
          <div className="p-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Capital"
              type="number"
              step="0.01"
              min="0"
              value={formData.montoCapital || ''}
              onChange={(e) => setFormData({
                ...formData,
                montoCapital: Number(e.target.value)
              })}
              placeholder="0.00"
              fullWidth
            />

            <Input
              label="Interés"
              type="number"
              step="0.01"
              min="0"
              value={formData.montoInteres || ''}
              onChange={(e) => setFormData({
                ...formData,
                montoInteres: Number(e.target.value)
              })}
              placeholder="0.00"
              fullWidth
            />

            <Input
              label="Mora"
              type="number"
              step="0.01"
              min="0"
              value={formData.montoMora || ''}
              onChange={(e) => setFormData({
                ...formData,
                montoMora: Number(e.target.value)
              })}
              placeholder="0.00"
              fullWidth
            />
          </div>
        </details>

        {/* Es cuota */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.esCuota || false}
              onChange={(e) => setFormData({
                ...formData,
                esCuota: e.target.checked,
                numeroCuota: e.target.checked ? (prestamo.cuotasPagadas + 1) : undefined
              })}
              className="mr-2 rounded"
            />
            <span className="text-sm text-gray-700">Este pago corresponde a una cuota</span>
          </label>

          {formData.esCuota && (
            <Input
              label="Número de cuota"
              type="number"
              min="1"
              value={formData.numeroCuota || ''}
              onChange={(e) => setFormData({
                ...formData,
                numeroCuota: Number(e.target.value)
              })}
              error={errors.numeroCuota}
              placeholder={String(prestamo.cuotasPagadas + 1)}
            />
          )}
        </div>

        <Textarea
          label="Descripción (opcional)"
          value={formData.descripcion || ''}
          onChange={(e) => setFormData({
            ...formData,
            descripcion: e.target.value
          })}
          error={errors.descripcion}
          placeholder="Concepto del pago, observaciones..."
          fullWidth
          rows={3}
        />

        <div className="flex space-x-4">
          <Button
            type="submit"
            loading={loading}
            disabled={!formData.monto || formData.monto <= 0}
            fullWidth
          >
            Registrar Pago
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancelar}
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default FormularioPago;