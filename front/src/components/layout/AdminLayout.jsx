// src/components/layout/AdminLayout.jsx
import { Outlet, NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import NotificationBell from '../NotificationBell';

/**
 * Layout pour l'espace administration.
 * Contient une barre de navigation latérale et affiche le contenu des pages d'administration.
 */
const AdminLayout = () => {
  const { user, logout } = useAuth();

  // Fonction pour styliser les liens de navigation actifs
  const navLinkClass = ({ isActive }) =>
    isActive
      ? 'flex items-center gap-2 py-2 px-3 rounded bg-red-00 text-blue-700 font-semibold text-base shadow-sm'
      : 'flex items-center gap-2 py-2 px-3 rounded hover:bg-blue-500 text-white-700 font-medium text-base';

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 via-white to-gray-200">
      {/* Barre de navigation latérale */}
      <aside className="w-full max-w-xs bg-slate-800 shadow-2xl p-6 flex flex-col justify-between border-r border-blue-200 md:w-72">
        <div>
          <h2 className="text-2xl font-extrabold mb-8 text-blue-700 tracking-wide text-center">Espace Admin</h2>
          <nav className="space-y-2 text-white-700">
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
          <button onClick={logout} className="mt-8 w-full py-2 px-3 rounded bg-red-100 text-red-700 font-semibold text-base hover:bg-red-200 transition">Se déconnecter</button>
        </div>
        <div className="mt-10 text-xs text-blue-400 text-center">© 2025 Plateforme Admin</div>
      </aside>
      {/* Contenu principal */}
      <main className="flex-1 p-4 md:p-10 bg-black-500 rounded-lg shadow-xl mx-2 md:mx-8 my-4 md:my-8 overflow-auto md:ml-50">
        <div className="border-b-4 border-blue-200 mb-6"></div>
        {/* Le composant Outlet rendra la page enfant correspondante */}
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
