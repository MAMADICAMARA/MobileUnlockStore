// src/components/ServiceModal.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth'; // Assurez-vous que le chemin est correct
import serviceService from '../services/serviceService';
import orderService from '../services/orderService';
import axios from 'axios';

/**
 * Modal de commande de service.
 * @param {object} props - Les propriétés du composant.
 * @param {boolean} props.isOpen - Indique si le modal est ouvert.
 * @param {function} props.onClose - Fonction pour fermer le modal.
 * @param {object} props.service - Le service sélectionné pour la commande.
 */
const ServiceModal = ({ isOpen, onClose, service }) => {
  const { user, updateUserBalance } = useAuth(); // Utiliser le hook d'authentification

  // État pour les champs dynamiques du formulaire
  const [formFields, setFormFields] = useState({});
  // État pour le chargement, les erreurs et le succès
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState('');

  // Réinitialiser l'état lorsque le service change (un nouveau modal est ouvert)
  useEffect(() => {
    if (service) {
      // Initialiser les champs du formulaire en fonction du type de service
      const initialFields = {};
      if (service.type === 'IMEI') {
        initialFields.imei = '';
      }
      // Ajouter d'autres champs pour d'autres types de service si nécessaire
      // exemple: if (service.type === 'Licence') { initialFields.dongleId = ''; }
      setFormFields(initialFields);
      setError('');
      setSuccess('');
    }
  }, [service]);

  if (!isOpen || !service) return null;

  const isBalanceSufficient = user?.balance >= service.price;

  // Gérer le changement dans les champs de formulaire
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormFields(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Gérer la soumission de la commande
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isBalanceSufficient) {
      setError('Solde insuffisant. Veuillez recharger votre compte.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // 1. Passer la commande. Cette fonction crée déjà la commande dans le backend.
      const orderResponse = await orderService.placeOrder({
        serviceId: service._id,
        fields: formFields,
      });

      setSuccess('Commande passée avec succès !');
      updateUserBalance(orderResponse.data.newBalance); // Mettre à jour le solde dans le contexte

      // 2. Utiliser l'ID de la commande retourné par la première réponse pour l'upload
      if (selectedFile) {
        const formData = new FormData();
        formData.append('document', selectedFile);
        try {
          // Utiliser l'ID de la commande qui vient d'être créée
          await axios.post(`/api/orders/${orderResponse.data.order._id}/upload-document`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } catch (err) {
          setUploadError('Erreur lors du téléversement du document.');
        }
      }

      // 3. Fermer le modal après un court délai
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Fond semi-transparent
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      {/* Conteneur du modal */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
        {/* Bouton de fermeture */}
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800">&times;</button>
        
        <h2 className="text-2xl font-bold mb-4">Confirmer la commande</h2>
        
        {/* Récapitulatif du service */}
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <p><strong>Service :</strong> {service.name}</p>
          <p><strong>Prix :</strong> <span className="font-bold text-green-600">{service.price} €</span></p>
          <p><strong>Délai :</strong> {service.deliveryTime}</p>
        </div>

        {/* Affichage du solde */}
        <div className={`p-2 rounded-md mb-4 text-center ${isBalanceSufficient ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          Votre solde actuel : {(user && user.balance !== undefined ? user.balance.toFixed(2) : '0.00')} €
        </div>

        {/* Formulaire de commande */}
        <form onSubmit={handleSubmit}>
          {/* Champs dynamiques */}
          {service.type === 'IMEI' && (
            <div>
              <label htmlFor="imei" className="block text-sm font-medium text-gray-700">Numéro IMEI</label>
              <input
                type="text"
                id="imei"
                name="imei"
                value={formFields.imei || ''}
                onChange={handleFieldChange}
                required
                minLength="15"
                maxLength="15"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
          {/* Ajouter d'autres champs conditionnels ici */}

          {/* Téléversement de document */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Téléverser un document (PDF, image, etc.)</label>
            <input type="file" accept=".pdf,image/*" onChange={handleFileChange} className="mt-1 block w-full" />
            {uploadError && <p className="text-red-500 text-sm mt-2">{uploadError}</p>}
          </div>

          {/* Messages d'erreur et de succès */}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {success && <p className="text-green-500 text-sm mt-2">{success}</p>}

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
              Annuler
            </button>
            <button
              type="submit"
              disabled={!isBalanceSufficient || loading || success || !user}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Confirmation...' : 'Confirmer la commande'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceModal;
