'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import NexusAlertBox, { AlertType } from './NexusAlertBox';

interface AlertAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface AlertOptions {
  type: AlertType;
  title: string;
  message: string;
  actions?: AlertAction[];
  autoClose?: boolean;
  duration?: number;
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export default function AlertProvider({ children }: AlertProviderProps) {
  const [alert, setAlert] = useState<AlertOptions | null>(null);

  const showAlert = (options: AlertOptions) => {
    setAlert(options);
  };

  const hideAlert = () => {
    setAlert(null);
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      {alert && alert.title && alert.message && (
        <NexusAlertBox
          isOpen={true}
          onClose={hideAlert}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          actions={alert.actions}
          autoClose={alert.autoClose}
          duration={alert.duration}
        />
      )}
    </AlertContext.Provider>
  );
} 