import { Smartphone, Key, Globe, Clock, Server, Shield, Wifi } from 'lucide-react';

const ServiceCard = ({ service, onClick }) => {
  if (!service) return null;

  const category = service.category || service.type || 'default';

  const categoryLabels = {
    'IMEI':    'IMEI',
    'Credit':  'Crédit',
    'Rental':  'Location',
    'Server':  'Serveur',
    'Remote':  'Remote',
    'default': 'Service',
  };

  const typeConfig = {
    'IMEI':    { color: 'from-blue-500 to-cyan-500',     icon: Smartphone, badge: 'bg-blue-100 text-blue-800',     border: 'border-blue-200' },
    'Credit':  { color: 'from-green-500 to-emerald-500', icon: Key,        badge: 'bg-green-100 text-green-800',    border: 'border-green-200' },
    'Rental':  { color: 'from-purple-500 to-pink-500',   icon: Globe,      badge: 'bg-purple-100 text-purple-800', border: 'border-purple-200' },
    'Server':  { color: 'from-orange-500 to-amber-500',  icon: Server,     badge: 'bg-orange-100 text-orange-800', border: 'border-orange-200' },
    'Remote':  { color: 'from-indigo-500 to-purple-500', icon: Wifi,       badge: 'bg-indigo-100 text-indigo-800', border: 'border-indigo-200' },
    'default': { color: 'from-gray-500 to-slate-500',    icon: Shield,     badge: 'bg-gray-100 text-gray-800',     border: 'border-gray-200' },
  };

  const config       = typeConfig[category] || typeConfig.default;
  const Icon         = config.icon;
  const label        = categoryLabels[category] || 'Service';
  const name         = service.name || 'Service sans nom';
  const description  = service.description || 'Service professionnel et sécurisé.';
  const price        = typeof service.price === 'number' ? service.price : 0;
  const deliveryTime = service.deliveryTime || '24h';
  const imageUrl     = service.imageUrl || null;

  return (
    <div
      onClick={onClick}
      className="group relative bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-1 md:hover:-translate-y-2 w-full h-full flex flex-col justify-between"
    >
      {/* Bandeau gradient haut */}
      <div className={`absolute top-0 left-0 right-0 h-1 md:h-1.5 bg-gradient-to-r ${config.color} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />

      {/* Déco hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className={`absolute -top-8 -right-8 w-16 h-16 rounded-full bg-gradient-to-r ${config.color} blur-2xl opacity-20`} />
        <div className={`absolute -bottom-8 -left-8 w-16 h-16 rounded-full bg-gradient-to-r ${config.color} blur-2xl opacity-20`} />
      </div>

      {/* ============ VERSION MOBILE ============ */}
      <div className="relative p-3 md:hidden flex flex-col h-full justify-between gap-2">
        <div className="w-full">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300 whitespace-normal break-words">
            {name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed whitespace-normal break-words">
            {description}
          </p>
        </div>

        {/* ✅ Prix + délai en jaune sur mobile */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-700/50 mt-auto">
          <div>
            <span className="text-xs text-black dark:text-yellow-400 font-medium block">Prix</span>
            <span className="font-bold text-sm text-yellow-600 dark:text-yellow-400">
              {price.toFixed(0)} <span className="text-xs text-green-600 dark:text-green-400  font-normal">FG</span>
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-black dark:text-yellow-400 font-medium block">Délai</span>
            <span className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold flex items-center gap-1 justify-end">
              <Clock className="w-4 h-4 text-gray-900"/>
              {deliveryTime}
            </span>
          </div>
        </div>
      </div>

      {/* ============ VERSION DESKTOP ============ */}
      <div className="relative p-5 hidden md:flex flex-col h-full justify-between gap-4">
        <div className="w-full">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${config.color} p-0.5 shadow-md group-hover:scale-110 transition-transform duration-300 overflow-hidden`}>
              <div className="w-full h-full rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-cover rounded-xl hidden md:block"
                  />
                ) : null}
              </div>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${config.badge} border ${config.border}`}>
              {label}
            </span>
          </div>

          <div className="w-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300 whitespace-normal break-words">
              {name}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed whitespace-normal break-words">
              {description}
            </p>
          </div>
        </div>

        {/* Prix + délai Desktop — inchangé */}
        <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 mt-auto w-full">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/30">
              <span className="text-green-600 dark:text-green-400 font-bold text-xs">FG</span>
            </div>
            <div>
              <span className="text-xs text-yellow-400">Prix</span>
              <div className="flex items-baseline gap-0.5">
                <span className="font-bold text-lg text-gray-900 dark:text-white">{price.toFixed(0)}</span>
                <span className="text-xs text-gray-400">FG</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-right">
              <span className="text-xs text-yellow-400">Délai</span>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">{deliveryTime}</p>
            </div>
          </div>
        </div>

        <div className={`absolute inset-0 bg-gradient-to-r ${config.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`} />
      </div>
    </div>
  );
};

export default ServiceCard;

// import { Smartphone, Key, Globe, Clock, Server, Shield, Wifi } from 'lucide-react';

// const ServiceCard = ({ service, onClick }) => {
//   if (!service) return null;

//   const category = service.category || service.type || 'default';

//   const categoryLabels = {
//     'IMEI':    'IMEI',
//     'Credit':  'Crédit',
//     'Rental':  'Location',
//     'Server':  'Serveur',
//     'Remote':  'Remote',
//     'default': 'Service',
//   };

//   const typeConfig = {
//     'IMEI':    { color: 'from-blue-500 to-cyan-500',     icon: Smartphone, badge: 'bg-blue-100 text-blue-800',     border: 'border-blue-200' },
//     'Credit':  { color: 'from-green-500 to-emerald-500', icon: Key,        badge: 'bg-green-100 text-green-800',    border: 'border-green-200' },
//     'Rental':  { color: 'from-purple-500 to-pink-500',   icon: Globe,      badge: 'bg-purple-100 text-purple-800', border: 'border-purple-200' },
//     'Server':  { color: 'from-orange-500 to-amber-500',  icon: Server,     badge: 'bg-orange-100 text-orange-800', border: 'border-orange-200' },
//     'Remote':  { color: 'from-indigo-500 to-purple-500', icon: Wifi,       badge: 'bg-indigo-100 text-indigo-800', border: 'border-indigo-200' },
//     'default': { color: 'from-gray-500 to-slate-500',    icon: Shield,     badge: 'bg-gray-100 text-gray-800',     border: 'border-gray-200' },
//   };

//   const config       = typeConfig[category] || typeConfig.default;
//   const Icon         = config.icon;
//   const label        = categoryLabels[category] || 'Service';
//   const name         = service.name || 'Service sans nom';
//   const description  = service.description || 'Service professionnel et sécurisé.';
//   const price        = typeof service.price === 'number' ? service.price : 0;
//   const deliveryTime = service.deliveryTime || '24h';
//   const imageUrl     = service.imageUrl || null;

//   return (
//     <div
//       onClick={onClick}
//       className="group relative bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-1 md:hover:-translate-y-2 w-full h-full flex flex-col justify-between"
//     >
//       {/* Bandeau gradient haut */}
//       <div className={`absolute top-0 left-0 right-0 h-1 md:h-1.5 bg-gradient-to-r ${config.color} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />

//       {/* Déco hover */}
//       <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
//         <div className={`absolute -top-8 -right-8 w-16 h-16 rounded-full bg-gradient-to-r ${config.color} blur-2xl opacity-20`} />
//         <div className={`absolute -bottom-8 -left-8 w-16 h-16 rounded-full bg-gradient-to-r ${config.color} blur-2xl opacity-20`} />
//       </div>

//       {/* ============ VERSION MOBILE ============ */}
//       <div className="relative p-3 md:hidden flex flex-col h-full justify-between gap-2">
//         <div className="w-full">
//           {/* Titre : jamais coupé */}
//           <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300 whitespace-normal break-words">
//             {name}
//           </h3>
//           {/* Description : jamais coupée */}
//           <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed whitespace-normal break-words">
//             {description}
//           </p>
//         </div>

//         {/* Prix + délai bas de carte mobile */}
//         <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-700/50 mt-auto">
//           <span className="font-bold text-sm text-gray-900 dark:text-white">
//             {price.toFixed(2)} <span className="text-xs font-normal text-gray-400">FG</span>
//           </span>
//           <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
//             <Clock className="w-3 h-3" />
//             {deliveryTime}
//           </span>
//         </div>
//       </div>

//       {/* ============ VERSION DESKTOP ============ */}
//       <div className="relative p-5 hidden md:flex flex-col h-full justify-between gap-4">
//         <div className="w-full">
//           {/* En-tête : icône OU image (uniquement sur desktop) */}
//           <div className="flex items-start justify-between mb-4">
//             <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${config.color} p-0.5 shadow-md group-hover:scale-110 transition-transform duration-300 overflow-hidden`}>
//               <div className="w-full h-full rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden">
//                 {imageUrl ? (
//                   // Afficher l'image uniquement sur desktop
//                   <img
//                     src={imageUrl}
//                     alt={name}
//                     className="w-full h-full object-cover rounded-xl hidden md:block"
//                   />
//                 ) : null}
//                 {/* L'icône apparaît toujours sur mobile, et sur desktop si PAS d'image */}
              
//               </div>
//             </div>
//             <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${config.badge} border ${config.border}`}>
//               {label}
//             </span>
//           </div>

//           {/* Titre et description : jamais coupés, s'étendent sur plusieurs lignes */}
//           <div className="w-full">
//             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300 whitespace-normal break-words">
//               {name}
//             </h3>
//             <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed whitespace-normal break-words">
//               {description}
//             </p>
//           </div>
//         </div>

//         {/* Prix + délai bas de carte Desktop */}
//         <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 mt-auto w-full">
//           <div className="flex items-center gap-2">
//             <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/30">
//               <span className="text-green-600 dark:text-green-400 font-bold text-xs">FG</span>
//             </div>
//             <div>
//               <span className="text-xs text-yellow-400">Prix</span>
//               <div className="flex items-baseline gap-0.5">
//                 <span className="font-bold text-lg text-gray-900 dark:text-white">{price.toFixed(2)}</span>
//                 <span className="text-xs text-gray-400">FG</span>
//               </div>
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30">
//               <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
//             </div>
//             <div className="text-right">
//               <span className="text-xs text-yellow-400">Délai</span>
//               <p className="font-semibold text-sm text-gray-900 dark:text-white">{deliveryTime}</p>
//             </div>
//           </div>
//         </div>

//         {/* Overlay hover */}
//         <div className={`absolute inset-0 bg-gradient-to-r ${config.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`} />
//       </div>
//     </div>
//   );
// };

// export default ServiceCard;
