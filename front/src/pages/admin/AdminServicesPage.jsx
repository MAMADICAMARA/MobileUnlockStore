// src/pages/admin/AdminServicesPage.jsx
import { useState, useEffect } from 'react';
import ServiceForm from '../../components/admin/ServiceForm';
import adminService from '../../services/adminService';

// /**
//  * Page de gestion des services pour l'administrateur.
//  * Affiche la liste des services et permet de les créer, modifier et supprimer.
//  */
const AdminServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null); // Pour la modification
  const [formLoading, setFormLoading] = useState(false);

  // Charger les services
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const response = await adminService.getAllServices();
        setServices(response.data);
      } catch (error) {
        console.error("Erreur de chargement des services", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Ouvrir le modal pour la création
  const handleCreate = () => {
    setSelectedService(null);
    setIsModalOpen(true);
  };

  // Ouvrir le modal pour la modification
  const handleEdit = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  // Gérer la soumission du formulaire (création/modification)
  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (selectedService) {
        // Mise à jour réelle
        const response = await adminService.updateService(selectedService._id, formData);
        setServices(services.map(s => s._id === selectedService._id ? response.data : s));
      } else {
        // Création réelle
        const response = await adminService.createService(formData);
        setServices([...services, response.data]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erreur lors de la soumission", error);
    } finally {
      setFormLoading(false);
    }
  };

  // Gérer la suppression
  const handleDelete = async (serviceId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce service ?")) {
      try {
        await adminService.deleteService(serviceId);
        setServices(services.filter(s => s._id !== serviceId));
      } catch (error) {
        console.error("Erreur de suppression", error);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">Gestion des Services</h1>
        <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Ajouter un service
        </button>
      </div>

      {/* Tableau des services */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {loading ? <p className="p-4">Chargement...</p> : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Prix</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-50 divide-y divide-gray-200">
              {services.map(service => (
                <tr key={service._id}>
                  <td className="px-6 py-4 font-medium text-blue-700">{service.name}</td>
                  <td className="px-6 py-4 text-blue-600">{service.type || 'Remote'}</td>
                  <td className="px-6 py-4 text-right text-blue-600">{service.price.toFixed(2)} €</td>
                  <td className="px-6 py-4 text-center space-x-2">
                    <button onClick={() => handleEdit(service)} className="text-blue-600 hover:text-blue-900">Modifier</button>
                    <button onClick={() => handleDelete(service._id)} className="text-red-600 hover:text-red-900">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal pour le formulaire */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
            <h2 className="text-2xl font-bold mb-4">{selectedService ? 'Modifier le service' : 'Créer un nouveau service'}</h2>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800">&times;</button>
            <ServiceForm service={selectedService} onSubmit={handleSubmit} isLoading={formLoading} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServicesPage;
