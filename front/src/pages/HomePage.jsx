// src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Données fictives pour les témoignages
const testimonials = [
  {
    id: 1,
    name: 'Jean Dupont',
    quote: 'Service ultra-rapide et efficace. Mon téléphone a été débloqué en moins de 10 minutes. Je recommande vivement !',
    avatar: 'https://via.placeholder.com/150' // URL d'un avatar
  },
  {
    id: 2,
    name: 'Marie Curie',
    quote: 'Le support client est exceptionnel. Ils m\'ont guidée pas à pas pour l\'activation de ma licence. Très professionnel.',
    avatar: 'https://via.placeholder.com/150'
  },
  {
    id: 3,
    name: 'Pierre Martin',
    quote: 'Enfin un service fiable et sécurisé. J\'avais des doutes au début, mais tout s\'est parfaitement déroulé.',
    avatar: 'https://via.placeholder.com/150'
  }
];

const sliderImages = [
  // Android bloqué (FRP, écran verrouillage, MDM)
  "https://th.bing.com/th/id/R.4ff76aa3a7a592ac0984fe86839f60ce?rik=u7K5fTjDhOR0Vw&pid=ImgRaw&r=0",
  "https://th.bing.com/th/id/R.d614147e8923f3447b67fe435d4ef85c?rik=W%2foQHJORt70kmQ&pid=ImgRaw&r=0",
  // iPhone bloqué (iCloud, mot de passe oublié, MDM)
  "https://th.bing.com/th/id/OIP.wn_lE3ArUtorhadV5gcTwgHaEu?w=247&h=180&c=7&r=0&o=7&pid=1.7&rm=3",
  "https://th.bing.com/th/id/OIP.bxtfP-Ue4N9iHCUuaPQr9gHaEI?w=266&h=180&c=7&r=0&o=7&pid=1.7&rm=3",
  // (Tu peux ajouter d'autres images ici)
];

/**
 * Composant pour la page d'accueil.
 * Présente le service avec une bannière, les avantages et des témoignages.
 */
const HomePage = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % sliderImages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Intercepte seulement les clics sur liens d'accès à l'espace utilisateur/admin
  // (profil, dashboard, sections du panneau). Ciblé pour éviter les conflits globaux.
  useEffect(() => {
    const handleClick = (e) => {
      const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || typeof href !== 'string') return;

      // Liste courte des chemins d'espace utilisateur/admin (adapter si besoin)
      const targets = [
        '/profile', '/user/profile', '/dashboard', '/admin', '/admin/dashboard',
        '/user', '/account', '/settings'
      ];

      const isTarget = targets.some(p => href === p || href.startsWith(p + '/') || href.startsWith(p + '?') || href.startsWith(p + '#'));
      if (!isTarget) return;

      // Ignorer liens externes et mails
      if (href.startsWith('mailto:') || href.startsWith('http') && !href.startsWith(window.location.origin)) return;
      // effect navigation via react-router
      e.preventDefault();
      try {
        navigate(href);
      } catch (err) {
        // fallback: laisser le comportement natif si navigate échoue
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [navigate]);

  return (
    <div className="bg-gray-50">
      <Header />
      <main>
        {/* Section Bannière Principale avec slider */}
        <section className="relative h-80 flex items-center justify-center overflow-hidden">
          {/* Slider d'images en background */}
          <div className="absolute inset-0 w-full h-full">
            {sliderImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`slide-${idx}`}
                className={`object-contain w-full h-full absolute transition-opacity duration-1000 ${current === idx ? 'opacity-100' : 'opacity-0'}`}
                style={{ zIndex: current === idx ? 1 : 0 }}
              />
            ))}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          </div>
          {/* Titre en avant-plan */}
          <h1 className="relative z-10 text-4xl md:text-5xl font-extrabold text-white text-center drop-shadow-lg">
            Débloquez votre mobile en toute sécurité
          </h1>
        </section>

        {/* Section Avantages */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl text-blue-700 font-bold mb-12">Pourquoi nous choisir ?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center">
                <div className="bg-blue-100 text-blue-600 rounded-full p-4 mb-4">
                  {/* Icône de sécurité (exemple) */}
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 018.618-3.04 11.955 11.955 0 018.618 3.04 12.02 12.02 0 00-3-14.968z"></path></svg>
                </div>
                <h3 className="text-xl text-blue-700 font-bold mb-2">Sécurité Garantie</h3>
                <p className="text-gray-600">Vos données et votre appareil sont traités avec le plus grand soin et en toute confidentialité.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-blue-100 text-blue-600 rounded-full p-4 mb-4">
                  {/* Icône de rapidité (exemple) */}
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <h3 className="text-xl text-blue-700 font-bold mb-2">Rapidité d'Exécution</h3>
                <p className="text-gray-600">La plupart de nos services sont traités en quelques minutes pour un résultat quasi instantané.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-blue-100 text-blue-600 rounded-full p-4 mb-4">
                  {/* Icône de support (exemple) */}
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V10a2 2 0 012-2h1V6a4 4 0 014-4h0a4 4 0 014 4v2z"></path></svg>
                </div>
                <h3 className="text-xl text-blue-700 font-bold mb-2">Support Professionnel</h3>
                <p className="text-gray-600">Notre équipe est disponible pour répondre à toutes vos questions et vous assister à chaque étape.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section Témoignages */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-blue-700 text-center mb-12">Ce que disent nos clients</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-gray-50 p-6 rounded-lg shadow-sm">
                  <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <img src="/logo.png" alt="Logo" />
                    <div>
                      <p className="font-bold">{testimonial.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
