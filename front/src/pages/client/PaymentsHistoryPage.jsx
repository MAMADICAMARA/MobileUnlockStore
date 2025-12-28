// src/pages/client/PaymentsHistoryPage.jsx
import { useEffect, useState } from 'react';
import paymentService from '../../services/paymentService';

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const StatusBadge = ({ status }) => {
  const styles = {
    'Réussi': 'bg-green-100 text-green-800',
    'Échoué': 'bg-red-100 text-red-800',
    'En attente': 'bg-yellow-100 text-yellow-800',
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>{status}</span>;
};

const PaymentsHistoryPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const response = await paymentService.getPayments();
        setPayments(response.data);
      } catch (err) {
        setPayments([]);
      }
      setLoading(false);
    };
    fetchPayments();
  }, []);

  return (
    <div>
      <h1 className="text-3xl text-blue-700 font-bold mb-6">Historique des Paiements</h1>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        {loading ? <p className="p-4">Chargement...</p> : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map(payment => (
                <tr key={payment._id}>
                  <td className="px-6 py-4">{formatDate(payment.createdAt)}</td>
                  <td className="px-6 py-4 text-right font-semibold">{payment.amount.toFixed(2)} €</td>
                  <td className="px-6 py-4">{payment.type}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={payment.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PaymentsHistoryPage;
