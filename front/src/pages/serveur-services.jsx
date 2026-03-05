// src/pages/serveur-services.jsx
import { useEffect } from 'react';
import ServiceList from '../components/ServiceList';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Server, Shield, Zap, Clock, Users, HardDrive } from 'lucide-react';

export default function ServeurServicesPage() {
  // Scroll to top au chargement
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      {/* Hero section spécifique aux serveurs */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Server className="w-4 h-4" />
                <span className="text-sm font-medium">Infrastructure haut de gamme</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Services Serveur
              </h1>
              
              <p className="text-xl text-green-50 mb-8">
                Solutions d'hébergement professionnelles, VPS, serveurs dédiés et cloud computing 
                adaptés à tous vos besoins.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Zap className="w-4 h-4" />
                  <span>Haute disponibilité</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Shield className="w-4 h-4" />
                  <span>Sécurité renforcée</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span>Support 24/7</span>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2 flex justify-center">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl text-center">
                  <HardDrive className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-2xl font-bold">SSD NVMe</div>
                  <div className="text-sm opacity-80">Stockage rapide</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl text-center">
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-2xl font-bold">99.9%</div>
                  <div className="text-sm opacity-80">Uptime garanti</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Liste des services serveur */}
      <ServiceList 
        category="serveur" 
        title="Nos Solutions Serveur" 
      />

      {/* Section avantages */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Pourquoi choisir nos services serveur ?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Performance optimale</h3>
              <p className="text-gray-600">
                Infrastructure dernier cri avec processeurs haute performance et SSD NVMe pour des temps de réponse exceptionnels.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Sécurité maximale</h3>
              <p className="text-gray-600">
                Firewall dédié, protection DDoS, sauvegardes automatiques et monitoring 24/7 pour vos données.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Support expert</h3>
              <p className="text-gray-600">
                Équipe technique disponible 24h/24 et 7j/7 pour vous accompagner dans la gestion de votre serveur.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}