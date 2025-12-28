import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import adminService from '../../services/adminService';

const AdminRechargeUserPage = () => {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        try {
            setError('');
            setSuccess('');
            await adminService.rechargeUserBalance(data);
            setSuccess('Balance rechargée avec succès');
            toast.success('Balance rechargée avec succès');
            reset();
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Une erreur est survenue";
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Recharger un client</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-md">
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                        Email du client
                    </label>
                    <input
                        type="email"
                        {...register('email', { 
                            required: "L'email est requis",
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Email invalide"
                            }
                        })}
                        className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="email@exemple.com"
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.email.message}
                        </p>
                    )}
                </div>
                
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                        Montant
                    </label>
                    <input
                        type="number"
                        {...register('amount', { 
                            required: "Le montant est requis",
                            min: {
                                value: 1,
                                message: "Le montant doit être supérieur à 0"
                            }
                        })}
                        className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                    />
                    {errors.amount && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.amount.message}
                        </p>
                    )}
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                        {success}
                    </div>
                )}
                
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Confirmer le rechargement
                </button>
            </form>
        </div>
    );
};

export default AdminRechargeUserPage;