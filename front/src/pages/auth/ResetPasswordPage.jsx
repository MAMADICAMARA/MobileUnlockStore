import React, { useState } from 'react';
import CodeVerificationModal from '../../components/CodeVerificationModal';
import authService from '../../services/authService';

const ResetPasswordPage = () => {
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [canChangePassword, setCanChangePassword] = useState(false);

  const handleRequestReset = async (email) => {
    try {
      await authService.requestReset(email);
      setPendingEmail(email);
      setShowCodeModal(true);
    } catch (err) {
      // ...gestion d'erreur...
    }
  };

  const handleVerifyCode = async (email, code) => {
    await authService.verifyResetCode(email, code);
    setShowCodeModal(false);
    setCanChangePassword(true);
  };

  const handleResendCode = async (email) => {
    await authService.resendResetCode(email);
  };

  return (
    <div>
      {/* ...formulaire de demande de reset... */}
      <CodeVerificationModal
        isOpen={showCodeModal}
        email={pendingEmail}
        onVerify={handleVerifyCode}
        onResend={handleResendCode}
        type="reset"
        onClose={() => setShowCodeModal(false)}
      />
      {/* ...formulaire de changement de mot de passe si canChangePassword... */}
    </div>
  );
};

export default ResetPasswordPage;