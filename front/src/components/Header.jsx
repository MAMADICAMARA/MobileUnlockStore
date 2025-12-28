// src/components/Header.jsx
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import NotificationBell from '../components/NotificationBell';

/**
 * Composant de l'en-tête de l'application.
 * Affiche le logo, la navigation principale et les liens d'authentification.
 */
const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-extrabold text-blue-700">Déblocage Mobile</Link>
        {/* Hamburger pour mobile */}
        <button className="md:hidden flex flex-col gap-1" onClick={() => setMenuOpen(true)} aria-label="Ouvrir le menu">
          <span className="w-7 h-1 bg-blue-700 rounded"></span>
          <span className="w-7 h-1 bg-blue-700 rounded"></span>
          <span className="w-7 h-1 bg-blue-700 rounded"></span>
        </button>
        {/* Menu horizontal desktop */}
        <nav className="hidden md:flex gap-8 items-center">
          <Link to="/" className="text-blue-700 font-semibold hover:underline">Accueil</Link>
          <Link to="/services" className="text-blue-700 font-semibold hover:underline">Services</Link>
          <Link to="/faq" className="text-blue-700 font-semibold hover:underline">FAQ</Link>
          <Link to="/contact" className="text-blue-700 font-semibold hover:underline">Contact</Link>
          {isAuthenticated ? (
              <>
                {user?.role === 'admin' ? (
                  <Link to="/admin/dashboard" className="text-blue-700 font-semibold text-lg" onClick={() => setMenuOpen(false)}>Profil</Link>
                ) : (
                  <Link to="/client/dashboard" className="text-blue-700 font-semibold text-lg" onClick={() => setMenuOpen(false)}>Profil</Link>
                )}
                <button onClick={() => { setMenuOpen(false); logout(); navigate('/'); }} className="text-red-600 font-semibold text-lg text-left">Se déconnecter</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-blue-700 font-semibold text-lg" onClick={() => setMenuOpen(false)}>Connexion</Link>
                <Link to="/register" className="text-blue-700 font-semibold text-lg" onClick={() => setMenuOpen(false)}>Inscription</Link>
              </>
            )}
        </nav>
      </div>
      {/* Menu mobile en overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex">
          <nav className="bg-white w-64 h-full p-8 flex flex-col gap-6 shadow-xl animate-slide-in-left relative">
            <button className="absolute top-4 right-4 text-3xl text-blue-700" onClick={() => setMenuOpen(false)} aria-label="Fermer le menu">&times;</button>
            <Link to="/" className="text-blue-700 font-semibold text-lg" onClick={() => setMenuOpen(false)}>Accueil</Link>
            <Link to="/services" className="text-blue-700 font-semibold text-lg" onClick={() => setMenuOpen(false)}>Services</Link>
            <Link to="/faq" className="text-blue-700 font-semibold text-lg" onClick={() => setMenuOpen(false)}>FAQ</Link>
            <Link to="/contact" className="text-blue-700 font-semibold text-lg" onClick={() => setMenuOpen(false)}>Contact</Link>
           {isAuthenticated ? (
              <>
                {user?.role === 'admin' ? (
                  <Link to="/admin/dashboard" className="text-blue-700 font-semibold text-lg" onClick={() => setMenuOpen(false)}>Tableau de bord</Link>
                ) : (
                  <Link to="/client/dashboard" className="text-blue-700 font-semibold text-lg" onClick={() => setMenuOpen(false)}>Tableau de bord</Link>
                )}
                <button onClick={() => { setMenuOpen(false); logout(); navigate('/'); }} className="text-red-600 font-semibold text-lg text-left">Se déconnecter</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-blue-700 font-semibold text-lg" onClick={() => setMenuOpen(false)}>Connexion</Link>
                <Link to="/register" className="text-blue-700 font-semibold text-lg" onClick={() => setMenuOpen(false)}>Inscription</Link>
              </>
            )}
          </nav>
          <div className="flex-1" onClick={() => setMenuOpen(false)}></div>
        </div>
      )}
    </header>
  );
};

export default Header;
