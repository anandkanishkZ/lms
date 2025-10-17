import { toast, ToastOptions } from 'react-toastify';

// Custom toast configuration for admin dashboard
const defaultToastOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  className: 'admin-toast',
};

// Success toast with custom styling
export const showSuccessToast = (message: string, options?: ToastOptions) => {
  return toast.success(message, {
    ...defaultToastOptions,
    className: 'admin-toast admin-toast-success',
    ...options,
  });
};

// Error toast with custom styling
export const showErrorToast = (message: string, options?: ToastOptions) => {
  return toast.error(message, {
    ...defaultToastOptions,
    className: 'admin-toast admin-toast-error',
    ...options,
  });
};

// Info toast with custom styling
export const showInfoToast = (message: string, options?: ToastOptions) => {
  return toast.info(message, {
    ...defaultToastOptions,
    className: 'admin-toast admin-toast-info',
    ...options,
  });
};

// Warning toast with custom styling
export const showWarningToast = (message: string, options?: ToastOptions) => {
  return toast.warning(message, {
    ...defaultToastOptions,
    className: 'admin-toast admin-toast-warning',
    ...options,
  });
};

// Loading toast
export const showLoadingToast = (message: string = 'Loading...') => {
  return toast.loading(message, {
    ...defaultToastOptions,
    className: 'admin-toast admin-toast-loading',
  });
};

// Promise toast for async operations
export const showPromiseToast = (
  promise: Promise<any>,
  messages: {
    pending: string;
    success: string;
    error: string;
  }
) => {
  return toast.promise(promise, messages, {
    ...defaultToastOptions,
  });
};

export { toast };