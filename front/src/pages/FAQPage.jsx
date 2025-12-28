// src/pages/FAQPage.jsx
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useState } from 'react';

// Données pour la FAQ
const faqData = [
  {
    question: 'Qu\'est-ce que le déblocage par IMEI ?',
    answer: 'Le déblocage par IMEI est une méthode officielle et sécurisée pour déverrouiller votre téléphone. Nous utilisons le numéro IMEI unique de votre appareil pour l\'enregistrer comme "débloqué" dans les bases de données du fabricant et de l\'opérateur, sans modifier le logiciel de votre téléphone.'
  },
  {
    question: 'Combien de temps prend le processus ?',
    answer: 'Le délai varie en fonction du service choisi. De nombreux services sont instantanés ou prennent quelques minutes. Les délais estimés sont clairement indiqués sur la page de chaque service avant que vous ne passiez commande.'
  },
  {
    question: 'Le déblocage est-il permanent ?',
    answer: 'Oui, tous nos déblocages sont permanents. Vous pourrez mettre à jour votre téléphone, le réinitialiser et utiliser n\'importe quelle carte SIM sans jamais avoir à le débloquer à nouveau.'
  },
  {
    question: 'Mon téléphone sera-t-il endommagé ?',
    answer: 'Non, absolument pas. Nos méthodes sont 100% sécurisées et n\'affectent en rien le matériel ou le logiciel de votre téléphone. La garantie de votre appareil est préservée.'
  },
  {
    question: 'Que se passe-t-il si mon déblocage échoue ?',
    answer: 'Dans le cas rare où un déblocage ne pourrait pas être effectué, vous serez intégralement remboursé sur le solde de votre compte. La transparence et votre satisfaction sont nos priorités.'
  }
];

/**
 * Composant pour un seul item de la FAQ avec un effet d'accordéon.
 */
const FaqItem = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left py-4 px-6 flex justify-between items-center focus:outline-none"
      >
        <span className="text-lg font-medium">{item.question}</span>
        <span className="transform transition-transform duration-300">
          {isOpen ? '-' : '+'}
        </span>
      </button>
      {isOpen && (
        <div className="px-6 pb-4 text-gray-600">
          <p>{item.answer}</p>
        </div>
      )}
    </div>
  );
};

/**
 * Composant pour la page FAQ.
 * Affiche une liste de questions et réponses fréquentes.
 */
const FAQPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12">Foire Aux Questions (FAQ)</h1>
        <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg">
          {faqData.map((item, index) => (
            <FaqItem key={index} item={item} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQPage;
