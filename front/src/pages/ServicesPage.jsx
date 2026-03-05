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
  AlertCircle,
  Server,
  Wifi
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ServiceCard from '../components/ServiceCard';
import ServiceModal from '../components/ServiceModal';
import serviceService from '../services/serviceService';
import { useAuth } from '../context/AuthContext';

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
        console.log('✅ Réponse brute:', response);
        
        // CORRECTION: Extraire correctement les données selon la structure
        let servicesData = [];
        
        if (response?.data) {
          if (Array.isArray(response.data)) {
            servicesData = response.data;
            console.log('📦 servicesData est un tableau direct');
          } 
          else if (response.data?.data && Array.isArray(response.data.data)) {
            servicesData = response.data.data;
            console.log('📦 servicesData est dans response.data.data');
          }
          else if (response.data?.services && Array.isArray(response.data.services)) {
            servicesData = response.data.services;
            console.log('📦 servicesData est dans response.data.services');
          }
          else {
            console.warn('⚠️ Structure inattendue:', response.data);
            servicesData = [];
          }
        } 
        else if (Array.isArray(response)) {
          servicesData = response;
          console.log('📦 response est directement un tableau');
        }
        
        console.log(`📊 ${servicesData.length} services chargés`);
        setServices(servicesData);
        
      } catch (err) {
        console.error('❌ Erreur lors du fetch des services :', err);
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

  // ✅ CORRECTION: Grouper les services par catégorie pour l'affichage
  const servicesByCategory = useMemo(() => {
    if (!Array.isArray(services)) return {};
    
    const grouped = {};
    services.forEach(service => {
      // Déterminer la catégorie (priorité à category, fallback type)
      const category = service.category || service.type || 'Autre';
      
      // Normaliser les catégories pour correspondre aux 4 types
      let normalizedCategory = category;
      if (category === 'Licence' || category === 'License') {
        normalizedCategory = 'License';
      } else if (category === 'Remote') {
        normalizedCategory = 'Rental';
      } else if (category === 'Déverrouillage IMEI' || category === 'IMEI') {
        normalizedCategory = 'IMEI';
      } else if (category === 'Server') {
        normalizedCategory = 'Server';
      }
      
      if (!grouped[normalizedCategory]) {
        grouped[normalizedCategory] = [];
      }
      grouped[normalizedCategory].push(service);
    });
    
    return grouped;
  }, [services]);

  // Logique de filtrage et de recherche
  const filteredServices = useMemo(() => {
    if (!Array.isArray(services)) {
      console.warn('⚠️ services n\'est pas un tableau:', services);
      return [];
    }
    
    return services
      .filter(service => {
        if (filter === 'Tous') return true;
        
        const category = service.category || service.type || '';
        
        // Mapping des filtres vers les catégories
        if (filter === 'IMEI') {
          return category === 'IMEI' || category === 'Déverrouillage IMEI';
        }
        if (filter === 'License') {
          return category === 'License' || category === 'Licence';
        }
        if (filter === 'Rental') {
          return category === 'Rental' || category === 'Remote';
        }
        if (filter === 'Server') {
          return category === 'Server';
        }
        return true;
      })
      .filter(service =>
        service.name?.toLowerCase?.().includes(searchTerm.toLowerCase()) || false
      );
  }, [services, filter, searchTerm]);

  // Gestion de l'ouverture du modal
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
    // ✅ CORRECTION: Rediriger vers le formulaire dynamique avec la catégorie
    navigate(`/services/${service._id}/order`);
  };

  // ✅ CORRECTION: Configuration des catégories
  const categories = [
    { 
      id: 'IMEI', 
      label: 'Services IMEI', 
      icon: Smartphone, 
      color: 'from-blue-500 to-cyan-500',
      description: 'Déblocage et vérification par IMEI'
    },
    { 
      id: 'Server', 
      label: 'Services Serveur', 
      icon: Server, 
      color: 'from-orange-500 to-red-500',
      description: 'Hébergement et services serveur'
    },
    { 
      id: 'Rental', 
      label: 'Location & Remote', 
      icon: Wifi, 
      color: 'from-purple-500 to-pink-500',
      description: 'Assistance à distance et location'
    },
    { 
      id: 'License', 
      label: 'Licences', 
      icon: Key, 
      color: 'from-green-500 to-emerald-500',
      description: 'Licences logicielles et clés d\'activation'
    }
  ];

  // Onglets de filtrage
  const filterTabs = [
    { id: 'Tous', label: 'Tous les services', icon: Sparkles, color: 'from-blue-400 to-cyan-400' },
    ...categories
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
            Découvrez notre gamme complète de services. Cliquez sur un service pour plus de détails.
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="mb-8">
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
          <div className={`transition-all duration-300 overflow-hidden ${showFilters ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
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

        {/* ✅ CORRECTION: Affichage des services par catégorie */}
        {!loading && !error && (
          <>
            {filter === 'Tous' ? (
              // Affichage groupé par catégories
              <div className="space-y-16">
                {categories.map(category => {
                  const categoryServices = servicesByCategory[category.id] || [];
                  if (categoryServices.length === 0) return null;
                  
                  return (
                    <div key={category.id} className="animate-fadeIn">
                      {/* En-tête de catégorie */}
                      <div className="flex items-center gap-4 mb-8">
                        <div className={`p-4 rounded-2xl bg-gradient-to-r ${category.color} shadow-lg`}>
                          <category.icon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {category.label}
                          </h2>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {category.description} • {categoryServices.length} services
                          </p>
                        </div>
                      </div>

                      {/* Grille des services de la catégorie */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {categoryServices.map((service, index) => (
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
                    </div>
                  );
                })}
              </div>
            ) : (
              // Affichage filtré par une catégorie spécifique
              <>
                {filteredServices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredServices.map((service, index) => (
                      <div
                        key={service._id}
                        className="transform transition-all duration-500 hover:scale-105 cursor-pointer animate-fadeIn"
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
                      Aucun service trouvé dans cette catégorie
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Essayez une autre catégorie ou modifiez votre recherche
                    </p>
                  </div>
                )}
              </>
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

      {/* Modal de détail du service */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        service={selectedService}
        userBalance={user?.balance || 0}
        onOrder={handleOrderFromModal}
      />

      {/* Modal solde insuffisant */}
      {showInsufficientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-8 text-center transform animate-slideUp">
            <button
              onClick={() => setShowInsufficientModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

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

      <Footer />
    </div>
  );
};

export default ServicesPage;