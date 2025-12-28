// src/components/Footer.jsx

/**
 * Composant du pied de page de l'application.
 * Affiche les informations légales, les liens vers les réseaux sociaux, etc.
 */
const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Section "À propos" */}
          <div>
            <h3 className="text-lg font-bold mb-4">À propos</h3>
            <p className="text-gray-400">
              Notre service de déblocage de mobiles vous offre une solution rapide, sécurisée et professionnelle.
            </p>
          </div>

          {/* Section "Liens rapides" */}
          <div>
            <h3 className="text-lg font-bold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 hover:text-white">Accueil</a></li>
              <li><a href="/services" className="text-gray-400 hover:text-white">Services</a></li>
              <li><a href="/faq" className="text-gray-400 hover:text-white">FAQ</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white">Contact</a></li>
            </ul>
          </div>

          {/* Section "Réseaux sociaux" */}
          <div>
            <h3 className="text-lg font-bold mb-4">Suivez-nous</h3>
            <div className="flex space-x-4">
              {/* Remplacez # par vos vrais liens */}
              <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
              <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-white">Instagram</a>
            </div>
          </div>
        </div>

        {/* Ligne de séparation et mentions légales */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} VotreNomDeService. Tous droits réservés.</p>
          <p className="mt-2">
            <a href="/mentions-legales" className="hover:text-white">Mentions Légales</a> | <a href="/cgu" className="hover:text-white">Conditions Générales d'Utilisation</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
