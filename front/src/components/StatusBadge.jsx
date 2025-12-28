const StatusBadge = ({ status }) => {
  const styles = {
    'Réussi': 'bg-green-100 text-green-800',
    'Échoué': 'bg-red-100 text-red-800',
    'En attente': 'bg-yellow-100 text-yellow-800',
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>{status}</span>;
};

export default StatusBadge;
