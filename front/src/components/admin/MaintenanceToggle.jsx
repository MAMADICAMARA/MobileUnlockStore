// src/components/admin/MaintenanceToggle.jsx
// Composant autonome — à importer et placer en haut de AdminDashboardPage.
import { useState, useEffect } from 'react';
import { Wrench, AlertTriangle, Loader } from 'lucide-react';
import systemService from '../../services/systemService';

const MaintenanceToggle = () => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    systemService.getStatus()
      .then(res => setEnabled(!!res.data.maintenanceMode))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async () => {
    const next = !enabled;
    const confirmMsg = next
      ? "⚠️ Activer le mode maintenance va déconnecter TOUS les clients et bloquer l'accès au site. Continuer ?"
      : 'Désactiver le mode maintenance et rendre le site accessible à tous ?';

    if (!window.confirm(confirmMsg)) return;

    setToggling(true);
    try {
      await systemService.setMaintenance(next);
      setEnabled(next);
    } catch (err) {
      alert(err.message || "Erreur lors du changement de mode.");
    } finally {
      setToggling(false);
    }
  };

  if (loading) return null;

  return (
    <div className={`rounded-2xl p-4 sm:p-5 border shadow-sm flex items-center justify-between gap-4 ${
      enabled
        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
    }`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          enabled ? 'bg-red-100 dark:bg-red-900/40' : 'bg-slate-100 dark:bg-slate-700'
        }`}>
          {enabled
            ? <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            : <Wrench className="w-5 h-5 text-slate-500" />}
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-semibold ${enabled ? 'text-red-700 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
            Mode Maintenance / Verrouillage Général
          </p>
          <p className={`text-xs ${enabled ? 'text-red-500 dark:text-red-400/80' : 'text-slate-400'}`}>
            {enabled ? 'Site verrouillé — seuls les admins ont accès' : 'Site accessible à tous'}
          </p>
        </div>
      </div>

      <button
        onClick={handleToggle}
        disabled={toggling}
        className={`relative flex-shrink-0 w-14 h-8 rounded-full transition-colors disabled:opacity-60 ${
          enabled ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-600'
        }`}
      >
        {toggling ? (
          <Loader className="w-4 h-4 text-white animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        ) : (
          <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${
            enabled ? 'translate-x-7' : 'translate-x-1'
          }`} />
        )}
      </button>
    </div>
  );
};

export default MaintenanceToggle;
