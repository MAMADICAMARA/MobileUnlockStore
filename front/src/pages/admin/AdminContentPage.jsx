// src/pages/admin/AdminContentPage.jsx
import { useState } from 'react';
import {
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  PlusCircleIcon,
  TrashIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

// Données fictives pour la FAQ
const initialFaq = [
  { id: 1, question: "Qu'est-ce que le déblocage par IMEI ?", answer: "C'est une méthode officielle qui permet de débloquer votre téléphone de manière permanente en utilisant son numéro IMEI unique. Cette procédure est légale et reconnue par tous les opérateurs.", category: "général" },
  { id: 2, question: "Combien de temps prend le processus ?", answer: "Le délai varie en fonction du service et de l'opérateur. En général, le processus prend entre 24h et 72h ouvrées. Certains déblocages peuvent être effectués en quelques heures.", category: "délais" },
  { id: 3, question: "Le déblocage est-il permanent ?", answer: "Oui, le déblocage par IMEI est définitif. Une fois effectué, votre téléphone restera débloqué même après les mises à jour système ou la réinitialisation.", category: "général" },
  { id: 4, question: "Quels opérateurs supportez-vous ?", answer: "Nous supportons tous les principaux opérateurs français et internationaux : Orange, SFR, Bouygues, Free, Vodafone, T-Mobile, etc.", category: "compatibilité" },
];

/**
 * Page de gestion du contenu du site (ex: FAQ).
 */
const AdminContentPage = () => {
  const [faq, setFaq] = useState(initialFaq);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [expandedItems, setExpandedItems] = useState([]);
  const [activeTab, setActiveTab] = useState('faq');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const handleFaqChange = (index, field, value) => {
    const newFaq = [...faq];
    newFaq[index][field] = value;
    setFaq(newFaq);
  };

  const handleAddFaq = () => {
    const newItem = {
      id: Date.now(),
      question: 'Nouvelle question',
      answer: 'Nouvelle réponse',
      category: 'général'
    };
    setFaq([...faq, newItem]);
    setExpandedItems([...expandedItems, faq.length]);
  };

  const handleDeleteFaq = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette entrée FAQ ?')) {
      setFaq(faq.filter(item => item.id !== id));
      setMessage({ type: 'success', text: 'Élément supprimé avec succès' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const toggleExpand = (index) => {
    if (expandedItems.includes(index)) {
      setExpandedItems(expandedItems.filter(i => i !== index));
    } else {
      setExpandedItems([...expandedItems, index]);
    }
  };

  const handleSaveChanges = () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    // Simuler un appel API
    setTimeout(() => {
      setLoading(false);
      setMessage({ type: 'success', text: 'Contenu mis à jour avec succès !' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }, 1500);
  };

  const filteredFaq = faq.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(faq.map(item => item.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 sm:p-6 lg:p-8">
      
      {/* Header avec effet de verre */}
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-3xl blur-3xl"></div>
        <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
                Gestion du Contenu
              </h1>
              <p className="text-gray-600 text-sm sm:text-base flex items-center gap-2">
                <DocumentTextIcon className="h-4 w-4" />
                Gérez le contenu dynamique de votre site
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveChanges}
                disabled={loading}
                className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                    <span>Sauvegarde...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>Publier les changements</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message de notification */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-slideDown ${
          message.type === 'success' ? 'bg-emerald-50 border-l-4 border-emerald-500' : 'bg-red-50 border-l-4 border-red-500'
        }`}>
          {message.type === 'success' ? (
            <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
          ) : (
            <XCircleIcon className="h-5 w-5 text-red-600" />
          )}
          <p className={`font-medium ${
            message.type === 'success' ? 'text-emerald-700' : 'text-red-700'
          }`}>{message.text}</p>
        </div>
      )}

      {/* Tabs de navigation */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('faq')}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'faq'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
              : 'bg-white/70 backdrop-blur-sm text-gray-600 hover:bg-white hover:shadow-md'
          }`}
        >
          <QuestionMarkCircleIcon className="h-5 w-5" />
          FAQ
        </button>
        <button
          onClick={() => setActiveTab('home')}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'home'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
              : 'bg-white/70 backdrop-blur-sm text-gray-600 hover:bg-white hover:shadow-md'
          }`}
        >
          <SparklesIcon className="h-5 w-5" />
          Page d'accueil
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'services'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
              : 'bg-white/70 backdrop-blur-sm text-gray-600 hover:bg-white hover:shadow-md'
          }`}
        >
          <InformationCircleIcon className="h-5 w-5" />
          Services
        </button>
      </div>

      {/* Contenu principal */}
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        
        {/* Header avec filtres */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <QuestionMarkCircleIcon className="h-6 w-6 text-purple-600" />
              Section FAQ
            </h2>
            
            <button
              onClick={handleAddFaq}
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <PlusCircleIcon className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>Nouvelle question</span>
            </button>
          </div>

          <p className="text-gray-600 mb-6">
            Modifiez les questions et réponses qui apparaissent sur la page FAQ publique.
            Les changements seront immédiatement visibles sur le site.
          </p>

          {/* Filtres */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher dans la FAQ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
              />
            </div>
            
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none appearance-none transition-all duration-300"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'Toutes les catégories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Liste des questions FAQ */}
        <div className="p-6">
          <div className="space-y-4">
            {filteredFaq.length > 0 ? (
              filteredFaq.map((item, index) => {
                const originalIndex = faq.findIndex(f => f.id === item.id);
                return (
                  <div
                    key={item.id}
                    className="group bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Header de l'item */}
                    <div
                      onClick={() => toggleExpand(originalIndex)}
                      className="p-5 cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                            Q
                          </div>
                          <span className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
                            {item.question}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                            {item.category}
                          </span>
                          {expandedItems.includes(originalIndex) ? (
                            <span className="text-xs text-gray-500">Cliquez pour réduire</span>
                          ) : (
                            <span className="text-xs text-gray-500">Cliquez pour modifier</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFaq(item.id);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                        {expandedItems.includes(originalIndex) ? (
                          <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Contenu détaillé */}
                    {expandedItems.includes(originalIndex) && (
                      <div className="p-5 border-t border-gray-200 bg-gradient-to-br from-white to-gray-50 animate-slideDown">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Question
                            </label>
                            <input
                              type="text"
                              value={item.question}
                              onChange={(e) => handleFaqChange(originalIndex, 'question', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Réponse
                            </label>
                            <textarea
                              value={item.answer}
                              onChange={(e) => handleFaqChange(originalIndex, 'answer', e.target.value)}
                              rows="4"
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 resize-none"
                              placeholder="Entrez la réponse ici..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Catégorie
                            </label>
                            <select
                              value={item.category}
                              onChange={(e) => handleFaqChange(originalIndex, 'category', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300"
                            >
                              <option value="général">Général</option>
                              <option value="délais">Délais</option>
                              <option value="compatibilité">Compatibilité</option>
                              <option value="prix">Prix</option>
                            </select>
                          </div>

                          <div className="flex justify-end gap-3 pt-4">
                            <button
                              onClick={() => toggleExpand(originalIndex)}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors duration-300"
                            >
                              Fermer
                            </button>
                            <button
                              onClick={() => {
                                setMessage({ type: 'success', text: 'Modifications enregistrées localement' });
                                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                            >
                              Sauvegarder
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <QuestionMarkCircleIcon className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg font-medium">Aucune question trouvée</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchTerm || categoryFilter !== 'all' ? 'Essayez de modifier vos filtres' : 'Commencez par ajouter une question'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section aperçu en temps réel */}
      <div className="mt-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-1 shadow-2xl">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <EyeIcon className="h-5 w-5 text-purple-600" />
              Aperçu en temps réel
            </h3>
            <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
              Version publique
            </span>
          </div>
          
          <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
            {faq.slice(0, 3).map(item => (
              <div key={item.id} className="bg-gray-50 rounded-xl p-4">
                <p className="font-medium text-gray-900 mb-2">{item.question}</p>
                <p className="text-gray-600 text-sm line-clamp-2">{item.answer}</p>
              </div>
            ))}
            {faq.length > 3 && (
              <p className="text-center text-sm text-gray-500">
                + {faq.length - 3} autres questions...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Autres sections (cachées selon l'onglet actif) */}
      {activeTab === 'home' && (
        <div className="mt-6 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 text-center">
          <SparklesIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-700 mb-2">Page d'accueil</h3>
          <p className="text-gray-500">Configuration de la page d'accueil à venir...</p>
        </div>
      )}

      {activeTab === 'services' && (
        <div className="mt-6 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 text-center">
          <InformationCircleIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-700 mb-2">Gestion des services</h3>
          <p className="text-gray-500">Configuration des services à venir...</p>
        </div>
      )}
    </div>
  );
};

export default AdminContentPage;