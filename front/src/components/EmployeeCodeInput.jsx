// src/components/EmployeeCodeInput.jsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';

const EmployeeCodeInput = ({ onChange, serviceCategory }) => {
    const [employeeCode, setEmployeeCode] = useState('');
    const [isVisible, setIsVisible] = useState(serviceCategory === 'official unlock iphone');

    // Ne pas rendre le composant si ce n'est pas un service de déblocage iPhone
    if (!isVisible) return null;

    const handleChange = (e) => {
        const code = e.target.value.toUpperCase();
        setEmployeeCode(code);
        onChange(code);
    };

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Code Employé (optionnel)
            </label>
            <div className="relative">
                <input
                    type="text"
                    value={employeeCode}
                    onChange={handleChange}
                    placeholder="Entrez le code employé"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="mt-1 text-sm text-gray-500">
                    Si vous avez un code employé, entrez-le ici pour assigner votre commande à un employé spécifique.
                </div>
            </div>
        </div>
    );
};

export default EmployeeCodeInput;