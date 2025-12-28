// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext, useCallback, useRef } from "react";
import {jwtDecode} from "jwt-decode";

export const AuthContext = createContext(null);

const readStoredToken = () => {
  const t = localStorage.getItem("token") || "";
  return t.startsWith("Bearer ") ? t.slice(7) : t;
};

const parseTokenSafe = (rawToken) => {
  try {
    if (!rawToken) return null;
    return jwtDecode(rawToken);
  } catch (err) {
    console.error("Échec du décodage JWT:", err, rawToken);
    return null;
  }
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => readStoredToken());
  const [loading, setLoading] = useState(true);
  const inactivityTimer = useRef(null);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = null;
    }
    console.info("Utilisateur déconnecté.");
  }, []);

  const login = useCallback((userData) => {
    if (!userData) return;
    const t = userData.token || userData.accessToken || "";
    if (!t) return;
    const raw = t.startsWith("Bearer ") ? t.slice(7) : t;
    localStorage.setItem("token", raw);
    setToken(raw);
    setUser({
      id: userData._id || userData.id || null,
      name: userData.name || userData.fullName || "",
      email: userData.email || "",
      role: userData.role || "",
      balance: userData.balance ?? 0,
      // Désactiver la vérification email côté client : forcer le flag de confirmation
      confirmed: true,
      emailConfirmed: true,
    });
  }, []);

  const updateUserBalance = useCallback((newBalance) => {
    setUser((cur) => (cur ? { ...cur, balance: newBalance } : cur));
  }, []);

  useEffect(() => {
    const raw = readStoredToken();
    if (raw) {
      const decoded = parseTokenSafe(raw);
      if (decoded) {
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          console.warn("Token expiré, déconnexion automatique.");
          logout();
        } else {
          setUser({
            id: decoded.id || decoded._id || null,
            email: decoded.email || null,
            role: decoded.role || null,
            name: decoded.name || decoded.username || null,
            balance: decoded.balance ?? 0,
            // Forcer confirmation côté client pour bypasser l'étape d'email
            confirmed: true,
            emailConfirmed: true,
          });
          setToken(raw);
        }
      } else {
        logout();
      }
    }
    setLoading(false);
    // debug
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logout]);

  useEffect(() => {
    const resetTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        logout();
        try {
          alert("Session expirée après 15 minutes d'inactivité. Veuillez vous reconnecter.");
        } catch {
          console.warn("Session expirée (alert échouée).");
        }
      }, 15 * 60 * 1000);
    };

    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [logout]);

  // eslint-disable-next-line no-unused-vars
  useEffect(() => {
    console.debug('[AuthContext] état:', { user, token: !!token, loading })
  }, [user, token, loading])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        logout,
        updateUserBalance,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export { AuthProvider };
export default AuthProvider;
