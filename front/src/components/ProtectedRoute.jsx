// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * Composant de route protégée.
 * Vérifie si l'utilisateur est authentifié et a le rôle requis pour accéder à une page.
 * @param {object} props - Les propriétés du composant.
 * @param {React.ReactNode} props.children - Les composants enfants à afficher si l'accès est autorisé.
 * @param {string[]} props.allowedRoles - La liste des rôles autorisés à accéder à la route.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  // Utilisation du hook useAuth pour obtenir l'état d'authentification
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Si l'utilisateur n'est pas authentifié, le rediriger vers la page de connexion
  if (!isAuthenticated) {
    // On sauvegarde l'URL actuelle pour rediriger l'utilisateur après la connexion
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si des rôles sont spécifiés et que le rôle de l'utilisateur n'est pas inclus,
  // le rediriger vers une page non autorisée ou la page d'accueil.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirige vers une page "non autorisé" ou simplement la page d'accueil
    // Pour un meilleur UX, une page /unauthorized serait idéale.
    return <Navigate to="/" replace />;
  }

  // Si l'utilisateur est authentifié et a le bon rôle, afficher le contenu de la route
  return children;
};

export default ProtectedRoute;
