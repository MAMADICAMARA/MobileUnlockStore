// src/components/layout/AdminLayout.jsx
import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import NotificationBell from '../NotificationBell';
import { Menu, X } from 'lucide-react'; // ← installe lucide-react si pas déjà fait : npm install lucide-react

/**
 * Layout pour l'espace administration.
 * Sidebar → hamburger menu sur mobile (< 768px)
 */
const AdminLayout = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    isActive
      ? 'flex items-center gap-3 py-3 px-4 rounded-lg bg-blue-700/20 text-blue-300 font-semibold text-base'
      : 'flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-blue-800/30 text-gray-200 font-medium text-base transition-colors';

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100">
      {/* Sidebar mobile overlay + hamburger */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 shadow-2xl p-6 flex flex-col transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:static md:translate-x-0 md:w-72 md:shadow-none md:bg-slate-800
        `}
      >
        {/* Header sidebar */}
        <div className="flex items-center justify-between mb-8 md:hidden">
          <h2 className="text-2xl font-extrabold text-blue-400 tracking-wide">Admin</h2>
          <button onClick={toggleSidebar} className="text-white p-2 rounded hover:bg-slate-700">
            <X size={28} />
          </button>
        </div>

        <h2 className="text-2xl font-extrabold mb-8 text-blue-400 tracking-wide text-center hidden md:block">
          Espace Admin
        </h2>

        {/* Navigation */}
        <nav className="space-y-1 flex-1 text-gray-200">
          <NavLink to="/" className={navLinkClass}>Accueil</NavLink>
          <NavLink to="/admin/dashboard" className={navLinkClass}>Tableau de bord</NavLink>
          <NavLink to="/admin/recharge" className={navLinkClass}>Recharger un client</NavLink>
          <NavLink to="/admin/services" className={navLinkClass}>Services</NavLink>
          <NavLink to="/admin/orders" className={navLinkClass}>Commandes</NavLink>
          <NavLink to="/admin/search-order" className={navLinkClass}>Rechercher Commande</NavLink>
          <NavLink to="/admin/users" className={navLinkClass}>Clients</NavLink>
          <NavLink to="/admin/licenses" className={navLinkClass}>Licences</NavLink>
          <NavLink to="/admin/remote" className={navLinkClass}>Remote</NavLink>
          <NavLink to="/admin/payments" className={navLinkClass}>Paiements</NavLink>
          <NavLink to="/admin/content" className={navLinkClass}>Contenu du site</NavLink>
          <NavLink to="/admin/support" className={navLinkClass}>Support</NavLink>
          <NavLink to="/admin/admins" className={navLinkClass}>Admins</NavLink>
          <NavLink to="/admin/change-role" className={navLinkClass}>Gestion des rôles</NavLink>
          <NavLink to="/admin/employees" className={navLinkClass}>Employés</NavLink>
        </nav>

        {/* Bouton déconnexion */}
        <button
          onClick={logout}
          className="mt-8 w-full py-3 px-4 rounded-lg bg-red-600/80 hover:bg-red-700 text-white font-semibold transition-colors"
        >
          Se déconnecter
        </button>

        <div className="mt-10 text-xs text-gray-500 text-center hidden md:block">
          © 2025 Plateforme Admin
        </div>
      </aside>

      {/* Overlay mobile quand sidebar ouverte */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">
        {/* Barre hamburger en haut sur mobile */}
        <header className="bg-slate-800 shadow-md p-4 flex items-center justify-between md:hidden">
          <button onClick={toggleSidebar} className="text-white p-2 rounded hover:bg-slate-700">
            <Menu size={28} />
          </button>
          <h1 className="text-xl font-bold text-blue-400">Admin</h1>
          <div className="w-10" /> {/* espace pour équilibrer */}
        </header>

        {/* Zone contenu */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;