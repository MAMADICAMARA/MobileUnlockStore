// src/components/ServiceModal.jsx
import { useState, useEffect } from 'react';
import {
  X, CreditCard, AlertCircle, CheckCircle,
  Smartphone, Key, Globe, Clock, FileText,
  HelpCircle, Info, ChevronRight, Loader,
  Server, Wifi, ExternalLink, Plus, Minus,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import serviceService from '../services/serviceService';
import orderService from '../services/orderService';
import axios from 'axios';

const fmtFG = (n) => new Intl.NumberFormat('fr-FR').format(n || 0);

// ─── Constante globale : minimum absolu pour la catégorie Credit ──────────────
const CREDIT_MIN_QUANTITY = 10;

const ServiceModal = ({ isOpen, onClose, service, userBalance }) => {
  const { user, updateUserBalance } = useAuth();

  const [serviceDetails, setServiceDetails] = useState(null);
  const [formFields, setFormFields]         = useState({});
  const [loading, setLoading]               = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [error, setError]                   = useState('');
  const [success, setSuccess]               = useState('');
  const [selectedFile, setSelectedFile]     = useState(null);
  const [uploadError, setUploadError]       = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [step, setStep]                     = useState(1);
  const [modalVisible, setModalVisible]     = useState(false);

  useEffect(() => { setModalVisible(isOpen); }, [isOpen]);

  useEffect(() => {
    if (!service) { setServiceDetails(null); return; }

    setFetchingDetails(true);
    setError('');
    setSuccess('');
    setStep(1);
    setSelectedFile(null);
    setUploadProgress(0);

    serviceService.getServiceById(service._id)
      .then(res => {
        const data = res.data?.data || res.data;
        setServiceDetails(data);

        const fields = getFormFields(data);
        const initial = {};
        fields.forEach(f => {
          if (f.name === 'quantity' && f.type === 'number') {
            // Initialiser à la valeur min issue du modèle
            initial[f.name] = f.min ?? f.defaultValue ?? CREDIT_MIN_QUANTITY;
          } else {
            initial[f.name] = f.defaultValue ?? '';
          }
        });
        setFormFields(initial);
      })
      .catch(err => {
        console.error('Erreur chargement service:', err);
        setServiceDetails(null);
        setFormFields({});
      })
      .finally(() => setFetchingDetails(false));
  }, [service]);

  if (!isOpen || !service) return null;

  // ─── Catégorie ────────────────────────────────────────────────────────────
  const resolveCategory = (raw = '') => {
    const c = raw.toString().trim();
    if (c.includes('IMEI'))                                                      return 'IMEI';
    if (c.includes('Server'))                                                    return 'Server';
    if (c.includes('Credit') || c.includes('License') || c.includes('Licence')) return 'Credit';
    if (c.includes('Rental'))                                                    return 'Rental';
    if (c.includes('Remote'))                                                    return 'Remote';
    return 'IMEI';
  };

  const rawCategory = serviceDetails?.category || service?.category || service?.type || 'IMEI';
  const category    = resolveCategory(rawCategory);

  // ─── Thème par catégorie ──────────────────────────────────────────────────
  const themes = {
    IMEI:   { icon: Smartphone, gradient: 'from-blue-500 to-cyan-500',     light: 'bg-blue-50 dark:bg-blue-900/20',     text: 'text-blue-600 dark:text-blue-400',     border: 'border-blue-200 dark:border-blue-800' },
    Credit: { icon: Key,        gradient: 'from-green-500 to-emerald-500', light: 'bg-green-50 dark:bg-green-900/20',   text: 'text-green-600 dark:text-green-400',   border: 'border-green-200 dark:border-green-800' },
    Server: { icon: Server,     gradient: 'from-orange-500 to-red-500',    light: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
    Rental: { icon: Globe,      gradient: 'from-purple-500 to-pink-500',   light: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
    Remote: { icon: Wifi,       gradient: 'from-indigo-500 to-purple-500', light: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800' },
  };

  const theme = themes[category] || themes.IMEI;
  const Icon  = theme.icon;

  // ─── Résolution du min/max depuis le modèle Service ───────────────────────
  // Priorité : serviceDetails.minQuantity (du modèle MongoDB) > CREDIT_MIN_QUANTITY
  const resolveQtyMin = () => {
    if (category !== 'Credit') return 1;
    const fromModel = serviceDetails?.minQuantity;
    if (typeof fromModel === 'number' && fromModel >= 1) {
      return Math.max(fromModel, CREDIT_MIN_QUANTITY); // jamais sous la constante globale
    }
    return CREDIT_MIN_QUANTITY;
  };

  const resolveQtyMax = () => {
    if (category !== 'Credit') return undefined;
    const fromModel = serviceDetails?.maxQuantity;
    if (typeof fromModel === 'number' && fromModel > 0) return fromModel;
    return undefined; // 0 ou absent = pas de limite
  };

  // ─── Champs du formulaire ─────────────────────────────────────────────────
  const getFormFields = (svc) => {
    const qMin = resolveQtyMin();
    const qMax = resolveQtyMax();

    if (svc?.fieldsRequired?.length) {
      // Appliquer le min/max du modèle sur le champ quantity si l'admin l'a défini
      return svc.fieldsRequired.map(f => {
        if (f.name === 'quantity' && f.type === 'number' && category === 'Credit') {
          return {
            ...f,
            min: qMin,
            max: qMax,
            defaultValue: Math.max(f.defaultValue ?? 1, qMin),
          };
        }
        return f;
      });
    }

    // Champs par défaut par catégorie
    const defaults = {
      IMEI: [
        { name: 'imei',     label: 'Numéro IMEI',            type: 'text',  required: true,  placeholder: '123456789012345', helpText: 'Composez *#06# pour obtenir votre IMEI', validation: { pattern: '^[0-9]{15}$', message: "L'IMEI doit contenir 15 chiffres" } },
        { name: 'imageUrl', label: 'Lien image (optionnel)', type: 'url',   required: false, placeholder: 'https://exemple.com/photo.jpg', helpText: "Photo de l'étiquette IMEI ou du téléphone" },
      ],
      Server: [
        { name: 'username', label: "Nom d'utilisateur (logiciel)", type: 'text',  required: true, placeholder: 'john_doe',        helpText: "Nom d'utilisateur du compte logiciel" },
        { name: 'email',    label: 'Email (compte logiciel)',       type: 'email', required: true, placeholder: 'votre@email.com', helpText: 'Email utilisé pour ouvrir le compte logiciel' },
      ],
      Credit: [
        { name: 'email',    label: 'Email de réception', type: 'email',  required: true, placeholder: 'votre@email.com', helpText: 'Les identifiants seront envoyés ici' },
        {
          name: 'quantity', label: 'Quantité', type: 'number', required: true,
          defaultValue: qMin,
          min: qMin,
          max: qMax,
          helpText: `Nombre de crédits souhaités (minimum ${qMin}${qMax ? `, maximum ${qMax}` : ''})`,
        },
      ],
      Rental: [
        { name: 'notes', label: 'Notes (optionnel)', type: 'textarea', required: false, placeholder: 'Informations complémentaires...' },
      ],
      Remote: [
        { name: 'remoteId',       label: 'ID de connexion',         type: 'text',     required: true, placeholder: 'ID AnyDesk/TeamViewer...' },
        { name: 'remotePassword', label: 'Mot de passe temporaire', type: 'password', required: true, placeholder: 'Mot de passe pour la session' },
      ],
    };

    return defaults[category] || [];
  };

  const formFieldDefs = getFormFields(serviceDetails);

  // ─── Quantité / montant total ──────────────────────────────────────────────
  const quantityFieldDef = formFieldDefs.find(f => f.name === 'quantity' && f.type === 'number');
  const qtyMin     = quantityFieldDef?.min ?? 1;
  const qtyMax     = quantityFieldDef?.max;
  const rawQty     = quantityFieldDef ? parseInt(formFields.quantity, 10) : 1;
  const effectiveQty = quantityFieldDef && Number.isFinite(rawQty) && rawQty >= qtyMin ? rawQty : qtyMin;
  const unitPrice  = service.price || 0;
  const totalPrice = quantityFieldDef ? unitPrice * effectiveQty : unitPrice;

  // ─── Solde ────────────────────────────────────────────────────────────────
  const currentBalance      = user?.balance ?? userBalance ?? 0;
  const isBalanceSufficient = currentBalance >= totalPrice;
  const remainingBalance    = currentBalance - totalPrice;

  // ─── Blocage bouton Continuer (Credit uniquement) ─────────────────────────
  const isContinueDisabled = !isBalanceSufficient || (category === 'Credit' && effectiveQty < qtyMin);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    const field = formFieldDefs.find(f => f.name === name);

    if (field && field.type === 'number') {
      if (value === '') { setFormFields(prev => ({ ...prev, [name]: '' })); return; }
      const numValue = parseInt(value, 10);
      if (!Number.isFinite(numValue)) return;
      // Bloquer au-dessus du max immédiatement
      const capped = field.max !== undefined && numValue > field.max ? field.max : numValue;
      setFormFields(prev => ({ ...prev, [name]: capped }));
    } else {
      setFormFields(prev => ({ ...prev, [name]: value }));
    }
  };

  // Corrige la valeur sous le min quand l'utilisateur quitte le champ
  const handleNumberBlur = (e) => {
    const { name } = e.target;
    const field = formFieldDefs.find(f => f.name === name);
    if (!field || field.type !== 'number') return;
    const minVal  = field.min ?? 1;
    const current = parseInt(formFields[name], 10);
    if (!Number.isFinite(current) || current < minVal) {
      setFormFields(prev => ({ ...prev, [name]: minVal }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setUploadError('Le fichier ne doit pas dépasser 5 Mo'); return; }
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowed.includes(file.type)) { setUploadError('Format accepté : JPEG, PNG, GIF, PDF'); return; }
    setSelectedFile(file);
    setUploadError('');
  };

  const validateForm = () => {
    for (const field of formFieldDefs) {
      const value = formFields[field.name]?.toString().trim() || '';
      if (field.required && !value) {
        setError(`📋 Champ requis — "${field.label}" doit être rempli.`);
        return false;
      }
      if (field.validation?.pattern && value) {
        if (!new RegExp(field.validation.pattern).test(value)) {
          setError(`❌ ${field.validation.message || `${field.label} n'est pas valide`}`);
          return false;
        }
      }
      if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setError('📧 Adresse email invalide');
        return false;
      }
      if (field.name === 'quantity' && field.type === 'number') {
        const n = parseInt(value, 10);
        if (!Number.isFinite(n)) {
          setError(`⚠️ Quantité invalide — doit être un nombre entier.`);
          return false;
        }
        if (n < qtyMin) {
          setError(`⚠️ Quantité minimale — La quantité minimale est ${qtyMin} crédit(s). Vous avez saisi : ${n}.`);
          return false;
        }
        if (qtyMax != null && n > qtyMax) {
          setError(`⚠️ Quantité maximale — La quantité maximale est ${qtyMax} crédit(s). Vous avez saisi : ${n}.`);
          return false;
        }
      }
    }
    return true;
  };

  const parseOrderError = (err) => {
    const msg = err?.response?.data?.message || err?.response?.data?.error || '';
    if (err?.response && msg) {
      const m = msg.toLowerCase();
      if (m.includes('minimum'))      return `⚠️ Quantité minimale insuffisante\n\n${msg}`;
      if (m.includes('maximum'))      return `⚠️ Quantité maximale dépassée\n\n${msg}`;
      if (m.includes('solde') || m.includes('insuffisant')) return `💰 Solde insuffisant\n\n${msg}`;
      if (m.includes('requis'))       return `📋 Champ obligatoire manquant\n\n${msg}`;
      if (m.includes('imei'))         return `📱 IMEI invalide\n\n${msg}`;
      if (m.includes('email'))        return `📧 Email invalide\n\n${msg}`;
      return `❌ Erreur\n\n${msg}`;
    }
    if (!err?.response) return `🌐 Erreur de connexion\n\nVérifiez votre connexion Internet.`;
    const s = err.response?.status;
    if (s === 401) return `🔐 Non authentifié`;
    if (s === 403) return `🚫 Accès refusé`;
    if (s === 404) return `🔍 Service introuvable`;
    if (s >= 500)  return `⚠️ Erreur serveur\n\nVeuillez réessayer plus tard.`;
    return `❌ Erreur inattendue\n\nVeuillez réessayer.`;
  };

  const handleNext = () => {
    if (!isBalanceSufficient) {
      setError('💰 Solde insuffisant\n\nVeuillez recharger votre compte pour continuer.');
      return;
    }
    if (category === 'Credit' && quantityFieldDef && effectiveQty < qtyMin) {
      setError(`⚠️ Quantité invalide — champ "Quantité"\n\nLa quantité minimale est ${qtyMin} crédit(s).\nValeur actuelle : ${effectiveQty}.`);
      return;
    }
    if (validateForm()) { setError(''); setStep(2); }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    try {
      const orderResponse = await orderService.placeOrder({
        serviceId: service._id,
        userSubmittedData: formFields,
        quantity: effectiveQty,
      });
      if (selectedFile) {
        const formData = new FormData();
        formData.append('document', selectedFile);
        await axios.post(`/api/orders/${orderResponse.data.order._id}/upload-document`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total)),
        });
      }
      if (updateUserBalance) updateUserBalance(orderResponse.data.newBalance);
      setSuccess('Commande confirmée avec succès !');
      setStep(3);
      setTimeout(onClose, 2500);
    } catch (err) {
      setError(parseOrderError(err));
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  // ─── Rendu des champs ─────────────────────────────────────────────────────
  const renderField = (field) => {
    // Champ number avec min/max → boutons +/−
    if (field.type === 'number' && (field.min !== undefined || field.max !== undefined)) {
      const minVal = field.min ?? 1;
      const maxVal = field.max;
      const currentValue = parseInt(formFields[field.name], 10);
      const displayValue = Number.isFinite(currentValue) ? currentValue : minVal;

      return (
        <div key={field.name} className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
            <span className="text-xs text-gray-400 font-normal ml-2">
              (min : {minVal}{maxVal !== undefined ? `, max : ${maxVal}` : ''})
            </span>
          </label>

          <div className="flex items-center gap-2">
            <button type="button"
              onClick={() => setFormFields(prev => ({ ...prev, [field.name]: Math.max(minVal, displayValue - 1) }))}
              disabled={displayValue <= minVal}
              className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title={`Minimum : ${minVal}`}
            >
              <Minus className="w-4 h-4" />
            </button>

            <input
              type="number"
              name={field.name}
              value={formFields[field.name] === '' ? '' : displayValue}
              onChange={handleFieldChange}
              onBlur={handleNumberBlur}
              min={minVal}
              max={maxVal}
              className="flex-1 text-center px-3 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm font-semibold"
            />

            <button type="button"
              onClick={() => {
                const newVal = maxVal !== undefined ? Math.min(maxVal, displayValue + 1) : displayValue + 1;
                setFormFields(prev => ({ ...prev, [field.name]: newVal }));
              }}
              disabled={maxVal !== undefined && displayValue >= maxVal}
              className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title={maxVal !== undefined ? `Maximum : ${maxVal}` : 'Augmenter'}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Valeur : <span className="font-semibold">{displayValue}</span> — Plage : <span className="font-semibold">{minVal}</span> à <span className="font-semibold">{maxVal ?? '∞'}</span>
            </p>
          </div>

          {field.helpText && (
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Info className="w-3 h-3 flex-shrink-0" />{field.helpText}
            </p>
          )}
        </div>
      );
    }

    // Champs standard
    return (
      <div key={field.name} className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {field.type === 'select' ? (
          <select name={field.name} value={formFields[field.name] || ''} onChange={handleFieldChange}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm">
            <option value="">Sélectionnez...</option>
            {field.options?.map(opt => <option key={opt.value ?? opt} value={opt.value ?? opt}>{opt.label ?? opt}</option>)}
          </select>
        ) : field.type === 'textarea' ? (
          <textarea name={field.name} value={formFields[field.name] || ''} onChange={handleFieldChange}
            placeholder={field.placeholder} rows={3}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm resize-none" />
        ) : (
          <div className="relative">
            <input type={field.type || 'text'} name={field.name} value={formFields[field.name] || ''}
              onChange={handleFieldChange} placeholder={field.placeholder}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm" />
            {field.helpText && field.name === 'imei' && (
              <HelpCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 cursor-help" title={field.helpText} />
            )}
          </div>
        )}
        {field.helpText && field.name !== 'imei' && (
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Info className="w-3 h-3 flex-shrink-0" />{field.helpText}
          </p>
        )}
      </div>
    );
  };

  const renderInstructions = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) =>
      urlRegex.test(part)
        ? <a key={i} href={part} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 underline underline-offset-2 break-all">
            {part}<ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        : <span key={i}>{part}</span>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
      modalVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className={`relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col transform transition-all duration-300 ${
        modalVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      }`}>
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${theme.gradient} rounded-t-2xl`} />

        <button onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto flex-1 p-6 pt-7">

          {/* En-tête */}
          <div className="flex items-center gap-4 mb-5">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${theme.gradient} p-0.5 flex-shrink-0`}>
              <div className="w-full h-full rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center">
                <Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{service.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Étape {step} sur 3</p>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="flex gap-1 mb-5">
            {[1, 2, 3].map(s => (
              <div key={s} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
                s <= step ? `bg-gradient-to-r ${theme.gradient}` : 'bg-gray-200 dark:bg-gray-700'
              }`} />
            ))}
          </div>

          {/* Récapitulatif service */}
          <div className={`${theme.light} p-4 rounded-xl border ${theme.border} mb-4`}>
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">{service.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                  {service.description || 'Service professionnel'}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className={`text-xs ${theme.text}`}>{quantityFieldDef && effectiveQty > 1 ? 'Total' : 'Prix'}</span>
                <p className={`text-2xl font-bold ${theme.text}`}>{fmtFG(totalPrice)} FG</p>
                {quantityFieldDef && effectiveQty > 1 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">{fmtFG(unitPrice)} FG × {effectiveQty}</p>
                )}
              </div>
            </div>
            {service.deliveryTime && (
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Délai : {service.deliveryTime}</span>
              </div>
            )}
          </div>

          {/* Solde */}
          <div className={`p-3 rounded-xl mb-5 border ${
            isBalanceSufficient
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className={`w-4 h-4 ${isBalanceSufficient ? 'text-green-500' : 'text-red-500'}`} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Solde disponible</span>
              </div>
              <span className={`font-bold ${isBalanceSufficient ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {fmtFG(currentBalance)} FG
              </span>
            </div>
            {isBalanceSufficient && (
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                Après commande : <span className="font-semibold text-green-600 dark:text-green-400">{fmtFG(remainingBalance)} FG</span>
              </p>
            )}
          </div>

          {/* Instructions admin */}
          {serviceDetails?.instructions && (
            <div className="mb-5 rounded-xl border border-amber-200 dark:border-amber-800 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800">
                <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">Instructions</span>
              </div>
              <div className="p-4 max-h-52 overflow-y-auto bg-white dark:bg-slate-800/50">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {renderInstructions(serviceDetails.instructions)}
                </p>
              </div>
            </div>
          )}

          {fetchingDetails && (
            <div className="flex items-center justify-center py-6 text-gray-400">
              <Loader className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm">Chargement du service...</span>
            </div>
          )}

          {/* ── Étape 1 : Formulaire ── */}
          {step === 1 && !fetchingDetails && (
            <div className="space-y-4">
              {formFieldDefs.map(renderField)}

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      {error.split('\n').map((line, idx) =>
                        line.trim() && <p key={idx} className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">{line}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium">
                  Annuler
                </button>
                <button type="button" onClick={handleNext} disabled={isContinueDisabled}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium flex items-center justify-center gap-2 group">
                  Continuer
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* ── Étape 2 : Confirmation ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Récapitulatif</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">Service</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{service.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-gray-400">{quantityFieldDef ? 'Prix unitaire' : 'Prix'}</dt>
                    <dd className="font-medium text-green-600 dark:text-green-400">{fmtFG(unitPrice)} FG</dd>
                  </div>
                  {formFieldDefs.map(field => {
                    const value = formFields[field.name];
                    if (!value) return null;
                    return (
                      <div key={field.name} className="flex justify-between gap-4">
                        <dt className="text-gray-500 dark:text-gray-400 flex-shrink-0">{field.label}</dt>
                        <dd className="font-mono text-gray-900 dark:text-white text-right break-all">
                          {field.type === 'password' ? '••••••••' : value}
                        </dd>
                      </div>
                    );
                  })}
                  {quantityFieldDef && (
                    <div className="flex justify-between pt-1 border-t border-dashed border-gray-300 dark:border-gray-600">
                      <dt className="font-medium text-gray-900 dark:text-white">Total ({effectiveQty} × {fmtFG(unitPrice)} FG)</dt>
                      <dd className="font-bold text-green-600 dark:text-green-400">{fmtFG(totalPrice)} FG</dd>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <dt className="font-medium text-gray-900 dark:text-white">Solde après commande</dt>
                    <dd className="font-bold text-green-600 dark:text-green-400">{fmtFG(remainingBalance)} FG</dd>
                  </div>
                </dl>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium">
                  Retour
                </button>
                <button type="button" onClick={handleSubmit}
                  disabled={loading || !isBalanceSufficient || effectiveQty < qtyMin}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg disabled:opacity-50 transition-all text-sm font-medium">
                  {loading
                    ? <span className="flex items-center justify-center gap-2"><Loader className="w-4 h-4 animate-spin" /> Traitement...</span>
                    : 'Confirmer la commande'
                  }
                </button>
              </div>
            </div>
          )}

          {/* ── Étape 3 : Succès ── */}
          {step === 3 && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {success || 'Commande confirmée !'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Votre commande a été traitée avec succès. Vous allez être redirigé...
              </p>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Téléversement : {uploadProgress}%</p>
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
// // src/components/ServiceModal.jsx
// import { useState, useEffect } from 'react';
// import {
//   X,
//   CreditCard,
//   AlertCircle,
//   CheckCircle,
//   Upload,
//   Smartphone,
//   Key,
//   Globe,
//   Clock,
//   FileText,
//   HelpCircle,
//   Info,
//   ChevronRight,
//   Loader,
//   Server,
//   Wifi,
//   ExternalLink,
// } from 'lucide-react';
// import { useAuth } from '../hooks/useAuth';
// import serviceService from '../services/serviceService';
// import orderService from '../services/orderService';
// import axios from 'axios';

// const fmtFG = (n) => new Intl.NumberFormat('fr-FR').format(n || 0);

// /**
//  * ServiceModal — Modal de commande de service.
//  *
//  * Props:
//  *  - isOpen      {boolean}   Indique si le modal est ouvert.
//  *  - onClose     {function}  Ferme le modal.
//  *  - service     {object}    Service sélectionné (données légères depuis la liste).
//  *  - userBalance {number}    Solde de l'utilisateur.
//  */
// const ServiceModal = ({ isOpen, onClose, service, userBalance }) => {
//   const { user, updateUserBalance } = useAuth();

//   const [serviceDetails, setServiceDetails] = useState(null);
//   const [formFields, setFormFields]         = useState({});
//   const [loading, setLoading]               = useState(false);
//   const [fetchingDetails, setFetchingDetails] = useState(false);
//   const [error, setError]                   = useState('');
//   const [success, setSuccess]               = useState('');
//   const [selectedFile, setSelectedFile]     = useState(null);
//   const [uploadError, setUploadError]       = useState('');
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [step, setStep]                     = useState(1); // 1: formulaire, 2: confirmation, 3: succès
//   const [modalVisible, setModalVisible]     = useState(false);

//   // Animation d'entrée ──────────────────────────────────────────
//   // useBodyScrollLock(isOpen) gère le scroll — pas besoin de le dupliquer ici
//   useEffect(() => {
//     setModalVisible(isOpen);
//   }, [isOpen]);

//   // ─── Chargement des détails complets du service ───────────────────────────
//   useEffect(() => {
//     if (!service) { setServiceDetails(null); return; }

//     setFetchingDetails(true);
//     setError('');
//     setSuccess('');
//     setStep(1);
//     setSelectedFile(null);
//     setUploadProgress(0);

//     serviceService.getServiceById(service._id)
//       .then(res => {
//         const data = res.data?.data || res.data;
//         setServiceDetails(data);

//         // Initialiser les champs du formulaire
//         const fields = getFormFields(data);
//         const initial = {};
//         fields.forEach(f => { initial[f.name] = f.defaultValue ?? ''; });
//         setFormFields(initial);
//       })
//       .catch(err => {
//         console.error('Erreur chargement service:', err);
//         setServiceDetails(null);
//         setFormFields({});
//       })
//       .finally(() => setFetchingDetails(false));
//   }, [service]);

//   if (!isOpen || !service) return null;

//   // ─── Catégorie ────────────────────────────────────────────────────────────
//   const resolveCategory = (raw = '') => {
//     const c = raw.toString().trim();
//     if (c.includes('IMEI'))                         return 'IMEI';
//     if (c.includes('Server'))                        return 'Server';
//     if (c.includes('Credit') || c.includes('License') || c.includes('Licence')) return 'Credit';
//     if (c.includes('Rental'))                        return 'Rental';
//     if (c.includes('Remote'))                        return 'Remote';
//     return 'IMEI';
//   };

//   const rawCategory = serviceDetails?.category || service?.category || service?.type || 'IMEI';
//   const category    = resolveCategory(rawCategory);

//   // ─── Thème par catégorie ──────────────────────────────────────────────────
//   const themes = {
//     IMEI:    { icon: Smartphone, gradient: 'from-blue-500 to-cyan-500',     light: 'bg-blue-50 dark:bg-blue-900/20',     text: 'text-blue-600 dark:text-blue-400',     border: 'border-blue-200 dark:border-blue-800',     label: 'Déblocage IMEI' },
//     Credit:  { icon: Key,        gradient: 'from-green-500 to-emerald-500', light: 'bg-green-50 dark:bg-green-900/20',   text: 'text-green-600 dark:text-green-400',   border: 'border-green-200 dark:border-green-800',   label: 'Crédit Logiciel' },
//     Server:  { icon: Server,     gradient: 'from-orange-500 to-red-500',    light: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800', label: 'Service Serveur' },
//     Rental:  { icon: Globe,      gradient: 'from-purple-500 to-pink-500',   light: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800', label: 'Location' },
//     Remote:  { icon: Wifi,       gradient: 'from-indigo-500 to-purple-500', light: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800', label: 'Assistance Remote' },
//   };

//   const theme = themes[category] || themes.IMEI;
//   const Icon  = theme.icon;

//   // ─── Champs du formulaire ─────────────────────────────────────────────────
//   /**
//    * Priorité : fieldsRequired sauvegardés par l'admin > champs par défaut par catégorie.
//    */
//   const getFormFields = (svc) => {
//     if (svc?.fieldsRequired?.length) return svc.fieldsRequired;

//     const defaults = {
//       IMEI: [
//         { name: 'imei',     label: 'Numéro IMEI',       type: 'text',  required: true,  placeholder: '123456789012345', helpText: 'Composez *#06# pour obtenir votre IMEI', validation: { pattern: '^[0-9]{15}$', message: "L'IMEI doit contenir 15 chiffres" } },
//         { name: 'imageUrl', label: 'Lien image (optionnel)', type: 'url', required: false, placeholder: 'https://exemple.com/photo.jpg', helpText: 'Photo de l\'étiquette IMEI ou du téléphone' },
//       ],
//       Server: [
//         { name: 'username', label: "Nom d'utilisateur (logiciel)", type: 'text',  required: true, placeholder: 'john_doe',          helpText: 'Nom d\'utilisateur du compte logiciel' },
//         { name: 'email',    label: 'Email (compte logiciel)',       type: 'email', required: true, placeholder: 'votre@email.com',   helpText: 'Email utilisé pour ouvrir le compte logiciel' },
//       ],
//       Credit: [
//         { name: 'email',    label: 'Email de réception', type: 'email',  required: true, placeholder: 'votre@email.com', helpText: 'Les identifiants seront envoyés ici' },
//         { name: 'quantity', label: 'Quantité',           type: 'number', required: true, defaultValue: 1, min: 1, max: 10, helpText: 'Nombre de crédits souhaités' },
//       ],
//       Rental: [
//         { name: 'notes',    label: 'Notes (optionnel)', type: 'textarea', required: false, placeholder: 'Informations complémentaires...' },
//       ],
//       Remote: [
//         { name: 'remoteId',       label: 'ID de connexion',      type: 'text',     required: true, placeholder: 'ID AnyDesk/TeamViewer...' },
//         { name: 'remotePassword', label: 'Mot de passe temporaire', type: 'password', required: true, placeholder: 'Mot de passe pour la session' },
//       ],
//     };

//     return defaults[category] || [];
//   };

//   const formFieldDefs = getFormFields(serviceDetails);

//   // ─── Quantité / montant total ──────────────────────────────────────────────
//   // Si le service définit un champ numérique "quantity" (ex: vente de crédits
//   // de licence), le prix total = prix unitaire × quantité. Le backend recalcule
//   // aussi ce montant côté serveur ; on n'envoie donc jamais un montant "brut".
//   const quantityFieldDef = formFieldDefs.find(f => f.name === 'quantity' && f.type === 'number');
//   const qtyMin = quantityFieldDef?.min ?? 1;
//   const qtyMax = quantityFieldDef?.max;
//   const rawQty = quantityFieldDef ? parseInt(formFields.quantity, 10) : 1;
//   const effectiveQty = quantityFieldDef && Number.isFinite(rawQty) && rawQty >= 1 ? rawQty : 1;
//   const unitPrice  = service.price || 0;
//   const totalPrice = quantityFieldDef ? unitPrice * effectiveQty : unitPrice;

//   // ─── Solde ────────────────────────────────────────────────────────────────
//   const currentBalance      = user?.balance ?? userBalance ?? 0;
//   const isBalanceSufficient = currentBalance >= totalPrice;
//   const remainingBalance    = currentBalance - totalPrice;

//   // ─── Handlers ─────────────────────────────────────────────────────────────
//   const handleFieldChange = (e) => {
//     const { name, value } = e.target;
//     setFormFields(prev => ({ ...prev, [name]: value }));
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     if (file.size > 5 * 1024 * 1024) { setUploadError('Le fichier ne doit pas dépasser 5 Mo'); return; }
//     const allowed = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
//     if (!allowed.includes(file.type)) { setUploadError('Format accepté : JPEG, PNG, GIF, PDF'); return; }
//     setSelectedFile(file);
//     setUploadError('');
//   };

//   const validateForm = () => {
//     for (const field of formFieldDefs) {
//       const value = formFields[field.name]?.toString().trim() || '';
//       if (field.required && !value) { setError(`${field.label} est requis`); return false; }
//       if (field.validation?.pattern && value) {
//         if (!new RegExp(field.validation.pattern).test(value)) { setError(field.validation.message || `${field.label} n'est pas valide`); return false; }
//       }
//       if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { setError('Adresse email invalide'); return false; }
//       if (field.name === 'quantity' && field.type === 'number') {
//         const n = parseInt(value, 10);
//         if (!Number.isFinite(n) || n < qtyMin || (qtyMax != null && n > qtyMax)) {
//           setError(`${field.label} doit être un nombre entre ${qtyMin} et ${qtyMax ?? '∞'}`);
//           return false;
//         }
//       }
//     }
//     return true;
//   };

//   const handleNext = () => {
//     if (!isBalanceSufficient) { setError('Solde insuffisant. Veuillez recharger votre compte.'); return; }
//     if (validateForm()) { setError(''); setStep(2); }
//   };

//   const handleSubmit = async (e) => {
//     e?.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const orderResponse = await orderService.placeOrder({
//         serviceId: service._id,
//         userSubmittedData: formFields,
//         quantity: effectiveQty,
//       });

//       if (selectedFile) {
//         const formData = new FormData();
//         formData.append('document', selectedFile);
//         await axios.post(`/api/orders/${orderResponse.data.order._id}/upload-document`, formData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//           onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total)),
//         });
//       }

//       if (updateUserBalance) updateUserBalance(orderResponse.data.newBalance);
//       setSuccess('Commande confirmée avec succès !');
//       setStep(3);
//       setTimeout(onClose, 2500);
//     } catch (err) {
//       setError(err.response?.data?.message || err.response?.data?.error || 'veillez entrer une quantité superieur ou égal a la quantité minimal');
//       setStep(1);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ─── Rendu des champs ─────────────────────────────────────────────────────
//   const renderField = (field) => (
//     <div key={field.name} className="space-y-1.5">
//       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//         {field.label}
//         {field.required && <span className="text-red-500 ml-1">*</span>}
//       </label>

//       {field.type === 'select' ? (
//         <select
//           name={field.name}
//           value={formFields[field.name] || ''}
//           onChange={handleFieldChange}
//           className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
//         >
//           <option value="">Sélectionnez...</option>
//           {field.options?.map(opt => (
//             <option key={opt.value ?? opt} value={opt.value ?? opt}>
//               {opt.label ?? opt}
//             </option>
//           ))}
//         </select>
//       ) : field.type === 'textarea' ? (
//         <textarea
//           name={field.name}
//           value={formFields[field.name] || ''}
//           onChange={handleFieldChange}
//           placeholder={field.placeholder}
//           rows={3}
//           className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm resize-none"
//         />
//       ) : (
//         <div className="relative">
//           <input
//             type={field.type || 'text'}
//             name={field.name}
//             value={formFields[field.name] || ''}
//             onChange={handleFieldChange}
//             placeholder={field.placeholder}
//             min={field.min}
//             max={field.max}
//             className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
//           />
//           {field.helpText && field.name === 'imei' && (
//             <HelpCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 cursor-help" title={field.helpText} />
//           )}
//         </div>
//       )}

//       {field.helpText && field.name !== 'imei' && (
//         <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
//           <Info className="w-3 h-3 flex-shrink-0" />
//           {field.helpText}
//         </p>
//       )}
//     </div>
//   );

//   // ─── Section instructions ─────────────────────────────────────────────────
//   /**
//    * Transforme les URLs dans le texte en liens cliquables.
//    */
//   const renderInstructions = (text) => {
//     const urlRegex = /(https?:\/\/[^\s]+)/g;
//     const parts = text.split(urlRegex);
//     return parts.map((part, i) =>
//       urlRegex.test(part) ? (
//         <a
//           key={i}
//           href={part}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 underline underline-offset-2 break-all"
//         >
//           {part}
//           <ExternalLink className="w-3 h-3 flex-shrink-0" />
//         </a>
//       ) : (
//         <span key={i}>{part}</span>
//       )
//     );
//   };

//   // ─── Render ───────────────────────────────────────────────────────────────
//   return (
//     <div
//       className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
//         modalVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
//       }`}
//     >
//       {/* Overlay */}
//       <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

//       {/* Modal */}
//       <div
//         className={`relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col transform transition-all duration-300 ${
//           modalVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
//         }`}
//       >
//         {/* Bandeau couleur */}
//         <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${theme.gradient} rounded-t-2xl`} />

//         {/* Bouton fermer */}
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//         >
//           <X className="w-5 h-5" />
//         </button>

//         {/* ── Contenu scrollable ── */}
//         <div className="overflow-y-auto flex-1 p-6 pt-7">

//           {/* En-tête */}
//           <div className="flex items-center gap-4 mb-5">
//             <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${theme.gradient} p-0.5 flex-shrink-0`}>
//               <div className="w-full h-full rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center">
//                 <Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
//               </div>
//             </div>
//             <div>
//               <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
//                 {service.name}
//               </h2>
//               <p className="text-sm text-gray-500 dark:text-gray-400">Étape {step} sur 3</p>
//             </div>
//           </div>

//           {/* Barre de progression */}
//           <div className="flex gap-1 mb-5">
//             {[1, 2, 3].map(s => (
//               <div
//                 key={s}
//                 className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
//                   s <= step ? `bg-gradient-to-r ${theme.gradient}` : 'bg-gray-200 dark:bg-gray-700'
//                 }`}
//               />
//             ))}
//           </div>

//           {/* Récapitulatif service */}
//           <div className={`${theme.light} p-4 rounded-xl border ${theme.border} mb-4`}>
//             <div className="flex justify-between items-start gap-3">
//               <div className="min-w-0">
//                 <p className="font-semibold text-gray-900 dark:text-white truncate">{service.name}</p>
//                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
//                   {service.description || 'Service professionnel'}
//                 </p>
//               </div>
//               <div className="text-right flex-shrink-0">
//                 <span className={`text-xs ${theme.text}`}>{quantityFieldDef && effectiveQty > 1 ? 'Total' : 'Prix'}</span>
//                 <p className={`text-2xl font-bold ${theme.text}`}>{fmtFG(totalPrice)} FG</p>
//                 {quantityFieldDef && effectiveQty > 1 && (
//                   <p className="text-xs text-gray-500 dark:text-gray-400">{fmtFG(unitPrice)} FG × {effectiveQty}</p>
//                 )}
//               </div>
//             </div>
//             {service.deliveryTime && (
//               <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
//                 <Clock className="w-4 h-4" />
//                 <span>Délai : {service.deliveryTime}</span>
//               </div>
//             )}
//           </div>

//           {/* Solde */}
//           <div className={`p-3 rounded-xl mb-5 border ${
//             isBalanceSufficient
//               ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
//               : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
//           }`}>
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <CreditCard className={`w-4 h-4 ${isBalanceSufficient ? 'text-green-500' : 'text-red-500'}`} />
//                 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Solde disponible</span>
//               </div>
//               <span className={`font-bold ${isBalanceSufficient ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
//                 {fmtFG(currentBalance)} FG
//               </span>
//             </div>
//             {isBalanceSufficient && (
//               <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
//                 Après commande : <span className="font-semibold text-green-600 dark:text-green-400">{fmtFG(remainingBalance)} FG</span>
//               </p>
//             )}
//           </div>

//           {/* ── Instructions admin (si disponibles) ── */}
//           {serviceDetails?.instructions && (
//             <div className="mb-5 rounded-xl border border-amber-200 dark:border-amber-800 overflow-hidden">
//               <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800">
//                 <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
//                 <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
//                   Instructions
//                 </span>
//               </div>
//               <div className="p-4 max-h-52 overflow-y-auto bg-white dark:bg-slate-800/50">
//                 <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
//                   {renderInstructions(serviceDetails.instructions)}
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Chargement des détails */}
//           {fetchingDetails && (
//             <div className="flex items-center justify-center py-6 text-gray-400">
//               <Loader className="w-5 h-5 animate-spin mr-2" />
//               <span className="text-sm">Chargement du service...</span>
//             </div>
//           )}

//           {/* ── Étape 1 : Formulaire ── */}
//           {step === 1 && !fetchingDetails && (
//             <div className="space-y-4">
//               {formFieldDefs.map(renderField)}

//               {error && (
//                 <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
//                   <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
//                     <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
//                   </p>
//                 </div>
//               )}

//               <div className="flex gap-3 pt-2">
//                 <button
//                   type="button"
//                   onClick={onClose}
//                   className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
//                 >
//                   Annuler
//                 </button>
//                 <button
//         type="button"
//         onClick={handleNext}
//         disabled={!isBalanceSufficient || (category === 'Credit' && effectiveQty < qtyMin)}
//         className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium flex items-center justify-center gap-2 group"
//       >
//         Continuer
//         <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
//           </button>
//                 {/* <button
//                   type="button"
//                   onClick={handleNext}
//                   disabled={!isBalanceSufficient}
//                   className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium flex items-center justify-center gap-2 group"
//                 >
//                   Continuer
//                   <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
//                 </button> */}
//               </div>
//             </div>
//           )}

//           {/* ── Étape 2 : Confirmation ── */}
//           {step === 2 && (
//             <div className="space-y-4">
//               <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
//                 <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Récapitulatif</h3>
//                 <dl className="space-y-2 text-sm">
//                   <div className="flex justify-between">
//                     <dt className="text-gray-500 dark:text-gray-400">Service</dt>
//                     <dd className="font-medium text-gray-900 dark:text-white">{service.name}</dd>
//                   </div>
//                   <div className="flex justify-between">
//                     <dt className="text-gray-500 dark:text-gray-400">{quantityFieldDef ? 'Prix unitaire' : 'Prix'}</dt>
//                     <dd className="font-medium text-green-600 dark:text-green-400">{fmtFG(unitPrice)} FG</dd>
//                   </div>
//                   {formFieldDefs.map(field => {
//                     const value = formFields[field.name];
//                     if (!value) return null;
//                     return (
//                       <div key={field.name} className="flex justify-between gap-4">
//                         <dt className="text-gray-500 dark:text-gray-400 flex-shrink-0">{field.label}</dt>
//                         <dd className="font-mono text-gray-900 dark:text-white text-right break-all">
//                           {field.type === 'password' ? '••••••••' : value}
//                         </dd>
//                       </div>
//                     );
//                   })}
//                   {quantityFieldDef && effectiveQty > qtyMin && (
//                     <div className="flex justify-between">
//                       <dt className="font-medium text-gray-900 dark:text-white">Total</dt>
//                       <dd className="font-bold text-green-600 dark:text-green-400">{fmtFG(totalPrice)} FG</dd>
//                     </div>
//                   )}
//                   <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
//                     <dt className="font-medium text-gray-900 dark:text-white">Solde après commande</dt>
//                     <dd className="font-bold text-green-600 dark:text-green-400">{fmtFG(remainingBalance)} FG</dd>
//                   </div>
//                 </dl>
//               </div>

//               <div className="flex gap-3">
//                 <button
//                   type="button"
//                   onClick={() => setStep(1)}
//                   className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
//                 >
//                   Retour
//                 </button>
//                 <button
//                   type="button"
//                   onClick={handleSubmit}
//                   disabled={loading || !isBalanceSufficient || effectiveQty < qtyMin}
//                   className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg disabled:opacity-50 transition-all text-sm font-medium"
//                 >
//                   {loading ? (
//                     <span className="flex items-center justify-center gap-2">
//                       <Loader className="w-4 h-4 animate-spin" /> Traitement...
//                     </span>
//                   ) : 'Confirmer la commande'}
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* ── Étape 3 : Succès ── */}
//           {step === 3 && (
//             <div className="text-center py-8">
//               <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
//                 <CheckCircle className="w-10 h-10 text-green-500" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
//                 {success || 'Commande confirmée !'}
//               </h3>
//               <p className="text-gray-500 dark:text-gray-400 text-sm">
//                 Votre commande a été traitée avec succès. Vous allez être redirigé...
//               </p>
//               {uploadProgress > 0 && uploadProgress < 100 && (
//                 <div className="mt-4">
//                   <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//                     <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
//                   </div>
//                   <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Téléversement : {uploadProgress}%</p>
//                 </div>
//               )}
//             </div>
//           )}

//         </div>{/* fin scroll */}
//       </div>{/* fin modal */}
//     </div>
//   );
// };

// export default ServiceModal;