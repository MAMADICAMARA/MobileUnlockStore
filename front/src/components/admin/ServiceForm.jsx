// src/components/admin/ServiceForm.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  HelpCircle, AlertCircle, Plus, Trash2, Image, X,
  Info, Tag, Clock, FileText, ListChecks, Sparkles, Power,
} from 'lucide-react';

// ─── Sous-composant : en-tête de section réutilisable ──────────────────────────
const SectionHeader = ({ icon: Icon, title, hint }) => (
  <div className="flex items-center gap-2 mb-3">
    <Icon className="w-4 h-4 text-blue-500 flex-shrink-0" />
    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
    {hint && <span className="text-xs text-slate-400 font-normal">{hint}</span>}
  </div>
);

// ─── Champs générés automatiquement selon la catégorie ─────────────────────────
const STANDARD_FIELD_NAMES = {
  IMEI:   ['imei', 'serialNumber', 'imageUrl'],
  Server: ['username', 'email'],
  Credit: ['email', 'quantity'],
  Rental: [],
};

const ServiceForm = ({ service, onSubmit, isLoading, onCancel }) => {
  const [customFields, setCustomFields] = useState([]);
  const [imagePreview, setImagePreview] = useState(service?.imageUrl || '');

  const categoryMapping = {
    'IMEI':    { display: '📱 IMEI Services',       value: 'IMEI' },
    'Server':  { display: '🖥️ Serveur',             value: 'Server' },
    'Rental':  { display: '🌐 Location & Remote',   value: 'Rental' },
    'Credit':  { display: '🔑 Crédits',             value: 'Credit' },
  };

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: service ? {
      name:                   service.name || '',
      description:            service.description || '',
      price:                  service.price || '',
      category:               service.category || '',
      deliveryTime:           service.deliveryTime || '',
      instructions:           service.instructions || '',
      active:                 service.active !== false,
      imageUrl:               service.imageUrl || '',
      imeiRequired:           service.metadata?.imei?.requireImei ?? true,
      snRequired:             service.metadata?.imei?.requireSn ?? false,
      imageRequired:          service.metadata?.imei?.requireImage ?? false,
      usernameRequired:       service.metadata?.serveur?.requireUsername ?? true,
      emailRequired:          service.metadata?.serveur?.requireEmail ?? true,
      minQuantity:            service.metadata?.credit?.minQuantity || 1,
      maxQuantity:            service.metadata?.credit?.maxQuantity || 1,
    } : {
      name: '', description: '', price: '', category: '', deliveryTime: '', instructions: '',
      active: true,
      imageUrl: '',
      imeiRequired: true, snRequired: false, imageRequired: false,
      usernameRequired: true, emailRequired: true,
      minQuantity: 1, maxQuantity: 1,
    }
  });

  const selectedCategory = watch('category');

  useEffect(() => {
    if (!service?.fieldsRequired) return;
    const standardNames = STANDARD_FIELD_NAMES[service.category] || [];
    setCustomFields(service.fieldsRequired.filter(f => !standardNames.includes(f.name)));
  }, [service]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setImagePreview(base64);
      setValue('imageUrl', base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    setValue('imageUrl', '');
    const fileInput = document.getElementById('imageUploadInput');
    if (fileInput) fileInput.value = '';
  };

  // ✅ Champs dynamiques par catégorie — minQuantity + maxQuantity pour Credit
  const categoryFields = {
    'IMEI': [
      { name: 'imeiRequired',  label: 'Numéro IMEI requis',        type: 'checkbox' },
      { name: 'snRequired',    label: 'Serial Number (SN) requis',  type: 'checkbox' },
      { name: 'imageRequired', label: 'Photo / lien image requis',  type: 'checkbox' },
    ],
    'Server': [
      { name: 'usernameRequired', label: "Nom d'utilisateur requis", type: 'checkbox' },
      { name: 'emailRequired',    label: 'Email requis',             type: 'checkbox' },
    ],
    'Credit': [
      { name: 'minQuantity',   label: 'Quantité minimale par commande', type: 'number', placeholder: 'ex: 10', min: 1, max: 10000 },
      { name: 'maxQuantity',   label: 'Quantité maximale par commande', type: 'number', placeholder: 'ex: 100', min: 1, max: 10000 },
    ],
    'Rental': [],
  };

  const addCustomField = () => {
    setCustomFields([...customFields, { name: `custom_${Date.now()}`, label: '', type: 'text', required: true, placeholder: '' }]);
  };

  const removeCustomField = (index) => setCustomFields(customFields.filter((_, i) => i !== index));

  const updateCustomField = (index, field, value) => {
    const updated = [...customFields];
    updated[index] = { ...updated[index], [field]: value };
    setCustomFields(updated);
  };

  const onFormSubmit = (data) => {
    const backendCategory = data.category;
    const fieldsRequired  = [];

    if (backendCategory === 'IMEI') {
      if (data.imeiRequired)  fieldsRequired.push({ name: 'imei',         label: 'Numéro IMEI',        type: 'text',  required: true,  validation: '^[0-9]{15}$', placeholder: '15 chiffres sans espaces', helpText: 'Composez *#06# pour obtenir votre IMEI' });
      if (data.snRequired)    fieldsRequired.push({ name: 'serialNumber', label: 'Numéro de série (SN)', type: 'text', required: true,  placeholder: 'Numéro de série du téléphone' });
      if (data.imageRequired) fieldsRequired.push({ name: 'imageUrl',     label: 'Photo du téléphone', type: 'url',  required: true,  placeholder: 'https://exemple.com/photo.jpg', helpText: "Photo de l'étiquette IMEI ou de l'écran" });
    }

    if (backendCategory === 'Server') {
      if (data.usernameRequired) fieldsRequired.push({ name: 'username', label: "Nom d'utilisateur (logiciel)", type: 'text',  required: true, validation: '^[a-zA-Z0-9_-]{3,20}$', placeholder: '3-20 caractères' });
      if (data.emailRequired)    fieldsRequired.push({ name: 'email',    label: 'Email (compte logiciel)',      type: 'email', required: true, placeholder: 'utilisateur@exemple.com', helpText: 'Email du compte logiciel, pas celui du site' });
    }

    // ✅ Pour Credit : générer fieldsRequired avec quantity, min/max depuis metadata
    if (backendCategory === 'Credit') {
      fieldsRequired.push({ name: 'email', label: 'Email de réception', type: 'email', required: true, placeholder: 'utilisateur@exemple.com', helpText: 'Les identifiants seront envoyés ici' });
      const minQty = Number(data.minQuantity) || 1;
      const maxQty = Number(data.maxQuantity) || 1;
      fieldsRequired.push({
        name: 'quantity',
        label: 'Quantité',
        type: 'number',
        required: true,
        defaultValue: minQty,
        min: minQty,
        max: maxQty,
        helpText: `Minimum ${minQty} crédit(s), maximum ${maxQty} crédit(s)`
      });
    }

    const standardNames = STANDARD_FIELD_NAMES[backendCategory] || [];
    customFields.forEach(field => {
      if (field.name && field.label && !standardNames.includes(field.name)) {
        fieldsRequired.push({ name: field.name, label: field.label, type: field.type || 'text', required: field.required !== false, placeholder: field.placeholder || '' });
      }
    });

    const metadata = {
      imei:     { requireImei: data.imeiRequired, requireSn: data.snRequired, requireImage: data.imageRequired },
      serveur:  { requireUsername: data.usernameRequired, requireEmail: data.emailRequired },
      credit:   { minQuantity: Number(data.minQuantity) || 1, maxQuantity: Number(data.maxQuantity) || 1 },
    };

    onSubmit({
      name:         data.name,
      description:  data.description,
      price:        Number(data.price),
      category:     backendCategory,
      deliveryTime: data.deliveryTime,
      instructions: data.instructions,
      active:       data.active,
      imageUrl:     data.imageUrl,
      fieldsRequired,
      metadata,
    });
  };

  const inputClass = 'mt-1.5 block w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow';

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">

      {/* ── Informations générales ── */}
      <div className="bg-gray-50/60 dark:bg-slate-900/30 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 sm:p-5">
        <SectionHeader icon={Info} title="Informations générales" />
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nom du service <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name', { required: 'Le nom est obligatoire' })}
              placeholder="Ex: Déblocage IMEI, Crédit TFM Tool Pro..."
              className={inputClass}
            />
            {errors.name && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('description', { required: 'La description est obligatoire' })}
              rows={3}
              placeholder="Décrivez le service en quelques phrases claires et attractives..."
              className={`${inputClass} resize-y`}
            />
            {errors.description && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{errors.description.message}</p>}
          </div>

          <label className="flex items-center gap-2.5 p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              {...register('active')}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
            />
            <Power className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Service actif <span className="text-gray-400">(visible par les clients)</span></span>
          </label>
        </div>
      </div>

      {/* ── Tarification & catégorie ── */}
      <div className="bg-gray-50/60 dark:bg-slate-900/30 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 sm:p-5">
        <SectionHeader icon={Tag} title="Tarification & catégorie" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Prix (FG) <span className="text-red-500">*</span>
            </label>
            <input
              type="number" step="0.01" min="0"
              {...register('price', { required: 'Le prix est obligatoire', min: { value: 0, message: 'Le prix doit être positif' } })}
              placeholder="0.00"
              className={inputClass}
            />
            {errors.price && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{errors.price.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Catégorie <span className="text-red-500">*</span>
            </label>
            <select
              {...register('category', { required: 'La catégorie est obligatoire' })}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="">Sélectionner une catégorie...</option>
              {Object.entries(categoryMapping).map(([key, { display }]) => (
                <option key={key} value={key}>{display}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{errors.category.message}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Délai de livraison <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('deliveryTime', { required: 'Le délai est obligatoire' })}
              placeholder="Ex: 24h, 2-3 jours, Instantané"
              className={inputClass}
            />
            {errors.deliveryTime && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{errors.deliveryTime.message}</p>}
          </div>
        </div>
      </div>

      {/* ── Image ── */}
      <div className="bg-gray-50/60 dark:bg-slate-900/30 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 sm:p-5">
        <SectionHeader icon={Image} title="Image du service" hint="(affichée uniquement sur ordinateur)" />
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">
                Télécharger une image
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <input
                  id="imageUploadInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300 file:cursor-pointer"
                />
                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1 whitespace-nowrap"
                  >
                    <X className="w-4 h-4" /> Supprimer
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Formats acceptés : PNG, JPG, WEBP (max 2 Mo)
              </p>
            </div>

            <div>
              {imagePreview ? (
                <div className="flex items-center gap-3">
                  <div className="p-1 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                    <img src={imagePreview} alt="Aperçu" className="h-16 w-16 object-cover rounded-md" />
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">Aperçu</span>
                </div>
              ) : (
                <div className="h-16 flex items-center text-gray-400 dark:text-gray-500 text-sm">
                  <span>Aucune image sélectionnée</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Instructions ── */}
      <div className="bg-gray-50/60 dark:bg-slate-900/30 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 sm:p-5">
        <SectionHeader icon={FileText} title="Instructions / Tutoriel" hint="(optionnel)" />
        <textarea
          {...register('instructions')}
          rows={6}
          placeholder={`Écrivez ici tout ce que le client doit savoir :\n• Lien de téléchargement : https://...\n• Étapes à suivre (1., 2., 3.)\n• Conseils importants\n• ...`}
          className={`${inputClass} font-mono text-xs resize-y`}
        />
        <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 flex-shrink-0" />
          Affiché au client dans le modal de commande. Les liens sont automatiquement cliquables.
        </p>
      </div>

      {/* ── Champs dynamiques par catégorie ── */}
      {selectedCategory && categoryFields[selectedCategory]?.length > 0 && (
        <div className="bg-gray-50/60 dark:bg-slate-900/30 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 sm:p-5">
          <SectionHeader icon={ListChecks} title={`Champs requis pour ${categoryMapping[selectedCategory]?.display || selectedCategory}`} />
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl p-4 space-y-4">
            {categoryFields[selectedCategory].map((field) => (
              <div key={field.name} className="flex items-start gap-3">
                {field.type === 'checkbox' && (
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" {...register(field.name)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{field.label}</span>
                  </label>
                )}
                {field.type === 'number' && (
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
                    <input type="number" {...register(field.name, { min: field.min || 1, max: field.max || 10000 })} placeholder={field.placeholder} className={`${inputClass} w-40`} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Champs personnalisés ── */}
      <div className="bg-gray-50/60 dark:bg-slate-900/30 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 sm:p-5">
        <div className="flex justify-between items-center mb-3">
          <SectionHeader icon={Sparkles} title="Champs personnalisés" />
          <button type="button" onClick={addCustomField} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex-shrink-0">
            <Plus className="w-3.5 h-3.5" /> Ajouter un champ
          </button>
        </div>

        {customFields.length > 0 ? (
          <div className="space-y-3">
            {customFields.map((field, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Champ {index + 1}</span>
                  <button type="button" onClick={() => removeCustomField(index)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="text" placeholder="Nom interne (ex: imei)" value={field.name} onChange={(e) => updateCustomField(index, 'name', e.target.value)} className={inputClass + ' mt-0'} />
                  <input type="text" placeholder="Label affiché (ex: Numéro IMEI)" value={field.label} onChange={(e) => updateCustomField(index, 'label', e.target.value)} className={inputClass + ' mt-0'} />
                  <select value={field.type || 'text'} onChange={(e) => updateCustomField(index, 'type', e.target.value)} className={inputClass + ' mt-0 cursor-pointer'}>
                    <option value="text">Texte</option>
                    <option value="number">Nombre</option>
                    <option value="email">Email</option>
                    <option value="url">URL</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input type="checkbox" checked={field.required !== false} onChange={(e) => updateCustomField(index, 'required', e.target.checked)} className="h-4 w-4 text-blue-600 rounded flex-shrink-0" />
                    Champ requis
                  </label>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">Aucun champ personnalisé. Cliquez sur "Ajouter un champ" pour en créer.</p>
        )}
      </div>

      {/* ── Aide ── */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p className="font-medium mb-1">Comment ça fonctionne ?</p>
          <p>Les champs cochés (ou personnalisés) seront demandés au client lors de la commande. Les instructions seront affichées dans le modal de commande avec les liens cliquables.</p>
        </div>
      </div>

      {/* ── Boutons (fixés en bas, toujours visibles) ── */}
      <div className="flex gap-3 pt-4 pb-[env(safe-area-inset-bottom)] -mx-4 sm:-mx-6 -mb-5 px-4 sm:px-6 mt-6 sticky bottom-0 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
        <button type="button" onClick={onCancel}
          className="flex-1 sm:flex-initial px-6 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
          Annuler
        </button>
        <button type="submit" disabled={isLoading}
          className="flex-1 sm:flex-initial sm:ml-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all">
          {isLoading ? 'Enregistrement...' : (service ? 'Mettre à jour' : 'Créer le service')}
        </button>
      </div>

    </form>
  );
};

export default ServiceForm;
