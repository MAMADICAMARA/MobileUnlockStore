// src/pages/client/AddFundsPage.jsx
import { FaWhatsapp } from "react-icons/fa";

const AddFundsPage = () => {
  const adminPhone = "224611066809"; // ← Mets ton numéro WhatsApp ici (format international)
  const message = encodeURIComponent(
    "Bonjour Admin, je souhaite ajouter des fonds à mon compte."
  );

  const whatsappUrl = `https://wa.me/${adminPhone}?text=${message}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center px-6 py-12">
      
      {/* Carte centrale */}
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-lg w-full text-center border border-gray-100">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">
          Bienvenu sur la page d'ajout de fonds
        </h1>

        <p className="text-gray-600 text-lg leading-relaxed mb-8">
          Merci de bien vouloir ajouter des fonds dans votre compte.
          <br />
          <span className="font-semibold text-gray-800">
            Veuillez contacter l’administrateur pour ajouter des fonds à votre compte.
          </span>
        </p>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all"
        >
          <FaWhatsapp size={24} />
          Contactez-nous sur WhatsApp
        </a>
      </div>

      {/* Icône WhatsApp flottante */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-xl transition-all animate-bounce"
      >
        <FaWhatsapp size={28} />
      </a>
    </div>
  );
};

export default AddFundsPage;





