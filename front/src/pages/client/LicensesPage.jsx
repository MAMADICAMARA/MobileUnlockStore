// src/pages/client/LicensesPage.jsx
import { useState, useEffect } from 'react';
import licenseService from '../../services/licenseService';

// Formate la date pour l'affichage
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

// Composant pour afficher un badge de statut coloré
const StatusBadge = ({ expiryDate }) => {
  const isExpired = new Date(expiryDate) < new Date();
  const statusText = isExpired ? 'Expiré' : 'Actif';
  const statusClass = isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';

  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClass}`}>{statusText}</span>;
};

/**
 * Page affichant la liste des licences logicielles du client.
 */
const LicensesPage = () => {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLicenses = async () => {
      try {
        const response = await licenseService.getLicenses();
        setLicenses(response.data);
      } catch (err) {
        setError('Impossible de charger les licences.');
      } finally {
        setLoading(false);
      }
    };
    fetchLicenses();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Mes Licences</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {loading && <p className="p-4">Chargement...</p>}
        {error && <p className="p-4 text-red-500">{error}</p>}
        {!loading && !error && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clé de licence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date d'expiration</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {licenses.map(license => (
                <tr key={license._id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{license.productName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">{license.key}</td>
                  <td className="px-6 py-4 text-sm">
                    <StatusBadge expiryDate={license.expiryDate} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(license.expiryDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LicensesPage;
