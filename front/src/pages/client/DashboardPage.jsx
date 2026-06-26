// src/pages/client/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import orderService from '../../services/orderService';
import licenseService from '../../services/licenseService';
import supportService from '../../services/supportService';
import {
  UserCircleIcon,
  ShoppingBagIcon,
  KeyIcon,
  LifebuoyIcon,
  CurrencyEuroIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  BellAlertIcon,
  ChartBarIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  WalletIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders]     = useState([]);
  const [activeLicenses, setActiveLicenses] = useState(0);
  const [openTickets, setOpenTickets]       = useState(0);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const ordersRes = await orderService.getOrders();
        let orders = ordersRes?.data?.data ?? ordersRes?.data ?? ordersRes ?? [];
        if (!Array.isArray(orders)) orders = [];
        setRecentOrders(orders.slice(0, 5));

        try {
          const licensesRes = await licenseService.getLicenses();
          let licenses = licensesRes?.data?.data ?? licensesRes?.data ?? licensesRes ?? [];
          if (!Array.isArray(licenses)) licenses = [];
          setActiveLicenses(licenses.length);
        } catch { setActiveLicenses(0); }

        try {
          const ticketsRes = await supportService.getTickets();
          let tickets = ticketsRes?.data?.data ?? ticketsRes?.data ?? ticketsRes ?? [];
          if (!Array.isArray(tickets)) tickets = [];
          setOpenTickets(tickets.filter(t => !['Résolu', 'resolved', 'closed'].includes(t.status)).length);
        } catch { setOpenTickets(0); }

      } catch (err) {
        console.error('Erreur Dashboard:', err);
        setError('Impossible de charger le résumé du tableau de bord.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Terminé':   case 'completed':  return <CheckCircleIcon className="h-4 w-4 text-emerald-600" />;
      case 'En cours':  case 'processing': return <ArrowPathIcon    className="h-4 w-4 text-amber-600" />;
      case 'En attente':case 'pending':    return <ClockIcon         className="h-4 w-4 text-blue-600" />;
      case 'Annulé':    case 'cancelled':  return <XCircleIcon       className="h-4 w-4 text-red-600" />;
      default:                             return <BellAlertIcon     className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Terminé':   case 'completed':  return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'En cours':  case 'processing': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'En attente':case 'pending':    return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Annulé':    case 'cancelled':  return 'bg-red-50 text-red-700 border-red-200';
      default:                             return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return '0.00';
    return typeof price === 'number' ? price.toFixed(2) : parseFloat(price || 0).toFixed(2);
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <UserCircleIcon className="h-20 w-20 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Veuillez vous connecter.</p>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-700 font-semibold">Chargement...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center">
        <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-indigo-600 text-white px-6 py-2 rounded-xl">Réessayer</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-3 sm:p-6 lg:p-8">

      {/* ── En-tête ── */}
      <div className="mb-6 bg-white/70 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-xl border border-white/20">
        <div className="flex flex-col gap-4">

          {/* Identité utilisateur */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <UserCircleIcon className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-black text-gray-800 leading-tight">
                Bonjour,{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent break-words">
                  {user?.name || 'Client'}
                </span>
              </h1>
              <p className="text-gray-500 text-sm flex items-center gap-1 mt-0.5">
                <SparklesIcon className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                Bienvenue dans votre espace personnel
              </p>
            </div>
          </div>

          {/* Sélecteur de période */}
          <div className="bg-white rounded-xl shadow p-1 inline-flex self-start">
            {[
              { key: 'week',  label: 'Semaine' },
              { key: 'month', label: 'Mois' },
              { key: 'year',  label: 'Année' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedPeriod(key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedPeriod === key ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Carte solde ── */}
      <div className="mb-6 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-5 sm:p-7 shadow-xl text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/10 rounded-full -ml-12 -mb-12 pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          {/* Solde */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <WalletIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-green-100 text-sm font-medium">Solde disponible</p>
              <p className="text-4xl sm:text-5xl font-black tracking-tight leading-none mt-0.5">
                {formatPrice(user?.balance)} <span className="text-2xl sm:text-3xl font-bold">€</span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => navigate('/client/add-funds')}
              className="bg-white/20 backdrop-blur-sm px-4 py-2.5 rounded-xl font-semibold hover:bg-white/30 transition-all text-sm flex items-center gap-2"
            >
              <CurrencyEuroIcon className="h-4 w-4" />
              Recharger
            </button>
            <button
              onClick={() => navigate('/client/balance-history')}
              className="bg-white text-green-700 px-4 py-2.5 rounded-xl font-semibold hover:bg-green-50 transition-all text-sm flex items-center gap-2"
            >
              <ArrowTrendingUpIcon className="h-4 w-4" />
              Historique
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: 'Commandes',        value: recentOrders.length, sub: '5 dernières',       icon: ShoppingBagIcon, from: 'from-blue-600',    to: 'to-indigo-600' },
          { label: 'Licences actives', value: activeLicenses,      sub: 'Logiciels en cours', icon: KeyIcon,         from: 'from-purple-600', to: 'to-pink-600' },
          { label: 'Tickets ouverts',  value: openTickets,         sub: 'En attente',         icon: LifebuoyIcon,    from: 'from-amber-600',  to: 'to-orange-600' },
          { label: 'Services utilisés',value: 12,                  sub: 'Ce mois-ci',         icon: ChartBarIcon,    from: 'from-emerald-600',to: 'to-teal-600' },
        ].map(({ label, value, sub, icon: Icon, from, to }) => (
          <div key={label} className="bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden">
            <div className={`h-1.5 bg-gradient-to-r ${from} ${to}`} />
            <div className="p-3 sm:p-5">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className={`h-9 w-9 sm:h-11 sm:w-11 bg-gradient-to-br ${from} ${to} rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow`}>
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <span className="text-2xl sm:text-3xl font-bold text-gray-800">{value}</span>
              </div>
              <p className="text-gray-600 font-medium text-xs sm:text-sm leading-tight">{label}</p>
              <p className="text-gray-400 text-xs mt-0.5 hidden sm:block">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Contenu principal ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Commandes récentes */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBagIcon className="h-5 w-5 text-white" />
              <h2 className="text-lg font-bold text-white">Commandes récentes</h2>
            </div>
            <button onClick={() => navigate('/client/orders')} className="text-white/80 hover:text-white text-sm font-medium">
              Voir tout →
            </button>
          </div>

          <div className="p-4 sm:p-5">
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order, index) => {
                  const serviceName = order.serviceName || order.service?.name || order.serviceDetails?.name || 'Service';
                  const orderId     = order._id || order.id || 'N/A';
                  const orderStatus = order.status || 'En attente';
                  const orderPrice  = order.price || order.amount || order.serviceDetails?.price || 0;

                  return (
                    <div
                      key={orderId}
                      onClick={() => navigate(`/client/orders/${orderId}`)}
                      className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-all cursor-pointer gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{serviceName}</p>
                          <p className="text-xs text-gray-400">#{typeof orderId === 'string' ? orderId.slice(-8) : orderId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border hidden sm:flex items-center gap-1 ${getStatusColor(orderStatus)}`}>
                          {getStatusIcon(orderStatus)}
                          {orderStatus}
                        </span>
                        <span className="font-bold text-gray-900 text-sm whitespace-nowrap">
                          {formatPrice(orderPrice)} €
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10">
                <ShoppingBagIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Aucune commande récente</p>
              </div>
            )}
          </div>
        </div>

        {/* Colonne droite */}
        <div className="space-y-4">

          {/* Licences */}
          <div className="bg-white/80 rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-3 flex items-center gap-2">
              <KeyIcon className="h-5 w-5 text-white" />
              <h2 className="text-base font-bold text-white">Licences actives</h2>
            </div>
            <div className="p-5">
              <div className="text-center mb-4">
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  {activeLicenses}
                </span>
                <p className="text-gray-500 text-sm mt-1">licences en cours</p>
              </div>
              <button
                onClick={() => navigate('/client/licenses')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-xl font-medium hover:opacity-90 transition-all shadow"
              >
                Gérer mes licences
              </button>
            </div>
          </div>

          {/* Support */}
          <div className="bg-white/80 rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-5 py-3 flex items-center gap-2">
              <LifebuoyIcon className="h-5 w-5 text-white" />
              <h2 className="text-base font-bold text-white">Support</h2>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-500 text-sm">Tickets ouverts</p>
                  <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                    {openTickets}
                  </p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center text-white">
                  <LifebuoyIcon className="h-6 w-6" />
                </div>
              </div>
              <button
                onClick={() => navigate('/client/tickets/new')}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-2.5 rounded-xl font-medium hover:opacity-90 transition-all shadow"
              >
                Contacter le support
              </button>
            </div>
          </div>

          {/* Sécurité */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-5 text-white shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheckIcon className="h-6 w-6" />
              <h3 className="font-bold">Sécurité renforcée</h3>
            </div>
            <p className="text-indigo-100 text-sm mb-4 leading-relaxed">
              Votre compte est protégé par une authentification à deux facteurs.
            </p>
            <button
              onClick={() => navigate('/client/security')}
              className="bg-white/20 px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/30 transition-all"
            >
              Vérifier la sécurité
            </button>
          </div>
        </div>
      </div>

      {/* ── Activité récente ── */}
      <div className="mt-5 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4 sm:p-5">
        <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          <ChartBarIcon className="h-5 w-5 text-indigo-600" />
          Activité récente
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex gap-6">
            <div>
              <p className="text-sm font-medium text-gray-700">Dernière connexion</p>
              <p className="text-xs text-gray-400">Aujourd'hui à 09:45</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Dernière commande</p>
              <p className="text-xs text-gray-400">Il y a 3 jours</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/client/activity')}
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm self-start sm:self-auto whitespace-nowrap"
          >
            Voir l'historique complet
          </button>
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;
