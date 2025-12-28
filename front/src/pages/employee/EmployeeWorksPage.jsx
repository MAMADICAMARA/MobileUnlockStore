// src/pages/employee/EmployeeWorksPage.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const EmployeeWorksPage = () => {
    const [works, setWorks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchWorks = async () => {
            try {
                // Récupérer les services de type "official unlock iphone"
                const response = await api.get('/employee/works');
                setWorks(response.data.works);
                setLoading(false);
            } catch (err) {
                const errorMessage = err.response?.data?.error || "Erreur lors du chargement des travaux";
                setError(errorMessage);
                toast.error(errorMessage);
                setLoading(false);
            }
        };

        fetchWorks();
    }, []);

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-100 text-red-700 p-4 rounded-md">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Mes Travaux</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {works.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500 py-8">
                        Aucun travail disponible pour le moment
                    </div>
                ) : (
                    works.map((work) => (
                        <div key={work._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {work.name}
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {work.description}
                                </p>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-blue-600 font-medium">
                                        Prix: {work.price} €
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                        work.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        work.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {work.status === 'pending' ? 'En attente' :
                                         work.status === 'completed' ? 'Terminé' : 'Nouveau'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default EmployeeWorksPage;