import toast from 'react-hot-toast';

const useToast = () => {
  const showSuccess = (message, options = {}) => {
    return toast.success(message, {
      duration: 5000,
      ...options
    });
  };

  const showError = (message, options = {}) => {
    return toast.error(message, {
      duration: 6000,
      ...options
    });
  };

  const showLoading = (message, options = {}) => {
    return toast.loading(message, {
      duration: Infinity,
      ...options
    });
  };

  const showInfo = (message, options = {}) => {
    return toast(message, {
      duration: 4000,
      icon: 'ℹ️',
      style: {
        background: 'linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%)',
        color: '#fff',
        border: '2px solid #17a2b8',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(23, 162, 184, 0.3)',
      },
      ...options
    });
  };

  const showWarning = (message, options = {}) => {
    return toast(message, {
      duration: 5000,
      icon: '⚠️',
      style: {
        background: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)',
        color: '#fff',
        border: '2px solid #ffc107',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(255, 193, 7, 0.3)',
      },
      ...options
    });
  };

  const dismiss = (toastId) => {
    toast.dismiss(toastId);
  };

  const dismissAll = () => {
    toast.dismiss();
  };

  return {
    showSuccess,
    showError,
    showLoading,
    showInfo,
    showWarning,
    dismiss,
    dismissAll,
    // Direct access to toast for custom usage
    toast
  };
};

export default useToast;

