// src/pages/payment/PaymentSuccessPage.jsx
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import paymentService from '../../services/paymentService';

const formatFG = (n) => new Intl.NumberFormat('fr-FR').format(n || 0);

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, updateUserBalance } = useAuth();
  const ref = searchParams.get('ref');
  const [status, setStatus] = useState('loading'); // loading | completed | pending | failed
  const [transaction, setTransaction] = useState(null);

  useEffect(() => {
    if (!ref) { setStatus('failed'); return; }
    const check = async () => {
      try {
        const res = await paymentService.getStatus(ref);
        const tx = res.data.data;
        setTransaction(tx);
        setStatus(tx.status === 'completed' ? 'completed' : tx.status === 'pending' ? 'pending' : 'failed');
        if (tx.status === 'completed' && updateUserBalance) {
          updateUserBalance((user?.balance || 0) + tx.amountCredited);
        }
      } catch {
        setStatus('failed');
      }
    };
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  const dashboardPath = `/${user?.role === 'utilisateur-employer' ? 'employee' : 'client'}/dashboard`;

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center space-y-4">
        {status === 'loading' && (
          <>
            <Loader2 className="w-14 h-14 text-blue-500 mx-auto animate-spin" />
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Vérification du paiement...</h1>
          </>
        )}
        {status === 'pending' && (
          <>
            <Loader2 className="w-14 h-14 text-amber-500 mx-auto animate-spin" />
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Paiement en cours de confirmation</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Votre solde sera crédité automatiquement dès la confirmation du fournisseur.
            </p>
          </>
        )}
        {status === 'completed' && transaction && (
          <>
            <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Paiement confirmé !</h1>
            <p className="text-3xl font-black text-green-600">{formatFG(transaction.amountCredited)} FG</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Référence : {transaction.internalRef}</p>
          </>
        )}
        {status === 'failed' && (
          <>
            <XCircle className="w-14 h-14 text-red-500 mx-auto" />
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Paiement échoué ou introuvable</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Le montant n'a pas été débité. Réessayez depuis la page de recharge.</p>
          </>
        )}

        <button onClick={() => navigate(dashboardPath)}
          className="w-full mt-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
          Retour au tableau de bord <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
