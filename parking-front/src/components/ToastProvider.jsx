import React from 'react';
import { Toaster } from 'react-hot-toast';

const ToastProvider = () => {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Default options for all toasts
        duration: 4000,
        style: {
          background: '#fff',
          color: '#333',
          borderRadius: '12px',
          border: '2px solid #E8092E',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          padding: '16px 20px',
          fontSize: '16px',
          fontWeight: '500',
          maxWidth: '500px',
          minWidth: '300px',
        },
        // Success toast
        success: {
          duration: 5000,
          style: {
            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
            color: '#fff',
            border: '2px solid #28a745',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(40, 167, 69, 0.3)',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#28a745',
          },
        },
        // Error toast
        error: {
          duration: 6000,
          style: {
            background: 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)',
            color: '#fff',
            border: '2px solid #dc3545',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(220, 53, 69, 0.3)',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#dc3545',
          },
        },
        // Loading toast
        loading: {
          duration: Infinity,
          style: {
            background: 'linear-gradient(135deg, #E8092E 0%, #1B1F28 100%)',
            color: '#fff',
            border: '2px solid #E8092E',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(232, 9, 46, 0.3)',
          },
        },
      }}
    />
  );
};

export default ToastProvider;

