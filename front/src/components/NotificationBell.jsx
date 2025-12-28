import { useEffect, useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import notificationService from '../services/notificationService';
import useAuth from '../hooks/useAuth';

const NotificationBell = ({ isAdmin = false }) => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = isAdmin
          ? await notificationService.getAll()
          : await notificationService.getMine();
        setNotifications(res.data);
      } catch (err) {
        setNotifications([]);
      }
    };
    fetchNotifications();
  }, [isAdmin]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id) => {
    await notificationService.markAsRead(id);
    setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
  };

  return (
    <div className="relative inline-block text-left">
      <button onClick={() => setOpen(!open)} className="relative">
        <BellIcon className="h-7 w-7 text-blue-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-2 py-0.5 font-bold">{unreadCount}</span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 border">
          <div className="p-4 border-b font-bold text-blue-700">Notifications</div>
          <ul className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && (
              <li className="p-4 text-gray-500 text-center">Aucune notification</li>
            )}
            {notifications.map(n => (
              <li key={n._id} className={`p-4 border-b last:border-b-0 flex flex-col gap-1 ${n.isRead ? 'bg-gray-50' : 'bg-blue-50'}`}>
                <div className="flex justify-between items-center">
                  <span className={`font-bold ${n.type === 'error' ? 'text-red-600' : n.type === 'success' ? 'text-green-600' : n.type === 'warning' ? 'text-yellow-600' : 'text-blue-700'}`}>{n.title}</span>
                  {!n.isRead && (
                    <button onClick={() => handleMarkAsRead(n._id)} className="text-xs text-blue-600 hover:underline">Marquer comme lu</button>
                  )}
                </div>
                <span className="text-sm text-gray-700">{n.message}</span>
                <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
