// src/components/ServiceCard.jsx

/**
 * Composant carte pour afficher un aperçu d'un service.
 * @param {object} props - Les propriétés du composant.
 * @param {object} props.service - L'objet contenant les détails du service.
 * @param {function} props.onOrderClick - La fonction à appeler lorsque le bouton "Commander" est cliqué.
 */
const ServiceCard = ({ service, onOrderClick }) => {
  // Définir des couleurs de badge en fonction du type de service
  const typeColors = {
    'IMEI': 'bg-blue-100 text-blue-800',
    'Licence': 'bg-green-100 text-green-800',
    'Remote': 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
      <div className="p-6">
        {/* En-tête de la carte avec le type et le nom */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-800">{service.name}</h3>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${typeColors[service.type] || 'bg-gray-100 text-gray-800'}`}>
            {service.type}
          </span>
        </div>
        
        {/* Description courte */}
        <p className="text-gray-600 text-sm mb-4 h-16">{service.description}</p>

        {/* Informations sur le prix et le délai */}
        <div className="flex justify-between items-center mb-4 text-sm">
          <div className="flex flex-col">
            <span className="text-gray-500">Prix</span>
            <span className="font-bold text-lg text-green-600">{service.price} €</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-gray-500">Délai</span>
            <span className="font-semibold text-gray-700">{service.deliveryTime}</span>
          </div>
        </div>

        {/* Bouton de commande */}
        <button
          onClick={() => onOrderClick(service)}
          className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300"
        >
          Commander
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;
