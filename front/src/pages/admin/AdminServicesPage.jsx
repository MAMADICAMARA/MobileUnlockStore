// src/pages/admin/AdminServicesPage.jsx
import { useState, useEffect } from 'react';
import ServiceForm from '../../components/admin/ServiceForm';
import adminService from '../../services/adminService';

/**
 * Page de gestion des services pour l'administrateur.
 * Liste, création, modification et suppression des services.
 */
const AdminServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Charger les services au montage
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await adminService.getAllServices();
        setServices(response.data || []);
      } catch (err) {
        console.error('Erreur chargement services:', err);
        setError('Impossible de charger les services. Vérifiez votre connexion.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Ouvrir modal création
  const handleCreate = () => {
    setSelectedService(null);
    setIsModalOpen(true);
  };

  // Ouvrir modal modification
  const handleEdit = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  // Soumission formulaire (création ou mise à jour)
  const handleSubmit = async (formData) => {
    setFormLoading(true);
    setError(null);
    try {
      let response;
      if (selectedService) {
        // Mise à jour
        response = await adminService.updateService(selectedService._id, formData);
        setServices(services.map(s => 
          s._id === selectedService._id ? response.data : s
        ));
      } else {
        // Création
        response = await adminService.createService(formData);
        setServices([...services, response.data]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Erreur soumission service:', err);
      setError(err.response?.data?.message || 'Erreur lors de l’enregistrement.');
    } finally {
      setFormLoading(false);
    }
  };

  // Suppression avec confirmation
  const handleDelete = async (serviceId) => {
    if (!window.confirm('Confirmez-vous la suppression de ce service ?')) return;

    try {
      await adminService.deleteService(serviceId);
      setServices(services.filter(s => s._id !== serviceId));
    } catch (err) {
      console.error('Erreur suppression:', err);
      setError('Impossible de supprimer ce service.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Services</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow transition"
        >
          + Ajouter un service
        </button>
      </div>

      {/* Message d'erreur global */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Tableau */}
      <div className="bg-white shadow rounded-xl overflow-hidden border border-gray-200">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Chargement des services...
          </div>
        ) : services.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Aucun service pour le moment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Catégorie</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Prix</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.map((service) => (
                  <tr key={service._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{service.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 capitalize">{service.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 font-medium">
                      {service.price.toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        service.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {service.active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => handleEdit(service)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(service._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedService ? 'Modifier le service' : 'Ajouter un nouveau service'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <ServiceForm 
                service={selectedService} 
                onSubmit={handleSubmit} 
                isLoading={formLoading} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServicesPage;