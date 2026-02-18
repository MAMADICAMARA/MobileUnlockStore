// src/components/layout/ClientLayout.jsx
import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { Menu, X } from 'lucide-react'; // npm install lucide-react si pas encore fait

const ClientLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const navLinkClass = ({ isActive }) =>
    isActive
      ? 'block py-3 px-5 rounded-lg bg-blue-100 text-blue-700 font-semibold text-base'
      : 'block py-3 px-5 rounded-lg hover:bg-blue-50 text-blue-800 font-medium text-base transition-colors';

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl p-6 flex flex-col transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:static md:translate-x-0 md:w-64 md:shadow-md md:bg-white
        `}
      >
        {/* Titre + bouton fermer (mobile only) */}
        <div className="flex items-center justify-between mb-8 md:hidden">
          <h2 className="text-2xl font-bold text-blue-700">Espace Client</h2>
          <button
            onClick={closeSidebar}
            className="text-gray-700 hover:text-blue-700 p-2 rounded hover:bg-gray-100"
          >
            <X size={28} />
          </button>
        </div>

        <h2 className="text-2xl font-bold text-blue-700 mb-6 hidden md:block">
          Espace Client
        </h2>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          <NavLink to="/" className={navLinkClass}>Accueil</NavLink>
          <NavLink
            to={`/${user?.role === 'utilisateur-employer' ? 'employee' : 'client'}/dashboard`}
            className={navLinkClass}
          >
            Tableau de bord
          </NavLink>

          {user?.role === 'utilisateur-employer' && (
            <>
              <NavLink to="/employee/works" className={navLinkClass}>Mes Travaux</NavLink>
              <div className="border-t border-gray-200 my-4"></div>
            </>
          )}

          <NavLink
            to={`/${user?.role === 'utilisateur-employer' ? 'employee' : 'client'}/orders`}
            className={navLinkClass}
          >
            Mes Commandes
          </NavLink>
          <NavLink
            to={`/${user?.role === 'utilisateur-employer' ? 'employee' : 'client'}/orders-history`}
            className={navLinkClass}
          >
            Historique des commandes
          </NavLink>
          <NavLink
            to={`/${user?.role === 'utilisateur-employer' ? 'employee' : 'client'}/licenses`}
            className={navLinkClass}
          >
            Mes Licences
          </NavLink>
          <NavLink
            to={`/${user?.role === 'utilisateur-employer' ? 'employee' : 'client'}/tickets`}
            className={navLinkClass}
          >
            Mes Tickets
          </NavLink>
          <NavLink
            to={`/${user?.role === 'utilisateur-employer' ? 'employee' : 'client'}/support`}
            className={navLinkClass}
          >
            Support
          </NavLink>

          {user?.role !== 'utilisateur-employer' && (
            <NavLink to="/client/add-funds" className={navLinkClass}>
              Ajouter des fonds
            </NavLink>
          )}

          <NavLink
            to={`/${user?.role === 'utilisateur-employer' ? 'employee' : 'client'}/profile`}
            className={navLinkClass}
          >
            Mon Profil
          </NavLink>
        </nav>

        {/* Déconnexion */}
        <button
          onClick={logout}
          className="mt-8 w-full py-3 px-5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-semibold transition-colors"
        >
          Se déconnecter
        </button>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">
        {/* Header mobile avec hamburger */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between md:hidden">
          <button
            onClick={toggleSidebar}
            className="text-blue-700 p-2 rounded hover:bg-blue-50"
          >
            <Menu size={28} />
          </button>

          <h1 className="text-xl font-bold text-blue-700">Espace Client</h1>

          <div className="w-10" /> {/* espace équilibré */}
        </header>

        {/* Zone contenu */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;