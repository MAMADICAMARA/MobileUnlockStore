// src/components/layout/AdminLayout.jsx
import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import NotificationBell from '../NotificationBell';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Home, 
  RefreshCw, 
  Server, 
  ShoppingBag, 
  Search,
  Users,
  Key,
  Globe,
  CreditCard,
  FileText,
  Headphones,
  Shield,
  UserCog,
  Briefcase,
  LogOut,
  ChevronRight,
  Bell
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();

  // Fermer la sidebar sur changement de route (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  const navItems = [
    { to: "/", icon: Home, label: "Accueil", color: "from-blue-400 to-cyan-400" },
    { to: "/admin/dashboard", icon: LayoutDashboard, label: "Tableau de bord", color: "from-purple-400 to-pink-400" },
    { to: "/admin/recharge", icon: RefreshCw, label: "Recharger un client", color: "from-green-400 to-emerald-400" },
    { to: "/admin/services", icon: Server, label: "Services", color: "from-yellow-400 to-orange-400" },
    { to: "/admin/orders", icon: ShoppingBag, label: "Commandes", color: "from-pink-400 to-rose-400" },
    { to: "/admin/search-order", icon: Search, label: "Rechercher Commande", color: "from-indigo-400 to-purple-400" },
    { to: "/admin/users", icon: Users, label: "Clients", color: "from-cyan-400 to-blue-400" },
    { to: "/admin/licenses", icon: Key, label: "Licences", color: "from-amber-400 to-orange-400" },
    { to: "/admin/remote", icon: Globe, label: "Remote", color: "from-teal-400 to-cyan-400" },
    { to: "/admin/payments", icon: CreditCard, label: "Paiements", color: "from-emerald-400 to-green-400" },
    { to: "/admin/content", icon: FileText, label: "Contenu du site", color: "from-violet-400 to-purple-400" },
    { to: "/admin/support", icon: Headphones, label: "Support", color: "from-red-400 to-pink-400" },
    { to: "/admin/admins", icon: Shield, label: "Admins", color: "from-slate-400 to-gray-400" },
    { to: "/admin/change-role", icon: UserCog, label: "Gestion des rôles", color: "from-fuchsia-400 to-pink-400" },
    { to: "/admin/employees", icon: Briefcase, label: "Employés", color: "from-blue-400 to-indigo-400" },
  ];

  const navLinkClass = ({ isActive }) => {
    const baseClasses = "flex items-center gap-3 py-3 px-4 rounded-xl font-medium transition-all duration-300 relative overflow-hidden group";
    
    if (isActive) {
      return `${baseClasses} bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white shadow-lg shadow-blue-500/10 border border-white/10`;
    }
    
    return `${baseClasses} text-gray-300 hover:text-white hover:bg-white/5`;
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* SIDEBAR - Version ultra moderne */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-slate-900/95 backdrop-blur-xl border-r border-white/10 shadow-2xl p-6 flex flex-col
          transform transition-all duration-500 ease-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:static md:translate-x-0 md:w-72
          hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]
        `}
      >
        {/* Éléments décoratifs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse animation-delay-2000"></div>
        </div>

        {/* Header Sidebar */}
        <div className="relative z-10">
          {/* Titre + bouton fermer (mobile only) */}
          <div className="flex items-center justify-between mb-8 md:hidden">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                Admin
              </h2>
            </div>
            <button
              onClick={closeSidebar}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Logo Desktop */}
          <div className="hidden md:flex items-center gap-3 mb-8 p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                Espace Admin
              </h2>
              <p className="text-xs text-gray-400">{user?.email || 'Administrateur'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
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
                  <item.icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-white/50" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Profil & Déconnexion */}
        <div className="relative z-10 mt-6 space-y-3">
          {/* Badge admin */}
          <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-pink-500/20 border border-amber-500/20">
            <p className="text-xs text-amber-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              Connecté en tant qu'administrateur
            </p>
          </div>

          {/* Bouton déconnexion */}
          <button
            onClick={logout}
            className="relative w-full group overflow-hidden rounded-xl bg-gradient-to-r from-red-500 to-pink-500 p-[2px] hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300"
          >
            <div className="relative flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white bg-slate-900 rounded-xl group-hover:bg-opacity-90 transition-all duration-300">
              <LogOut className="w-5 h-5" />
              <span>Se déconnecter</span>
            </div>
          </button>

          <div className="text-xs text-gray-500 text-center pt-4 border-t border-white/5">
            © 2025 Plateforme Admin
            <br />
            <span className="text-gray-600">Version 2.0.0</span>
          </div>
        </div>
      </aside>

      {/* Overlay mobile amélioré */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
          onClick={closeSidebar}
        />
      )}

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">
        {/* Header moderne */}
        <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 shadow-lg">
          <div className="px-4 md:px-8 py-4 flex items-center justify-between">
            {/* Bouton menu mobile */}
            <button
              onClick={toggleSidebar}
              className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors relative group"
            >
              <Menu size={24} />
              <span className="absolute inset-0 rounded-lg bg-white/0 group-hover:bg-white/5 transition-colors"></span>
            </button>

            {/* Titre de la page actuelle */}
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
              {navItems.find(item => item.to === location.pathname)?.label || 'Administration'}
            </h1>

            {/* Actions header */}
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <div className="relative">
                <NotificationBell />
              </div>

              {/* Profil rapide */}
              <div className="hidden md:flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {user?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="text-white font-medium">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-400">{user?.role || 'Administrateur'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Zone contenu avec animation */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="relative">
            {/* Élément décoratif */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
            
            {/* Contenu avec fond glassmorphism */}
            <div className="relative z-10 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-xl">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;