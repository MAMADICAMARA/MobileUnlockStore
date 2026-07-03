// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext, useCallback, useRef } from "react";
import {jwtDecode} from "jwt-decode";

export const AuthContext = createContext(null);

const API_BASE = (
  import.meta.env.MODE === 'development'
    ? 'http://localhost:5000'
    : (import.meta.env.VITE_API_URL || '')
).replace(/\/+$/, '');

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
    localStorage.removeItem("user");
    localStorage.removeItem("cachedBalance");
    setToken("");
    setUser(null);
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = null;
    }
  }, []);

  const INACTIVITY_DELAY = 30 * 60 * 1000;

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(logout, INACTIVITY_DELAY);
  }, [logout]);

  useEffect(() => {
    if (!user) return;
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetInactivityTimer, { passive: true }));
    resetInactivityTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetInactivityTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [user, resetInactivityTimer]);

  const login = useCallback((userData) => {
    if (!userData) return;
    console.log('[AuthContext] Login appelé avec:', userData);
    const t = userData.token || userData.accessToken || "";
    if (!t) return;
    const raw = t.startsWith("Bearer ") ? t.slice(7) : t;
    localStorage.setItem("token", raw);
    const userRole = (userData.role || 'client').toLowerCase();
    const userObject = {
      id:                  userData._id || userData.id || null,
      name:                userData.name || userData.fullName || userData.username || userData.email?.split('@')[0] || "Utilisateur",
      email:               userData.email || "",
      role:                userRole,
      balance:             userData.balance ?? 0,
      isMaintenanceAllowed: !!userData.isMaintenanceAllowed,
    };
    console.log('[AuthContext] Utilisateur créé avec rôle:', userRole);
    localStorage.setItem("user", JSON.stringify(userObject));
    localStorage.setItem("cachedBalance", String(userObject.balance));
    setToken(raw);
    setUser(userObject);
  }, []);

  // ✅ FIX CRITIQUE : updateUserBalance persiste dans localStorage ET cachedBalance
  const updateUserBalance = useCallback((newBalance) => {
    if (typeof newBalance !== 'number' || isNaN(newBalance)) return;
    localStorage.setItem('cachedBalance', String(newBalance));
    setUser((cur) => {
      if (!cur) return cur;
      const updated = { ...cur, balance: newBalance };
      // ✅ Persiste dans localStorage pour survivre au rechargement de page
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const refreshBalance = useCallback(() => {
    const raw = readStoredToken();
    if (!raw) return;
    fetch(`${API_BASE}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${raw}`, 'Content-Type': 'application/json' },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const fresh = data?.user?.balance;
        if (typeof fresh === 'number') {
          updateUserBalance(fresh);
        }
      })
      .catch(() => null);
  }, [updateUserBalance]);

  // ✅ Initialisation : JWT pour l'identité + API pour le solde réel
  useEffect(() => {
    const raw = readStoredToken();
    if (!raw) { setLoading(false); return; }

    const decoded = parseTokenSafe(raw);
    if (!decoded) { logout(); setLoading(false); return; }

    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      console.warn("Token expiré, déconnexion automatique.");
      logout();
      setLoading(false);
      return;
    }

    // ✅ Construire le user depuis le JWT + localStorage si disponible
    const storedUser = localStorage.getItem('user');
    let baseUser = null;
    if (storedUser) {
      try { baseUser = JSON.parse(storedUser); } catch { /* ignore */ }
    }

    const userObject = baseUser || {
      id:                   decoded.id || decoded._id || null,
      email:                decoded.email || null,
      role:                 (decoded.role || 'client').toLowerCase(),
      name:                 decoded.name || decoded.username || null,
      balance:              0, // sera mis à jour par l'API
      isMaintenanceAllowed: !!decoded.isMaintenanceAllowed,
      twoFactorEnabled:     !!decoded.twoFactorEnabled,
    };

    setUser(userObject);
    setToken(raw);

    // ✅ TOUJOURS fetcher le profil depuis l'API pour avoir le vrai solde en DB
    fetch(`${API_BASE}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${raw}`, 'Content-Type': 'application/json' },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user) {
          const freshUser = {
            ...userObject,
            balance:             data.user.balance ?? userObject.balance,
            name:                data.user.name    || userObject.name,
            email:               data.user.email   || userObject.email,
            isMaintenanceAllowed: !!data.user.isMaintenanceAllowed,
            twoFactorEnabled:    !!data.user.twoFactorEnabled,
          };
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
          localStorage.setItem('cachedBalance', String(freshUser.balance));
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false));

  }, [logout]);

  useEffect(() => {
    console.debug('[AuthContext] état:', { user, token: !!token, loading });
  }, [user, token, loading]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user,
      login,
      logout,
      updateUserBalance,
      refreshBalance,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export { AuthProvider };
export default AuthProvider;


// // src/context/AuthContext.jsx
// import { createContext, useState, useEffect, useContext, useCallback, useRef } from "react";
// import {jwtDecode} from "jwt-decode";

// export const AuthContext = createContext(null);

// const API_BASE = (
//   import.meta.env.MODE === 'development'
//     ? 'http://localhost:5000'
//     : (import.meta.env.VITE_API_URL || '')
// ).replace(/\/+$/, '');

// const readStoredToken = () => {
//   const t = localStorage.getItem("token") || "";
//   return t.startsWith("Bearer ") ? t.slice(7) : t;
// };

// const parseTokenSafe = (rawToken) => {
//   try {
//     if (!rawToken) return null;
//     return jwtDecode(rawToken);
//   } catch (err) {
//     console.error("Échec du décodage JWT:", err, rawToken);
//     return null;
//   }
// };

// const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(() => readStoredToken());
//   const [loading, setLoading] = useState(true);
//   const inactivityTimer = useRef(null);

//   const logout = useCallback(() => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     localStorage.removeItem("cachedBalance");
//     setToken("");
//     setUser(null);
//     if (inactivityTimer.current) {
//       clearTimeout(inactivityTimer.current);
//       inactivityTimer.current = null;
//     }
//   }, []);

//   const INACTIVITY_DELAY = 30 * 60 * 1000;

//   const resetInactivityTimer = useCallback(() => {
//     if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
//     inactivityTimer.current = setTimeout(logout, INACTIVITY_DELAY);
//   }, [logout]);

//   useEffect(() => {
//     if (!user) return;
//     const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
//     events.forEach(e => window.addEventListener(e, resetInactivityTimer, { passive: true }));
//     resetInactivityTimer();
//     return () => {
//       events.forEach(e => window.removeEventListener(e, resetInactivityTimer));
//       if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
//     };
//   }, [user, resetInactivityTimer]);

//   const login = useCallback((userData) => {
//     if (!userData) return;
//     console.log('[AuthContext] Login appelé avec:', userData);
//     const t = userData.token || userData.accessToken || "";
//     if (!t) return;
//     const raw = t.startsWith("Bearer ") ? t.slice(7) : t;
//     localStorage.setItem("token", raw);
//     const userRole = (userData.role || 'client').toLowerCase();
//     const userObject = {
//       id:                  userData._id || userData.id || null,
//       name:                userData.name || userData.fullName || userData.username || userData.email?.split('@')[0] || "Utilisateur",
//       email:               userData.email || "",
//       role:                userRole,
//       balance:             userData.balance ?? 0,
//       isMaintenanceAllowed: !!userData.isMaintenanceAllowed,
//     };
//     console.log('[AuthContext] Utilisateur créé avec rôle:', userRole);
//     localStorage.setItem("user", JSON.stringify(userObject));
//     localStorage.setItem("cachedBalance", String(userObject.balance));
//     setToken(raw);
//     setUser(userObject);
//   }, []);

//   // ✅ FIX CRITIQUE : updateUserBalance persiste dans localStorage ET cachedBalance
//   const updateUserBalance = useCallback((newBalance) => {
//     if (typeof newBalance !== 'number' || isNaN(newBalance)) return;
//     localStorage.setItem('cachedBalance', String(newBalance));
//     setUser((cur) => {
//       if (!cur) return cur;
//       if (cur.balance === newBalance) return cur; // Pas de re-render si solde identique
//       const updated = { ...cur, balance: newBalance };
//       localStorage.setItem('user', JSON.stringify(updated));
//       return updated;
//     });
//   }, []);

//   const refreshBalance = useCallback(() => {
//     const raw = readStoredToken();
//     if (!raw) return;
//     fetch(`${API_BASE}/api/auth/profile`, {
//       headers: { Authorization: `Bearer ${raw}`, 'Content-Type': 'application/json' },
//     })
//       .then(r => r.ok ? r.json() : null)
//       .then(data => {
//         const fresh = data?.user?.balance;
//         if (typeof fresh === 'number') {
//           updateUserBalance(fresh);
//         }
//       })
//       .catch(() => null);
//   }, [updateUserBalance]);

//   // ✅ Initialisation : priorité localStorage > cachedBalance > JWT
//   useEffect(() => {
//     const raw = readStoredToken();
//     if (!raw) { setLoading(false); return; }

//     const decoded = parseTokenSafe(raw);
//     if (!decoded) { logout(); setLoading(false); return; }

//     if (decoded.exp && decoded.exp * 1000 < Date.now()) {
//       console.warn("Token expiré, déconnexion automatique.");
//       logout();
//       setLoading(false);
//       return;
//     }

//     // ✅ Priorité 1 : user complet stocké en localStorage (le plus à jour)
//     const storedUser = localStorage.getItem('user');
//     if (storedUser) {
//       try {
//         const parsed = JSON.parse(storedUser);
//         setUser(parsed);
//         setToken(raw);
//         setLoading(false);
//         return;
//       } catch { /* fallback ci-dessous */ }
//     }

//     // ✅ Priorité 2 : cachedBalance + données du JWT
//     const cachedBalance = parseFloat(localStorage.getItem('cachedBalance'));
//     const initialBalance = !isNaN(cachedBalance) ? cachedBalance : (decoded.balance ?? 0);

//     const userObject = {
//       id:                  decoded.id || decoded._id || null,
//       email:               decoded.email || null,
//       role:                (decoded.role || 'client').toLowerCase(),
//       name:                decoded.name || decoded.username || null,
//       balance:             initialBalance,
//       isMaintenanceAllowed: !!decoded.isMaintenanceAllowed,
//       confirmed:           true,
//       emailConfirmed:      true,
//     };

//     setUser(userObject);
//     setToken(raw);
//     setLoading(false);

//     // Rafraîchit le solde réel depuis le serveur en arrière-plan
//     fetch(`${API_BASE}/api/auth/profile`, {
//       headers: { Authorization: `Bearer ${raw}`, 'Content-Type': 'application/json' },
//     })
//       .then(r => r.ok ? r.json() : null)
//       .then(data => {
//         const freshBalance = data?.user?.balance;
//         if (typeof freshBalance === 'number') {
//           updateUserBalance(freshBalance);
//         }
//       })
//       .catch(() => null);

//   }, [logout, updateUserBalance]);

//   useEffect(() => {
//     console.debug('[AuthContext] état:', { user, token: !!token, loading });
//   }, [user, token, loading]);

//   return (
//     <AuthContext.Provider value={{
//       user,
//       token,
//       isAuthenticated: !!user,
//       login,
//       logout,
//       updateUserBalance,
//       refreshBalance,
//       loading,
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);
// export { AuthProvider };
// export default AuthProvider;