// src/pages/auth/ResetPasswordPage.jsx   (ou le nom exact de ton fichier)
import React, { useState } from 'react';
// import CodeVerificationModal from '../../components/CodeVerificationModal'; // ← COMMENTÉ
import authService from '../../services/authService';

const ResetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [canChangePassword, setCanChangePassword] = useState(true); // forcé à true pour bypass le code

  // ────────────────────────────── RESET CODE / OTP EN PAUSE ──────────────────────────────
  // const [showCodeModal, setShowCodeModal] = useState(false);
  // const [pendingEmail, setPendingEmail] = useState('');
  // ────────────────────────────────────────────────────────────────────────────────────────

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email.trim()) {
        throw new Error('Veuillez entrer votre adresse email.');
      }

      // ────────────────────────────── RESET CODE / OTP EN PAUSE ──────────────────────────────
      /*
      await authService.requestReset(email);
      setPendingEmail(email);
      setShowCodeModal(true);
      setSuccess('Un code de réinitialisation a été envoyé à votre email.');
      */
      // ────────────────────────────────────────────────────────────────────────────────────────

      // Version sans code : on passe directement au changement de mot de passe
      setSuccess('Vous pouvez maintenant saisir votre nouveau mot de passe.');
      setCanChangePassword(true); // forcé

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la demande de réinitialisation.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────── RESET CODE / OTP EN PAUSE ──────────────────────────────
  /*
  const handleVerifyCode = async (email, code) => {
    await authService.verifyResetCode(email, code);
    setShowCodeModal(false);
    setCanChangePassword(true);
  };

  const handleResendCode = async (email) => {
    await authService.resendResetCode(email);
  };
  */
  // ────────────────────────────────────────────────────────────────────────────────────────

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!newPassword || !confirmNewPassword) {
        throw new Error('Veuillez saisir et confirmer votre nouveau mot de passe.');
      }
      if (newPassword !== confirmNewPassword) {
        throw new Error('Les mots de passe ne correspondent pas.');
      }
      if (newPassword.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères.');
      }

      // Appel au service pour changer le mot de passe (sans code intermédiaire)
      await authService.resetPassword(email, newPassword);

      setSuccess('Mot de passe modifié avec succès ! Vous pouvez maintenant vous connecter.');
      setTimeout(() => {
        navigate('/login');
      }, 2500);

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du changement de mot de passe.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center">Réinitialiser le mot de passe</h1>

          {error && <p className="text-red-500 text-center">{error}</p>}
          {success && <p className="text-green-500 text-center">{success}</p>}

          {/* Formulaire de demande de reset (email) */}
          {!canChangePassword && (
            <form onSubmit={handleRequestReset} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Adresse e-mail associée à votre compte
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@email.com"
                  required
                  disabled={loading}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
              >
                {loading ? 'Envoi en cours...' : 'Envoyer le code'}
              </button>
            </form>
          )}

          {/* ────────────────────────────── RESET CODE / OTP EN PAUSE ────────────────────────────── */}
          {/* 
          <CodeVerificationModal
            isOpen={showCodeModal}
            email={pendingEmail}
            onVerify={handleVerifyCode}
            onResend={handleResendCode}
            type="reset"
            onClose={() => setShowCodeModal(false)}
          />
          */}
          {/* ──────────────────────────────────────────────────────────────────────────────────────── */}

          {/* Formulaire de changement de mot de passe (directement accessible maintenant) */}
          {canChangePassword && (
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email (pour référence)
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                />
              </div>

              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                  Nouveau mot de passe
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nouveau mot de passe"
                  required
                  disabled={loading}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-700">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  id="confirm-new-password"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirmer"
                  required
                  disabled={loading}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
              >
                {loading ? 'Modification en cours...' : 'Modifier le mot de passe'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-600">
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Retour à la connexion
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPasswordPage;