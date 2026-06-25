// src/pages/admin/AdminUsersPage.jsx
import { useState, useEffect } from 'react';
import { Search, Eye, User, Mail, Calendar, CreditCard, Shield, Hash, XCircle } from 'lucide-react';
import adminService from '../../services/adminService';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'GNF' }).format(amount || 0);

const ROLE_LABELS = {
  admin: { label: 'Admin', color: 'bg-red-100 text-red-700' },
  client: { label: 'Client', color: 'bg-blue-100 text-blue-700' },
  Client: { label: 'Client', color: 'bg-blue-100 text-blue-700' },
  'utilisateur-employer': { label: 'Employé', color: 'bg-purple-100 text-purple-700' },
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersRes, ordersRes] = await Promise.all([
          adminService.getAllUsers(),
          adminService.getAllOrders(),
        ]);

        const usersData = usersRes.data || [];
        const ordersData = ordersRes.data?.data || ordersRes.data || [];

        // Compter les commandes par userId
        const orderCountMap = {};
        ordersData.forEach(order => {
          const uid = order.user?._id || order.user || order.userId;
          if (uid) orderCountMap[uid] = (orderCountMap[uid] || 0) + 1;
        });

        // Enrichir les users avec le nb de commandes
        const enriched = usersData.map(u => ({
          ...u,
          orderCount: orderCountMap[u._id] || 0,
        }));

        setUsers(enriched);
        setOrders(ordersData);
      } catch (error) {
        console.error('Erreur chargement:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (user) => {
    // Filtrer les commandes de cet utilisateur
    const uOrders = orders.filter(o => {
      const uid = o.user?._id || o.user || o.userId;
      return uid?.toString() === user._id?.toString();
    });
    setUserOrders(uOrders);
    setSelectedUser(user);
  };

  const roleConfig = (role) => ROLE_LABELS[role] || { label: role || 'N/A', color: 'bg-gray-100 text-gray-700' };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Clients</h1>
        <span className="text-sm text-gray-500">{filteredUsers.length} utilisateur(s)</span>
      </div>

      {/* Barre de recherche */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par nom ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {/* Tableau */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Chargement...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Aucun utilisateur trouvé.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Utilisateur', 'Email', 'Rôle', 'Solde', 'Commandes', 'Inscription', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const rc = roleConfig(user.role);
                  return (
                    <tr key={user._id} className="hover:bg-gray-50 transition">
                      {/* Nom */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-bold">
                              {user.name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      {/* Email */}
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      {/* Rôle */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${rc.color}`}>
                          {rc.label}
                        </span>
                      </td>
                      {/* Solde */}
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatCurrency(user.balance)}
                      </td>
                      {/* Commandes */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
                          {user.orderCount}
                        </span>
                      </td>
                      {/* Date */}
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewDetails(user)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                        >
                          <Eye className="w-4 h-4" />
                          Détails
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal détails utilisateur */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header modal */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-800">Détails de l'utilisateur</h2>
              <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Avatar + nom */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {selectedUser.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedUser.name}</h3>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${roleConfig(selectedUser.role).color}`}>
                    {roleConfig(selectedUser.role).label}
                  </span>
                </div>
              </div>

              {/* Infos principales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoCard icon={Mail} label="Email" value={selectedUser.email} />
                <InfoCard icon={CreditCard} label="Solde" value={formatCurrency(selectedUser.balance)} />
                <InfoCard icon={Calendar} label="Inscription" value={formatDate(selectedUser.createdAt)} />
                <InfoCard icon={Shield} label="Statut" value={selectedUser.isActive ? '✅ Actif' : '❌ Inactif'} />
                <InfoCard icon={Hash} label="ID" value={selectedUser._id} mono />
                {selectedUser.employeeCode && (
                  <InfoCard icon={User} label="Code employé" value={selectedUser.employeeCode} mono />
                )}
              </div>

              {/* Commandes de l'utilisateur */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">
                  Commandes ({userOrders.length})
                </h4>
                {userOrders.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Aucune commande pour cet utilisateur.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {userOrders.map(order => (
                      <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {order.service?.name || order.serviceDetails?.name || 'Service'}
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-800">
                            {formatCurrency(order.serviceDetails?.price || order.amount || 0)}
                          </p>
                          <StatusBadge status={order.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bouton fermer */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant carte info
const InfoCard = ({ icon: Icon, label, value, mono = false }) => (
  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-blue-600" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={`text-sm font-medium text-gray-900 break-all ${mono ? 'font-mono text-xs' : ''}`}>
        {value || 'N/A'}
      </p>
    </div>
  </div>
);

// Badge statut commande
const StatusBadge = ({ status }) => {
  const map = {
    'Terminé':    'bg-green-100 text-green-700',
    'En cours':   'bg-yellow-100 text-yellow-700',
    'En attente': 'bg-blue-100 text-blue-700',
    'Annulé':     'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-700'}`}>
      {status || 'N/A'}
    </span>
  );
};

export default AdminUsersPage;


// // src/pages/admin/AdminUsersPage.jsx
// import { useState, useEffect } from 'react';
// import adminService from '../../services/adminService';

// const formatDate = (dateString) =>
//   new Date(dateString).toLocaleDateString('fr-FR', {
//     day: '2-digit',
//     month: '2-digit',
//     year: 'numeric',
//   });

// const AdminUsersPage = () => {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedUser, setSelectedUser] = useState(null);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       setLoading(true);
//       try {
//         const response = await adminService.getAllUsers();
//         setUsers(response.data);
//       } catch (error) {
//         console.error('Erreur lors du chargement des utilisateurs :', error);
//         setUsers([]);
//       }
//       setLoading(false);
//     };
//     fetchUsers();
//   }, []);

//   const filteredUsers = users.filter((user) =>
//     user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     user.email.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleViewDetails = (user) => {
//     setSelectedUser(user);
//   };

//   const handleCloseModal = () => {
//     setSelectedUser(null);
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-3xl text-blue-600 font-bold mb-6">Gestion des Clients</h1>

//       {/* Barre de recherche */}
//       <div className="mb-6">
//         <input
//           type="text"
//           placeholder="Rechercher par nom ou e-mail..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="w-full max-w-sm px-4 py-2 border rounded-lg"
//         />
//       </div>

//       {/* Tableau des utilisateurs */}
//       <div className="bg-white shadow-md rounded-lg overflow-x-auto">
//         {loading ? (
//           <p className="p-4">Chargement...</p>
//         ) : (
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-mail</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date d'inscription</th>
//                 <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Nb. Commandes</th>
//                 <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredUsers.map((user) => (
//                 <tr key={user._id}>
//                   <td className="px-6 py-4 text-blue-700 font-medium">{user.name}</td>
//                   <td className="px-6 py-4 text-blue-700">{user.email}</td>
//                   <td className="px-6 py-4 text-blue-700">{formatDate(user.registrationDate)}</td>
//                   <td className="px-6 py-4 text-center text-blue-700">{user.orderCount}</td>
//                   <td className="px-6 py-4 text-center">
//                     <button
//                       className="text-blue-600 hover:text-blue-900"
//                       onClick={() => handleViewDetails(user)}
//                     >
//                       Voir détails
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {/* Modale de détails utilisateur */}
//       {selectedUser && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white text-blue-500 rounded-lg shadow-lg p-6 w-full max-w-md relative">
//             <h2 className="text-xl font-bold text-blue-700 mb-4">Détails de l'utilisateur</h2>
//             <p ><strong>Nom :</strong> {selectedUser.name}</p>
//             <p><strong>Email :</strong> {selectedUser.email}</p>
//             <p><strong>Date d'inscription :</strong> {formatDate(selectedUser.registrationDate)}</p>
//             <p><strong>Commandes :</strong> {selectedUser.orderCount}</p>
//             <p><strong>Rôle :</strong> {selectedUser.role}</p>
//             <p><strong>Solde :</strong> {selectedUser.balance} GNF</p>
//             <div className="mt-6 text-right">
//               <button
//                 className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//                 onClick={handleCloseModal}
//               >
//                 Fermer
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminUsersPage;
