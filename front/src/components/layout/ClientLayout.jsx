// src/components/layout/ClientLayout.jsx
import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import NotificationBell from '../NotificationBell';
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
    </div>
  );
};

export default ClientLayout;


// // src/components/layout/ClientLayout.jsx
// import { useState, useEffect } from 'react';
// import { Outlet, NavLink, useLocation } from 'react-router-dom';
// import useAuth from '../../hooks/useAuth';
// import NotificationBell from '../NotificationBell';
// import { 
//   Menu, 
//   X, 
//   Home, 
//   LayoutDashboard, 
//   Briefcase,
//   ShoppingBag,
//   History,
//   Key,
//   Ticket,
//   Headphones,
//   Wallet,
//   User,
//   LogOut,
//   ChevronRight,
//   Bell,
//   Sun,
//   Moon,
//   CreditCard,
//   Shield,
//   Sparkles,
//   Smartphone,  // AJOUTÉ - pour l'icône IMEI
//   Server,      // AJOUTÉ - pour l'icône Serveur
//   Globe,       // AJOUTÉ - pour l'icône Location
//   Award,       // AJOUTÉ - pour l'icône Licences
//   Package,     // AJOUTÉ - pour usage général
//   Settings,    // AJOUTÉ - pour usage général
//   HelpCircle,  // AJOUTÉ - pour usage général
//   AlertCircle  // AJOUTÉ - pour usage général
// } from 'lucide-react';

// const ClientLayout = () => {
//   const { user, logout } = useAuth();
//   const location = useLocation();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [darkMode, setDarkMode] = useState(false);
//   const [scrolled, setScrolled] = useState(false);

//   // Gestion du scroll pour l'effet de header
//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 10);
//     };
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   // Fermer la sidebar sur changement de route (mobile)
//   useEffect(() => {
//     setSidebarOpen(false);
//   }, [location]);

//   // Déterminer le rôle pour les routes
//   const role = user?.role === 'utilisateur-employer' ? 'employee' : 'client';
//   const isEmployee = user?.role === 'utilisateur-employer';

//   const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
//   const closeSidebar = () => setSidebarOpen(false);
//   const toggleDarkMode = () => setDarkMode(!darkMode);

//   // Navigation items avec icônes et couleurs
//   const navItems = [
//     { to: "/", icon: Home, label: "Accueil", color: "from-blue-400 to-cyan-400" },
//     // liens rapides vers catégories de services
//     { to: `/${role}/services/IMEI`, icon: Smartphone, label: "Services IMEI", color: "from-blue-400 to-cyan-400" },
//     { to: `/${role}/services/Server`, icon: Server, label: "Services Serveur", color: "from-orange-400 to-amber-400" },
//     { to: `/${role}/services/Rental`, icon: Globe, label: "Services Location", color: "from-purple-400 to-pink-400" },
//     { to: `/${role}/services/License`, icon: Key, label: "Services Licence", color: "from-green-400 to-emerald-400" },
//     { to: `/${role}/dashboard`, icon: LayoutDashboard, label: "Tableau de bord", color: "from-purple-400 to-pink-400" },
//     ...(isEmployee ? [{
//       to: "/employee/works", icon: Briefcase, label: "Mes Travaux", color: "from-green-400 to-emerald-400"
//     }] : []),
//     { to: `/${role}/orders`, icon: ShoppingBag, label: "Mes Commandes", color: "from-pink-400 to-rose-400" },
//     // liens rapides par catégorie
//     { to: `/${role}/orders?category=IMEI`, icon: Smartphone, label: "Commandes IMEI", color: "from-pink-400 to-rose-400" },
//     { to: `/${role}/orders?category=Server`, icon: Server, label: "Commandes Serveur", color: "from-pink-400 to-rose-400" },
//     { to: `/${role}/orders?category=Rental`, icon: Globe, label: "Commandes Location", color: "from-pink-400 to-rose-400" },
//     { to: `/${role}/orders?category=License`, icon: Key, label: "Commandes Licence", color: "from-pink-400 to-rose-400" },
//     { to: `/${role}/orders-history`, icon: History, label: "Historique", color: "from-orange-400 to-amber-400" },
//     { to: `/${role}/licenses`, icon: Award, label: "Mes Licences", color: "from-indigo-400 to-purple-400" },
//     { to: `/${role}/tickets`, icon: Ticket, label: "Mes Tickets", color: "from-yellow-400 to-orange-400" },
//     { to: `/${role}/support`, icon: Headphones, label: "Support", color: "from-teal-400 to-cyan-400" },
//     ...(!isEmployee ? [{
//       to: "/client/add-funds", icon: Wallet, label: "Ajouter des fonds", color: "from-emerald-400 to-green-400"
//     }] : []),
//     { to: `/${role}/profile`, icon: User, label: "Mon Profil", color: "from-violet-400 to-purple-400" },
//   ];

//   const navLinkClass = ({ isActive }) => {
//     const baseClasses = "flex items-center gap-3 py-3 px-4 rounded-xl font-medium transition-all duration-300 relative overflow-hidden group";
    
//     if (isActive) {
//       return `${baseClasses} bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white shadow-lg shadow-blue-500/10 border border-white/10`;
//     }
    
//     return `${baseClasses} text-gray-300 hover:text-white hover:bg-white/5`;
//   };

//   return (
//     <div className={`flex min-h-screen transition-colors duration-300 ${
//       darkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 to-white'
//     }`}>
//       {/* SIDEBAR - Version ultra moderne */}
//       <aside
//         className={`
//           fixed inset-y-0 left-0 z-50 w-72
//           ${darkMode ? 'bg-slate-900/95 border-white/10' : 'bg-white/95 border-gray-200/20'}
//           backdrop-blur-xl border-r shadow-2xl p-6 flex flex-col
//           transform transition-all duration-500 ease-out
//           ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
//           lg:static lg:translate-x-0 lg:w-72
//           ${darkMode ? 'lg:bg-slate-900/50' : 'lg:bg-white/50'}
//         `}
//       >
//         {/* Éléments décoratifs */}
//         <div className="absolute inset-0 overflow-hidden pointer-events-none">
//           <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse ${
//             darkMode ? 'bg-blue-500' : 'bg-blue-400'
//           }`}></div>
//           <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse animation-delay-2000 ${
//             darkMode ? 'bg-purple-500' : 'bg-purple-400'
//           }`}></div>
//         </div>

//         {/* Header Sidebar */}
//         <div className="relative z-10">
//           {/* Titre + bouton fermer (mobile/tablet only) */}
//           <div className="flex items-center justify-between mb-8 lg:hidden">
//             <div className="flex items-center gap-2">
//               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
//                 <Shield className="w-6 h-6 text-white" />
//               </div>
//               <h2 className={`text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text`}>
//                 {isEmployee ? 'Employé' : 'Client'}
//               </h2>
//             </div>
//             <button
//               onClick={closeSidebar}
//               className={`p-2 rounded-lg transition-colors ${
//                 darkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
//               }`}
//             >
//               <X size={24} />
//             </button>
//           </div>

//           {/* Logo Desktop */}
//           <div className={`hidden lg:flex items-center gap-3 mb-8 p-3 rounded-xl border ${
//             darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-200'
//           }`}>
//             <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
//               <Shield className="w-7 h-7 text-white" />
//             </div>
//             <div>
//               <h2 className={`text-xl font-bold ${
//                 darkMode ? 'text-white' : 'text-gray-800'
//               }`}>
//                 {isEmployee ? 'Espace Employé' : 'Espace Client'}
//               </h2>
//               <p className={`text-xs truncate max-w-[150px] ${
//                 darkMode ? 'text-gray-400' : 'text-gray-500'
//               }`}>
//                 {user?.email || user?.name || 'Bienvenue'}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Navigation avec scroll */}
//         <nav className="relative z-10 space-y-1 flex-1 overflow-y-auto custom-scrollbar pr-2">
//           {navItems.map((item) => (
//             <NavLink
//               key={item.to}
//               to={item.to}
//               className={navLinkClass}
//             >
//               {({ isActive }) => (
//                 <>
//                   <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${isActive ? 'opacity-20' : ''}`} />
//                   <item.icon className={`w-5 h-5 transition-all duration-300 ${
//                     isActive ? 'text-white' : darkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-500 group-hover:text-gray-900'
//                   }`} />
//                   <span className={`flex-1 ${
//                     isActive ? 'text-white' : darkMode ? 'text-gray-300' : 'text-gray-700'
//                   }`}>
//                     {item.label}
//                   </span>
//                   {isActive && <ChevronRight className="w-4 h-4 text-white/50" />}
//                 </>
//               )}
//             </NavLink>
//           ))}
//         </nav>

//         {/* Badge statut & Déconnexion */}
//         <div className="relative z-10 mt-6 space-y-3">
//           {/* Badge de statut */}
//           <div className={`px-4 py-2 rounded-lg border ${
//             darkMode ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'
//           }`}>
//             <p className={`text-xs flex items-center gap-2 ${
//               darkMode ? 'text-blue-400' : 'text-blue-600'
//             }`}>
//               <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
//               {isEmployee ? 'Mode employé actif' : 'Compte client'}
//             </p>
//           </div>

//           {/* Bouton déconnexion */}
//           <button
//             onClick={logout}
//             className="relative w-full group overflow-hidden rounded-xl bg-gradient-to-r from-red-500 to-pink-500 p-[2px] hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300"
//           >
//             <div className={`relative flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-xl transition-all duration-300 ${
//               darkMode ? 'bg-slate-900 text-white' : 'bg-white text-gray-700'
//             } group-hover:bg-opacity-90`}>
//               <LogOut className="w-5 h-5" />
//               <span>Se déconnecter</span>
//             </div>
//           </button>

//           {/* Version app */}
//           <div className={`text-xs text-center pt-4 border-t ${
//             darkMode ? 'text-gray-600 border-white/5' : 'text-gray-400 border-gray-200'
//           }`}>
//             © 2025 MobileUnlockStore
//             <br />
//             <span className={darkMode ? 'text-gray-700' : 'text-gray-300'}>Version 2.0.0</span>
//           </div>
//         </div>
//       </aside>

//       {/* Overlay mobile amélioré */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
//           onClick={closeSidebar}
//         />
//       )}

//       {/* Contenu principal */}
//       <div className="flex-1 flex flex-col min-w-0">
//         {/* Header moderne et responsive */}
//         <header className={`sticky top-0 z-30 transition-all duration-300 ${
//           darkMode 
//             ? scrolled ? 'bg-slate-900/95 border-white/10' : 'bg-slate-900/80 border-transparent'
//             : scrolled ? 'bg-white/95 border-gray-200/20' : 'bg-white/80 border-transparent'
//         } backdrop-blur-xl border-b shadow-lg`}>
//           <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
//             {/* Bouton menu mobile/tablet */}
//             <button
//               onClick={toggleSidebar}
//               className="lg:hidden p-2 rounded-lg transition-colors relative group"
//             >
//               <Menu size={24} className={darkMode ? 'text-white' : 'text-gray-700'} />
//               <span className={`absolute inset-0 rounded-lg transition-colors ${
//                 darkMode ? 'group-hover:bg-white/5' : 'group-hover:bg-gray-100'
//               }`}></span>
//             </button>

//             {/* Titre de page dynamique avec breadcrumb */}
//             <div className="hidden sm:flex items-center gap-2">
//               <h1 className={`text-lg sm:text-xl font-bold ${
//                 darkMode ? 'text-white' : 'text-gray-800'
//               }`}>
//                 {navItems.find(item => item.to === location.pathname)?.label || 'Tableau de bord'}
//               </h1>
//               {location.pathname !== '/' && (
//                 <span className={`text-sm hidden md:inline ${
//                   darkMode ? 'text-gray-500' : 'text-gray-400'
//                 }`}>
//                   • {new Date().toLocaleDateString('fr-FR', { 
//                     weekday: 'long', 
//                     year: 'numeric', 
//                     month: 'long', 
//                     day: 'numeric' 
//                   })}
//                 </span>
//               )}
//             </div>

//             {/* Actions header */}
//             <div className="flex items-center gap-2 sm:gap-3">
//               {/* Dark mode toggle */}
//               <button
//                 onClick={toggleDarkMode}
//                 className={`p-2 rounded-lg transition-colors ${
//                   darkMode 
//                     ? 'text-yellow-400 hover:bg-white/10' 
//                     : 'text-gray-600 hover:bg-gray-100'
//                 }`}
//               >
//                 {darkMode ? <Sun size={20} /> : <Moon size={20} />}
//               </button>

//               {/* Notification Bell */}
//               <div className="relative">
//                 <NotificationBell />
//               </div>

//               {/* Profil utilisateur - visible sur tous les écrans mais style différent selon taille */}
//               <div className="flex items-center gap-2 sm:gap-3">
//                 {/* Avatar - toujours visible */}
//                 <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
//                   <span className="text-sm sm:text-base font-bold text-white">
//                     {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
//                   </span>
//                 </div>

//                 {/* Infos - caché sur mobile, visible à partir de sm */}
//                 <div className="hidden sm:block">
//                   <p className={`text-sm font-medium ${
//                     darkMode ? 'text-white' : 'text-gray-800'
//                   }`}>
//                     {user?.name || user?.email?.split('@')[0] || 'Utilisateur'}
//                   </p>
//                   <p className={`text-xs ${
//                     darkMode ? 'text-gray-400' : 'text-gray-500'
//                   }`}>
//                     {isEmployee ? 'Employé' : 'Client'}
//                   </p>
//                 </div>

//                 {/* Badge de statut - seulement sur grand écran */}
//                 <div className={`hidden xl:flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
//                   darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
//                 }`}>
//                   <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
//                   <span>En ligne</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Breadcrumb mobile (optionnel) */}
//           <div className="px-4 sm:px-6 lg:px-8 pb-2 sm:hidden">
//             <p className={`text-xs ${
//               darkMode ? 'text-gray-500' : 'text-gray-400'
//             }`}>
//               {new Date().toLocaleDateString('fr-FR', { 
//                 weekday: 'long', 
//                 day: 'numeric', 
//                 month: 'long' 
//               })}
//             </p>
//           </div>
//         </header>

//         {/* Zone contenu principal avec padding responsive */}
//         <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
//           <div className="relative h-full">
//             {/* Éléments décoratifs */}
//             <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse ${
//               darkMode ? 'bg-blue-500' : 'bg-blue-400'
//             }`}></div>
//             <div className={`absolute -bottom-10 -left-10 w-40 h-40 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse animation-delay-2000 ${
//               darkMode ? 'bg-purple-500' : 'bg-purple-400'
//             }`}></div>
            
//             {/* Contenu avec padding adaptatif */}
//             <div className="relative mx-auto w-full max-w-6xl">
//               <div className={`relative z-10 rounded-2xl border p-4 sm:p-6 lg:p-8 min-h-full ${
//                 darkMode 
//                   ? 'bg-white/5 border-white/10' 
//                   : 'bg-white border-gray-200 shadow-sm'
//               }`}>
//                 <Outlet />
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default ClientLayout;