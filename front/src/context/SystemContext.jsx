// src/context/SystemContext.jsx
// Vérifie périodiquement l'état du système (maintenance).
// Règles d'accès en mode maintenance :
//   - Toujours autoriser /login et /maintenance elles-mêmes
//   - Toujours autoriser un admin connecté
//   - Toujours autoriser un client avec isMaintenanceAllowed = true
//   - Tout le reste est redirigé vers /maintenance
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import systemService from '../services/systemService';
import { useAuth } from './AuthContext';

const SystemContext = createContext(null);

const POLL_INTERVAL = 15000; // 15s

// Routes toujours accessibles, même en maintenance
const ALWAYS_ALLOWED_PATHS = ['/login', '/maintenance'];

export const SystemProvider = ({ children }) => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const checkStatus = useCallback(async () => {
    // ⚠️ Ne rien faire tant que l'état d'authentification n'est pas stabilisé
    // (évite de rediriger un admin vers /maintenance pendant le chargement initial)
    if (authLoading) return;

    try {
      const res  = await systemService.getStatus();
      const data = res.data;
      setMaintenanceMode(!!data.maintenanceMode);

      const isAdmin              = user?.role === 'admin';
      // data.isMaintenanceAllowed vient de la DB (live) — plus fiable que le JWT
      const isAllowedClient      = !!data.isMaintenanceAllowed || !!user?.isMaintenanceAllowed;
      const isOnAlwaysAllowedRoute = ALWAYS_ALLOWED_PATHS.includes(location.pathname);

      const hasFullAccess = isAdmin || isAllowedClient;

      if (data.maintenanceMode && !hasFullAccess && !isOnAlwaysAllowedRoute) {
        sessionStorage.setItem('maintenanceMessage', data.maintenanceMessage || '');
        navigate('/maintenance', { replace: true });
      }

      // Retour automatique si maintenance terminée et qu'on était bloqué dessus
      if (!data.maintenanceMode && location.pathname === '/maintenance') {
        navigate('/', { replace: true });
      }

      // ✅ Si un admin ou client autorisé se retrouve sur /maintenance, le laisser sortir
      if (data.maintenanceMode && hasFullAccess && location.pathname === '/maintenance') {
        navigate('/', { replace: true });
      }
    } catch {
      // Silencieux — ne jamais bloquer l'utilisateur sur une erreur réseau
    }
  }, [user, authLoading, location.pathname, navigate]);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [checkStatus]);

  return (
    <SystemContext.Provider value={{ maintenanceMode }}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => useContext(SystemContext);
export default SystemProvider;