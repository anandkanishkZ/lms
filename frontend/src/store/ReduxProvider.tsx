'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './index';
import { useEffect, useState } from 'react';

// Loading component for PersistGate
const PersistLoading = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
      <p className="text-gray-700 text-lg">Loading...</p>
    </div>
  </div>
);

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Provider store={store}>
      {isClient ? (
        <PersistGate loading={<PersistLoading />} persistor={persistor}>
          {children}
        </PersistGate>
      ) : (
        <PersistLoading />
      )}
    </Provider>
  );
}
