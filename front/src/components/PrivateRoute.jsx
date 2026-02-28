// src/components/PrivateRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Vérifier l'authentification
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérifier les rôles autorisés
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    console.warn(`Accès refusé. Rôle ${user?.role} non autorisé. Rôles acceptés:`, allowedRoles);
    
    // Rediriger vers le dashboard approprié selon le rôle
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === 'utilisateur-employer') {
      return <Navigate to="/employee/dashboard" replace />;
    } else {
      return <Navigate to="/client/dashboard" replace />;
    }
  }

  return children;
};

export default PrivateRoute;