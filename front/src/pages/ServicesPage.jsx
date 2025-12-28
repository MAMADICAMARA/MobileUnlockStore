// src/pages/ServicesPage.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ServiceCard from '../components/ServiceCard';
import ServiceModal from '../components/ServiceModal';
import serviceService from '../services/serviceService';
import useAuth from '../hooks/useAuth'; // Pour obtenir les infos utilisateur


const ServicesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  // États pour les données, le chargement et les erreurs
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // États pour les filtres et la recherche
  const [filter, setFilter] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');

  // États pour le modal de commande
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);

  // Récupération des services au chargement du composant
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await serviceService.getServices();
        // Log utile pour debug : affiche l'URL complète et le status
        console.log('GET services -> request url:', response.request?.responseURL || 'unknown');
        setServices(response.data);
      } catch (err) {
        console.error('Erreur lors du fetch des services :', err);
        // Si axios error.response existe, log détaillé
        if (err?.response) {
          console.error('Response status:', err.response.status, 'data:', err.response.data);
          setError(`Erreur serveur: ${err.response.status} - ${err.response.data?.message || JSON.stringify(err.response.data)}`);
        } else if (err?.message) {
          setError(err.message);
        } else {
          setError('Impossible de charger les services. Vérifiez la connexion au backend et l\'URL de l\'API.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Logique de filtrage et de recherche
  const filteredServices = useMemo(() => {
    if (!Array.isArray(services)) {
      console.warn('services is not an array:', services);
      return [];
    }
    return services
      .filter(service => {
        if (filter === 'Tous') return true;
        if (filter === 'Déverrouillage par IMEI') return service.type === 'IMEI';
        if (filter === 'Licences Logicielles') return service.type === 'Licence';
        else if (filter === 'Remote') return service.type === 'Remote';
        return true;
      })
      .filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [services, filter, searchTerm]);

  // Gestion de l'ouverture du modal
  const handleOrderClick = (service) => {
    if (!isAuthenticated) {
      alert("Veuillez vous connecter pour commander un service.");
      return;
    }
    if (user?.role === 'admin') {
      alert("Un administrateur ne peut pas passer de commande.");
      return;
    }
    if (user?.balance < service.price) {
      setShowInsufficientModal(true);
      return;
    }
    setSelectedService(service);
    setIsModalOpen(true);
  };

  // Gestion de la fermeture du modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  const filterTabs = ['Tous', 'Déverrouillage par IMEI', 'Licences Logicielles', 'Remote'];

  return (
    <div className="bg-gray-400 min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-blue-600 text-center mb-4">Nos Services</h1>
        <p className="text-center text-gray-600 mb-12">Trouvez le service dont vous avez besoin.</p>

        {/* Barre de filtres et de recherche */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Filtres */}
            <div className="flex border border-gray-200 rounded-lg p-1">
              {filterTabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${filter === tab ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            {/* Barre de recherche */}
            <input
              type="text"
              placeholder="Rechercher un service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg w-full md:w-auto"
            />
          </div>
        </div>

        {/* Affichage des services */}
        {loading && <p className="text-center">Chargement des services...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.length > 0 ? (
              filteredServices.map(service => (
                <ServiceCard key={service._id} service={service} onOrderClick={handleOrderClick} />
              ))
            ) : (
              <p className="text-center col-span-full">Aucun service ne correspond à votre recherche.</p>
            )}
          </div>
        )}
      </main>
      <Footer />

      {/* Modal de commande */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        service={selectedService}
        userBalance={user?.balance || 0} // Remplacer par user?.balance quand disponible
      />

      {/* Modal solde insuffisant */}
      {showInsufficientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 text-center relative">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Solde insuffisant</h2>
            <p className="mb-6 text-gray-700">Votre solde est insuffisant pour commander ce service.</p>
            <button onClick={() => { setShowInsufficientModal(false); navigate('/client/add-funds'); }} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">Ajouter un fond</button>
            <button onClick={() => setShowInsufficientModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
