// src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Zap, 
  Headphones, 
  Star, 
  ChevronRight, 
  Lock, 
  Smartphone, 
  CheckCircle,
  ArrowRight,
  Sparkles,
  Phone,
  Tablet,
  Laptop,
  Clock,
  Users,
  Award,
  Play,
  Pause
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Données fictives pour les témoignages


const sliderImages = [
  {
    url: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "Déblocage iPhone",
    subtitle: "iCloud, MDM, Mot de passe oublié"
  },
  {
    url: "https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "Déblocage Android",
    subtitle: "FRP, Écran verrouillé, Compte Google"
  },
  {
    url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "Solutions MDM",
    subtitle: "Déblocage entreprise et institutionnel"
  },
  {
    url: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "Support 24/7",
    subtitle: "Assistance en direct toute l'année"
  }
];

const stats = [
  { icon: Users, value: '10K+', label: 'Clients satisfaits', color: 'from-blue-400 to-cyan-400' },
  { icon: Clock, value: '< 15min', label: 'Délai moyen', color: 'from-purple-400 to-pink-400' },
  { icon: Award, value: '99.9%', label: 'Taux de réussite', color: 'from-green-400 to-emerald-400' },
  { icon: Smartphone, value: '50K+', label: 'Appareils débloqués', color: 'from-orange-400 to-amber-400' },
];

const services = [
  {
    icon: Smartphone,
    title: 'Déblocage iPhone',
    description: 'iCloud, MDM, mot de passe oublié - Tous modèles',
    price: 'À partir de 29.99 FG',
    color: 'from-blue-500 to-cyan-500',
    features: ['iPhone 6 à 15', 'iCloud Activation', 'MDM Enterprise']
  },
  {
    icon: Phone,
    title: 'Déblocage Android',
    description: 'FRP, verrouillage écran, compte Google',
    price: 'À partir de 19.99 FG',
    color: 'from-purple-500 to-pink-500',
    features: ['Samsung, Huawei, Xiaomi', 'FRP Bypass', 'Compte Google']
  },
  {
    icon: Tablet,
    title: 'Déblocage Tablette',
    description: 'iPad, Samsung Tab, Huawei MediaPad',
    price: 'À partir de 24.99 FG',
    color: 'from-green-500 to-emerald-500',
    features: ['Toutes marques', 'iCloud iPad', 'FRP Tablette']
  },
  {
    icon: Laptop,
    title: 'Solutions Entreprise',
    description: 'MDM, déploiement masse, gestion parc',
    price: 'Sur devis',
    color: 'from-orange-500 to-amber-500',
    features: ['Parc d\'entreprise', 'Déploiement', 'Support dédié']
  }
];

/**
 * Composant pour la page d'accueil.
 * Présente le service avec une bannière, les avantages et des témoignages.
 */
const HomePage = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let interval;
    if (isAutoPlay) {
      interval = setInterval(() => {
        setCurrent(prev => (prev + 1) % sliderImages.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlay]);

  // Effet de parallaxe sur le slider
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % sliderImages.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
      <Header />
      
      <main className="overflow-hidden">
        {/* Section Héro avec Slider - Ultra moderne */}
        <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
          {/* Slider d'images en background avec effet parallaxe */}
          <div className="absolute inset-0 w-full h-full">
            
            {sliderImages.map((img, idx) => (
              <div
                key={idx}
                className="absolute inset-0 transition-all duration-1000 ease-out"
                style={{
                  opacity: current === idx ? 1 : 0,
                  transform: current === idx ? `translate(${mousePosition.x}px, ${mousePosition.y}px)` : 'none',
                  scale: current === idx ? 1.1 : 1,
                }}
              >
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover"
                />
                {/* Overlay gradient dynamique */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
              </div>
            ))}
          </div>

          {/* Contenu du slider */}
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              {/* Badge animé */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white mb-6 animate-fadeIn">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium">Déblocage instantané - 100% sécurisé</span>
              </div>

              {/* Titre avec animation */}
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-slideUp">
                {sliderImages[current].title}
              </h1>
              
              {/* Sous-titre */}
              <p className="text-xl md:text-2xl text-white/80 mb-8 animate-slideUp animation-delay-200">
                {sliderImages[current].subtitle}
              </p>

              {/* Boutons CTA */}
              <div className="flex flex-wrap gap-4 animate-slideUp animation-delay-400">
                <button
                  onClick={() => navigate('/services')}
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Découvrir nos services
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
                
                <button
                  onClick={() => navigate('/contact')}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 hover:scale-105"
                >
                  Contacter le support
                </button>
              </div>
            </div>
          </div>

          {/* Contrôles du slider */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-4">
            <button
              onClick={prevSlide}
              className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all"
              aria-label="Précédent"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            
            {/* Indicateurs */}
            <div className="flex gap-2">
              {sliderImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    current === idx 
                      ? 'w-8 bg-white' 
                      : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Aller à la slide ${idx + 1}`}
                />
              ))}
            </div>
            
            <button
              onClick={nextSlide}
              className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all"
              aria-label="Suivant"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Bouton pause/play */}
            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all ml-4"
              aria-label={isAutoPlay ? "Pause" : "Lecture"}
            >
              {isAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 right-8 z-20 hidden lg:block animate-bounce">
            <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center">
              <div className="w-1 h-2 bg-white rounded-full mt-2 animate-scroll"></div>
            </div>
          </div>
        </section>

        {/* Section Statistiques */}
        <section className="py-20 bg-white dark:bg-slate-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="text-center group cursor-pointer"
                >
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${stat.color} bg-opacity-10 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Services */}
        <section className="py-20 bg-gray-50 dark:bg-slate-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Nos services de déblocage
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Des solutions professionnelles pour tous vos besoins de déblocage mobile
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {services.map((service, idx) => (
                <div
                  key={idx}
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                  onClick={() => navigate('/services')}
                >
                  {/* Badge gradient */}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${service.color} text-white opacity-0 group-hover:opacity-100 transition-opacity`}>
                    {service.price}
                  </div>

                  {/* Icône */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${service.color} bg-opacity-10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <service.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {service.description}
                  </p>

                  {/* Features list */}
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Lien */}
                  <div className="flex items-center gap-2 text-blue-500 font-semibold group-hover:gap-3 transition-all">
                    En savoir plus
                    <ArrowRight className="w-4 h-4" />
                  </div>

                  {/* Effet de glow */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${service.color} opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none`}></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        
        

        {/* Section CTA */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"></div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Prêt à débloquer votre appareil ?
              </h2>
              <p className="text-xl text-white/80 mb-8">
                Rejoignez des milliers de clients satisfaits et débloquez votre mobile en quelques minutes
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => navigate('/register')}
                  className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  Commencer maintenant
                </button>
                <button
                  onClick={() => navigate('/contact')}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300"
                >
                  Contactez-nous
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;