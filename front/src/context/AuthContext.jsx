//voila le contenue de authcontext.jsx et useAuth.js

//authcontext.jsx
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

 // src/context/AuthContext.jsx
// Modifie la fonction login et l'initialisation

const login = useCallback((userData) => {
  if (!userData) return;
  
  console.log('[AuthContext] Login appelé avec:', userData);
  
  const t = userData.token || userData.accessToken || "";
  if (!t) return;

  const raw = t.startsWith("Bearer ") ? t.slice(7) : t;
  localStorage.setItem("token", raw);

  // 🔥 S'assurer que le rôle est défini
  const userRole = (userData.role || 'client').toLowerCase();
  
  // Construire l'objet utilisateur
  const userObject = {
    id: userData._id || userData.id || null,
    name: userData.name || userData.fullName || userData.username || userData.email?.split('@')[0] || "Utilisateur",
    email: userData.email || "",
    role: userRole,
    balance: userData.balance ?? 0,
  };

  console.log('[AuthContext] Utilisateur créé avec rôle:', userRole);
  
  localStorage.setItem("user", JSON.stringify(userObject));
  setToken(raw);
  setUser(userObject);
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
            role: (decoded.role || null).toLowerCase(),
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
  const raw = readStoredToken();
  if (raw) {
    const decoded = parseTokenSafe(raw);
    if (decoded) {
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        console.warn("Token expiré, déconnexion automatique.");
        logout();
      } else {
        // ✅ Reconstruire user dès le montage
        setUser({
          id: decoded.id || decoded._id || null,
          email: decoded.email || null,
          role: (decoded.role || null).toLowerCase(),
          name: decoded.name || decoded.username || null,
          balance: decoded.balance ?? 0,
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
    isAuthenticated: !!user, // ✅ clé pour la redirection
    login,
    logout,
    updateUserBalance,
    loading,
  }}
>
  {children}
</AuthContext.Provider>
)
};

export const useAuth = () => useContext(AuthContext);
export { AuthProvider };
export default AuthProvider;


