import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, Users, Tag, Layers, BarChart2, IceCream, Gift, LogOut, Receipt, Settings as SettingsIcon, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, logout } = useAuth();

  const allNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'cashier', 'inventory_staff'] },
    { name: 'Orders', path: '/orders', icon: ShoppingBag, roles: ['admin', 'manager', 'cashier'] },
    { name: 'Billing', path: '/billing', icon: Receipt, roles: ['admin', 'cashier'] },
    { name: 'Inventory', path: '/inventory', icon: Package, roles: ['admin', 'manager', 'inventory_staff'] },
    { name: 'Ice-Cream Mgmt', path: '/products', icon: IceCream, roles: ['admin', 'manager'] },
    { name: 'Categories', path: '/categories', icon: Layers, roles: ['admin', 'manager'] },
    { name: 'Customers', path: '/customers', icon: Users, roles: ['admin', 'manager', 'cashier'] },
    { name: 'Staff', path: '/employees', icon: Shield, roles: ['admin'] },
    { name: 'Offers', path: '/offers', icon: Gift, roles: ['admin'] },
    { name: 'Reports', path: '/reports', icon: BarChart2, roles: ['admin', 'manager'] },
    { name: 'Settings', path: '/settings', icon: SettingsIcon, roles: ['admin'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-40 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out h-full w-[260px] bg-surface border-r border-border flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)]`}>
      {/* Logo Area */}
      <div className="h-24 flex items-center px-6">
        <img src="/favicon.svg" alt="Cone Crazy Logo" className="w-10 h-10 mr-3 drop-shadow-sm" />
        <h1 className="text-2xl font-bold text-secondary tracking-tight">
          CONE <span className="text-primary font-black">CRAZY</span>
        </h1>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 overflow-y-auto custom-scrollbar space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen && setIsOpen(false)}
              className={`relative flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all duration-200 text-[15px] overflow-hidden ${
                isActive 
                  ? 'bg-primary/10 text-primary font-bold dark:bg-primary/20' 
                  : 'text-text-muted hover:bg-primary/5 hover:text-primary font-medium'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
              )}
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={`transition-colors duration-200 ${isActive ? 'text-primary' : 'text-text-muted group-hover:text-primary'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* Footer Area */}
      <div className="p-4 border-t border-border mt-auto">
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-3.5 px-4 py-3 w-full text-text-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all duration-200 text-[15px] font-medium"
        >
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
