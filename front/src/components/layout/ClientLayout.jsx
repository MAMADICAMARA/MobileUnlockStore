// src/components/layout/ClientLayout.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAuth from '../../hooks/useAuth';

/**
 * Layout pour l'espace client.
 * Contient une barre de navigation latérale et affiche le contenu des pages client.
 */
const ClientLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Fonction pour styliser les liens de navigation actifs
  const navLinkClass = ({ isActive }) => 
    isActive 
      ? 'block py-2.5 px-4 rounded bg-blue-100 text-blue-600' 
      : 'block py-2.5 text-blue-700 px-4 rounded hover:bg-red-100';

  return (
    <div className="flex min-h-screen bg-blue-50">
      {/* Bouton hamburger */}
      <button className="md:hidden fixed top-4 left-4 z-50 bg-white rounded-full p-2 shadow" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <span className="block w-6 h-0.5 bg-blue-700 mb-1"></span>
        <span className="block w-6 h-0.5 bg-blue-700 mb-1"></span>
        <span className="block w-6 h-0.5 bg-blue-700"></span>
      </button>
      {/* Barre de navigation latérale */}
      <aside className={`w-64 bg-white shadow-md p-4 flex flex-col justify-between fixed top-0 left-0 h-full z-40 transition-transform duration-300 md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:block`}>
        <div>
          <h2 className="text-xl font-bold text-blue-700 mb-6">Espace Client</h2>
          <nav className="space-y-2">
            <NavLink to="/" className={navLinkClass}>Accueil</NavLink>
            <NavLink to={`/${user?.role === 'utilisateur-employer' ? 'employee' : 'client'}/dashboard`} className={navLinkClass}>
              Tableau de bord
            </NavLink>
            
            {/* Fonctionnalités spécifiques aux employés */}
            {user?.role === 'utilisateur-employer' && (
              <>
                <NavLink to="/employee/works" className={navLinkClass}>Mes Travaux</NavLink>
                <div className="border-t border-gray-200 my-2"></div>
              </>
            )}
            
            {/* Fonctionnalités communes à tous */}
            <NavLink to={`/${user?.role === 'utilisateur-employer' ? 'employee' : 'client'}/orders`} className={navLinkClass}>
              Mes Commandes
            </NavLink>
            <NavLink to={`/${user?.role === 'utilisateur-employer' ? 'employee' : 'client'}/orders-history`} className={navLinkClass}>
              Historique des commandes
            </NavLink>
            <NavLink to={`/${user?.role === 'utilisateur-employer' ? 'employee' : 'client'}/licenses`} className={navLinkClass}>
              Mes Licences
            </NavLink>
            <NavLink to={`/${user?.role === 'utilisateur-employer' ? 'employee' : 'client'}/tickets`} className={navLinkClass}>
              Mes Tickets
            </NavLink>
            <NavLink to={`/${user?.role === 'utilisateur-employer' ? 'employee' : 'client'}/support`} className={navLinkClass}>
              Support
            </NavLink>
            {user?.role !== 'utilisateur-employer' && (
              <NavLink to="/client/add-funds" className={navLinkClass}>Ajouter des fonds</NavLink>
            )}
            <NavLink to={`/${user?.role === 'utilisateur-employer' ? 'employee' : 'client'}/profile`} className={navLinkClass}>
              Mon Profil
            </NavLink>
          </nav>
          <button onClick={logout} className="mt-8 w-full py-2 px-4 rounded bg-red-100 text-red-700 font-semibold text-base hover:bg-red-200 transition">Se déconnecter</button>
        </div>
      </aside>
      {/* Overlay pouermer le menu sur mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden" onClick={() => setSidebarOpen(false)}></div>}
      {/* Contenu principal */}
      <main className="flex-1 p-12 md:ml-50">
        {/* Le composant Outlet rendra la page enfant correspondante */}
        <Outlet />
      </main>
    </div>
  );
};

export default ClientLayout;
