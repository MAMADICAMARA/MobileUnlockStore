// src/pages/remote-services.jsx
import { useEffect } from 'react';
import ServiceList from '../components/ServiceList';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Globe, Wifi, Monitor, Lock, Headphones, Zap } from 'lucide-react';

export default function RemoteServicesPage() {
  // Scroll to top au chargement
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      {/* Hero section spécifique au remote */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">Accès instantané depuis n'importe où</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Services Remote
              </h1>
              
              <p className="text-xl text-purple-50 mb-8">
                Accédez à vos applications et bureaux à distance en toute sécurité. 
                Solutions de télétravail, assistance technique et maintenance.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Wifi className="w-4 h-4" />
                  <span>Connexion sécurisée</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Monitor className="w-4 h-4" />
                  <span>Multi-plateforme</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Lock className="w-4 h-4" />
                  <span>Chiffrement AES-256</span>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl">
                <h3 className="text-2xl font-bold mb-4">Comment ça marche ?</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">1</div>
                    <div>
                      <p className="font-semibold">Choisissez votre formule</p>
                      <p className="text-sm text-purple-200">Selon vos besoins (1h, 24h, 7j)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">2</div>
                    <div>
                      <p className="font-semibold">Commande immédiate</p>
                      <p className="text-sm text-purple-200">Recevez vos identifiants temporaires</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">3</div>
                    <div>
                      <p className="font-semibold">Connexion et utilisation</p>
                      <p className="text-sm text-purple-200">Accédez à votre session à distance</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Liste des services remote */}
      <ServiceList 
        category="remote" 
        title="Solutions d'Accès à Distance" 
      />

      {/* Section fonctionnalités */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Fonctionnalités avancées
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Des outils professionnels pour le télétravail, l'assistance technique et la maintenance
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold mb-2">Connexion instantanée</h3>
              <p className="text-sm text-gray-600">Accès en moins de 5 secondes</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold mb-2">Chiffrement militaire</h3>
              <p className="text-sm text-gray-600">AES-256 pour vos données</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Monitor className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold mb-2">Multi-écrans</h3>
              <p className="text-sm text-gray-600">Support de plusieurs moniteurs</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold mb-2">Support inclus</h3>
              <p className="text-sm text-gray-600">Assistance pendant la session</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}