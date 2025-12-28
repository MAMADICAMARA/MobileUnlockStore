// src/components/Notification.jsx
import React from 'react';

const AlertNotification = ({ message, type }) => {
  let bgColor = 'bg-green-100';
  let textColor = 'text-green-700';

  if (type === 'warning') {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-700';
  }

  return (
    <div className={`p-3 rounded-md ${bgColor} ${textColor} mb-4`}>
      {message}
    </div>
  );
};
export default AlertNotification;