// src/components/ServiceList.jsx
// Composant pour afficher une liste de services

import ServiceCard from './ServiceCard';
import { Sparkles } from 'lucide-react';

/**
 * Affiche une liste de services sous forme de grille.
 * Chaque service est rendu avec ServiceCard.
 * 
 * @param {Array} services - Tableau des services à afficher
 * @param {Function} onServiceClick - Callback quand un service est cliqué
 * @param {boolean} loading - État de chargement
 * @param {string} emptyMessage - Message affiché si aucun service
 */
const ServiceList = ({ 
  services = [], 
  onServiceClick = () => {}, 
  loading = false,
  emptyMessage = 'Aucun service disponible'
}) => {
  // État de chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-500 dark:text-gray-400">Chargement des services...</p>
        </div>
      </div>
    );
  }

  // Liste vide
  if (!services || services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
          <Sparkles className="w-12 h-12 text-gray-400" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          {emptyMessage}
        </p>
      </div>
    );
  }

  // Liste avec services
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {services.map((service, index) => (
        <div
          key={service._id || index}
          className="transform transition-all duration-500 hover:scale-105 cursor-pointer animate-fadeIn"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <ServiceCard
            service={service}
            onClick={() => onServiceClick(service)}
          />
        </div>
      ))}
    </div>
  );
};

export default ServiceList;
