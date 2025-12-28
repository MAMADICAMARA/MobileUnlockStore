import { useState } from 'react';

const CodeVerificationModal = ({ isOpen, email, onVerify, onResend, onClose, type }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onVerify(email, code);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Code invalide.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setLoading(true);
    try {
      await onResend(email);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Erreur lors du renvoi.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold text-blue-700 mb-4">Vérification du code</h2>
        <p className="text-sm text-gray-600 mb-4">
          Un code a été envoyé à <strong>{email}</strong>. Veuillez le saisir ci-dessous pour confirmer votre {type === 'signup' ? 'inscription' : 'action'}.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Code à 6 chiffres"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {loading ? 'Vérification...' : 'Vérifier le code'}
          </button>
        </form>
        <div className="mt-4 flex justify-between items-center text-sm">
          <button onClick={handleResend} className="text-blue-600 hover:underline">
            Renvoyer le code
          </button>
          <button onClick={onClose} className="text-gray-500 hover:underline">
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeVerificationModal;
