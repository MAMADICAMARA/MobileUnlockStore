import { useState } from 'react';
import { useNotification } from '../context/NotificationContext';

const CodeVerificationModal = ({ isOpen, email, onVerify, onResend, type, onClose }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showNotification } = useNotification();

  if (!isOpen) return null;

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onVerify(email, code);
      showNotification('Code confirmé !', 'success');
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Code invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    try {
      await onResend(email);
      showNotification('Nouveau code envoyé !', 'success');
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors de l\'envoi du code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 text-center relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-gray-500">&times;</button>
        <h2 className="text-2xl font-bold mb-4">{type === 'signup' ? 'Confirmation d\'inscription' : 'Code de réinitialisation'}</h2>
        <p className="mb-4 text-gray-700">Un code a été envoyé à <span className="font-semibold">{email}</span>. Veuillez le saisir ci-dessous.</p>
        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            maxLength={6}
            minLength={6}
            required
            placeholder="Code à 6 chiffres"
            className="w-full px-4 py-2 border rounded-lg text-center text-lg"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400">
            {loading ? 'Vérification...' : 'Confirmer'}
          </button>
        </form>
        <button onClick={handleResend} disabled={loading} className="mt-6 text-blue-600 hover:underline text-sm">
          Renvoyer un nouveau code
        </button>
      </div>
    </div>
  );
};

export default CodeVerificationModal;
