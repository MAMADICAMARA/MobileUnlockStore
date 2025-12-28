import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CodeVerificationModal from './CodeVerificationModal';
import authService from '../../services/authService';
import useAuth from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';

const CodeVerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const { showNotification } = useNotification();

  const email = location.state?.email;
  const [isOpen, setIsOpen] = useState(true);

  if (!email) {
    // Pas d'email fourni — revenir à la page login
    navigate('/auth/login', { replace: true });
    return null;
  }

  const handleVerify = async (emailParam, code) => {
    try {
      const response = await authService.verifyLoginCode({ email: emailParam, code });
      // response.data.data contient token et user data
      const userData = response.data.data;
      // stocker token/user via contexte (suppose authLogin accepte userData)
      authLogin(userData);
      showNotification('Connexion réussie !', 'success');
      setIsOpen(false);
      navigate('/services', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Code invalide.';
      throw new Error(msg);
    }
  };

  const handleResend = async (emailParam) => {
    // On peut réutiliser requestLoginCode pour renvoyer le code
    try {
      await authService.requestLoginCode({ email: emailParam, password: '' });
      // Note: pour renvoi sécurisé, normalement il faut valider password à nouveau.
      showNotification('Nouveau code envoyé.', 'info');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Erreur lors du renvoi.';
      throw new Error(msg);
    }
  };

  return (
    <CodeVerificationModal
      isOpen={isOpen}
      email={email}
      onVerify={handleVerify}
      onResend={handleResend}
      onClose={() => { setIsOpen(false); navigate('/auth/login'); }}
      type="login"
    />
  );
};

export default CodeVerificationPage;
