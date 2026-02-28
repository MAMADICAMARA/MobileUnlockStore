// src/pages/client/DashboardPage.jsx
import { useState, useEffect } from 'react';
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
  DocumentTextIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  WalletIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

/**
 * Page du tableau de bord de l'espace client.
 * Affiche un résumé des activités de l'utilisateur.
 */
const DashboardPage = () => {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState([]);
  const [activeLicenses, setActiveLicenses] = useState(0);
  const [openTickets, setOpenTickets] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const ordersRes = await orderService.getOrders();
        setRecentOrders(ordersRes.data.slice(0, 5));
        const licensesRes = await licenseService.getLicenses();
        setActiveLicenses(licensesRes.data.length);
        const ticketsRes = await supportService.getTickets();
        setOpenTickets(ticketsRes.data.filter(t => t.status !== 'Résolu').length);
      } catch (err) {
        setError('Impossible de charger le résumé du tableau de bord.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Terminé':
        return <CheckCircleIcon className="h-4 w-4 text-emerald-600" />;
      case 'En cours':
        return <ArrowPathIcon className="h-4 w-4 text-amber-600" />;
      case 'En attente':
        return <ClockIcon className="h-4 w-4 text-blue-600" />;
      case 'Annulé':
        return <XCircleIcon className="h-4 w-4 text-red-600" />;
      default:
        return <BellAlertIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Terminé':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'En cours':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'En attente':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Annulé':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-indigo-500 blur-xl opacity-20 animate-pulse"></div>
          <div className="relative">
            <div className="h-20 w-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
          </div>
        </div>
        <p className="text-gray-700 font-semibold text-xl mb-2">Chargement de votre espace</p>
        <p className="text-gray-500">Préparation de vos données personnalisées...</p>
        <div className="mt-8 flex justify-center gap-2">
          <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-lg w-full p-8 border border-red-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-red-100 rounded-full p-4">
            <XCircleIcon className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Erreur de chargement</h2>
            <p className="text-gray-500 text-sm">Impossible de récupérer vos données</p>
          </div>
        </div>
        <p className="text-gray-600 mb-8 bg-red-50 p-4 rounded-xl">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          <ArrowPathIcon className="h-5 w-5" />
          Réessayer
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8">
      
      {/* Header avec bienvenue personnalisée */}
      <div className="mb-10 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 rounded-3xl blur-3xl"></div>
        <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                <UserCircleIcon className="h-12 w-12" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-gray-800 mb-2">
                  Bonjour, <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{user?.name || 'Client'}</span>
                </h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <SparklesIcon className="h-5 w-5 text-indigo-600" />
                  Bienvenue dans votre espace personnel
                </p>
              </div>
            </div>
            
            {/* Sélecteur de période */}
            <div className="bg-white rounded-xl shadow-lg p-1 inline-flex">
              {['week', 'month', 'year'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    selectedPeriod === period
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {period === 'week' ? 'Semaine' : period === 'month' ? 'Mois' : 'Année'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Solde actuel - Carte principale */}
      <div className="mb-10 relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
        <div className="relative bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-8 shadow-2xl text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-20 -mb-20"></div>
          
          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <WalletIcon className="h-8 w-8" />
              </div>
              <div>
                <p className="text-green-100 text-lg font-medium mb-1">Solde disponible</p>
                <p className="text-5xl font-black tracking-tight">
                  {user?.balance !== undefined ? user.balance.toFixed(2) : '0.00'} €
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 flex items-center gap-2">
                <CurrencyEuroIcon className="h-5 w-5" />
                Recharger
              </button>
              <button className="bg-white text-green-700 px-6 py-3 rounded-xl font-semibold hover:bg-green-50 transition-all duration-300 flex items-center gap-2">
                <ArrowTrendingUpIcon className="h-5 w-5" />
                Historique
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grille des statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Carte Commandes */}
        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <ShoppingBagIcon className="h-6 w-6" />
              </div>
              <span className="text-3xl font-bold text-gray-800">{recentOrders.length}</span>
            </div>
            <h3 className="text-gray-600 font-medium mb-1">Commandes récentes</h3>
            <p className="text-sm text-gray-400">Dernières 5 commandes</p>
          </div>
        </div>

        {/* Carte Licences */}
        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-purple-600 to-pink-600"></div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <KeyIcon className="h-6 w-6" />
              </div>
              <span className="text-3xl font-bold text-gray-800">{activeLicenses}</span>
            </div>
            <h3 className="text-gray-600 font-medium mb-1">Licences actives</h3>
            <p className="text-sm text-gray-400">Logiciels en cours</p>
          </div>
        </div>

        {/* Carte Support */}
        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-amber-600 to-orange-600"></div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <LifebuoyIcon className="h-6 w-6" />
              </div>
              <span className="text-3xl font-bold text-gray-800">{openTickets}</span>
            </div>
            <h3 className="text-gray-600 font-medium mb-1">Tickets ouverts</h3>
            <p className="text-sm text-gray-400">En attente de réponse</p>
          </div>
        </div>

        {/* Carte Statistiques */}
        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-600 to-teal-600"></div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <ChartBarIcon className="h-6 w-6" />
              </div>
              <span className="text-3xl font-bold text-gray-800">12</span>
            </div>
            <h3 className="text-gray-600 font-medium mb-1">Services utilisés</h3>
            <p className="text-sm text-gray-400">Ce mois-ci</p>
          </div>
        </div>
      </div>

      {/* Grille détaillée */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Commandes récentes */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBagIcon className="h-6 w-6 text-white" />
                <h2 className="text-xl font-bold text-white">Commandes récentes</h2>
              </div>
              <button className="text-white/80 hover:text-white text-sm font-medium transition-colors duration-300">
                Voir tout →
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order, index) => (
                  <div 
                    key={order._id} 
                    className="group flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">
                          {order.serviceName}
                        </p>
                        <p className="text-xs text-gray-500">
                          #{order._id?.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)} flex items-center gap-1`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                      <span className="font-bold text-gray-900">
                        {order.price?.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingBagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">Aucune commande récente</p>
                <p className="text-gray-400 text-sm mt-1">Découvrez nos services</p>
              </div>
            )}
          </div>
        </div>

        {/* Colonne de droite - Licences et Support */}
        <div className="space-y-6">
          {/* Licences actives */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <KeyIcon className="h-6 w-6 text-white" />
                <h2 className="text-xl font-bold text-white">Licences actives</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  {activeLicenses}
                </span>
                <p className="text-gray-600 mt-2">licences en cours de validité</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                  <span className="text-sm font-medium text-purple-700">Licences actives</span>
                  <span className="text-sm font-bold text-purple-700">{activeLicenses}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-700">Expire bientôt</span>
                  <span className="text-sm font-bold text-gray-700">2</span>
                </div>
              </div>
              
              <button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg">
                Gérer mes licences
              </button>
            </div>
          </div>

          {/* Tickets support */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <LifebuoyIcon className="h-6 w-6 text-white" />
                <h2 className="text-xl font-bold text-white">Support</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-gray-600">Tickets ouverts</p>
                  <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                    {openTickets}
                  </p>
                </div>
                <div className="h-16 w-16 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl flex items-center justify-center text-white">
                  <LifebuoyIcon className="h-8 w-8" />
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                  <span className="text-sm font-medium text-amber-700">En attente</span>
                  <span className="text-sm font-bold text-amber-700">{openTickets}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <span className="text-sm font-medium text-green-700">Résolus ce mois</span>
                  <span className="text-sm font-bold text-green-700">8</span>
                </div>
              </div>
              
              <button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 rounded-xl font-medium hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-lg">
                Contacter le support
              </button>
            </div>
          </div>

          {/* Sécurité */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheckIcon className="h-8 w-8" />
              <h3 className="text-lg font-bold">Sécurité renforcée</h3>
            </div>
            <p className="text-indigo-100 text-sm mb-4">
              Votre compte est protégé par une authentification à deux facteurs.
            </p>
            <button className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/30 transition-all duration-300">
              Vérifier la sécurité
            </button>
          </div>
        </div>
      </div>

      {/* Activité récente */}
      <div className="mt-8 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <ChartBarIcon className="h-5 w-5 text-indigo-600" />
          Activité récente
        </h3>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-8">
            <div>
              <p className="font-medium">Dernière connexion</p>
              <p className="text-gray-400">Aujourd'hui à 09:45</p>
            </div>
            <div>
              <p className="font-medium">Dernière commande</p>
              <p className="text-gray-400">Il y a 3 jours</p>
            </div>
          </div>
          <button className="text-indigo-600 hover:text-indigo-700 font-medium">
            Voir l'historique complet
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;