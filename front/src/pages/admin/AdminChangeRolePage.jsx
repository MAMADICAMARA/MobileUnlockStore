// src/pages/admin/AdminChangeRolePage.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';

const AdminChangeRolePage = () => {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [userData, setUserData] = useState(null);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        try {
            setError('');
            setSuccess('');
            setUserData(null);

            const response = await adminService.changeUserRole(data);
            setSuccess('Rôle mis à jour avec succès');
            setUserData(response.user);
            toast.success('Rôle mis à jour avec succès');
            
            if (response.user.role === 'utilisateur-employer') {
                setSuccess(`Rôle mis à jour avec succès. Code employé : ${response.user.employeeCode}`);
            }
            
            reset();
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Une erreur est survenue";
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Changer le rôle d'un utilisateur</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-md">
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                        Email de l'utilisateur
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
                        Nouveau rôle
                    </label>
                    <select
                        {...register('role', { required: "Le rôle est requis" })}
                        className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Sélectionner un rôle</option>
                        <option value="client">Client</option>
                        <option value="admin">Admin</option>
                        <option value="utilisateur-employer">Utilisateur Employé</option>
                    </select>
                    {errors.role && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.role.message}
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

                {userData && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-md">
                        <h3 className="font-semibold mb-2">Informations utilisateur :</h3>
                        <p>Nom : {userData.name}</p>
                        <p>Email : {userData.email}</p>
                        <p>Rôle : {userData.role}</p>
                        {userData.employeeCode && (
                            <p>Code employé : {userData.employeeCode}</p>
                        )}
                    </div>
                )}
                
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Changer le rôle
                </button>
            </form>
        </div>
    );
};

export default AdminChangeRolePage;