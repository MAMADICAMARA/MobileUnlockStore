import { useEffect, useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import notificationService from '../services/notificationService';
import useAuth from '../hooks/useAuth';

const NotificationBell = ({ isAdmin = false }) => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        let response;
        
        if (isAdmin) {
          response = await notificationService.getAll();
        } else {
          response = await notificationService.getMine();
        }
        
        // La réponse de l'API est probablement dans response.data.data
        // ou response.data selon votre backend
        console.log('Réponse notifications:', response.data); // Pour debug
        
        // Vérifier différentes structures possibles
        if (response.data && response.data.data) {
          // Si la réponse est { data: [...] }
          setNotifications(response.data.data);
        } else if (response.data && Array.isArray(response.data)) {
          // Si la réponse est directement un tableau
          setNotifications(response.data);
        } else {
          console.warn('Structure de réponse inattendue:', response.data);
          setNotifications([]);
        }
        
      } catch (err) {
        console.error('Erreur lors du chargement des notifications:', err);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, [isAdmin, user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      console.error('Erreur lors du marquage de la notification:', err);
    }
  };

  if (!user) return null;

  return (
    <div className="relative inline-block text-left">
      <button 
        onClick={() => setOpen(!open)} 
        className="relative p-1 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <BellIcon className="h-7 w-7 text-blue-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-2 py-0.5 font-bold min-w-[20px] text-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {open && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setOpen(false)}
          />
          
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <span className="font-bold text-blue-700">Notifications</span>
              {!loading && (
                <span className="text-xs text-gray-500">
                  {notifications.length} totale{notifications.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            <ul className="max-h-96 overflow-y-auto">
              {loading ? (
                <li className="p-4 text-center text-gray-500">
                  Chargement...
                </li>
              ) : notifications.length === 0 ? (
                <li className="p-4 text-center text-gray-500">
                  Aucune notification
                </li>
              ) : (
                notifications.map(n => (
                  <li 
                    key={n._id} 
                    className={`p-4 border-b last:border-b-0 border-gray-100 flex flex-col gap-1 transition-colors ${
                      n.isRead ? 'bg-white hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className={`font-semibold text-sm ${
                        n.type === 'error' ? 'text-red-600' : 
                        n.type === 'success' ? 'text-green-600' : 
                        n.type === 'warning' ? 'text-yellow-600' : 
                        'text-blue-700'
                      }`}>
                        {n.title || 'Notification'}
                      </span>
                      
                      {!n.isRead && (
                        <button 
                          onClick={() => handleMarkAsRead(n._id)} 
                          className="text-xs text-blue-600 hover:text-blue-800 hover:underline whitespace-nowrap"
                        >
                          Marquer comme lu
                        </button>
                      )}
                    </div>
                    
                    <span className="text-sm text-gray-700 break-words">
                      {n.message}
                    </span>
                    
                    <span className="text-xs text-gray-400">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Date inconnue'}
                    </span>
                  </li>
                ))
              )}
            </ul>
            
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 text-center">
                <button 
                  onClick={() => window.location.href = '/account/notifications'} 
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Voir toutes les notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;