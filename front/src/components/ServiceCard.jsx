// src/components/ServiceCard.jsx
import { Smartphone, Key, Globe, CreditCard, Star, Clock, ChevronRight, Zap } from 'lucide-react';

/**
 * Composant carte pour afficher un aperçu d'un service.
 * @param {object} props - Les propriétés du composant.
 * @param {object} props.service - L'objet contenant les détails du service.
 * @param {function} props.onClick - La fonction à appeler lorsque la carte est cliquée.
 */
const ServiceCard = ({ service, onClick }) => {
  // Définir des couleurs et icônes en fonction du type de service
  const typeConfig = {
    'IMEI': {
      color: 'from-blue-500 to-cyan-500',
      lightColor: 'bg-blue-50 dark:bg-blue-900/20',
      icon: Smartphone,
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    'Licence': {
      color: 'from-green-500 to-emerald-500',
      lightColor: 'bg-green-50 dark:bg-green-900/20',
      icon: Key,
      badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    'Remote': {
      color: 'from-purple-500 to-pink-500',
      lightColor: 'bg-purple-50 dark:bg-purple-900/20',
      icon: Key,
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      borderColor: 'border-purple-200 dark:border-purple-800'
    },
    'default': {
      color: 'from-orange-500 to-amber-500',
      lightColor: 'bg-orange-50 dark:bg-orange-900/20',
      icon: CreditCard,
      badgeColor: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      borderColor: 'border-gray-200 dark:border-gray-700'
    }
  };

  const config = typeConfig[service.type] || typeConfig.default;
  const IconComponent = config.icon;

  // Fonction pour formater le délai
  const formatDeliveryTime = (time) => {
    if (!time) return '24h';
    if (typeof time === 'string') return time;
    if (time.value && time.unit) return `${time.value}${time.unit}`;
    return '24h';
  };

  return (
    <div
      onClick={onClick}
      className="group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
    >
      {/* Bandeau de gradient en haut avec animation */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${config.color} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>

      {/* Éléments décoratifs */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className={`absolute -top-10 -right-10 w-20 h-20 rounded-full bg-gradient-to-r ${config.color} filter blur-2xl opacity-20`}></div>
        <div className={`absolute -bottom-10 -left-10 w-20 h-20 rounded-full bg-gradient-to-r ${config.color} filter blur-2xl opacity-20`}></div>
      </div>

      {/* Contenu principal */}
      <div className="relative p-6">
        {/* En-tête avec icône et badge */}
        <div className="flex items-start justify-between mb-4">
          {/* Icône avec fond dégradé */}
          <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${config.color} p-0.5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <div className="w-full h-full rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center">
              <IconComponent className={`w-7 h-7`} style={{
                color: `var(--tw-${config.color.split(' ')[0].replace('from-', '')})`
              }} />
            </div>
          </div>

          {/* Badge de type */}
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${config.badgeColor} border ${config.borderColor} shadow-sm`}>
            {service.type || 'Service'}
          </span>
        </div>

        {/* Titre et description */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
            {service.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-2">
            {service.description || 'Service de déblocage professionnel et sécurisé. Solution rapide et efficace pour tous vos besoins.'}
          </p>
        </div>

        {/* Tags additionnels (si disponibles) */}
        {service.tags && service.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {service.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md"
              >
                {tag}
              </span>
            ))}
            {service.tags.length > 2 && (
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md">
                +{service.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Informations prix et délai */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-4 border border-gray-100 dark:border-gray-700">
          {/* Prix */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30">
              <span className="text-green-600 dark:text-green-400 font-bold text-sm">€</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Prix</span>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-xl text-gray-900 dark:text-white">
                  {service.price?.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">€</span>
              </div>
            </div>
          </div>

          {/* Délai */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500 dark:text-gray-400">Délai</span>
              <p className="font-semibold text-gray-900 dark:text-white">
                {service.deliveryTime || '24h'}
              </p>
            </div>
          </div>
        </div>

        {/* Métriques de popularité */}
        <div className="flex items-center justify-between text-sm mb-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-gray-700 dark:text-gray-300">4.8</span>
            <span className="text-gray-500 dark:text-gray-500">(125 avis)</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-gray-600 dark:text-gray-400">Populaire</span>
          </div>
        </div>

        {/* Indicateur de disponibilité */}
        <div className="flex items-center gap-2 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-green-600 dark:text-green-400 font-medium">Disponible immédiatement</span>
        </div>

        {/* Message de call-to-action au survol */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white dark:from-slate-800 dark:via-slate-800 to-transparent p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
          <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
            <span>Voir les détails du service</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Overlay de brillance au survol */}
      <div className={`absolute inset-0 bg-gradient-to-r ${config.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`}></div>
    </div>
  );
};

export default ServiceCard;