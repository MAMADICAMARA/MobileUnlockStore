// src/components/TwoFactorSection.jsx
// Bloc 2FA à intégrer dans DashboardPage.jsx
// Remplace le faux bloc "2FA actif" existant

import { useState } from 'react';
import { Shield, ShieldCheck, ShieldOff, QrCode, KeyRound, Check, X } from 'lucide-react';
import api from '../services/api';

const TwoFactorSection = ({ user, onStatusChange }) => {
  const [step, setStep]         = useState('idle'); // idle | setup | enable | disable
  const [qrCode, setQrCode]     = useState('');
  const [secret, setSecret]     = useState('');
  const [code, setCode]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const isEnabled = user?.twoFactorEnabled;

  const reset = () => { setStep('idle'); setCode(''); setError(''); setSuccess(''); setQrCode(''); setSecret(''); };

  // ── Lancer la configuration ───────────────────────────────────────────────
  const handleSetup = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.post('/api/auth/2fa/setup');
      setQrCode(res.data.qrCode);
      setSecret(res.data.secret);
      setStep('setup');
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors de la configuration.');
    } finally { setLoading(false); }
  };

  // ── Activer après scan du QR ──────────────────────────────────────────────
  const handleEnable = async (e) => {
    e.preventDefault();
    if (code.length !== 6) { setError('Le code doit contenir 6 chiffres.'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/api/auth/2fa/enable', { code });
      setSuccess('2FA activé avec succès ! Votre compte est maintenant sécurisé.');
      onStatusChange?.({ twoFactorEnabled: true });
      setTimeout(reset, 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Code invalide. Réessayez.');
    } finally { setLoading(false); }
  };

  // ── Désactiver ────────────────────────────────────────────────────────────
  const handleDisable = async (e) => {
    e.preventDefault();
    if (code.length !== 6) { setError('Le code doit contenir 6 chiffres.'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/api/auth/2fa/disable', { code });
      setSuccess('2FA désactivé.');
      onStatusChange?.({ twoFactorEnabled: false });
      setTimeout(reset, 2000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Code invalide.');
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          {isEnabled
            ? <ShieldCheck className="w-5 h-5 text-emerald-500" />
            : <Shield className="w-5 h-5 text-gray-400" />}
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Authentification à deux facteurs
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Google Authenticator / Authy
            </p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          isEnabled
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
        }`}>
          {isEnabled ? '✅ Activé' : '⚫ Désactivé'}
        </span>
      </div>

      <div className="p-5">

        {/* ── IDLE ── */}
        {step === 'idle' && (
          <>
            {success && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <p className="text-sm text-emerald-700 dark:text-emerald-400">{success}</p>
              </div>
            )}

            {!isEnabled ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Activez le 2FA pour sécuriser votre compte avec une couche de protection supplémentaire. Chaque connexion nécessitera un code généré par votre application.
                </p>
                <button onClick={handleSetup} disabled={loading}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  {loading
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><QrCode className="w-4 h-4" /> Configurer le 2FA</>}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Le 2FA est actif sur votre compte. Chaque connexion requiert un code de votre application d'authentification.
                </p>
                <button onClick={() => { setStep('disable'); setError(''); }}
                  className="w-full py-2.5 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2">
                  <ShieldOff className="w-4 h-4" /> Désactiver le 2FA
                </button>
              </div>
            )}
          </>
        )}

        {/* ── SETUP : afficher QR code ── */}
        {step === 'setup' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Scannez ce QR code avec Google Authenticator ou Authy
              </p>
              {qrCode && (
                <img src={qrCode} alt="QR Code 2FA" className="mx-auto w-48 h-48 rounded-xl border border-gray-200 dark:border-gray-600" />
              )}
              <details className="mt-3">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                  QR code ne fonctionne pas ? Entrez le code manuel
                </summary>
                <code className="block mt-2 text-xs font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded-lg break-all text-gray-800 dark:text-gray-200">
                  {secret}
                </code>
              </details>
            </div>

            <form onSubmit={handleEnable} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Entrez le code à 6 chiffres pour confirmer
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={code} inputMode="numeric"
                    onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                    placeholder="000000" maxLength={6} autoFocus
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-lg tracking-widest font-mono text-center" />
                </div>
              </div>

              {error && (
                <div className="p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg flex items-center gap-2">
                  <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button type="submit" disabled={loading || code.length !== 6}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                  {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> Activer</>}
                </button>
                <button type="button" onClick={reset}
                  className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-500 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── DISABLE : confirmer avec code ── */}
        {step === 'disable' && (
          <form onSubmit={handleDisable} className="space-y-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Entrez votre code Google Authenticator actuel pour désactiver le 2FA.
              </p>
            </div>

            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={code} inputMode="numeric"
                onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                placeholder="000000" maxLength={6} autoFocus
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white text-lg tracking-widest font-mono text-center" />
            </div>

            {error && (
              <div className="p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg flex items-center gap-2">
                <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button type="submit" disabled={loading || code.length !== 6}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><ShieldOff className="w-4 h-4" /> Désactiver</>}
              </button>
              <button type="button" onClick={reset}
                className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-500 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSection;
