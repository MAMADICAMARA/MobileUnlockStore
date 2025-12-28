// src/pages/admin/AdminContentPage.jsx
import { useState } from 'react';

// Données fictives pour la FAQ
const initialFaq = [
  { id: 1, question: 'Qu\'est-ce que le déblocage par IMEI ?', answer: 'C\'est une méthode officielle...' },
  { id: 2, question: 'Combien de temps prend le processus ?', answer: 'Le délai varie en fonction du service...' },
];

/**
 * Page de gestion du contenu du site (ex: FAQ).
 */
const AdminContentPage = () => {
  const [faq, setFaq] = useState(initialFaq);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFaqChange = (index, field, value) => {
    const newFaq = [...faq];
    newFaq[index][field] = value;
    setFaq(newFaq);
  };

  const handleSaveChanges = () => {
    setLoading(true);
    setMessage('');
    // Simuler un appel API pour sauvegarder les changements
    console.log("Sauvegarde du contenu:", { faq });
    setTimeout(() => {
      setLoading(false);
      setMessage('Contenu mis à jour avec succès !');
    }, 1000);
  };

  return (
    <div>
      <h1 className="text-3xl text-blue-700 font-bold mb-6">Gestion du Contenu</h1>
      
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Section FAQ</h2>
        <p className="text-gray-600 mb-6">Modifiez les questions et réponses qui apparaissent sur la page FAQ publique.</p>
        
        <div className="space-y-6">
          {faq.map((item, index) => (
            <div key={item.id} className="p-4 border rounded-md">
              <label className="block text-sm font-medium text-gray-700">Question {index + 1}</label>
              <input
                type="text"
                value={item.question}
                onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
              <label className="block text-sm font-medium text-gray-700 mt-2">Réponse</label>
              <textarea
                value={item.answer}
                onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                rows="3"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
          ))}
        </div>

        <div className="mt-8">
          <button
            onClick={handleSaveChanges}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Sauvegarde...' : 'Enregistrer les modifications'}
          </button>
          {message && <p className="text-green-600 inline-block ml-4">{message}</p>}
        </div>
      </div>
      {/* D'autres sections de contenu (ex: page d'accueil) pourraient être ajoutées ici */}
    </div>
  );
};

export default AdminContentPage;
