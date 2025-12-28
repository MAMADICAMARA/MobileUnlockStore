// src/components/admin/ServiceForm.jsx
import { useState, useEffect } from 'react';

const serviceTypes = ['IMEI', 'Licence', 'Remote', 'official unlock iphone'];

/**
 * Formulaire pour créer ou modifier un service.
 * @param {object} props
 * @param {object|null} props.service - Le service à modifier, ou null pour une création.
 * @param {function} props.onSubmit - Fonction à appeler lors de la soumission.
 * @param {boolean} props.isLoading - Indique si une opération est en cours.
 */
const ServiceForm = ({ service, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    deliveryTime: '',
    type: 'IMEI',
  });

  // Pré-remplir le formulaire si un service est passé en props (pour la modification)
  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        price: service.price || '',
        deliveryTime: service.deliveryTime || '',
        type: service.type || 'IMEI',
      });
    } else {
      // Réinitialiser pour le mode création
      setFormData({ name: '', description: '', price: '', deliveryTime: '', type: 'IMEI' });
    }
  }, [service]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom du service</label>
        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows="3" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Prix (€)</label>
          <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type de service</label>
          <select name="type" id="type" value={formData.type} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
            {serviceTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-700">Délai de traitement</label>
        <input type="text" name="deliveryTime" id="deliveryTime" value={formData.deliveryTime} onChange={handleChange} required placeholder="Ex: 5-10 min, 24h, Instantané" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
      </div>
      <div className="pt-4">
        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
          {isLoading ? 'Enregistrement...' : (service ? 'Mettre à jour le service' : 'Créer le service')}
        </button>
      </div>
    </form>
  );
};

export default ServiceForm;
