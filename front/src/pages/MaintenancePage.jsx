// src/pages/MaintenancePage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, RefreshCw, ShieldCheck, LogIn } from 'lucide-react';
import systemService from '../services/systemService';

/**
 * Page plein écran affichée à tous les utilisateurs non-admin
 * lorsque le mode maintenance est activé.
 * Re-vérifie l'état toutes les 10s pour revenir au site automatiquement
 * dès que l'admin désactive le mode.
 */
const MaintenancePage = () => {
  const [message, setMessage] = useState(
    sessionStorage.getItem('maintenanceMessage') ||
    "Maintenance en cours. Notre équipe technique effectue des mises à jour pour améliorer votre service. Nous serons de retour très rapidement. Merci pour votre patience."
  );
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      setChecking(true);
      try {
        const res = await systemService.getStatus();
        const data = res.data;
        if (!data.maintenanceMode) {
          // ✅ Maintenance terminée → retour automatique au site
          sessionStorage.removeItem('maintenanceMessage');
          window.location.href = '/';
        }
      } catch {
        // Silencieux — on retentera au prochain cycle
      } finally {
        setChecking(false);
      }
    }, 10000); // 10s — assez réactif sans surcharger le serveur

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Déco */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />

      <div className="relative max-w-md w-full text-center">

        {/* Icône animée */}
        <div className="relative mx-auto mb-8 w-24 h-24">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
            <Wrench className="w-11 h-11 text-white animate-[spin_4s_linear_infinite]" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Maintenance en cours
        </h1>

        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          {message}
        </p>

        {/* Statut de vérification */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400">
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
          Vérification automatique en cours…
        </div>

        {/* Badge sécurité */}
        <div className="mt-8 flex items-center justify-center gap-2 text-slate-600 text-xs">
          <ShieldCheck className="w-4 h-4" />
          Vos données sont en sécurité
        </div>

        {/* Accès admin discret */}
        <div className="mt-10">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            Accès administration
          </Link>
        </div>

      </div>
    </div>
  );
};

export default MaintenancePage;
