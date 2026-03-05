// src/pages/ServiceCategoryPage.jsx
// Page générique affichant les services d'une catégorie spécifique

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, Smartphone, Key, Globe, Server, Sparkles, Loader } from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import ServiceModal from '../components/ServiceModal';
import serviceService from '../services/serviceService';
import { useAuth } from '../hooks/useAuth';

/**
 * Page affichant tous les services d'une catégorie spécifique.
 * Route: /services/:category
 */
const ServiceCategoryPage = () => {
    const { category: rawCategory } = useParams(); // param may come lowercase
  const { user } = useAuth();

  // normaliser la catégorie pour correspondre aux valeurs du backend
  const category = (() => {
    if (!rawCategory) return '';
    const lower = rawCategory.toLowerCase();
    switch (lower) {
      case 'imei':
        return 'IMEI';
      case 'server':
        return 'Server';
      case 'rental':
      case 'remote':
        return 'Rental';
      case 'license':
      case 'licence':
        return 'License';
      default:
        return rawCategory; // laisse le raw si inconnu, sera géré ailleurs
    }
  })();

  // État pour les services et le chargement
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // État pour le modal de commande
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Configuration par catégorie
  const categoryConfig = {
    'IMEI': {
      title: 'Déblocage par IMEI',
      description: 'Débloquez vos téléphones avec votre numéro IMEI',
      icon: Smartphone,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-600 to-cyan-600',
      lightBg: 'bg-blue-50 dark:bg-blue-900/20'
    },
    'Server': {
      title: 'Services Serveur',
      description: 'Infrastructure cloud et services de serveur hébergés',
      icon: Server,
      color: 'from-orange-500 to-amber-500',
      bgColor: 'from-orange-600 to-amber-600',
      lightBg: 'bg-orange-50 dark:bg-orange-900/20'
    },
    'Rental': {
      title: 'Services de Location',
      description: 'Location d\'équipements et accès à distance',
      icon: Globe,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-600 to-pink-600',
      lightBg: 'bg-purple-50 dark:bg-purple-900/20'
    },
    'License': {
      title: 'Licences Logicielles',
      description: 'Licences activables pour vos logiciels et applications',
      icon: Key,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-600 to-emerald-600',
      lightBg: 'bg-green-50 dark:bg-green-900/20'
    }
  };

  // Récupère les services de la catégorie
  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchServices = async () => {
      setLoading(true);
      setError('');
      try {
        // Récupérer les services filtrés par catégorie (API attend valeur exactement comme dans la DB)
        const response = await serviceService.getServices({
          category: category
        });

        // Extraire les services de la réponse
        let servicesData = [];
        if (response?.data) {
          if (Array.isArray(response.data)) {
            servicesData = response.data;
          } else if (response.data?.data && Array.isArray(response.data.data)) {
            servicesData = response.data.data;
          } else if (response.data?.services && Array.isArray(response.data.services)) {
            servicesData = response.data.services;
          }
        } else if (Array.isArray(response)) {
          servicesData = response;
        }

        // Filtrer par catégorie en cas de besoin
        servicesData = servicesData.filter(s =>
          (s.category || s.type) === category
        );

        setServices(servicesData);

        if (servicesData.length === 0) {
          setError(`Aucun service disponible dans la catégorie "${category}".`);
        }
      } catch (err) {
        console.error('❌ Erreur lors du chargement des services:', err);
        if (err?.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Impossible de charger les services. Vérifiez votre connexion.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [category]);

  const config = categoryConfig[category] || categoryConfig['IMEI'];
  const IconComponent = config.icon;

  // si catégorie non reconnue (ne fait partie d'aucune config), on affiche message
  if (!categoryConfig[category]) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Header />
        <main className="text-center p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Catégorie inconnue</h1>
          <p>La catégorie «{rawCategory}» n'est pas reconnue.</p>
          <p>Veuillez vérifier l'URL ou retournez à la <a href="/services" className="text-blue-600 underline">page des services</a>.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col">
   

      {/* Hero section spécifique à la catégorie */}
      <section className={`bg-gradient-to-r ${config.bgColor} text-white py-20`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center`}>
              <IconComponent className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">
                {config.title}
              </h1>
            </div>
          </div>

          <p className="text-xl text-white/90 max-w-2xl">
            {config.description}
          </p>
        </div>
      </section>

      {/* Contenu principal */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-grow">
        {/* En-tête avec badge */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200 dark:border-blue-800 mb-4">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {services.length} services dans cette catégorie
            </span>
          </div>
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
        {error && !loading && (
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

        {/* Grille de services */}
        {!loading && services.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={service._id}
                className="transform transition-all duration-500 hover:scale-105 cursor-pointer animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => {
                  setSelectedService(service);
                  setIsModalOpen(true);
                }}
              >
                <ServiceCard
                  service={service}
                  onClick={() => {
                    setSelectedService(service);
                    setIsModalOpen(true);
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Aucun service */}
        {!loading && services.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
              <Sparkles className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Aucun service disponible
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Cette catégorie ne contient pas de services pour le moment.
            </p>
          </div>
        )}
      </main>

      {/* Modal de commande */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedService(null);
        }}
        service={selectedService}
        userBalance={user?.balance || 0}
      />
    </div>
  );
};

export default ServiceCategoryPage;
