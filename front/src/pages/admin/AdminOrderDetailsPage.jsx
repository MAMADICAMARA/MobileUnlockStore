// src/pages/admin/AdminOrderDetailsPage.jsx
// Page d'admin pour afficher les détails d'une commande et entrer les données de livraison

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Save,
  Loader,
  Copy,
  Send
} from 'lucide-react';
import orderService from '../../services/orderService';
import { useAuth } from '../../hooks/useAuth';

/**
 * Page admin pour gérer les détails d'une commande.
 * Permet de visualiser les informations de la commande,
 * entrer les données de livraison, et changer le statut.
 */
const AdminOrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // État pour la commande
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // État pour l'édition des données de livraison
  const [deliveryData, setDeliveryData] = useState({});
  const [newStatus, setNewStatus] = useState('pending');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  // Récupère les détails de la commande
  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError('');
      try {
        // Utiliser l'endpoint admin pour accéder aux commandes
        const response = await orderService.getAdminOrderById(orderId);
        const orderData = response.data || response;
        setOrder(orderData);
        
        // Initialiser les données de livraison s'elles existent
        if (orderData?.deliveryData) {
          setDeliveryData(orderData.deliveryData);
        }
        
        // Initialiser le nouveau statut
        setNewStatus(orderData?.status || 'pending');
      } catch (err) {
        console.error('❌ Erreur lors du chargement de la commande:', err);
        setError('Impossible de charger les détails de la commande.');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  /**
   * Formate une date pour l'affichage
   */
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  /**
   * Formate un montant en euros
   */
  const formatPrice = (price) => {
    if (!price && price !== 0) return '—';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  /**
   * Gère les changements dans les champs de livraison
   */
  const handleDeliveryFieldChange = (key, value) => {
    setDeliveryData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  /**
   * Ajoute un nouveau champ de livraison
   */
  const addDeliveryField = () => {
    const fieldName = prompt('Nom du champ de livraison (ex: "licenseKey", "accessCode"):');
    if (fieldName && fieldName.trim()) {
      setDeliveryData(prev => ({
        ...prev,
        [fieldName.trim()]: ''
      }));
    }
  };

  /**
   * Supprime un champ de livraison
   */
  const removeDeliveryField = (key) => {
    setDeliveryData(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  /**
   * Enregistre les modifications de la commande
   */
  const handleSaveChanges = async () => {
    if (!order) return;

    setSaving(true);
    saveError && setSaveError('');
    setSaveSuccess('');

    try {
      // Mettre à jour le statut et les données de livraison
      const updateData = {
        status: newStatus,
        deliveryData: deliveryData
      };

      await orderService.updateOrderStatus(orderId, updateData);

      // Message de succès
      setSaveSuccess('✅ Commande mise à jour avec succès !');

      // Recharger les détails
      setTimeout(() => {
        const fetchUpdated = async () => {
          const response = await orderService.getAdminOrderById(orderId);
          setOrder(response.data || response);
        };
        fetchUpdated();
      }, 1000);
    } catch (err) {
      console.error('❌ Erreur lors de la mise à jour:', err);
      setSaveError('Erreur lors de la mise à jour. Réessayez.');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Copie le texte dans le presse-papiers
   */
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader className="w-6 h-6 text-blue-500 animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-gray-500 dark:text-gray-400">Chargement de la commande...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => navigate('/admin/orders')}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour aux commandes
        </button>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Commande non trouvée'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Récupérer les informations
  const serviceName = order?.serviceDetails?.name || 'Service inconnu';
  const serviceCategory = order?.serviceDetails?.category || 'Inconnu';
  const userSubmittedData = order?.userSubmittedData || {};
  const userId = order?.userId;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Bouton Retour */}
      <button
        onClick={() => navigate('/admin/orders')}
        className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
      >
        <ArrowLeft className="w-5 h-5" />
        Retour aux commandes
      </button>

      {/* Messages de succès/erreur */}
      {saveSuccess && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <p className="text-green-700 dark:text-green-400">{saveSuccess}</p>
        </div>
      )}
      {saveError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-red-700 dark:text-red-400">{saveError}</p>
        </div>
      )}

      {/* En-tête avec informations principales */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {serviceName}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Catégorie: {serviceCategory}
              </p>
            </div>
          </div>
        </div>

        {/* Grille d'informations */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Numéro de commande */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Numéro</p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                #{order._id?.slice(-8)}
              </span>
              <button
                onClick={() => copyToClipboard(order._id)}
                className="p-1 text-gray-400 hover:text-blue-500"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Date */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Date</p>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {formatDate(order?.createdAt)}
              </span>
            </div>
          </div>

          {/* Montant */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Montant</p>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                {formatPrice(order?.amount)}
              </span>
            </div>
          </div>

          {/* Client */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Client</p>
            <div className="font-mono text-sm font-bold text-gray-900 dark:text-white break-all">
              {userId?.slice(-8) || '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Données soumises par l'utilisateur (lecture seule) */}
      {Object.keys(userSubmittedData).length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Données soumises par le client
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(userSubmittedData).map(([key, value]) => (
              <div key={key} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 uppercase">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-lg font-mono font-bold text-gray-900 dark:text-white break-all">
                  {String(value)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulaire pour les données de livraison et le statut */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Traitement de la commande
        </h2>

        <div className="space-y-6">
          {/* Sélection du statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Statut de la commande
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            >
              <option value="pending">⏳ En attente</option>
              <option value="processing">🔄 En cours</option>
              <option value="completed">✅ Terminé</option>
            </select>
          </div>

          {/* Données de livraison */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Données de livraison
              </label>
              <button
                onClick={addDeliveryField}
                className="text-xl text-blue-500 hover:text-blue-600"
                title="Ajouter un champ"
              >
                +
              </button>
            </div>

            <div className="space-y-3">
              {Object.keys(deliveryData).length > 0 ? (
                Object.entries(deliveryData).map(([key, value]) => (
                  <div key={key} className="flex gap-3">
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleDeliveryFieldChange(key, e.target.value)}
                      placeholder={key}
                      className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                    <button
                      onClick={() => removeDeliveryField(key)}
                      className="px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Aucune donnée de livraison. Cliquez sur + pour ajouter des champs.
                </p>
              )}
            </div>
          </div>

          {/* Bouton d'enregistrement */}
          <button
            onClick={handleSaveChanges}
            disabled={saving}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Enregistrer les modifications
              </>
            )}
          </button>
        </div>
      </div>

      {/* Informations utiles */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          Conseils
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>• Entrez les données de livraison (clés de licence, codes d'accès, etc.).</li>
          <li>• Changez le statut en "Terminé" lorsque la commande est traitée.</li>
          <li>• Le client recevra une notification une fois la commande finalisée.</li>
          <li>• Vous pouvez ajouter autant de champs que nécessaire avec le bouton +.</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminOrderDetailsPage;
