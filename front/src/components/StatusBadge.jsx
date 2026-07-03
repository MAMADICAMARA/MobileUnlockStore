const StatusBadge = ({ status }) => {
  const styles = {
    'En cours': 'bg-blue-100 text-blue-800',
    'Annulé':   'bg-red-100 text-red-800',
    'Terminé':  'bg-green-100 text-green-800',
    'Réussi':   'bg-green-100 text-green-800',
    'Échoué':   'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
