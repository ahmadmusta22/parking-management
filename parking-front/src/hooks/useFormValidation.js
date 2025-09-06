import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import useToast from './useToast';

export const useFormValidation = (schema, defaultValues = {}) => {
  const { showError, showSuccess } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
    getValues
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
    mode: 'onSubmit' // Only validate on submit to be less restrictive
  });

  const onSubmit = async (data, customSubmitFn) => {
    try {
      if (customSubmitFn) {
        await customSubmitFn(data);
      }
      showSuccess('Form submitted successfully!');
      reset();
    } catch (error) {
      console.error('Form submission error:', error);
      showError(error.message || 'An error occurred while submitting the form');
    }
  };

  const getFieldError = (fieldName) => {
    return errors[fieldName]?.message;
  };

  const hasFieldError = (fieldName) => {
    return !!errors[fieldName];
  };

  const isFormValid = Object.keys(errors).length === 0;

  return {
    register,
    handleSubmit: (customSubmitFn) => handleSubmit((data) => onSubmit(data, customSubmitFn)),
    errors,
    isSubmitting,
    reset,
    setValue,
    watch,
    getValues,
    getFieldError,
    hasFieldError,
    isFormValid
  };
};

export default useFormValidation;
