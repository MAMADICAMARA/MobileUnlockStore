// src/pages/client/SupportPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supportService from '../../services/supportService';

/**
 * Page permettant à un client de soumettre un nouveau ticket de support.
 */
const SupportPage = () => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback('');

    try {
      await supportService.createTicket({ subject, message });
      setLoading(false);
      setFeedback('Votre ticket a été envoyé avec succès !');
      setTimeout(() => navigate('/client/tickets'), 2000); // Rediriger vers la liste des tickets
    } catch (error) {
      setLoading(false);
      setFeedback('Erreur lors de l\'envoi du ticket.');
    }
  };

  return (
    <div>
      <h1 className="text-3xl text-blue-700 font-bold mb-6">Contacter le Support</h1>
      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Sujet</label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
            <textarea
              id="message"
              rows="6"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Envoi en cours...' : 'Envoyer le ticket'}
            </button>
          </div>
          {feedback && <p className="text-green-600 text-center mt-4">{feedback}</p>}
        </form>
      </div>
    </div>
  );
};

export default SupportPage;
