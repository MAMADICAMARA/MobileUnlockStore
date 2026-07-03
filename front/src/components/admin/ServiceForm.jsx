// // src/components/admin/ServiceForm.jsx
// import { useState, useEffect } from 'react';
// import { useForm } from 'react-hook-form';
// import { HelpCircle, AlertCircle, Plus, Trash2 } from 'lucide-react';

// const ServiceForm = ({ service, onSubmit, isLoading }) => {
//   const [customFields, setCustomFields] = useState([]);

//   const categoryMapping = {
//     'IMEI':    { display: '📱 IMEI Services',       value: 'IMEI' },
//     'Server':  { display: '🖥️ Serveur',             value: 'Server' },
//     'Rental':  { display: '🌐 Location & Remote',   value: 'Rental' },
//     'License': { display: '🔑 Licences',            value: 'License' },
//   };

//   const { register, handleSubmit, watch, formState: { errors } } = useForm({
//     defaultValues: service ? {
//       name:                   service.name || '',
//       description:            service.description || '',
//       price:                  service.price || '',
//       category:               service.category || '',
//       deliveryTime:           service.deliveryTime || '',
//       instructions:           service.instructions || '',
//       active:                 service.active !== false,
//       imeiRequired:           service.metadata?.imei?.requireImei ?? true,
//       snRequired:             service.metadata?.imei?.requireSn ?? false,
//       imageRequired:          service.metadata?.imei?.requireImage ?? false,
//       usernameRequired:       service.metadata?.serveur?.requireUsername ?? true,
//       emailRequired:          service.metadata?.serveur?.requireEmail ?? true,
//       maxQuantity:            service.metadata?.licences?.maxQuantity || 1,
//       autoGenerateKey:        service.metadata?.licences?.autoGenerateKey ?? false,
//       defaultDuration:        service.metadata?.remote?.defaultDuration || '24h',
//       autoGenerateCredentials:service.metadata?.remote?.autoGenerateCredentials ?? false,
//     } : {
//       name: '', description: '', price: '', category: '', deliveryTime: '', instructions: '',
//       active: true,
//       imeiRequired: true, snRequired: false, imageRequired: false,
//       usernameRequired: true, emailRequired: true,
//       maxQuantity: 1, autoGenerateKey: false,
//       defaultDuration: '24h', autoGenerateCredentials: false,
//     }
//   });

//   const selectedCategory = watch('category');

//   useEffect(() => {
//     if (service?.fieldsRequired) setCustomFields(service.fieldsRequired);
//   }, [service]);

//   useEffect(() => {
//     if (selectedCategory) setCustomFields([]);
//   }, [selectedCategory]);

//   // Champs dynamiques par catégorie
//   const categoryFields = {
//     'IMEI': [
//       { name: 'imeiRequired',  label: 'Numéro IMEI requis',        type: 'checkbox' },
//       { name: 'snRequired',    label: 'Serial Number (SN) requis',  type: 'checkbox' },
//       { name: 'imageRequired', label: 'Photo / lien image requis',  type: 'checkbox' },
//     ],
//     'Server': [
//       { name: 'usernameRequired', label: "Nom d'utilisateur requis", type: 'checkbox' },
//       { name: 'emailRequired',    label: 'Email requis',             type: 'checkbox' },
//     ],
//     'License': [
//       { name: 'maxQuantity',   label: 'Quantité maximale par commande', type: 'number', placeholder: 'ex: 50', min: 1, max: 1000 },
//       { name: 'autoGenerateKey', label: 'Générer les clés automatiquement', type: 'checkbox' },
//     ],
//     'Rental': [
//       { name: 'defaultDuration', label: 'Durée par défaut', type: 'select', options: [{ value: '1h', label: '1 heure' }, { value: '24h', label: '24 heures' }, { value: '7j', label: '7 jours' }] },
//       { name: 'autoGenerateCredentials', label: 'Générer identifiants automatiquement', type: 'checkbox' },
//     ],
//   };

//   const addCustomField = () => {
//     setCustomFields([...customFields, { name: `custom_${Date.now()}`, label: '', type: 'text', required: true, placeholder: '' }]);
//   };

//   const removeCustomField = (index) => setCustomFields(customFields.filter((_, i) => i !== index));

//   const updateCustomField = (index, field, value) => {
//     const updated = [...customFields];
//     updated[index] = { ...updated[index], [field]: value };
//     setCustomFields(updated);
//   };

//   const onFormSubmit = (data) => {
//     const backendCategory = data.category;
//     const fieldsRequired  = [];

//     if (backendCategory === 'IMEI') {
//       if (data.imeiRequired)  fieldsRequired.push({ name: 'imei',         label: 'Numéro IMEI',        type: 'text',  required: true,  validation: '^[0-9]{15}$', placeholder: '15 chiffres sans espaces', helpText: 'Composez *#06# pour obtenir votre IMEI' });
//       if (data.snRequired)    fieldsRequired.push({ name: 'serialNumber', label: 'Numéro de série (SN)', type: 'text', required: true,  placeholder: 'Numéro de série du téléphone' });
//       if (data.imageRequired) fieldsRequired.push({ name: 'imageUrl',     label: 'Photo du téléphone', type: 'url',  required: true,  placeholder: 'https://exemple.com/photo.jpg', helpText: "Photo de l'étiquette IMEI ou de l'écran" });
//     }

//     if (backendCategory === 'Server') {
//       if (data.usernameRequired) fieldsRequired.push({ name: 'username', label: "Nom d'utilisateur (logiciel)", type: 'text',  required: true, validation: '^[a-zA-Z0-9_-]{3,20}$', placeholder: '3-20 caractères' });
//       if (data.emailRequired)    fieldsRequired.push({ name: 'email',    label: 'Email (compte logiciel)',      type: 'email', required: true, placeholder: 'utilisateur@exemple.com', helpText: 'Email du compte logiciel, pas celui du site' });
//     }

//     if (backendCategory === 'License') {
//       fieldsRequired.push({ name: 'email', label: 'Email pour la licence', type: 'email', required: true, placeholder: 'utilisateur@exemple.com' });
//       if (data.maxQuantity > 1) fieldsRequired.push({ name: 'quantity', label: 'Quantité', type: 'number', required: true, defaultValue: 1, helpText: `Maximum ${data.maxQuantity} licences` });
//     }

//     if (backendCategory === 'Rental') {
//       fieldsRequired.push({ name: 'duration', label: 'Durée souhaitée', type: 'select', required: true, options: ['1h', '24h', '7j'], defaultValue: data.defaultDuration || '24h' });
//       if (!data.autoGenerateCredentials) fieldsRequired.push({ name: 'preferredTool', label: 'Outil préféré', type: 'select', required: false, options: ['AnyDesk', 'TeamViewer', 'Chrome Remote', 'Autre'] });
//     }

//     customFields.forEach(field => {
//       if (field.name && field.label) {
//         fieldsRequired.push({ name: field.name, label: field.label, type: field.type || 'text', required: field.required !== false, placeholder: field.placeholder || '' });
//       }
//     });

//     const metadata = {
//       imei:     { requireImei: data.imeiRequired, requireSn: data.snRequired, requireImage: data.imageRequired },
//       serveur:  { requireUsername: data.usernameRequired, requireEmail: data.emailRequired },
//       licences: { maxQuantity: data.maxQuantity || 1, autoGenerateKey: data.autoGenerateKey },
//       remote:   { defaultDuration: data.defaultDuration || '24h', autoGenerateCredentials: data.autoGenerateCredentials },
//     };

//     onSubmit({
//       name:         data.name,
//       description:  data.description,
//       price:        Number(data.price),
//       category:     backendCategory,
//       deliveryTime: data.deliveryTime,
//       instructions: data.instructions,   // ← champ instructions
//       active:       data.active,
//       fieldsRequired,
//       metadata,
//     });
//   };

//   return (
//     <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">

//       {/* ── Champs communs ── */}
//       <div className="grid grid-cols-1 gap-6">

//         {/* Nom */}
//         <div>
//           <label className="block text-sm font-medium text-gray-900">
//             Nom du service <span className="text-red-500">*</span>
//           </label>
//           <input
//             type="text"
//             {...register('name', { required: 'Le nom est obligatoire' })}
//             className="mt-1 block w-full rounded-lg border-gray-300 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//           />
//           {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
//         </div>

//         {/* Description */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Description <span className="text-red-500">*</span>
//           </label>
//           <textarea
//             {...register('description', { required: 'La description est obligatoire' })}
//             rows={3}
//             className="mt-1 block w-full text-gray-900 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//           />
//           {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
//         </div>

//         {/* Prix + Catégorie */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Prix (FG) <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="number" step="0.01" min="0"
//               {...register('price', { required: 'Le prix est obligatoire', min: { value: 0, message: 'Le prix doit être positif' } })}
//               className="mt-1 block w-full text-gray-900 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//             />
//             {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Catégorie <span className="text-red-500">*</span>
//             </label>
//             <select
//               {...register('category', { required: 'La catégorie est obligatoire' })}
//               className="mt-1 block w-full text-gray-900 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//             >
//               <option value="">Sélectionner...</option>
//               {Object.entries(categoryMapping).map(([key, { display }]) => (
//                 <option key={key} value={key}>{display}</option>
//               ))}
//             </select>
//             {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
//           </div>
//         </div>

//         {/* Délai de livraison */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Délai de livraison <span className="text-red-500">*</span>
//           </label>
//           <input
//             type="text"
//             {...register('deliveryTime', { required: 'Le délai est obligatoire' })}
//             placeholder="ex: 1-24h, Instantané, 3-7 jours"
//             className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//           />
//           {errors.deliveryTime && <p className="mt-1 text-sm text-red-600">{errors.deliveryTime.message}</p>}
//         </div>

//         {/* ── Instructions / Tutoriel ── */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             Instructions / Tutoriel
//             <span className="ml-2 text-xs text-gray-400 font-normal">(optionnel)</span>
//           </label>
//           <textarea
//             {...register('instructions')}
//             rows={7}
//             placeholder={`Écrivez ici tout ce que le client doit savoir :\n- Lien de téléchargement : https://...\n- Étapes à suivre\n- Conseils importants\n- ...`}
//             className="mt-1 block w-full text-gray-900 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm font-mono resize-y"
//           />
//           <p className="mt-1 text-xs text-gray-500">
//             Ce texte sera affiché au client dans le modal de commande. Les liens seront automatiquement cliquables.
//           </p>
//         </div>

//         {/* Actif */}
//         <div className="flex items-center gap-2">
//           <input
//             type="checkbox"
//             {...register('active')}
//             className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//           />
//           <label className="text-sm text-gray-700">Service actif</label>
//         </div>
//       </div>

//       {/* ── Champs dynamiques par catégorie ── */}
//       {selectedCategory && categoryFields[selectedCategory] && (
//         <div className="border-t border-gray-200 pt-6">
//           <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
//             <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
//             Champs requis pour {categoryMapping[selectedCategory]?.display || selectedCategory}
//           </h3>
//           <div className="bg-gray-50 rounded-lg p-4 space-y-4">
//             {categoryFields[selectedCategory].map((field) => (
//               <div key={field.name} className="flex items-start gap-3">
//                 {field.type === 'checkbox' && (
//                   <>
//                     <input type="checkbox" {...register(field.name)} className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
//                     <label className="text-sm text-gray-700">{field.label}</label>
//                   </>
//                 )}
//                 {field.type === 'number' && (
//                   <div className="flex-1">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
//                     <input type="number" {...register(field.name, { min: field.min || 1, max: field.max || 1000 })} placeholder={field.placeholder} className="w-32 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
//                   </div>
//                 )}
//                 {field.type === 'select' && (
//                   <div className="flex-1">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
//                     <select {...register(field.name)} className="w-48 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
//                       {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
//                     </select>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* ── Champs personnalisés ── */}
//       <div className="border-t border-gray-200 pt-6">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-base font-semibold text-gray-900">Champs personnalisés</h3>
//           <button type="button" onClick={addCustomField} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
//             <Plus className="w-4 h-4" /> Ajouter un champ
//           </button>
//         </div>

//         {customFields.length > 0 ? (
//           <div className="space-y-4">
//             {customFields.map((field, index) => (
//               <div key={index} className="flex gap-3 items-start bg-gray-50 p-4 rounded-lg">
//                 <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
//                   <input type="text" placeholder="Nom du champ (ex: imei)" value={field.name} onChange={(e) => updateCustomField(index, 'name', e.target.value)} className="rounded-lg border-gray-300 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" />
//                   <input type="text" placeholder="Label (ex: Numéro IMEI)" value={field.label} onChange={(e) => updateCustomField(index, 'label', e.target.value)} className="rounded-lg border-gray-300 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" />
//                   <select value={field.type || 'text'} onChange={(e) => updateCustomField(index, 'type', e.target.value)} className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm">
//                     <option value="text">Texte</option>
//                     <option value="number">Nombre</option>
//                     <option value="email">Email</option>
//                     <option value="url">URL</option>
//                   </select>
//                   <div className="flex items-center gap-4">
//                     <label className="flex items-center gap-2 text-sm">
//                       <input type="checkbox" checked={field.required !== false} onChange={(e) => updateCustomField(index, 'required', e.target.checked)} className="h-4 w-4 text-blue-600 rounded" />
//                       Requis
//                     </label>
//                     <button type="button" onClick={() => removeCustomField(index)} className="text-red-600 hover:text-red-800">
//                       <Trash2 className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p className="text-sm text-gray-500 italic">Aucun champ personnalisé. Cliquez sur "Ajouter un champ" pour en créer.</p>
//         )}
//       </div>

//       {/* ── Aide ── */}
//       <div className="bg-blue-50 rounded-lg p-4 flex items-start gap-3">
//         <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
//         <div className="text-sm text-blue-700">
//           <p className="font-medium mb-1">Comment ça fonctionne ?</p>
//           <p>Les champs cochés seront demandés au client lors de la commande. Les instructions seront affichées dans le modal de commande avec les liens cliquables.</p>
//         </div>
//       </div>

//       {/* ── Boutons ── */}
//       <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
//         <button type="button" onClick={() => window.history.back()} className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
//           Annuler
//         </button>
//         <button type="submit" disabled={isLoading} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
//           {isLoading ? 'Enregistrement...' : (service ? 'Mettre à jour' : 'Créer le service')}
//         </button>
//       </div>

//     </form>
//   );
// };

// export default ServiceForm;

// src/components/admin/ServiceForm.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { HelpCircle, AlertCircle, Plus, Trash2, Upload, Image, X } from 'lucide-react';

const ServiceForm = ({ service, onSubmit, isLoading }) => {
  const [customFields, setCustomFields] = useState([]);
  const [imagePreview, setImagePreview] = useState(service?.imageUrl || '');
  const [imageFile, setImageFile] = useState(null); // non utilisé mais gardé

  const categoryMapping = {
    'IMEI':    { display: '📱 IMEI Services',       value: 'IMEI' },
    'Server':  { display: '🖥️ Serveur',             value: 'Server' },
    'Rental':  { display: '🌐 Location & Remote',   value: 'Rental' },
    'License': { display: '🔑 Licences',            value: 'License' },
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
      maxQuantity:            service.metadata?.licences?.maxQuantity || 1,
      autoGenerateKey:        service.metadata?.licences?.autoGenerateKey ?? false,
      defaultDuration:        service.metadata?.remote?.defaultDuration || '24h',
      autoGenerateCredentials:service.metadata?.remote?.autoGenerateCredentials ?? false,
    } : {
      name: '', description: '', price: '', category: '', deliveryTime: '', instructions: '',
      active: true,
      imageUrl: '',
      imeiRequired: true, snRequired: false, imageRequired: false,
      usernameRequired: true, emailRequired: true,
      maxQuantity: 1, autoGenerateKey: false,
      defaultDuration: '24h', autoGenerateCredentials: false,
    }
  });

  const selectedCategory = watch('category');

  useEffect(() => {
    if (service?.fieldsRequired) setCustomFields(service.fieldsRequired);
  }, [service]);

  useEffect(() => {
    if (selectedCategory) setCustomFields([]);
  }, [selectedCategory]);

  // Gestion de l'upload d'image
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
      setValue('imageUrl', base64); // synchronise avec react-hook-form
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    setValue('imageUrl', '');
    const fileInput = document.getElementById('imageUploadInput');
    if (fileInput) fileInput.value = '';
  };

  // Champs dynamiques par catégorie
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
    'License': [
      { name: 'maxQuantity',   label: 'Quantité maximale par commande', type: 'number', placeholder: 'ex: 50', min: 1, max: 1000 },
      { name: 'autoGenerateKey', label: 'Générer les clés automatiquement', type: 'checkbox' },
    ],
    'Rental': [
      { name: 'defaultDuration', label: 'Durée par défaut', type: 'select', options: [{ value: '1h', label: '1 heure' }, { value: '24h', label: '24 heures' }, { value: '7j', label: '7 jours' }] },
      { name: 'autoGenerateCredentials', label: 'Générer identifiants automatiquement', type: 'checkbox' },
    ],
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

    if (backendCategory === 'License') {
      fieldsRequired.push({ name: 'email', label: 'Email pour la licence', type: 'email', required: true, placeholder: 'utilisateur@exemple.com' });
      if (data.maxQuantity > 1) fieldsRequired.push({ name: 'quantity', label: 'Quantité', type: 'number', required: true, defaultValue: 1, helpText: `Maximum ${data.maxQuantity} licences` });
    }

    if (backendCategory === 'Rental') {
      fieldsRequired.push({ name: 'duration', label: 'Durée souhaitée', type: 'select', required: true, options: ['1h', '24h', '7j'], defaultValue: data.defaultDuration || '24h' });
      if (!data.autoGenerateCredentials) fieldsRequired.push({ name: 'preferredTool', label: 'Outil préféré', type: 'select', required: false, options: ['AnyDesk', 'TeamViewer', 'Chrome Remote', 'Autre'] });
    }

    customFields.forEach(field => {
      if (field.name && field.label) {
        fieldsRequired.push({ name: field.name, label: field.label, type: field.type || 'text', required: field.required !== false, placeholder: field.placeholder || '' });
      }
    });

    const metadata = {
      imei:     { requireImei: data.imeiRequired, requireSn: data.snRequired, requireImage: data.imageRequired },
      serveur:  { requireUsername: data.usernameRequired, requireEmail: data.emailRequired },
      licences: { maxQuantity: data.maxQuantity || 1, autoGenerateKey: data.autoGenerateKey },
      remote:   { defaultDuration: data.defaultDuration || '24h', autoGenerateCredentials: data.autoGenerateCredentials },
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

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">

      {/* ── Champs communs ── */}
      <div className="grid grid-cols-1 gap-6">

        {/* Nom */}
        <div>
          <label className="block text-sm font-medium text-gray-900">
            Nom du service <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('name', { required: 'Le nom est obligatoire' })}
            placeholder="Ex: Déblocage IMEI, Licence Windows 10 Pro..."
            className="mt-1 block w-full rounded-lg border-gray-300 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('description', { required: 'La description est obligatoire' })}
            rows={3}
            placeholder="Décrivez le service en quelques phrases claires et attractives..."
            className="mt-1 block w-full text-gray-900 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400"
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
        </div>

        {/* Prix + Catégorie */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Prix (FG) <span className="text-red-500">*</span>
            </label>
            <input
              type="number" step="0.01" min="0"
              {...register('price', { required: 'Le prix est obligatoire', min: { value: 0, message: 'Le prix doit être positif' } })}
              placeholder="0.00"
              className="mt-1 block w-full text-gray-900 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400"
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
              <option value="">Sélectionner une catégorie...</option>
              {Object.entries(categoryMapping).map(([key, { display }]) => (
                <option key={key} value={key}>{display}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
          </div>
        </div>

        {/* ─── SECTION IMAGE (design amélioré) ─── */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-gray-50/80 dark:bg-gray-800/50 space-y-4 transition-all">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200 font-semibold text-sm">
            <Image className="w-5 h-5 text-blue-500" />
            <span>Image du service (affichée uniquement sur ordinateur)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upload de fichier */}
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

            {/* Aperçu + URL manuelle */}
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

              <div className="mt-2">
                <label className="block text-sm text-gray-600 dark:text-gray-400">
                  Ou saisissez une URL externe
                </label>
                <input
                  type="url"
                  {...register('imageUrl')}
                  placeholder="https://exemple.com/images/icone-service.png"
                  className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500"
                />
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  L'image uploadée remplace l'URL. Supprimez-la pour utiliser l'URL.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Délai de livraison */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Délai de livraison <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('deliveryTime', { required: 'Le délai est obligatoire' })}
            placeholder="Ex: 24h, 2-3 jours, Instantané"
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400"
          />
          {errors.deliveryTime && <p className="mt-1 text-sm text-red-600">{errors.deliveryTime.message}</p>}
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Instructions / Tutoriel
            <span className="ml-2 text-xs text-gray-400 font-normal">(optionnel)</span>
          </label>
          <textarea
            {...register('instructions')}
            rows={7}
            placeholder={`Écrivez ici tout ce que le client doit savoir :\n• Lien de téléchargement : https://...\n• Étapes à suivre (1., 2., 3.)\n• Conseils importants\n• ...`}
            className="mt-1 block w-full text-gray-900 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm font-mono resize-y placeholder-gray-400"
          />
          <p className="mt-1 text-xs text-gray-500">
            Ce texte sera affiché au client dans le modal de commande. Les liens seront automatiquement cliquables.
          </p>
        </div>

        {/* Actif */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register('active')}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label className="text-sm text-gray-700">Service actif (visible par les clients)</label>
        </div>
      </div>

      {/* ── Champs dynamiques par catégorie ── */}
      {selectedCategory && categoryFields[selectedCategory] && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Champs requis pour {categoryMapping[selectedCategory]?.display || selectedCategory}
          </h3>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-4">
            {categoryFields[selectedCategory].map((field) => (
              <div key={field.name} className="flex items-start gap-3">
                {field.type === 'checkbox' && (
                  <>
                    <input type="checkbox" {...register(field.name)} className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <label className="text-sm text-gray-700 dark:text-gray-300">{field.label}</label>
                  </>
                )}
                {field.type === 'number' && (
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
                    <input type="number" {...register(field.name, { min: field.min || 1, max: field.max || 1000 })} placeholder={field.placeholder} className="w-32 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                )}
                {field.type === 'select' && (
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
                    <select {...register(field.name)} className="w-48 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Champs personnalisés ── */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Champs personnalisés</h3>
          <button type="button" onClick={addCustomField} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
            <Plus className="w-4 h-4" /> Ajouter un champ
          </button>
        </div>

        {customFields.length > 0 ? (
          <div className="space-y-4">
            {customFields.map((field, index) => (
              <div key={index} className="flex gap-3 items-start bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="text" placeholder="Nom interne (ex: imei)" value={field.name} onChange={(e) => updateCustomField(index, 'name', e.target.value)} className="rounded-lg border-gray-300 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" />
                  <input type="text" placeholder="Label affiché (ex: Numéro IMEI)" value={field.label} onChange={(e) => updateCustomField(index, 'label', e.target.value)} className="rounded-lg border-gray-300 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" />
                  <select value={field.type || 'text'} onChange={(e) => updateCustomField(index, 'type', e.target.value)} className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm">
                    <option value="text">Texte</option>
                    <option value="number">Nombre</option>
                    <option value="email">Email</option>
                    <option value="url">URL</option>
                  </select>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={field.required !== false} onChange={(e) => updateCustomField(index, 'required', e.target.checked)} className="h-4 w-4 text-blue-600 rounded" />
                      Requis
                    </label>
                    <button type="button" onClick={() => removeCustomField(index)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">Aucun champ personnalisé. Cliquez sur "Ajouter un champ" pour en créer.</p>
        )}
      </div>

      {/* ── Aide ── */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p className="font-medium mb-1">Comment ça fonctionne ?</p>
          <p>Les champs cochés seront demandés au client lors de la commande. Les instructions seront affichées dans le modal de commande avec les liens cliquables.</p>
        </div>
      </div>

      {/* ── Boutons ── */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button type="button" onClick={() => window.history.back()} className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Annuler
        </button>
        <button type="submit" disabled={isLoading} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          {isLoading ? 'Enregistrement...' : (service ? 'Mettre à jour' : 'Créer le service')}
        </button>
      </div>

    </form>
  );
};

export default ServiceForm;