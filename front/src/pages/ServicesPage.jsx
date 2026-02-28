// src/pages/ServicesPage.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Smartphone, 
  Key, 
  Globe, 
  CreditCard,
  X,
  ChevronRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ServiceCard from '../components/ServiceCard';
import ServiceModal from '../components/ServiceModal';
import serviceService from '../services/serviceService';
import useAuth from '../hooks/useAuth';

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
  const [showFilters, setShowFilters] = useState(false);

  // États pour le modal de commande
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);

  // Animation de chargement
  const [pageLoaded, setPageLoaded] = useState(false);
  useEffect(() => {
    setPageLoaded(true);
  }, []);

  // Récupération des services au chargement du composant
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await serviceService.getServices();
        console.log('GET services -> request url:', response.request?.responseURL || 'unknown');
        setServices(response.data);
      } catch (err) {
        console.error('Erreur lors du fetch des services :', err);
        if (err?.response) {
          console.error('Response status:', err.response.status, 'data:', err.response.data);
          setError(`Erreur serveur: ${err.response.status} - ${err.response.data?.message || JSON.stringify(err.response.data)}`);
        } else if (err?.message) {
          setError(err.message);
        } else {
          setError('Impossible de charger les services. Vérifiez la connexion au backend.');
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
        if (filter === 'Remote') return service.type === 'Remote';
        return true;
      })
      .filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [services, filter, searchTerm]);

  // Gestion de l'ouverture du modal (maintenant appelé quand on clique sur la carte)
  const handleServiceClick = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  // Gestion de la fermeture du modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  // Gestion de la commande depuis le modal
  const handleOrderFromModal = (service) => {
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
      setIsModalOpen(false);
      return;
    }
    // Ici, logique pour ouvrir le modal de commande final ou rediriger
    console.log('Commande du service:', service);
  };

  const filterTabs = [
    { id: 'Tous', label: 'Tous', icon: Sparkles, color: 'from-blue-400 to-cyan-400' },
    { id: 'Déverrouillage par IMEI', label: 'Déverrouillage IMEI', icon: Smartphone, color: 'from-purple-400 to-pink-400' },
    { id: 'Licences Logicielles', label: 'Licences', icon: Key, color: 'from-green-400 to-emerald-400' },
    { id: 'Remote', label: 'Remote', icon: Globe, color: 'from-orange-400 to-amber-400' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
      <Header />
      
      <main className={`container mx-auto px-4 sm:px-6 lg:px-8 py-12 transition-opacity duration-700 ${pageLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {/* En-tête de page */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200 dark:border-blue-800 mb-4">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {filteredServices.length} services disponibles
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              Nos Services
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Découvrez notre gamme complète de solutions de déblocage mobile.
            Cliquez sur un service pour plus de détails.
          </p>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="mb-8">
          {/* Barre de recherche principale */}
          <div className="relative max-w-2xl mx-auto mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un service par nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <Filter className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filtres dépliants */}
          <div className={`transition-all duration-300 overflow-hidden ${showFilters ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="flex flex-wrap justify-center gap-2 p-2">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`relative group px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 overflow-hidden ${
                    filter === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:scale-105'
                  }`}
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <div className="relative flex items-center gap-2">
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Résultats de recherche */}
          {searchTerm && (
            <div className="text-center mt-4 text-gray-600 dark:text-gray-400">
              {filteredServices.length} résultat(s) pour "{searchTerm}"
            </div>
          )}
        </div>

        {/* État de chargement */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-blue-500 animate-pulse" />
              </div>
            </div>
            <p className="mt-6 text-gray-600 dark:text-gray-400">Chargement des services...</p>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="max-w-2xl mx-auto p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">Erreur de chargement</h3>
            <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Grille des services */}
        {!loading && !error && (
          <>
            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredServices.map((service, index) => (
                  <div
                    key={service._id}
                    className="transform transition-all duration-500 hover:scale-105 cursor-pointer"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => handleServiceClick(service)}
                  >
                    <ServiceCard 
                      service={service} 
                      onClick={() => handleServiceClick(service)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Aucun service trouvé
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Essayez de modifier vos critères de recherche
                </p>
              </div>
            )}
          </>
        )}

        {/* Badge de confiance */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-200 dark:border-green-800">
            <CreditCard className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Paiement 100% sécurisé • Service après-vente disponible
            </span>
          </div>
        </div>
      </main>

      <Footer />

      {/* Modal de détail du service (maintenant sans bouton commander) */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        service={selectedService}
        userBalance={user?.balance || 0}
        onOrder={handleOrderFromModal} // Ajoute cette prop si ton modal a besoin de cette fonction
      />

      {/* Modal solde insuffisant */}
      {showInsufficientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-8 text-center transform animate-slideUp">
            {/* Bouton fermer */}
            <button
              onClick={() => setShowInsufficientModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Icône */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Solde insuffisant
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Votre solde actuel n'est pas suffisant pour commander ce service.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowInsufficientModal(false);
                  navigate('/client/add-funds');
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                Ajouter des fonds
              </button>
              
              <button
                onClick={() => setShowInsufficientModal(false)}
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;