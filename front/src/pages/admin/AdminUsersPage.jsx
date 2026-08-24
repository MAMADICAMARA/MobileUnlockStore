// src/pages/admin/AdminUsersPage.jsx
import { useState, useEffect, useMemo } from 'react';
import { Search, Eye, User, Mail, Calendar, CreditCard, Shield, Hash, XCircle, Lock, Unlock, Wrench, ChevronLeft, ChevronRight } from 'lucide-react';
import adminService from '../../services/adminService';

const formatDate = (d) => d
  ? new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric' })
  : 'N/A';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('fr-FR').format(amount || 0) + ' FG';

const ROLE_LABELS = {
  admin:                { label: 'Admin',  color: 'bg-red-100 text-red-700' },
  client:               { label: 'Client', color: 'bg-blue-100 text-blue-700' },
  Client:               { label: 'Client', color: 'bg-blue-100 text-blue-700' },
  'utilisateur-employer': { label: 'Employé', color: 'bg-purple-100 text-purple-700' },
};

const roleConfig = (role) => ROLE_LABELS[role] || { label: role || 'N/A', color: 'bg-gray-100 text-gray-700' };

const AdminUsersPage = () => {
  const [users, setUsers]               = useState([]);
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders]     = useState([]);
  const [page, setPage]                 = useState(1);
  const [pagination, setPagination]     = useState({ total: 0, pages: 1, limit: 20 });

  // Commandes chargées une seule fois, pour compter les commandes par client
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersRes = await adminService.getAllOrders({ limit: 100 });
        setOrders(ordersRes.data?.data || ordersRes.data || []);
      } catch (error) {
        console.error('Erreur chargement commandes:', error);
      }
    };
    fetchOrders();
  }, []);

  // Utilisateurs paginés côté serveur
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const usersRes = await adminService.getAllUsers({ page, limit: 20 });
        const usersData = usersRes.data?.data || usersRes.data || [];
        setUsers(usersData);
        if (usersRes.data?.pagination) setPagination(usersRes.data.pagination);
      } catch (error) {
        console.error('Erreur chargement utilisateurs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [page]);

  const orderCountMap = useMemo(() => {
    const map = {};
    orders.forEach(order => {
      const uid = order.user?._id || order.user || order.userId;
      if (uid) map[uid] = (map[uid] || 0) + 1;
    });
    return map;
  }, [orders]);

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const goToPage = (p) => {
    if (p < 1 || p > pagination.pages || p === page) return;
    setPage(p);
  };

  const handleViewDetails = (user) => {
    const uOrders = orders.filter(o => {
      const uid = o.user?._id || o.user || o.userId;
      return uid?.toString() === user._id?.toString();
    });
    setUserOrders(uOrders);
    setSelectedUser(user);
  };

  // ─── Bloquer / Débloquer ──────────────────────────────────────────────────
  const handleToggleBlock = async (userId, e) => {
    e.stopPropagation();
    if (!window.confirm('Confirmer le changement de statut de ce compte ?')) return;
    try {
      const res = await adminService.toggleUserBlock(userId);
      const isActive = res.data.isActive;
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive } : u));
      if (selectedUser?._id === userId) setSelectedUser(prev => ({ ...prev, isActive }));
    } catch (err) {
      console.error('Erreur toggle block:', err);
      alert('Impossible de changer le statut de ce compte.');
    }
  };

  // ─── Accès maintenance ───────────────────────────────────────────────────
  const handleToggleMaintenanceAccess = async (userId, e) => {
    e.stopPropagation();
    try {
      const res = await adminService.toggleMaintenanceAccess(userId);
      const isMaintenanceAllowed = res.data.isMaintenanceAllowed;
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isMaintenanceAllowed } : u));
      if (selectedUser?._id === userId) setSelectedUser(prev => ({ ...prev, isMaintenanceAllowed }));
    } catch (err) {
      console.error('Erreur toggle maintenance access:', err);
      alert("Impossible de changer l'accès maintenance.");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Gestion des Clients</h1>
        <span className="text-sm text-gray-500">{pagination.total || filteredUsers.length} utilisateur(s)</span>
      </div>

      {/* Recherche */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Rechercher par nom ou email..."
          value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
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
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map(user => {
                  const rc = roleConfig(user.role);
                  const isAdmin = (user.role || '').toLowerCase() === 'admin';
                  return (
                    <tr key={user._id} className="hover:bg-gray-50 transition">
                      {/* Nom */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-bold">{user.name?.charAt(0)?.toUpperCase() || '?'}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{user.name}</p>
                            {user.isMaintenanceAllowed && (
                              <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                                <Wrench className="w-3 h-3" /> Maintenance
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* Email */}
                      <td className="px-4 py-4 text-sm text-gray-600 max-w-[160px] truncate">{user.email}</td>
                      {/* Rôle */}
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${rc.color}`}>{rc.label}</span>
                      </td>
                      {/* Solde */}
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{formatCurrency(user.balance)}</td>
                      {/* Commandes */}
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">{orderCountMap[user._id] || 0}</span>
                      </td>
                      {/* Date */}
                      <td className="px-4 py-4 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {/* Détails */}
                          <button onClick={() => handleViewDetails(user)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
                            <Eye className="w-3.5 h-3.5" /> Détails
                          </button>
                          {/* Bloquer */}
                          <button onClick={e => handleToggleBlock(user._id, e)} disabled={isAdmin}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed ${
                              user.isActive ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                            }`}>
                            {user.isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                            {user.isActive ? 'Bloquer' : 'Débloquer'}
                          </button>
                          {/* ✅ Accès maintenance — visible uniquement pour les non-admin */}
                          {!isAdmin && (
                            <button onClick={e => handleToggleMaintenanceAccess(user._id, e)}
                              title={user.isMaintenanceAllowed ? "Retirer l'accès maintenance" : "Autoriser pendant la maintenance"}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg transition ${
                                user.isMaintenanceAllowed
                                  ? 'text-amber-700 bg-amber-100 hover:bg-amber-200'
                                  : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                              }`}>
                              <Wrench className="w-3.5 h-3.5" />
                              {user.isMaintenanceAllowed ? 'Retirer accès' : 'Accès maint.'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed">
            <ChevronLeft className="w-4 h-4" /> Précédent
          </button>
          <span className="text-sm text-gray-500">Page {pagination.page || page} sur {pagination.pages}</span>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page >= pagination.pages}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed">
            Suivant <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Modal détails ── */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-800">Détails de l'utilisateur</h2>
              <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">{selectedUser.name?.charAt(0)?.toUpperCase()}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedUser.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${roleConfig(selectedUser.role).color}`}>
                      {roleConfig(selectedUser.role).label}
                    </span>
                    {selectedUser.isMaintenanceAllowed && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        <Wrench className="w-3 h-3" /> Accès maintenance
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Infos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoCard icon={Mail}     label="Email"           value={selectedUser.email} />
                <InfoCard icon={CreditCard} label="Solde"         value={formatCurrency(selectedUser.balance)} />
                <InfoCard icon={Calendar} label="Inscription"     value={formatDate(selectedUser.createdAt)} />
                <InfoCard icon={Shield}   label="Statut"          value={selectedUser.isActive ? '✅ Actif' : '❌ Inactif'} />
                <InfoCard icon={Hash}     label="ID"              value={selectedUser._id} mono />
                {selectedUser.employeeCode && (
                  <InfoCard icon={User}   label="Code employé"    value={selectedUser.employeeCode} mono />
                )}
              </div>

              {/* Commandes */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Commandes ({userOrders.length})</h4>
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

              {/* Actions du modal */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-200">
                {/* Bloquer/Débloquer */}
                <button
                  onClick={e => handleToggleBlock(selectedUser._id, e)}
                  disabled={(selectedUser.role || '').toLowerCase() === 'admin'}
                  className={`w-full sm:w-auto px-5 py-2 rounded-lg font-medium text-sm transition disabled:opacity-30 disabled:cursor-not-allowed ${
                    selectedUser.isActive
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  }`}>
                  {selectedUser.isActive ? 'Bloquer le compte' : 'Débloquer le compte'}
                </button>

                {/* ✅ Accès maintenance dans le modal */}
                {(selectedUser.role || '').toLowerCase() !== 'admin' && (
                  <button
                    onClick={e => handleToggleMaintenanceAccess(selectedUser._id, e)}
                    className={`w-full sm:w-auto px-5 py-2 rounded-lg font-medium text-sm transition flex items-center justify-center gap-2 ${
                      selectedUser.isMaintenanceAllowed
                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}>
                    <Wrench className="w-4 h-4" />
                    {selectedUser.isMaintenanceAllowed ? "Retirer l'accès maintenance" : 'Autoriser pendant maintenance'}
                  </button>
                )}

                <button onClick={() => setSelectedUser(null)}
                  className="w-full sm:w-auto px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm">
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

const InfoCard = ({ icon: Icon, label, value, mono = false }) => (
  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-blue-600" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={`text-sm font-medium text-gray-900 break-all ${mono ? 'font-mono text-xs' : ''}`}>{value || 'N/A'}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    'Terminé':    'bg-green-100 text-green-700',
    'En cours':   'bg-yellow-100 text-yellow-700',
    'Annulé':     'bg-red-100 text-red-700',
    'Remboursé':  'bg-purple-100 text-purple-700',
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
// import { Search, Eye, User, Mail, Calendar, CreditCard, Shield, Hash, XCircle, Wrench } from 'lucide-react';
// import adminService from '../../services/adminService';
// import { Lock, Unlock } from 'lucide-react';

// const formatDate = (dateString) => {
//   if (!dateString) return 'N/A';
//   return new Date(dateString).toLocaleDateString('fr-FR', {
//     day: '2-digit', month: '2-digit', year: 'numeric',
//   });
// };

// const formatCurrency = (amount) =>
//   new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'GNF' }).format(amount || 0);

// const ROLE_LABELS = {
//   admin: { label: 'Admin', color: 'bg-red-100 text-red-700' },
//   client: { label: 'Client', color: 'bg-blue-100 text-blue-700' },
//   Client: { label: 'Client', color: 'bg-blue-100 text-blue-700' },
//   'utilisateur-employer': { label: 'Employé', color: 'bg-purple-100 text-purple-700' },
// };

// const AdminUsersPage = () => {
//   const [users, setUsers] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [userOrders, setUserOrders] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const [usersRes, ordersRes] = await Promise.all([
//           adminService.getAllUsers(),
//           adminService.getAllOrders(),
//         ]);

//         const usersData = usersRes.data || [];
//         const ordersData = ordersRes.data?.data || ordersRes.data || [];

//         // Compter les commandes par userId
//         const orderCountMap = {};
//         ordersData.forEach(order => {
//           const uid = order.user?._id || order.user || order.userId;
//           if (uid) orderCountMap[uid] = (orderCountMap[uid] || 0) + 1;
//         });

//         // Enrichir les users avec le nb de commandes
//         const enriched = usersData.map(u => ({
//           ...u,
//           orderCount: orderCountMap[u._id] || 0,
//         }));

//         setUsers(enriched);
//         setOrders(ordersData);
//       } catch (error) {
//         console.error('Erreur chargement:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   const filteredUsers = users.filter(u =>
//     u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     u.email?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleViewDetails = (user) => {
//     // Filtrer les commandes de cet utilisateur
//     const uOrders = orders.filter(o => {
//       const uid = o.user?._id || o.user || o.userId;
//       return uid?.toString() === user._id?.toString();
//     });
//     setUserOrders(uOrders);
//     setSelectedUser(user);
//   };

//   const handleToggleBlock = async (userId, e) => {
//     e.stopPropagation();
//     if (!window.confirm("Confirmer le changement de statut de ce compte ?")) return;
//     try {
//       const res = await adminService.toggleUserBlock(userId);
//       const isActive = res.data.isActive;
//       setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive } : u));
//       if (selectedUser?._id === userId) {
//         setSelectedUser(prev => ({ ...prev, isActive }));
//       }
//     } catch (err) {
//       console.error('Erreur toggle block:', err);
//       alert(err.message || "Impossible de changer le statut de ce compte.");
//     }
//   };

//   const handleToggleMaintenanceAccess = async (userId, e) => {
//     e.stopPropagation();
//     try {
//       const res = await adminService.toggleMaintenanceAccess(userId);
//       const isMaintenanceAllowed = res.data.isMaintenanceAllowed;
//       setUsers(prev => prev.map(u => u._id === userId ? { ...u, isMaintenanceAllowed } : u));
//       if (selectedUser?._id === userId) {
//         setSelectedUser(prev => ({ ...prev, isMaintenanceAllowed }));
//       }
//     } catch (err) {
//       console.error('Erreur toggle maintenance access:', err);
//       alert(err.message || "Impossible de modifier l'accès maintenance.");
//     }
//   };

//   const roleConfig = (role) => ROLE_LABELS[role] || { label: role || 'N/A', color: 'bg-gray-100 text-gray-700' };

//   return (
//     <div className="p-6 max-w-7xl mx-auto space-y-6">
//       {/* En-tête */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <h1 className="text-3xl font-bold text-gray-800">Gestion des Clients</h1>
//         <span className="text-sm text-gray-500">{filteredUsers.length} utilisateur(s)</span>
//       </div>

//       {/* Barre de recherche */}
//       <div className="relative max-w-sm">
//         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//         <input
//           type="text"
//           placeholder="Rechercher par nom ou email..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//         />
//       </div>

//       {/* Tableau */}
//       <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
//         {loading ? (
//           <div className="p-12 text-center text-gray-500">Chargement...</div>
//         ) : filteredUsers.length === 0 ? (
//           <div className="p-12 text-center text-gray-500">Aucun utilisateur trouvé.</div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   {['Utilisateur', 'Email', 'Rôle', 'Solde', 'Commandes', 'Inscription', 'Actions'].map(h => (
//                     <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                       {h}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredUsers.map((user) => {
//                   const rc = roleConfig(user.role);
//                   return (
//                     <tr key={user._id} className="hover:bg-gray-50 transition">
//                       {/* Nom */}
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-3">
//                           <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
//                             <span className="text-white text-sm font-bold">
//                               {user.name?.charAt(0)?.toUpperCase() || '?'}
//                             </span>
//                           </div>
//                           <span className="font-medium text-gray-900">{user.name}</span>
//                         </div>
//                       </td>
//                       {/* Email */}
//                       <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
//                       {/* Rôle */}
//                       <td className="px-6 py-4">
//                         <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${rc.color}`}>
//                           {rc.label}
//                         </span>
//                       </td>
//                       {/* Solde */}
//                       <td className="px-6 py-4 text-sm font-medium text-gray-900">
//                         {formatCurrency(user.balance)}
//                       </td>
//                       {/* Commandes */}
//                       <td className="px-6 py-4 text-center">
//                         <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
//                           {user.orderCount}
//                         </span>
//                       </td>
//                       {/* Date */}
//                       <td className="px-6 py-4 text-sm text-gray-500">
//                         {formatDate(user.createdAt)}
//                       </td>
//                       {/* Actions */}
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-1.5 flex-wrap">
//                           <button
//                             onClick={() => handleViewDetails(user)}
//                             className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
//                           >
//                             <Eye className="w-4 h-4" />
//                             Détails
//                           </button>
//                           <button
//                             onClick={(e) => handleToggleBlock(user._id, e)}
//                             disabled={user.role === 'admin'}
//                             className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed ${
//                               user.isActive
//                                 ? 'text-red-600 bg-red-50 hover:bg-red-100'
//                                 : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
//                             }`}
//                             title={user.role === 'admin' ? 'Impossible de bloquer un admin' : ''}
//                           >
//                             {user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
//                             {user.isActive ? 'Bloquer' : 'Débloquer'}
//                           </button>
//                           {user.role !== 'admin' && (
//                             <button
//                               onClick={(e) => handleToggleMaintenanceAccess(user._id, e)}
//                               className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition ${
//                                 user.isMaintenanceAllowed
//                                   ? 'text-orange-600 bg-orange-50 hover:bg-orange-100'
//                                   : 'text-slate-500 bg-slate-50 hover:bg-slate-100'
//                               }`}
//                               title={user.isMaintenanceAllowed ? 'Retirer l\'accès maintenance' : 'Autoriser pendant la maintenance'}
//                             >
//                               <Wrench className="w-4 h-4" />
//                               {user.isMaintenanceAllowed ? 'Épargné' : 'Épargner'}
//                             </button>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Modal détails utilisateur */}
//       {selectedUser && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
//           <div className="flex min-h-full items-center justify-center p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//             {/* Header modal */}
//             <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
//               <h2 className="text-xl font-bold text-gray-800">Détails de l'utilisateur</h2>
//               <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-100 rounded-lg transition">
//                 <XCircle className="w-5 h-5 text-gray-500" />
//               </button>
//             </div>

//             <div className="p-6 space-y-6">
//               {/* Avatar + nom */}
//               <div className="flex items-center gap-4">
//                 <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
//                   <span className="text-white text-2xl font-bold">
//                     {selectedUser.name?.charAt(0)?.toUpperCase()}
//                   </span>
//                 </div>
//                 <div>
//                   <h3 className="text-xl font-bold text-gray-900">{selectedUser.name}</h3>
//                   <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${roleConfig(selectedUser.role).color}`}>
//                     {roleConfig(selectedUser.role).label}
//                   </span>
//                 </div>
//               </div>

//               {/* Infos principales */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <InfoCard icon={Mail} label="Email" value={selectedUser.email} />
//                 <InfoCard icon={CreditCard} label="Solde" value={formatCurrency(selectedUser.balance)} />
//                 <InfoCard icon={Calendar} label="Inscription" value={formatDate(selectedUser.createdAt)} />
//                 <InfoCard icon={Shield} label="Statut" value={selectedUser.isActive ? '✅ Actif' : '❌ Inactif'} />
//                 <InfoCard icon={Wrench} label="Accès maintenance" value={selectedUser.isMaintenanceAllowed ? '🛠️ Épargné' : '🚫 Bloqué en maintenance'} />
//                 <InfoCard icon={Hash} label="ID" value={selectedUser._id} mono />
//                 {selectedUser.employeeCode && (
//                   <InfoCard icon={User} label="Code employé" value={selectedUser.employeeCode} mono />
//                 )}
//               </div>

//               {/* Commandes de l'utilisateur */}
//               <div>
//                 <h4 className="text-lg font-semibold text-gray-800 mb-3">
//                   Commandes ({userOrders.length})
//                 </h4>
//                 {userOrders.length === 0 ? (
//                   <p className="text-sm text-gray-500 italic">Aucune commande pour cet utilisateur.</p>
//                 ) : (
//                   <div className="space-y-2 max-h-60 overflow-y-auto">
//                     {userOrders.map(order => (
//                       <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
//                         <div>
//                           <p className="text-sm font-medium text-gray-800">
//                             {order.service?.name || order.serviceDetails?.name || 'Service'}
//                           </p>
//                           <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
//                         </div>
//                         <div className="text-right">
//                           <p className="text-sm font-bold text-gray-800">
//                             {formatCurrency(order.serviceDetails?.price || order.amount || 0)}
//                           </p>
//                           <StatusBadge status={order.status} />
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Boutons d'action en bas du modal */}
//               <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-200">
//                 {selectedUser.role !== 'admin' && (
//                   <button
//                     onClick={(e) => handleToggleMaintenanceAccess(selectedUser._id, e)}
//                     className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-medium transition ${
//                       selectedUser.isMaintenanceAllowed
//                         ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
//                         : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
//                     }`}
//                   >
//                     <Wrench className="w-4 h-4" />
//                     {selectedUser.isMaintenanceAllowed ? 'Retirer l\'accès maintenance' : 'Épargner pendant la maintenance'}
//                   </button>
//                 )}
//                 <button
//                   onClick={(e) => handleToggleBlock(selectedUser._id, e)}
//                   disabled={selectedUser.role === 'admin'}
//                   className={`w-full sm:w-auto px-6 py-2 rounded-lg font-medium transition disabled:opacity-30 disabled:cursor-not-allowed ${
//                     selectedUser.isActive
//                       ? 'bg-red-100 text-red-700 hover:bg-red-200'
//                       : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
//                   }`}
//                 >
//                   {selectedUser.isActive ? 'Bloquer le compte' : 'Débloquer le compte'}
//                 </button>
//                 <button
//                   onClick={() => setSelectedUser(null)}
//                   className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
//                 >
//                   Fermer
//                 </button>
//               </div>
//             </div>
//           </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Composant carte info
// const InfoCard = ({ icon: Icon, label, value, mono = false }) => (
//   <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
//     <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
//       <Icon className="w-4 h-4 text-blue-600" />
//     </div>
//     <div className="min-w-0">
//       <p className="text-xs text-gray-500 mb-0.5">{label}</p>
//       <p className={`text-sm font-medium text-gray-900 break-all ${mono ? 'font-mono text-xs' : ''}`}>
//         {value || 'N/A'}
//       </p>
//     </div>
//   </div>
// );

// // Badge statut commande
// const StatusBadge = ({ status }) => {
//   const map = {
//     'Terminé':    'bg-green-100 text-green-700',
//     'En cours':   'bg-yellow-100 text-yellow-700',
//     'en cours': 'bg-blue-100 text-blue-700',
//     'Annulé':     'bg-red-100 text-red-700',
//   };
//   return (
//     <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-700'}`}>
//       {status || 'N/A'}
//     </span>
//   );
// };

// export default AdminUsersPage;

