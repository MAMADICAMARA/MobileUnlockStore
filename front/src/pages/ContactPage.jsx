// src/pages/ContactPage.jsx
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

/**
 * Composant pour la page de contact.
 * Affiche un formulaire de contact et les coordonnées de l'entreprise.
 */
const ContactPage = () => {
  
  // Gestionnaire de soumission de formulaire (à implémenter)
  const handleSubmit = (event) => {
    event.preventDefault();
    // Logique pour envoyer le message (par exemple, appel API)
    alert('Fonctionnalité à implémenter : envoi du message.');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-blue-700 mb-8">Contactez-nous</h1>
        <p className="mb-6 text-gray-600">Une question, un problème ? Remplissez le formulaire ci-dessous ou contactez-nous par email.</p>
        
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 rounded-lg shadow-md">
          {/* Formulaire de contact */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom complet</label>
              <input type="text" id="name" name="name" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adresse e-mail</label>
              <input type="email" id="email" name="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Sujet</label>
              <input type="text" id="subject" name="subject" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Votre message</label>
              <textarea id="message" name="message" rows="4" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
            <div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Envoyer le message
              </button>
            </div>
          </form>

          {/* Informations de contact */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Nos coordonnées</h2>
            <p className="text-gray-600">
              Vous avez une question ? N'hésitez pas à nous contacter directement. Notre équipe est là pour vous aider.
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <span className="mt-1 mr-3 text-blue-600">📍</span>
                <p className="text-gray-700">Mamou</p>
              </div>
              <div className="flex items-start">
                <span className="mt-1 mr-3 text-blue-600">📧</span>
                <p className="text-gray-700">Mamadicamara566@gmail.com</p>
              </div>
              <div className="flex items-start">
                <span className="mt-1 mr-3 text-blue-600">📞</span>
                <p className="text-gray-700">+224 621 656 424</p>
              </div>
            </div>
            <p className="text-gray-600">
              Pour les demandes de support technique, veuillez utiliser le système de tickets dans votre <Link to="/client/support" className="text-blue-600 hover:underline">espace client</Link> .
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
