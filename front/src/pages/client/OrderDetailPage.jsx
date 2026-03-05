// src/pages/client/OrderDetailPage.jsx
// Page de détail d'une commande avec affichage des informations et données de livraison

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
  Upload,
  Download,
  FileText,
  Loader,
  Copy,
  X
} from 'lucide-react';
import orderService, { formatOrderStatus } from '../../services/orderService';
import { useAuth } from '../../hooks/useAuth'; // Import du hook useAuth

/**
 * Page de détail d'une commande unique.
 * Affiche les informations de la commande, les données utilisateur soumises,
 * et les données de livraison si elles ont été remplies par l'admin.
 */
const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // État pour la commande et le chargement
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // État pour l'upload et les actions
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Récupère les détails de la commande au chargement
  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError('');
      try {
        // Utiliser l'endpoint approprié selon si l'utilisateur est admin ou client
        const response = user?.role === 'admin'
          ? await orderService.getAdminOrderById(orderId)
          : await orderService.getOrderById(orderId);

        const orderData = response.data || response;
        setOrder(orderData);
      } catch (err) {
        console.error('❌ Erreur lors du chargement de la commande:', err);
        setError('Impossible de charger les détails de la commande. Vérifiez votre connexion.');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, user?.role]);

  /**
   * Formate une date pour l'affichage (format français)
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
   * Gère la sélection d'un fichier pour l'upload
   */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation de la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Le fichier ne doit pas dépasser 5MB');
      return;
    }

    // Validation du type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Format accepté : JPEG, PNG, GIF, PDF');
      return;
    }

    setUploadFile(file);
    setUploadError('');
  };

  /**
   * Gère l'upload du document
   */
  const handleUploadDocument = async () => {
    if (!uploadFile) {
      setUploadError('Veuillez sélectionner un fichier');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      // Uploader le document via orderService
      await orderService.uploadDocument(orderId, uploadFile);
      // Réinitialiser l'état d'upload
      setUploadFile(null);
      setUploadProgress(0);
      // Message de succès
      alert('Document uploadé avec succès !');
      // Recharger les détails de la commande
      const response = await orderService.getOrderById(orderId);
      setOrder(response.data || response);
    } catch (err) {
      console.error('❌ Erreur lors de l\'upload:', err);
      setUploadError('Erreur lors de l\'upload du document. Réessayez.');
    } finally {
      setUploading(false);
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
          onClick={() => navigate('/client/orders')}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour à l'historique
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

  // Récupérer les informations de la commande avec fallbacks
  const serviceName = order?.serviceDetails?.name || 'Service inconnu';
  const serviceCategory = order?.serviceDetails?.category || 'Inconnu';
  const status = order?.status || 'pending';
  const statusConfig = formatOrderStatus(status);
  const userSubmittedData = order?.userSubmittedData || {};

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Bouton Retour */}
      <button
        onClick={() => navigate('/client/orders')}
        className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
      >
        <ArrowLeft className="w-5 h-5" />
        Retour à l'historique
      </button>

      {/* En-tête avec statut */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Icône service */}
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Package className="w-8 h-8 text-white" />
            </div>

            <div>
              {/* Titre et catégorie */}
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {serviceName}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Catégorie: {serviceCategory}
              </p>
            </div>
          </div>

          {/* Badge de statut */}
          <div className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border ${statusConfig.color} ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
            {/* Afficher un icône basé sur le statut */}
            {status === 'completed' && <CheckCircle className="w-5 h-5" />}
            {status === 'processing' && <Clock className="w-5 h-5" />}
            {status === 'pending' && <AlertCircle className="w-5 h-5" />}
            <span>{statusConfig.label}</span>
          </div>
        </div>
      </div>

      {/* Grille d'informations principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Référence de commande */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Numéro de commande</p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-mono font-bold text-gray-900 dark:text-white">
              #{order._id?.slice(-12)}
            </span>
            <button
              onClick={() => copyToClipboard(order._id)}
              className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          {copied && <p className="text-xs text-green-500 mt-2">✅ Copié !</p>}
        </div>

        {/* Date de création */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Date de commande</p>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {formatDate(order?.createdAt)}
            </span>
          </div>
        </div>

        {/* Montant */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Montant</p>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <span className="text-lg font-bold text-green-600 dark:text-green-400">
              {formatPrice(order?.amount)}
            </span>
          </div>
        </div>
      </div>

      {/* Données soumises par l'utilisateur */}
      {Object.keys(userSubmittedData).length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Informations soumises
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Afficher chaque champ soumis */}
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

      {/* Données de livraison (si disponibles) */}
      {order?.deliveryData && Object.keys(order.deliveryData).length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-transparent dark:from-green-900/20 dark:to-transparent">
          <h2 className="text-xl font-bold text-green-900 dark:text-green-100 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Données de livraison
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Afficher chaque donnée de livraison */}
            {Object.entries(order.deliveryData).map(([key, value]) => (
              <div key={key} className="bg-white dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 uppercase">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-lg font-mono font-bold text-gray-900 dark:text-white break-all">
                  {String(value)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">
              ✅ Votre commande a été traitée et les informations de livraison ont été fournies.
            </p>
          </div>
        </div>
      )}

      {/* Section d'upload de documents */}
      {!order?.deliveryData || Object.keys(order.deliveryData).length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-500" />
            Uploader un document supplémentaire
          </h2>

          <div className="space-y-4">
            {/* Zone de drop / sélection de fichier */}
            <div className="relative">
              <input
                type="file"
                id="document-upload"
                onChange={handleFileChange}
                accept=".pdf,image/*"
                className="hidden"
              />
              <label
                htmlFor="document-upload"
                className="flex flex-col items-center justify-center w-full px-6 py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  {uploadFile 
                    ? uploadFile.name 
                    : 'Cliquez pour téléverser un fichier (PDF, JPEG, PNG, GIF)'}
                </span>
              </label>
            </div>

            {/* Message d'erreur d'upload */}
            {uploadError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {uploadError}
                </p>
              </div>
            )}

            {/* Barre de progression (optionnel) */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Téléversement: {uploadProgress}%
                </p>
              </div>
            )}

            {/* Bouton d'upload */}
            <button
              onClick={handleUploadDocument}
              disabled={!uploadFile || uploading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Uploader le document
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Informations utiles */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          Besoin d'aide ?
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>• Si votre commande est en cours, l'admin travaille à son traitement.</li>
          <li>• Les données de livraison s'afficheront ici une fois votre commande terminée.</li>
          <li>• Vous pouvez téléverser des documents supplémentaires si nécessaire.</li>
          <li>• <a href="/support" className="underline hover:no-underline">Contactez le support</a> pour toute question.</li>
        </ul>
      </div>
    </div>
  );
};

export default OrderDetailPage;
