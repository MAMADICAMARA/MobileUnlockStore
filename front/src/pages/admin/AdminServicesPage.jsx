// src/pages/admin/AdminServicesPage.jsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Server, Sparkles } from 'lucide-react';
import ServiceForm from '../../components/admin/ServiceForm';
import adminService from '../../services/adminService';

// ─── Hook : verrouille le scroll du body pendant qu'un modal est ouvert ────────
const useLockBodyScroll = (locked) => {
  useEffect(() => {
    if (!locked) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [locked]);
};

const AdminServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useLockBodyScroll(isModalOpen);

  useEffect(() => {
    if (!isModalOpen) return;
    const handler = (e) => { if (e.key === 'Escape') setIsModalOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isModalOpen]);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await adminService.getAllServices();
        setServices(response.data || []);
      } catch (err) {
        console.error('Erreur chargement services:', err);
        setError('Impossible de charger les services. Vérifiez votre connexion.');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleCreate = () => {
    setSelectedService(null);
    setIsModalOpen(true);
  };

  const handleEdit = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    setError(null);
    try {
      let response;
      if (selectedService) {
        response = await adminService.updateService(selectedService._id, formData);
        setServices(services.map(s => (s._id === selectedService._id ? response.data : s)));
      } else {
        response = await adminService.createService(formData);
        setServices([...services, response.data]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Erreur soumission service:', err);
      setError(err.response?.data?.message || 'Erreur lors de l’enregistrement.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Confirmez-vous la suppression de ce service ?')) return;
    try {
      await adminService.deleteService(serviceId);
      setServices(services.filter(s => s._id !== serviceId));
    } catch (err) {
      console.error('Erreur suppression:', err);
      setError('Impossible de supprimer ce service.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <main className="max-w-6xl mx-auto px-3 py-4 sm:px-6 sm:py-8">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
            Gestion des Services
          </h1>
          <button
            onClick={handleCreate}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow transition text-sm sm:text-base"
          >
            + Ajouter un service
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        {/* Tableau */}
        <div className="overflow-hidden rounded-xl sm:rounded-2xl shadow sm:shadow-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              Chargement des services...
            </div>
          ) : services.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              Aucun service pour le moment.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Nom</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Catégorie</th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Prix</th>
                    <th className="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                    <th className="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {services.map((service) => (
                    <tr key={service._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900 dark:text-white break-words min-w-0">
                        {service.name}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 dark:text-gray-300 capitalize break-words">
                        {service.category}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-right text-gray-900 dark:text-white font-medium whitespace-nowrap">
                        {service.price.toFixed(2)} FG
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-center whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          service.active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {service.active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-center text-sm font-medium whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(service)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3 sm:mr-4"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(service._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal création / édition de service */}
        {isModalOpen && createPortal(
          <div
            // ✅ z-[60] + portail dans <body> : évite que le backdrop-blur du layout
            // admin ne piège ce modal en position fixed (bug déjà rencontré ailleurs
            // dans l'app — voir OrderModal dans AdminOrdersPage.jsx).
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
          >
            <div className="relative bg-white dark:bg-slate-800 w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh]">

              {/* Bandeau couleur */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl" />

              {/* ── Header ── */}
              <div className="relative flex items-start justify-between gap-3 px-4 sm:px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
                {/* Indicateur de glissement (mobile) */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full sm:hidden" />
                <div className="flex items-center gap-3 min-w-0 mt-1 sm:mt-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 flex-shrink-0">
                    <div className="w-full h-full rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center">
                      {selectedService
                        ? <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        : <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                      {selectedService ? 'Modifier le service' : 'Nouveau service'}
                    </h2>
                    {selectedService && (
                      <p className="text-xs text-slate-400 truncate">{selectedService.name}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors flex-shrink-0"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* ── Corps scrollable ── */}
              <div className="overflow-y-auto flex-1 min-h-0 px-4 sm:px-6 py-5">
                <ServiceForm
                  service={selectedService}
                  onSubmit={handleSubmit}
                  isLoading={formLoading}
                  onCancel={() => setIsModalOpen(false)}
                />
              </div>
            </div>
          </div>,
          document.body
        )}
      </main>
    </div>
  );
};

export default AdminServicesPage;


// // src/pages/admin/AdminServicesPage.jsx
// import { useState, useEffect } from 'react';
// import ServiceForm from '../../components/admin/ServiceForm';
// import adminService from '../../services/adminService';

// /**
//  * Page de gestion des services pour l'administrateur.
//  * Liste, création, modification et suppression des services.
//  */
// const AdminServicesPage = () => {
//   const [services, setServices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedService, setSelectedService] = useState(null);
//   const [formLoading, setFormLoading] = useState(false);

//   // Charger les services au montage
//   useEffect(() => {
//     const fetchServices = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const response = await adminService.getAllServices();
//         setServices(response.data || []);
//       } catch (err) {
//         console.error('Erreur chargement services:', err);
//         setError('Impossible de charger les services. Vérifiez votre connexion.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchServices();
//   }, []);

//   // Ouvrir modal création
//   const handleCreate = () => {
//     setSelectedService(null);
//     setIsModalOpen(true);
//   };

//   // Ouvrir modal modification
//   const handleEdit = (service) => {
//     setSelectedService(service);
//     setIsModalOpen(true);
//   };

//   // Soumission formulaire (création ou mise à jour)
//   const handleSubmit = async (formData) => {
//     setFormLoading(true);
//     setError(null);
//     try {
//       let response;
//       if (selectedService) {
//         // Mise à jour
//         response = await adminService.updateService(selectedService._id, formData);
//         setServices(services.map(s => 
//           s._id === selectedService._id ? response.data : s
//         ));
//       } else {
//         // Création
//         response = await adminService.createService(formData);
//         setServices([...services, response.data]);
//       }
//       setIsModalOpen(false);
//     } catch (err) {
//       console.error('Erreur soumission service:', err);
//       setError(err.response?.data?.message || 'Erreur lors de l’enregistrement.');
//     } finally {
//       setFormLoading(false);
//     }
//   };

//   // Suppression avec confirmation
//   const handleDelete = async (serviceId) => {
//     if (!window.confirm('Confirmez-vous la suppression de ce service ?')) return;

//     try {
//       await adminService.deleteService(serviceId);
//       setServices(services.filter(s => s._id !== serviceId));
//     } catch (err) {
//       console.error('Erreur suppression:', err);
//       setError('Impossible de supprimer ce service.');
//     }
//   };

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       {/* En-tête */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
//         <h1 className="text-3xl font-bold text-gray-800">Gestion des Services</h1>
//         <button
//           onClick={handleCreate}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow transition"
//         >
//           + Ajouter un service
//         </button>
//       </div>

//       {/* Message d'erreur global */}
//       {error && (
//         <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
//           {error}
//         </div>
//       )}

//       {/* Tableau */}
//       <div className="bg-white shadow rounded-xl overflow-hidden border border-gray-200">
//         {loading ? (
//           <div className="p-12 text-center text-gray-500">
//             Chargement des services...
//           </div>
//         ) : services.length === 0 ? (
//           <div className="p-12 text-center text-gray-500">
//             Aucun service pour le moment.
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nom</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Catégorie</th>
//                   <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Prix</th>
//                   <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
//                   <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {services.map((service) => (
//                   <tr key={service._id} className="hover:bg-gray-50 transition">
//                     <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{service.name}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-gray-600 capitalize">{service.category}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 font-medium">
//                       {service.price.toFixed(2)} FG
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-center">
//                       <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
//                         service.active 
//                           ? 'bg-green-100 text-green-800' 
//                           : 'bg-red-100 text-red-800'
//                       }`}>
//                         {service.active ? 'Actif' : 'Inactif'}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
//                       <button
//                         onClick={() => handleEdit(service)}
//                         className="text-blue-600 hover:text-blue-900 mr-4"
//                       >
//                         Modifier
//                       </button>
//                       <button
//                         onClick={() => handleDelete(service._id)}
//                         className="text-red-600 hover:text-red-900"
//                       >
//                         Supprimer
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//             <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
//               <h2 className="text-2xl font-bold text-gray-800">
//                 {selectedService ? 'Modifier le service' : 'Ajouter un nouveau service'}
//               </h2>
//               <button
//                 onClick={() => setIsModalOpen(false)}
//                 className="text-gray-500 hover:text-gray-800 text-2xl"
//               >
//                 ×
//               </button>
//             </div>
//             <div className="p-6">
//               <ServiceForm 
//                 service={selectedService} 
//                 onSubmit={handleSubmit} 
//                 isLoading={formLoading} 
//               />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminServicesPage;