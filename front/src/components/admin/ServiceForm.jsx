// src/components/admin/ServiceForm.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { HelpCircle, AlertCircle, Plus, Trash2 } from 'lucide-react';

const ServiceForm = ({ service, onSubmit, isLoading }) => {
  const [customFields, setCustomFields] = useState([]);
  
  // ✅ CORRECTION: Mapping des catégories backend vers affichage
  const categoryMapping = {
    'IMEI': { display: '📱 IMEI Services', value: 'IMEI' },
    'Server': { display: '🖥️ Serveur', value: 'Server' },
    'Rental': { display: '🌐 Location & Remote', value: 'Rental' },
    'License': { display: '🔑 Licences', value: 'License' }
  };

  // ✅ CORRECTION: Mapping inverse pour l'affichage
  const displayToBackend = {
    'imei': 'IMEI',
    'serveur': 'Server',
    'remote': 'Rental',
    'licences': 'License'
  };

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: service ? {
      name: service.name || '',
      description: service.description || '',
      price: service.price || '',
      // ✅ CORRECTION: Si le service a une catégorie backend, la garder
      category: service.category || '',
      deliveryTime: service.deliveryTime || '',
      active: service.active !== false,
      
      // Métadonnées IMEI
      imeiRequired: service.metadata?.imei?.requireImei ?? true,
      snRequired: service.metadata?.imei?.requireSn ?? false,
      imageRequired: service.metadata?.imei?.requireImage ?? false,
      
      // Métadonnées Serveur
      usernameRequired: service.metadata?.serveur?.requireUsername ?? true,
      emailRequired: service.metadata?.serveur?.requireEmail ?? true,
      
      // Métadonnées Licences
      maxQuantity: service.metadata?.licences?.maxQuantity || 1,
      autoGenerateKey: service.metadata?.licences?.autoGenerateKey ?? false,
      
      // Métadonnées Remote
      defaultDuration: service.metadata?.remote?.defaultDuration || '24h',
      autoGenerateCredentials: service.metadata?.remote?.autoGenerateCredentials ?? false,
      
    } : {
      name: '',
      description: '',
      price: '',
      category: '',
      deliveryTime: '',
      active: true,
      
      // Valeurs par défaut
      imeiRequired: true,
      snRequired: false,
      imageRequired: false,
      usernameRequired: true,
      emailRequired: true,
      maxQuantity: 1,
      autoGenerateKey: false,
      defaultDuration: '24h',
      autoGenerateCredentials: false,
    }
  });

  const selectedCategory = watch('category');

  // Charger les champs personnalisés si existants
  useEffect(() => {
    if (service?.fieldsRequired) {
      setCustomFields(service.fieldsRequired);
    }
  }, [service]);

  // Reset des champs quand la catégorie change
  useEffect(() => {
    if (selectedCategory) {
      setCustomFields([]);
    }
  }, [selectedCategory]);

  // ✅ CORRECTION: Configuration des champs par catégorie (avec valeurs backend)
  const categoryFields = {
    'IMEI': [
      { name: 'imeiRequired', label: 'Numéro IMEI requis', type: 'checkbox', default: true },
      { name: 'snRequired', label: 'Serial Number (SN) requis', type: 'checkbox', default: false },
      { name: 'imageRequired', label: 'Photo / lien image requis', type: 'checkbox', default: false },
    ],
    'Server': [
      { name: 'usernameRequired', label: "Nom d'utilisateur requis", type: 'checkbox', default: true },
      { name: 'emailRequired', label: 'Email requis', type: 'checkbox', default: true },
    ],
    'License': [
      { 
        name: 'maxQuantity', 
        label: 'Quantité maximale par commande', 
        type: 'number', 
        default: 1,
        placeholder: 'ex: 50',
        min: 1,
        max: 1000
      },
      { name: 'autoGenerateKey', label: 'Générer les clés automatiquement', type: 'checkbox', default: false },
    ],
    'Rental': [
      { 
        name: 'defaultDuration', 
        label: 'Durée par défaut', 
        type: 'select',
        options: [
          { value: '1h', label: '1 heure' },
          { value: '24h', label: '24 heures' },
          { value: '7j', label: '7 jours' }
        ],
        default: '24h'
      },
      { name: 'autoGenerateCredentials', label: 'Générer identifiants automatiquement', type: 'checkbox', default: false },
    ],
  };

  // Ajouter un champ personnalisé
  const addCustomField = () => {
    setCustomFields([
      ...customFields,
      {
        name: `custom_${Date.now()}`,
        label: '',
        type: 'text',
        required: true,
        placeholder: ''
      }
    ]);
  };

  // Supprimer un champ personnalisé
  const removeCustomField = (index) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  // Mettre à jour un champ personnalisé
  const updateCustomField = (index, field, value) => {
    const updated = [...customFields];
    updated[index] = { ...updated[index], [field]: value };
    setCustomFields(updated);
  };

  const onFormSubmit = (data) => {
    // ✅ CORRECTION: Convertir la catégorie affichée en catégorie backend
    const backendCategory = displayToBackend[data.category] || data.category;
    
    // Construire le tableau fieldsRequired
    const fieldsRequired = [];

    // Ajouter les champs selon la catégorie sélectionnée
    if (selectedCategory && categoryFields[backendCategory]) {
      if (backendCategory === 'IMEI') {
        if (data.imeiRequired) {
          fieldsRequired.push({
            name: 'imei',
            label: 'Numéro IMEI',
            type: 'text',
            required: true,
            validation: '^[0-9]{15}$',
            placeholder: '15 chiffres sans espaces',
            helpText: 'Composez *#06# pour obtenir votre IMEI'
          });
        }
        if (data.snRequired) {
          fieldsRequired.push({
            name: 'serialNumber',
            label: 'Numéro de série (SN)',
            type: 'text',
            required: true,
            placeholder: 'Numéro de série du téléphone'
          });
        }
        if (data.imageRequired) {
          fieldsRequired.push({
            name: 'imageUrl',
            label: 'Photo du téléphone',
            type: 'url',
            required: true,
            placeholder: 'https://exemple.com/photo.jpg',
            helpText: 'Photo de l\'étiquette IMEI ou de l\'écran'
          });
        }
      }

      if (backendCategory === 'Server') {
        if (data.usernameRequired) {
          fieldsRequired.push({
            name: 'username',
            label: "Nom d'utilisateur",
            type: 'text',
            required: true,
            validation: '^[a-zA-Z0-9_-]{3,20}$',
            placeholder: '3-20 caractères (lettres, chiffres, -_)'
          });
        }
        if (data.emailRequired) {
          fieldsRequired.push({
            name: 'email',
            label: 'Email',
            type: 'email',
            required: true,
            validation: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
            placeholder: 'utilisateur@exemple.com'
          });
        }
      }

      if (backendCategory === 'License') {
        fieldsRequired.push({
          name: 'email',
          label: 'Email pour la licence',
          type: 'email',
          required: true,
          placeholder: 'utilisateur@exemple.com'
        });

        if (data.maxQuantity > 1) {
          fieldsRequired.push({
            name: 'quantity',
            label: 'Quantité',
            type: 'number',
            required: true,
            validation: `^[1-${data.maxQuantity}]$`,
            defaultValue: 1,
            helpText: `Maximum ${data.maxQuantity} licences`
          });
        }
      }

      if (backendCategory === 'Rental') {
        fieldsRequired.push({
          name: 'duration',
          label: 'Durée souhaitée',
          type: 'select',
          required: true,
          options: ['1h', '24h', '7j'],
          defaultValue: data.defaultDuration || '24h'
        });

        if (!data.autoGenerateCredentials) {
          fieldsRequired.push({
            name: 'preferredTool',
            label: 'Outil préféré',
            type: 'select',
            required: false,
            options: ['AnyDesk', 'TeamViewer', 'Chrome Remote', 'Autre']
          });
        }
      }
    }

    // Ajouter les champs personnalisés
    customFields.forEach(field => {
      if (field.name && field.label) {
        fieldsRequired.push({
          name: field.name,
          label: field.label,
          type: field.type || 'text',
          required: field.required !== false,
          placeholder: field.placeholder || '',
          ...(field.validation && { validation: field.validation })
        });
      }
    });

    // Construire les métadonnées
    const metadata = {
      imei: {
        requireImei: data.imeiRequired,
        requireSn: data.snRequired,
        requireImage: data.imageRequired
      },
      serveur: {
        requireUsername: data.usernameRequired,
        requireEmail: data.emailRequired
      },
      licences: {
        maxQuantity: data.maxQuantity || 1,
        autoGenerateKey: data.autoGenerateKey
      },
      remote: {
        defaultDuration: data.defaultDuration || '24h',
        autoGenerateCredentials: data.autoGenerateCredentials
      }
    };

    // Objet final avec catégorie corrigée
    const serviceData = {
      name: data.name,
      description: data.description,
      price: Number(data.price),
      category: backendCategory, // ✅ CORRECTION: Utiliser la catégorie backend
      deliveryTime: data.deliveryTime,
      active: data.active,
      fieldsRequired,
      metadata
    };

    console.log('📦 Service data envoyé:', serviceData);
    onSubmit(serviceData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Champs communs */}
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-900">
            Nom du service <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('name', { required: 'Le nom est obligatoire' })}
            className="mt-1 block w-full rounded-lg border-gray-300 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('description', { required: 'La description est obligatoire' })}
            rows={4}
            className="mt-1 block w-full text-gray-900 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Prix (€) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('price', { 
                required: 'Le prix est obligatoire',
                min: { value: 0, message: 'Le prix doit être positif' }
              })}
              className="mt-1 block w-full text-gray-900 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Catégorie <span className="text-red-500">*</span>
            </label>
            <select
              {...register('category', { required: 'La catégorie est obligatoire' })}
              className="mt-1 block w-full text-gray-900 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Sélectionner...</option>
              {/* ✅ CORRECTION: Les valeurs sont maintenant les clés du mapping */}
              {Object.entries(categoryMapping).map(([key, { display }]) => (
                <option key={key} value={key}>{display}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Délai de livraison <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('deliveryTime', { required: 'Le délai est obligatoire' })}
            placeholder="ex: 1-24h, Instantané, 3-7 jours"
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.deliveryTime && <p className="mt-1 text-sm text-red-600">{errors.deliveryTime.message}</p>}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            {...register('active')}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label className="ml-2 text-sm text-gray-700">Service actif</label>
        </div>
      </div>

      {/* Champs dynamiques selon catégorie */}
      {selectedCategory && categoryFields[selectedCategory] && (
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Configuration des champs pour {categoryMapping[selectedCategory]?.display || selectedCategory}
          </h3>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            {categoryFields[selectedCategory].map((field) => (
              <div key={field.name} className="flex items-start gap-3">
                {field.type === 'checkbox' && (
                  <>
                    <input
                      type="checkbox"
                      {...register(field.name)}
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="text-sm text-gray-700">{field.label}</label>
                  </>
                )}

                {field.type === 'number' && (
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <input
                      type="number"
                      {...register(field.name, { 
                        min: field.min || 1,
                        max: field.max || 1000
                      })}
                      placeholder={field.placeholder}
                      className="w-32 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                )}

                {field.type === 'select' && (
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <select
                      {...register(field.name)}
                      className="w-48 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      {field.options?.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {field.helpText && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <HelpCircle className="w-3 h-3" />
                    <span>{field.helpText}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Champs personnalisés */}
      <div className="mt-8 border-t border-gray-200 pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Champs personnalisés</h3>
          <button
            type="button"
            onClick={addCustomField}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter un champ
          </button>
        </div>

        {customFields.length > 0 ? (
          <div className="space-y-4">
            {customFields.map((field, index) => (
              <div key={index} className="flex gap-3 items-start bg-gray-50 p-4 rounded-lg">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Nom du champ (ex: imei)"
                    value={field.name}
                    onChange={(e) => updateCustomField(index, 'name', e.target.value)}
                    className="rounded-lg border-gray-300 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Label (ex: Numéro IMEI)"
                    value={field.label}
                    onChange={(e) => updateCustomField(index, 'label', e.target.value)}
                    className="rounded-lg border-gray-300 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                  <select
                    value={field.type || 'text'}
                    onChange={(e) => updateCustomField(index, 'type', e.target.value)}
                    className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  >
                    <option value="text">Texte</option>
                    <option value="number">Nombre</option>
                    <option value="email">Email</option>
                    <option value="url">URL</option>
                  </select>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={field.required !== false}
                        onChange={(e) => updateCustomField(index, 'required', e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      Requis
                    </label>
                    <button
                      type="button"
                      onClick={() => removeCustomField(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">
            Aucun champ personnalisé. Cliquez sur "Ajouter un champ" pour en créer.
          </p>
        )}
      </div>

      {/* Aide */}
      <div className="bg-blue-50 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-1">Comment ça fonctionne ?</p>
          <p>Les champs cochés seront demandés à l'utilisateur lors de la commande. 
          Vous pouvez également ajouter des champs personnalisés pour des besoins spécifiques.</p>
        </div>
      </div>

      {/* Boutons */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isLoading ? 'Enregistrement...' : (service ? 'Mettre à jour' : 'Créer le service')}
        </button>
      </div>
    </form>
  );
};

export default ServiceForm;