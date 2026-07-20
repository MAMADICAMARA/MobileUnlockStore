// src/components/layout/ClientLayout.jsx
import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import NotificationBell from '../NotificationBell';
import WhatsAppButton from '../WhatsAppButton';

import {
  Menu, X, Home, LayoutDashboard, Briefcase,
  ShoppingBag, History, Key, Ticket, Headphones,
  Wallet, User, LogOut, ChevronRight, ChevronDown,
  Sun, Moon, Shield, Smartphone, Server, Globe,
  Award, Package, Bell
} from 'lucide-react';

// ─── Structure du menu en sections ───────────────────────────────────────────

const buildNav = (role, isEmployee) => [
  
  // ── Section principale ──
  {
    section: null,
    items: [
      { to: '/', icon: Home, label: 'Accueil' },
      { to: `/${role}/dashboard`, icon: LayoutDashboard, label: 'Tableau de bord' },
      ...(isEmployee ? [{ to: '/employee/works', icon: Briefcase, label: 'Mes Travaux' }] : []),
    ],
  },
  // {
  //   section: null,
  //   items: [
  //     { to: `/${role}/dashboard`, icon: LayoutDashboard, label: 'Tableau de bord' },
  //     ...(isEmployee ? [{ to: '/employee/works', icon: Briefcase, label: 'Mes Travaux' }] : []),
  //   ],
  // },

  // ── Commander ──
  {
    section: 'COMMANDER',
    items: [
      { to: `/${role}/services/IMEI`,    icon: Smartphone, label: 'Service IMEI' },
      { to: `/${role}/services/Server`,  icon: Server,     label: 'Service Serveur' },
      { to: `/${role}/services/Rental`,  icon: Globe,      label: 'Service Location' },
      { to: `/${role}/services/Credit`,  icon: Key,        label: 'Service Crédit' },
    ],
  },

  // ── Historique des commandes ──
  // ✅ FIX : Les valeurs de category dans l'URL correspondent exactement
  //          aux categoryTabs de OrderHistoryPage.jsx
  {
    section: 'HISTORIQUE',
    items: [
      { to: `/${role}/orders`,                      icon: ShoppingBag, label: 'Toutes les commandes' },
      { to: `/${role}/orders?category=imei`,        icon: Smartphone,  label: 'Commandes IMEI' },
      { to: `/${role}/orders?category=serveur`,     icon: Server,      label: 'Commandes Serveur' },
      { to: `/${role}/orders?category=remote`,      icon: Globe,       label: 'Commandes Location' },
      { to: `/${role}/orders?category=credit`,       icon: Key,         label: 'Commandes Crédit' },
    ],
  },

  // ── Produits ──
  {
    section: 'PRODUITS',
    items: [
      { to: `/${role}/licenses`, icon: Award, label: 'Mes Licences' },
    ],
  },

  // ── Mon compte ──
  {
    section: 'MON COMPTE',
    items: [
      ...(!isEmployee ? [{ to: '/client/add-funds', icon: Wallet, label: 'Ajouter des fonds' }] : []),
      { to: `/${role}/tickets`,  icon: Ticket,     label: 'Mes Tickets' },
      { to: `/${role}/support`,  icon: Headphones, label: 'Support' },
      { to: `/${role}/profile`,  icon: User,        label: 'Mon Profil' },
    ],
  },
];

// ─── Composant NavItem ────────────────────────────────────────────────────────
// ✅ FIX : isActive basé sur pathname + search pour distinguer
//          /orders de /orders?category=imei etc.

const NavItem = ({ to, icon: Icon, label, darkMode, onClick }) => {
  const location = useLocation();

  const checkIsActive = () => {
    const [toPath, toSearch] = to.split('?');
    const currentPath = location.pathname;
    const currentSearch = location.search;

    // Lien "Toutes les commandes" : actif seulement si pas de ?category=
    if (!toSearch) {
      return currentPath === toPath && !currentSearch.includes('category=');
    }

    // Liens avec catégorie : actif si pathname + search correspondent
    const toParams = new URLSearchParams(toSearch);
    const currentParams = new URLSearchParams(currentSearch);
    return (
      currentPath === toPath &&
      toParams.get('category') === currentParams.get('category')
    );
  };

  const isActive = checkIsActive();

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={() =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
          isActive
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
            : darkMode
              ? 'text-slate-300 hover:bg-white/8 hover:text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`
      }
    >
      <Icon className={`w-4 h-4 flex-shrink-0 ${
        isActive
          ? 'text-white'
          : darkMode
            ? 'text-slate-400 group-hover:text-white'
            : 'text-slate-400 group-hover:text-slate-700'
      }`} />
      <span className="flex-1 truncate">{label}</span>
      {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/60 flex-shrink-0" />}
    </NavLink>
  );
};

// ─── Sidebar content ──────────────────────────────────────────────────────────

const SidebarContent = ({ darkMode, role, isEmployee, user, logout, closeSidebar }) => {
  const nav = buildNav(role, isEmployee);

  return (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className={`px-4 py-5 border-b ${darkMode ? 'border-white/8' : 'border-slate-100'}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className={`text-sm font-bold truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {isEmployee ? 'Espace Employé' : 'MobileUnlockStore'}
            </p>
            <p className={`text-xs truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {user?.email || 'Bienvenue'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation avec sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {nav.map((group, gi) => (
          <div key={gi} className={gi > 0 ? 'mt-4' : ''}>
            {/* Titre de section */}
            {group.section && (
              <p className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest mb-1 ${
                darkMode ? 'text-slate-500' : 'text-slate-400'
              }`}>
                {group.section}
              </p>
            )}
            {/* Items */}
            <div className="space-y-0.5">
              {group.items.map(item => (
                <NavItem
                  key={item.to}
                  {...item}
                  darkMode={darkMode}
                  onClick={closeSidebar}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={`px-3 py-4 border-t ${darkMode ? 'border-white/8' : 'border-slate-100'} space-y-2`}>
        {/* Statut */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${
          darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
        }`}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <span className="truncate">{isEmployee ? 'Mode employé actif' : 'Compte client actif'}</span>
        </div>

        {/* Déconnexion */}
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            darkMode
              ? 'text-red-400 hover:bg-red-500/10'
              : 'text-red-500 hover:bg-red-50'
          }`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Se déconnecter
        </button>

        <p className={`text-center text-[10px] ${darkMode ? 'text-slate-700' : 'text-slate-300'}`}>
          © 2025 MobileUnlockStore
        </p>
      </div>
    </div>
  );
};

// ─── Layout principal ─────────────────────────────────────────────────────────

const ClientLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode]       = useState(false);
  const [scrolled, setScrolled]       = useState(false);

  const role       = user?.role === 'utilisateur-employer' ? 'employee' : 'client';
  const isEmployee = user?.role === 'utilisateur-employer';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [location]);

  // Titre de la page courante (prend en compte le ?category= dans l'URL)
  const allItems = buildNav(role, isEmployee).flatMap(g => g.items);
  const currentLabel = allItems.find(i => {
    const [iPath, iSearch] = i.to.split('?');
    if (iPath !== location.pathname) return false;
    if (!iSearch) return !location.search.includes('category=');
    const iParams = new URLSearchParams(iSearch);
    const lParams = new URLSearchParams(location.search);
    return iParams.get('category') === lParams.get('category');
  })?.label || 'Tableau de bord';

  return (
    <div className={`flex min-h-screen overflow-x-hidden ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>

      {/* ── Sidebar desktop ── */}
      <aside className={`hidden lg:flex flex-col w-60 xl:w-64 flex-shrink-0 sticky top-0 h-screen border-r ${
        darkMode ? 'bg-slate-900 border-white/8' : 'bg-white border-slate-200'
      }`}>
        <SidebarContent
          darkMode={darkMode} role={role} isEmployee={isEmployee}
          user={user} logout={logout} closeSidebar={() => {}}
        />
      </aside>

      {/* ── Sidebar mobile (drawer) ── */}
      <>
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col transform transition-transform duration-300 ease-out lg:hidden border-r ${
          darkMode ? 'bg-slate-900 border-white/8' : 'bg-white border-slate-200'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <button
            onClick={() => setSidebarOpen(false)}
            className={`absolute top-4 right-4 p-1.5 rounded-lg z-10 ${
              darkMode ? 'text-slate-400 hover:bg-white/10' : 'text-slate-400 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
          <SidebarContent
            darkMode={darkMode} role={role} isEmployee={isEmployee}
            user={user} logout={logout} closeSidebar={() => setSidebarOpen(false)}
          />
        </aside>
      </>

      {/* ── Zone principale ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">

        {/* Header */}
        <header className={`sticky top-0 z-30 transition-all duration-200 border-b ${
          darkMode
            ? scrolled ? 'bg-slate-900/95 border-white/8' : 'bg-slate-900/80 border-transparent'
            : scrolled ? 'bg-white/95 border-slate-200'  : 'bg-white/80 border-transparent'
        } backdrop-blur-xl`}>
          <div className="flex items-center gap-3 px-4 sm:px-6 h-14">

            {/* Burger mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className={`lg:hidden p-2 rounded-lg transition-colors flex-shrink-0 ${
                darkMode ? 'text-white hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Titre */}
            <h1 className={`text-base font-semibold flex-1 truncate ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              {currentLabel}
            </h1>

            {/* Actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">

              {/* Dark mode */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'text-yellow-400 hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Notifications */}
              <NotificationBell />

              {/* Avatar */}
              <div className="flex items-center gap-2 ml-1">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0">
                  <span className="text-xs font-bold text-white">
                    {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block min-w-0">
                  <p className={`text-xs font-semibold truncate max-w-[100px] ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    {user?.name || user?.email?.split('@')[0] || 'Utilisateur'}
                  </p>
                  <p className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                    {isEmployee ? 'Employé' : 'Client'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Contenu */}
        <main className="flex-1 overflow-x-hidden">
          <div className="max-w-6xl mx-auto p-4 sm:p-6">
            <Outlet />
          </div>
        </main>

      </div>
      <WhatsAppButton />
    
    </div>
  );
};

export default ClientLayout;

