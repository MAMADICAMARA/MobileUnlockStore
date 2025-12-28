// src/hooks/useAuth.js
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

/**
 * useAuth safe wrapper
 * - importe AuthContext correctement
 * - retourne un fallback si le provider n'est pas monté (évite ReferenceError / crash)
 */
const DEFAULT = {
  user: null,
  token: "",
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  updateUserBalance: () => {},
  loading: false,
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Ne pas planter l'app : renvoyer un fallback et logguer pour debug
    // Les composants peuvent continuer à s'afficher (page d'accueil visible)
    // et vous remplacerez le stub par la vraie implémentation plus tard.
    console.warn("useAuth: AuthContext introuvable — retour du fallback.");
    return DEFAULT;
  }
  return ctx;
};

export default useAuth;
