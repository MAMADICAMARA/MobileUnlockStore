// src/components/layout/ClientLayout.jsx
import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import NotificationBell from '../NotificationBell';
import { 
  Menu, 
  X, 
  Home, 
  LayoutDashboard, 
  Briefcase,
  ShoppingBag,
  History,
  Key,
  Ticket,
  Headphones,
  Wallet,
  User,
  LogOut,
  ChevronRight,
  Bell,
  Sun,
  Moon,
  CreditCard,
  Shield,
  Sparkles
} from 'lucide-react';

const ClientLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Gestion du scroll pour l'effet de header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer la sidebar sur changement de route (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  // Déterminer le rôle pour les routes
  const role = user?.role === 'utilisateur-employer' ? 'employee' : 'client';
  const isEmployee = user?.role === 'utilisateur-employer';

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Navigation items avec icônes et couleurs
  const navItems = [
    { to: "/", icon: Home, label: "Accueil", color: "from-blue-400 to-cyan-400" },
    { to: `/${role}/dashboard`, icon: LayoutDashboard, label: "Tableau de bord", color: "from-purple-400 to-pink-400" },
    ...(isEmployee ? [{
      to: "/employee/works", icon: Briefcase, label: "Mes Travaux", color: "from-green-400 to-emerald-400"
    }] : []),
    { to: `/${role}/orders`, icon: ShoppingBag, label: "Mes Commandes", color: "from-pink-400 to-rose-400" },
    { to: `/${role}/orders-history`, icon: History, label: "Historique", color: "from-orange-400 to-amber-400" },
    { to: `/${role}/licenses`, icon: Key, label: "Mes Licences", color: "from-indigo-400 to-purple-400" },
    { to: `/${role}/tickets`, icon: Ticket, label: "Mes Tickets", color: "from-yellow-400 to-orange-400" },
    { to: `/${role}/support`, icon: Headphones, label: "Support", color: "from-teal-400 to-cyan-400" },
    ...(!isEmployee ? [{
      to: "/client/add-funds", icon: Wallet, label: "Ajouter des fonds", color: "from-emerald-400 to-green-400"
    }] : []),
    { to: `/${role}/profile`, icon: User, label: "Mon Profil", color: "from-violet-400 to-purple-400" },
  ];

  const navLinkClass = ({ isActive }) => {
    const baseClasses = "flex items-center gap-3 py-3 px-4 rounded-xl font-medium transition-all duration-300 relative overflow-hidden group";
    
    if (isActive) {
      return `${baseClasses} bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white shadow-lg shadow-blue-500/10 border border-white/10`;
    }
    
    return `${baseClasses} text-gray-300 hover:text-white hover:bg-white/5`;
  };

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 to-white'
    }`}>
      {/* SIDEBAR - Version ultra moderne */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72
          ${darkMode ? 'bg-slate-900/95 border-white/10' : 'bg-white/95 border-gray-200/20'}
          backdrop-blur-xl border-r shadow-2xl p-6 flex flex-col
          transform transition-all duration-500 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:translate-x-0 lg:w-72
          ${darkMode ? 'lg:bg-slate-900/50' : 'lg:bg-white/50'}
        `}
      >
        {/* Éléments décoratifs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse ${
            darkMode ? 'bg-blue-500' : 'bg-blue-400'
          }`}></div>
          <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse animation-delay-2000 ${
            darkMode ? 'bg-purple-500' : 'bg-purple-400'
          }`}></div>
        </div>

        {/* Header Sidebar */}
        <div className="relative z-10">
          {/* Titre + bouton fermer (mobile/tablet only) */}
          <div className="flex items-center justify-between mb-8 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className={`text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text`}>
                {isEmployee ? 'Employé' : 'Client'}
              </h2>
            </div>
            <button
              onClick={closeSidebar}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <X size={24} />
            </button>
          </div>

          {/* Logo Desktop */}
          <div className={`hidden lg:flex items-center gap-3 mb-8 p-3 rounded-xl border ${
            darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {isEmployee ? 'Espace Employé' : 'Espace Client'}
              </h2>
              <p className={`text-xs truncate max-w-[150px] ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {user?.email || user?.name || 'Bienvenue'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation avec scroll */}
        <nav className="relative z-10 space-y-1 flex-1 overflow-y-auto custom-scrollbar pr-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={navLinkClass}
            >
              {({ isActive }) => (
                <>
                  <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${isActive ? 'opacity-20' : ''}`} />
                  <item.icon className={`w-5 h-5 transition-all duration-300 ${
                    isActive ? 'text-white' : darkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-500 group-hover:text-gray-900'
                  }`} />
                  <span className={`flex-1 ${
                    isActive ? 'text-white' : darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {item.label}
                  </span>
                  {isActive && <ChevronRight className="w-4 h-4 text-white/50" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Badge statut & Déconnexion */}
        <div className="relative z-10 mt-6 space-y-3">
          {/* Badge de statut */}
          <div className={`px-4 py-2 rounded-lg border ${
            darkMode ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'
          }`}>
            <p className={`text-xs flex items-center gap-2 ${
              darkMode ? 'text-blue-400' : 'text-blue-600'
            }`}>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              {isEmployee ? 'Mode employé actif' : 'Compte client'}
            </p>
          </div>

          {/* Bouton déconnexion */}
          <button
            onClick={logout}
            className="relative w-full group overflow-hidden rounded-xl bg-gradient-to-r from-red-500 to-pink-500 p-[2px] hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300"
          >
            <div className={`relative flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-xl transition-all duration-300 ${
              darkMode ? 'bg-slate-900 text-white' : 'bg-white text-gray-700'
            } group-hover:bg-opacity-90`}>
              <LogOut className="w-5 h-5" />
              <span>Se déconnecter</span>
            </div>
          </button>

          {/* Version app */}
          <div className={`text-xs text-center pt-4 border-t ${
            darkMode ? 'text-gray-600 border-white/5' : 'text-gray-400 border-gray-200'
          }`}>
            © 2025 MobileUnlockStore
            <br />
            <span className={darkMode ? 'text-gray-700' : 'text-gray-300'}>Version 2.0.0</span>
          </div>
        </div>
      </aside>

      {/* Overlay mobile amélioré */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
          onClick={closeSidebar}
        />
      )}

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header moderne et responsive */}
        <header className={`sticky top-0 z-30 transition-all duration-300 ${
          darkMode 
            ? scrolled ? 'bg-slate-900/95 border-white/10' : 'bg-slate-900/80 border-transparent'
            : scrolled ? 'bg-white/95 border-gray-200/20' : 'bg-white/80 border-transparent'
        } backdrop-blur-xl border-b shadow-lg`}>
          <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            {/* Bouton menu mobile/tablet */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg transition-colors relative group"
            >
              <Menu size={24} className={darkMode ? 'text-white' : 'text-gray-700'} />
              <span className={`absolute inset-0 rounded-lg transition-colors ${
                darkMode ? 'group-hover:bg-white/5' : 'group-hover:bg-gray-100'
              }`}></span>
            </button>

            {/* Titre de page dynamique avec breadcrumb */}
            <div className="hidden sm:flex items-center gap-2">
              <h1 className={`text-lg sm:text-xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {navItems.find(item => item.to === location.pathname)?.label || 'Tableau de bord'}
              </h1>
              {location.pathname !== '/' && (
                <span className={`text-sm hidden md:inline ${
                  darkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  • {new Date().toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              )}
            </div>

            {/* Actions header */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-yellow-400 hover:bg-white/10' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Notification Bell */}
              <div className="relative">
                <NotificationBell />
              </div>

              {/* Profil utilisateur - visible sur tous les écrans mais style différent selon taille */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Avatar - toujours visible */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-sm sm:text-base font-bold text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>

                {/* Infos - caché sur mobile, visible à partir de sm */}
                <div className="hidden sm:block">
                  <p className={`text-sm font-medium ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    {user?.name || user?.email?.split('@')[0] || 'Utilisateur'}
                  </p>
                  <p className={`text-xs ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {isEmployee ? 'Employé' : 'Client'}
                  </p>
                </div>

                {/* Badge de statut - seulement sur grand écran */}
                <div className={`hidden xl:flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
                  darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  <span>En ligne</span>
                </div>
              </div>
            </div>
          </div>

          {/* Breadcrumb mobile (optionnel) */}
          <div className="px-4 sm:px-6 lg:px-8 pb-2 sm:hidden">
            <p className={`text-xs ${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </p>
          </div>
        </header>

        {/* Zone contenu principal avec padding responsive */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="relative h-full">
            {/* Éléments décoratifs */}
            <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse ${
              darkMode ? 'bg-blue-500' : 'bg-blue-400'
            }`}></div>
            <div className={`absolute -bottom-10 -left-10 w-40 h-40 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse animation-delay-2000 ${
              darkMode ? 'bg-purple-500' : 'bg-purple-400'
            }`}></div>
            
            {/* Contenu avec padding adaptatif */}
            <div className={`relative z-10 rounded-2xl border p-4 sm:p-6 lg:p-8 min-h-full ${
              darkMode 
                ? 'bg-white/5 border-white/10' 
                : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;