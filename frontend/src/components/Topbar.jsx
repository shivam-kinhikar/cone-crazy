import { useState, useEffect, useRef } from 'react';
import { Bell, User, CheckCircle, Info, Package, FileText, Menu, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';

const Topbar = ({ toggleSidebar }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch notifications");
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/read/${id}`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error("Failed to mark as read");
    }
  };

  const clearAllNotifications = async () => {
    try {
      await api.delete('/notifications/clear');
      setNotifications([]);
    } catch (error) {
      console.error("Failed to clear notifications");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type) => {
    switch (type) {
      case 'Low Stock': return <Package size={16} className="text-warning" />;
      case 'Order': return <FileText size={16} className="text-primary" />;
      case 'System': return <Info size={16} className="text-blue-500" />;
      default: return <Info size={16} className="text-text-muted" />;
    }
  };

  return (
    <div className="h-20 bg-surface border-b border-border px-4 sm:px-8 flex items-center justify-between lg:justify-end sticky top-0 z-20">
      <div className="flex items-center lg:hidden">
        <button onClick={toggleSidebar} className="p-2 -ml-2 text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-surface-hover">
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center space-x-4 sm:space-x-6">
        <ThemeToggle />
        
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-text-muted hover:text-text transition-colors p-1"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-danger rounded-full border-2 border-surface"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-surface border border-border rounded-xl shadow-lg overflow-hidden animate-fade-in-up z-50">
              <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
                <h3 className="font-bold text-secondary text-sm">Notifications</h3>
                <div className="flex items-center space-x-3">
                  {notifications.length > 0 && (
                    <button 
                      onClick={clearAllNotifications} 
                      className="text-xs font-semibold text-text-muted hover:text-danger transition-colors cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                  {unreadCount > 0 && (
                    <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {unreadCount} New
                    </span>
                  )}
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-text-muted text-sm">No notifications</div>
                ) : (
                  notifications.map(n => (
                     <div key={n._id} className={`p-4 border-b border-border/50 hover:bg-surface-hover transition-colors flex items-start space-x-3 ${!n.isRead ? 'bg-primary/5' : ''}`}>
                      <div className={`mt-0.5 p-1.5 rounded-full ${!n.isRead ? 'bg-background' : 'bg-background'}`}>
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${!n.isRead ? 'font-bold text-secondary' : 'font-medium text-text'}`}>{n.title}</p>
                        <p className="text-xs text-text-muted mt-1 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-text-muted/70 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                      {!n.isRead && (
                        <button onClick={() => markAsRead(n._id)} className="text-primary hover:text-primary-hover p-1" title="Mark as read">
                          <CheckCircle size={16} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-secondary leading-tight">{user?.name || 'User'}</p>
              <span className="text-[10px] font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">
                {role?.replace('_', ' ') || 'Staff'}
              </span>
            </div>
            <div className="w-9 h-9 bg-surface-hover rounded-full flex items-center justify-center border border-border overflow-hidden group-hover:border-primary transition-colors">
              <User size={18} className="text-text-muted group-hover:text-primary transition-colors" />
            </div>
          </div>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-48 bg-surface border border-border rounded-xl shadow-lg overflow-hidden animate-fade-in-up z-50">
              <div className="p-3 border-b border-border/50 bg-background/50 sm:hidden">
                <p className="text-sm font-bold text-secondary truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-text-muted truncate">{user?.email || ''}</p>
              </div>
              <div className="p-1">
                <button onClick={() => { setShowProfileMenu(false); navigate('/settings'); }} className="w-full text-left px-3 py-2 text-sm font-medium text-text hover:bg-surface-hover hover:text-primary rounded-lg transition-colors flex items-center">
                  <Settings size={16} className="mr-2" /> Settings
                </button>
                <div className="h-px bg-border my-1"></div>
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm font-medium text-danger hover:bg-danger-bg rounded-lg transition-colors flex items-center">
                  <LogOut size={16} className="mr-2" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
