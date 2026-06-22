import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center border border-slate-100">
        <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert size={40} className="text-rose-500" />
        </div>
        
        <h1 className="text-2xl font-black text-slate-800 mb-2">Access Denied</h1>
        <p className="text-slate-500 mb-8 font-medium">
          You do not have the required permissions to view this page. Please contact your administrator if you believe this is a mistake.
        </p>
        
        <Link 
          to="/dashboard" 
          className="inline-flex items-center justify-center w-full px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
        >
          <ArrowLeft size={18} className="mr-2" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
