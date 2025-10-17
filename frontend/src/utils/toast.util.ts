import { toast, ToastOptions } from 'react-toastify';

const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: 'light',
};

export const showSuccessToast = (message: string, options?: ToastOptions) => {
  toast.success(message, {
    ...defaultOptions,
    ...options,
  });
};

export const showErrorToast = (message: string, options?: ToastOptions) => {
  toast.error(message, {
    ...defaultOptions,
    ...options,
  });
};

export const showInfoToast = (message: string, options?: ToastOptions) => {
  toast.info(message, {
    ...defaultOptions,
    ...options,
  });
};

export const showWarningToast = (message: string, options?: ToastOptions) => {
  toast.warning(message, {
    ...defaultOptions,
    ...options,
  });
};

export const showLoadingToast = (message: string) => {
  return toast.loading(message, {
    position: 'top-right',
    theme: 'light',
  });
};

export const updateToast = (toastId: any, type: 'success' | 'error' | 'info' | 'warning', message: string) => {
  toast.update(toastId, {
    render: message,
    type: type,
    isLoading: false,
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

export const dismissToast = (toastId?: any) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};
