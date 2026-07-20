// src/components/WhatsAppButton.jsx
const WhatsAppButton = () => {
  const phone   = '224612563702';
  const message = encodeURIComponent('Bonjour, j\'ai besoin d\'aide concernant mon compte.');
  const url     = `https://wa.me/${phone}?text=${message}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter le support WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg bg-[#25D366] hover:bg-[#1ebe5d] transition-all duration-300 hover:scale-110 group"
    >
      {/* Icône WhatsApp SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="w-8 h-8 fill-white"
      >
        <path d="M16.003 2.667C8.638 2.667 2.667 8.638 2.667 16c0 2.354.633 4.559 1.733 6.463L2.667 29.333l7.07-1.703A13.267 13.267 0 0 0 16.003 29.333C23.362 29.333 29.333 23.362 29.333 16S23.362 2.667 16.003 2.667zm0 24.267a11.03 11.03 0 0 1-5.61-1.534l-.402-.238-4.194 1.011.99-4.09-.261-.42A11.04 11.04 0 0 1 4.94 16c0-6.107 4.956-11.067 11.063-11.067S27.067 9.893 27.067 16 22.11 26.934 16.003 26.934zm6.07-8.27c-.332-.166-1.963-.967-2.268-1.078-.305-.11-.527-.166-.748.166-.222.332-.858 1.078-1.051 1.3-.194.22-.388.248-.72.082-.332-.166-1.402-.516-2.67-1.647-.986-.88-1.652-1.966-1.846-2.298-.193-.332-.02-.512.146-.677.15-.149.332-.388.499-.582.166-.193.22-.332.332-.554.11-.22.055-.415-.028-.582-.082-.166-.748-1.804-1.025-2.47-.27-.648-.545-.56-.748-.57l-.637-.012c-.22 0-.582.082-.887.415-.305.332-1.162 1.136-1.162 2.77 0 1.635 1.19 3.214 1.356 3.436.166.22 2.341 3.574 5.673 5.013.793.343 1.412.547 1.894.7.796.253 1.52.218 2.093.132.638-.095 1.963-.803 2.24-1.579.277-.775.277-1.44.194-1.579-.082-.138-.305-.22-.637-.387z"/>
      </svg>

      {/* Tooltip */}
      <span className="absolute right-16 bg-white text-gray-800 text-xs font-medium px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        Contacter le support
      </span>

      {/* Pulse animation */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
    </a>
  );
};

export default WhatsAppButton;
