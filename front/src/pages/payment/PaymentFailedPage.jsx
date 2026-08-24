// src/pages/payment/PaymentFailedPage.jsx
import { useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const PaymentFailedPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const ref = searchParams.get('ref');

  const addFundsPath = `/${user?.role === 'utilisateur-employer' ? 'employee' : 'client'}/add-funds`;
  const dashboardPath = `/${user?.role === 'utilisateur-employer' ? 'employee' : 'client'}/dashboard`;

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center space-y-4">
        <XCircle className="w-14 h-14 text-red-500 mx-auto" />
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Paiement échoué ou annulé</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Le montant n'a pas été débité de votre compte.
        </p>
        {ref && <p className="text-xs text-gray-400 font-mono">Référence : {ref}</p>}

        <div className="flex gap-3 pt-2">
          <button onClick={() => navigate(addFundsPath)}
            className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-sm">
            Réessayer
          </button>
          <button onClick={() => navigate(dashboardPath)}
            className="flex-1 py-3 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-sm">
            Retour
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;
