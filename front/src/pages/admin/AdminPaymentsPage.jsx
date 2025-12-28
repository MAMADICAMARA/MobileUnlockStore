// src/pages/admin/AdminPaymentsPage.jsx
import { useState, useEffect } from 'react';
import adminService from "../../services/adminService";
import StatusBadge from "../../components/StatusBadge";

/**
 * Page de visualisation des paiements pour l'administrateur.
 */
const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const response = await adminService.getAllPayments();
        setPayments(response.data);
      } catch (err) {
        setPayments([]);
      }
      setLoading(false);
    };
    fetchPayments();
  }, []);

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl text-blue-700 font-bold mb-6">Historique des Paiements</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map(payment => (
              <tr key={payment._id}>
                <td className="px-6 py-4 text-blue-600">{payment.user?.name || payment.user?.email || 'Utilisateur'}</td>
                <td className="px-6 py-4 text-right text-blue-700 font-semibold">{payment.amount.toFixed(2)} €</td>
                <td className="px-6 text-blue-600 py-4">{payment.date ? payment.date : payment.createdAt}</td>
                <td className="px-6 text-blue-600 py-4">
                  <StatusBadge status={payment.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPaymentsPage;
