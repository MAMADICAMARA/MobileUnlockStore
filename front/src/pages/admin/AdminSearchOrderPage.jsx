// src/pages/admin/AdminSearchOrderPage.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';

const AdminSearchOrderPage = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async ({ orderCode }) => {
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const response = await adminService.getOrderByCode(orderCode.trim());
      setOrder(response.data);
      toast.success('Commande trouvée !');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Commande non trouvée ou erreur serveur.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleString('fr-FR');

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Rechercher une commande par code</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mb-8">
        <div className="flex items-center gap-4">
          <input
            type="text"
            {...register('orderCode', { required: true })}
            className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Entrez le code de la commande (ex: CMD-123...)"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Recherche...' : 'Rechercher'}
          </button>
        </div>
      </form>

      {error && <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

      {order && (
        <div className="bg-white shadow-lg rounded-lg p-6 mt-8">
          <h3 className="text-xl font-semibold mb-4">Détails de la commande</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Code :</strong> {order.orderCode}</p>
              <p><strong>Statut :</strong> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                  order.status === 'En cours' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'Terminé' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </p>
              <p><strong>Date :</strong> {formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p><strong>Client :</strong> {order.user?.name} ({order.user?.email})</p>
              <p><strong>Service :</strong> {order.serviceDetails?.name}</p>
              <p><strong>Prix :</strong> {order.serviceDetails?.price} €</p>
            </div>
            {order.fields && Object.keys(order.fields).length > 0 && (
              <div className="md:col-span-2 mt-4">
                <h4 className="font-semibold">Informations fournies :</h4>
                <ul className="list-disc list-inside bg-gray-50 p-3 rounded-md mt-2">
                  {Object.entries(order.fields).map(([key, value]) => (
                    <li key={key}><strong>{key}:</strong> {value}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSearchOrderPage;
