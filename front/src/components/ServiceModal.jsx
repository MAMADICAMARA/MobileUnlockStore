// src/components/ServiceModal.jsx
import { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Upload,
  Smartphone,
  Key,
  Globe,
  Clock,
  Shield,
  FileText,
  HelpCircle,
  Info,
  ChevronRight,
  Loader
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import serviceService from '../services/serviceService';
import orderService from '../services/orderService';
import axios from 'axios';

/**
 * Modal de commande de service.
 * @param {object} props - Les propriétés du composant.
 * @param {boolean} props.isOpen - Indique si le modal est ouvert.
 * @param {function} props.onClose - Fonction pour fermer le modal.
 * @param {object} props.service - Le service sélectionné pour la commande.
 * @param {number} props.userBalance - Solde de l'utilisateur.
 */
const ServiceModal = ({ isOpen, onClose, service, userBalance }) => {
  const { user, updateUserBalance } = useAuth();

  // État pour les champs dynamiques du formulaire
  const [formFields, setFormFields] = useState({});
  // État pour le chargement, les erreurs et le succès
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [step, setStep] = useState(1); // 1: formulaire, 2: confirmation, 3: succès

  // Animation d'entrée
  const [modalVisible, setModalVisible] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setModalVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setModalVisible(false);
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Réinitialiser l'état lorsque le service change
  useEffect(() => {
    if (service) {
      const initialFields = {};
      if (service.type === 'IMEI') {
        initialFields.imei = '';
      }
      if (service.type === 'Licence') {
        initialFields.dongleId = '';
        initialFields.deviceModel = '';
      }
      if (service.type === 'Remote') {
        initialFields.remoteType = 'teamviewer';
        initialFields.remoteId = '';
        initialFields.remotePassword = '';
      }
      setFormFields(initialFields);
      setError('');
      setSuccess('');
      setStep(1);
      setSelectedFile(null);
      setUploadProgress(0);
    }
  }, [service]);

  if (!isOpen || !service) return null;

  const isBalanceSufficient = (user?.balance || userBalance) >= service.price;
  const currentBalance = user?.balance || userBalance || 0;
  const remainingBalance = currentBalance - service.price;

  // Configuration selon le type de service
  const typeConfig = {
    'IMEI': {
      icon: Smartphone,
      color: 'from-blue-500 to-cyan-500',
      lightColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-800',
      title: 'Déblocage par IMEI'
    },
    'Licence': {
      icon: Key,
      color: 'from-green-500 to-emerald-500',
      lightColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-200 dark:border-green-800',
      title: 'Licence Logicielle'
    },
    'Remote': {
      icon: Globe,
      color: 'from-purple-500 to-pink-500',
      lightColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-200 dark:border-purple-800',
      title: 'Assistance Remote'
    },
    'default': {
      icon: CreditCard,
      color: 'from-orange-500 to-amber-500',
      lightColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400',
      borderColor: 'border-orange-200 dark:border-orange-800',
      title: 'Service'
    }
  };

  const config = typeConfig[service.type] || typeConfig.default;
  const IconComponent = config.icon;

  // Gérer le changement dans les champs
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormFields(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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
      setSelectedFile(file);
      setUploadError('');
    }
  };

  // Valider le formulaire
  const validateForm = () => {
    if (service.type === 'IMEI') {
      const imeiRegex = /^[0-9]{15}$/;
      if (!imeiRegex.test(formFields.imei)) {
        setError("L'IMEI doit contenir exactement 15 chiffres");
        return false;
      }
    }
    if (service.type === 'Remote') {
      if (!formFields.remoteId) {
        setError("L'ID remote est requis");
        return false;
      }
      if (!formFields.remotePassword) {
        setError("Le mot de passe remote est requis");
        return false;
      }
    }
    return true;
  };

  // Passer à l'étape de confirmation
  const handleNext = () => {
    if (!isBalanceSufficient) {
      setError('Solde insuffisant. Veuillez recharger votre compte.');
      return;
    }
    if (validateForm()) {
      setError('');
      setStep(2);
    }
  };

  // Gérer la soumission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // 1. Passer la commande
      const orderResponse = await orderService.placeOrder({
        serviceId: service._id,
        fields: formFields,
      });

      // 2. Upload du fichier si présent
      if (selectedFile) {
        const formData = new FormData();
        formData.append('document', selectedFile);
        
        await axios.post(`/api/orders/${orderResponse.data.order._id}/upload-document`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        });
      }

      // 3. Mettre à jour le solde
      if (updateUserBalance) {
        updateUserBalance(orderResponse.data.newBalance);
      }

      // 4. Afficher le succès
      setSuccess('Commande confirmée avec succès !');
      setStep(3);

      // 5. Fermer après 2 secondes
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la commande.');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  // Rendu du champ IMEI
  const renderIMEIField = () => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Numéro IMEI <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          type="text"
          name="imei"
          value={formFields.imei || ''}
          onChange={handleFieldChange}
          placeholder="123456789012345"
          maxLength="15"
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <HelpCircle className="w-5 h-5 text-gray-400 cursor-help" title="Tapez *#06# pour obtenir votre IMEI" />
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        <Info className="w-3 h-3 inline mr-1" />
        Composez *#06# sur votre téléphone pour obtenir votre IMEI
      </p>
    </div>
  );

  // Rendu des champs Remote
  const renderRemoteFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Type de remote
        </label>
        <div className="flex gap-3">
          {['teamviewer', 'anydesk', 'supremo'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFormFields(prev => ({ ...prev, remoteType: type }))}
              className={`px-4 py-2 rounded-lg capitalize transition-all ${
                formFields.remoteType === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          ID {formFields.remoteType || 'Remote'}
        </label>
        <input
          type="text"
          name="remoteId"
          value={formFields.remoteId || ''}
          onChange={handleFieldChange}
          className="mt-1 w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Mot de passe
        </label>
        <input
          type="password"
          name="remotePassword"
          value={formFields.remotePassword || ''}
          onChange={handleFieldChange}
          className="mt-1 w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
        />
      </div>
    </div>
  );

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        modalVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-500 ${
        modalVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      }`}>
        {/* Bandeau de gradient */}
        <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${config.color} rounded-t-2xl`}></div>

        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {/* En-tête avec icône */}
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${config.color} p-0.5`}>
              <div className="w-full h-full rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center">
                <IconComponent className="w-7 h-7 text-gray-700 dark:text-gray-300" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {config.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Étape {step} sur 3
              </p>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="flex gap-1 mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full transition-all ${
                  s <= step 
                    ? `bg-gradient-to-r ${config.color}` 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>

          {/* Récapitulatif du service */}
          <div className={`${config.lightColor} p-4 rounded-xl border ${config.borderColor} mb-6`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{service.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {service.description || 'Service de déblocage professionnel'}
                </p>
              </div>
              <div className="text-right">
                <span className={`text-xs ${config.textColor}`}>Prix</span>
                <p className={`text-2xl font-bold ${config.textColor}`}>
                  {service.price?.toFixed(2)} €
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Délai: {service.deliveryTime || '24h'}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Shield className="w-4 h-4" />
                <span>Garantie incluse</span>
              </div>
            </div>
          </div>

          {/* Affichage du solde */}
          <div className={`p-4 rounded-xl mb-6 border ${
            isBalanceSufficient 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className={`w-5 h-5 ${
                  isBalanceSufficient ? 'text-green-500' : 'text-red-500'
                }`} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Solde disponible
                </span>
              </div>
              <span className={`font-bold ${
                isBalanceSufficient ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {currentBalance.toFixed(2)} €
              </span>
            </div>
            
            {isBalanceSufficient && (
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Après commande : <span className="font-semibold text-green-600 dark:text-green-400">
                  {remainingBalance.toFixed(2)} €
                </span>
              </div>
            )}
          </div>

          {/* Étape 1: Formulaire */}
          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
              {service.type === 'IMEI' && renderIMEIField()}
              {service.type === 'Remote' && renderRemoteFields()}

              {/* Upload de fichier */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Document supplémentaire (optionnel)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="file-upload"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                  >
                    <div className="text-center">
                      <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedFile ? selectedFile.name : 'Cliquez pour téléverser un fichier'}
                      </span>
                    </div>
                  </label>
                </div>
                {uploadError && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {uploadError}
                  </p>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!isBalanceSufficient}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
                >
                  <span className="flex items-center justify-center gap-2">
                    Continuer
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* Étape 2: Confirmation */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Récapitulatif</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">Service</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{service.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">Prix</dt>
                    <dd className="font-medium text-green-600 dark:text-green-400">{service.price} €</dd>
                  </div>
                  {service.type === 'IMEI' && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500 dark:text-gray-400">IMEI</dt>
                      <dd className="font-mono text-gray-900 dark:text-white">{formFields.imei}</dd>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <dt className="font-medium text-gray-900 dark:text-white">Solde après commande</dt>
                    <dd className="font-bold text-green-600 dark:text-green-400">{remainingBalance.toFixed(2)} €</dd>
                  </div>
                </dl>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Retour
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      Traitement...
                    </span>
                  ) : (
                    'Confirmer la commande'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Étape 3: Succès */}
          {step === 3 && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {success || 'Commande confirmée !'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Votre commande a été traitée avec succès.
                Vous allez être redirigé...
              </p>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Téléversement: {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;