import { useState, useCallback } from 'react';
import { handleApiError } from '@/utils/helpers';
import type { UseApiOptions, ProcessedError } from '@/types';

export const useApi = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ProcessedError | null>(null);

  const execute = useCallback(async <T>(
    apiCall: () => Promise<T>,
    options: UseApiOptions = {}
  ): Promise<T> => {
    const { 
      showLoader = true, 
      onSuccess, 
      onError,
      resetErrorOnStart = true
    } = options;

    if (showLoader) setLoading(true);
    if (resetErrorOnStart) setError(null);

    try {
      const result = await apiCall();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err: any) {
      const processedError = handleApiError(err);
      setError(processedError);
      
      if (onError) {
        onError(processedError);
      }
      
      throw processedError;
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    clearError
  };
};

export default useApi;