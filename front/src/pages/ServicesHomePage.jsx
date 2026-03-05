// src/pages/ServicesHomePage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Smartphone, 
  Server, 
  Key, 
  Globe, 
  Wifi,
  ArrowRight,
  Clock,
  Shield,
  Star,
  Users,
  Zap
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ServicesHomePage = () => {
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState(null);

  // Configuration des catégories
  const categories = [
    {
      id: 'IMEI',
      title: 'Services IMEI',
      description: 'Déblocage, vérification et services liés à l\'IMEI',
      longDescription: 'Solution rapide et sécurisée pour débloquer votre téléphone par IMEI. Compatible avec tous les opérateurs.',
      icon: Smartphone,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-800',
      features: [
        'Déblocage permanent',
        'Compatible tous réseaux',
        'Sans risque pour le téléphone',
        'Traitement en 24-48h'
      ],
      stats: {
        services: 8,
        success: '99%',
        delay: '24h'
      }
    },
    {
      id: 'Server',
      title: 'Services Serveur',
      description: 'Hébergement, VPS et solutions serveur',
      longDescription: 'Infrastructure robuste et scalable pour vos projets. Configuration sur mesure.',
      icon: Server,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400',
      borderColor: 'border-orange-200 dark:border-orange-800',
      features: [
        'Configuration personnalisée',
        'Support 24/7',
        'Sauvegardes automatiques',
        'Haute disponibilité'
      ],
      stats: {
        services: 12,
        success: '100%',
        delay: 'Instant'
      }
    },
    {
      id: 'License',
      title: 'Licences Logicielles',
      description: 'Licences authentiques pour vos logiciels',
      longDescription: 'Licences originales aux meilleurs prix. Activation garantie.',
      icon: Key,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-200 dark:border-green-800',
      features: [
        'Licences originales',
        'Prix compétitifs',
        'Livraison instantanée',
        'Support inclus'
      ],
      stats: {
        services: 15,
        success: '100%',
        delay: 'Instant'
      }
    },
    {
      id: 'Rental',
      title: 'Location & Remote',
      description: 'Location de services et assistance à distance',
      longDescription: 'Solutions flexibles pour vos besoins temporaires. Assistance technique à distance.',
      icon: Globe,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-200 dark:border-purple-800',
      features: [
        'Durée flexible',
        'Configuration à distance',
        'Support technique',
        'Paiement mensuel'
      ],
      stats: {
        services: 6,
        success: '98%',
        delay: '1h'
      }
    }
  ];

  const stats = [
    { icon: Users, value: '5000+', label: 'Clients satisfaits' },
    { icon: Zap, value: '24/7', label: 'Support disponible' },
    { icon: Star, value: '4.8/5', label: 'Note moyenne' },
    { icon: Clock, value: '15 min', label: 'Temps de réponse' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text">
              Nos Services
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Découvrez notre gamme complète de services professionnels.
            Sélectionnez une catégorie pour commencer.
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center p-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-3">
                  <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Grille des catégories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {categories.map((category) => {
            const Icon = category.icon;
            const isHovered = hoveredCategory === category.id;
            
            return (
              <div
                key={category.id}
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                onClick={() => navigate(`/services/${category.id}`)}
                className={`
                  relative overflow-hidden rounded-2xl cursor-pointer
                  transform transition-all duration-500 
                  ${isHovered ? 'scale-[1.02] shadow-2xl' : 'shadow-lg'}
                `}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-10`} />
                
                {/* Border glow on hover */}
                <div className={`
                  absolute inset-0 rounded-2xl border-2 transition-opacity duration-500
                  ${isHovered ? 'opacity-100' : 'opacity-0'}
                  border-white dark:border-gray-800
                `} />
                
                <div className="relative p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${category.color} p-3`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${category.bgColor} ${category.textColor} border ${category.borderColor}`}>
                        {category.stats.services} services
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {category.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {category.description}
                  </p>
                  
                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {category.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${category.color}`} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">Délai: {category.stats.delay}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-gray-600 dark:text-gray-400">{category.stats.success} succès</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className={`
                    absolute bottom-8 right-8 flex items-center gap-2
                    transform transition-all duration-500
                    ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
                  `}>
                    <span className={`font-medium bg-gradient-to-r ${category.color} text-transparent bg-clip-text`}>
                      Voir les services
                    </span>
                    <ArrowRight className={`w-5 h-5 text-transparent bg-gradient-to-r ${category.color} bg-clip-text`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section confiance */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-200 dark:border-green-800">
            <Shield className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Services 100% sécurisés • Paiement protégé • Support après-vente
            </span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ServicesHomePage;