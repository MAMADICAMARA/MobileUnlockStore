// src/components/OfflineBlocker.jsx
import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

const OfflineBlocker = () => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-950 p-6 text-center">
      <div className="w-20 h-20 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-500 mb-6 animate-pulse">
        <WifiOff className="w-10 h-10" />
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Connexion Internet requise
      </h1>
      
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8 text-sm leading-relaxed">
        Impossible de charger l'application. Veuillez vérifier votre connexion internet pour accéder à vos services.
      </p>

      <button
        onClick={handleReload}
        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all text-sm font-medium active:scale-95"
      >
        <RefreshCw className="w-4 h-4" />
        Réessayer
      </button>
    </div>
  );
};

export default OfflineBlocker;