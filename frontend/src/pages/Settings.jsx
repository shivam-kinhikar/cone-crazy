import { useState, useEffect } from 'react';
import { Save, Store, Receipt, Percent, MapPin, Phone, Mail } from 'lucide-react';
import api from '../utils/axios';

const Settings = () => {
  const [settings, setSettings] = useState({
    storeName: '',
    gstNumber: '',
    address: '',
    phone: '',
    email: '',
    invoicePrefix: '',
    taxPercentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data.data) {
        setSettings(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch settings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: name === 'taxPercentage' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', settings);
      alert("Settings saved successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center text-text-muted">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-secondary flex items-center">
          <div className="w-1 h-6 bg-primary mr-3 rounded-full"></div>
          System Settings
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Information */}
        <div className="saas-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-surface-hover/30">
            <h2 className="text-base font-bold text-secondary">Business Information</h2>
            <p className="text-sm text-text-muted mt-1">Update your store details and contact information.</p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text mb-1 flex items-center"><Store size={14} className="mr-1.5 text-text-muted"/> Store Name</label>
              <input type="text" name="storeName" value={settings.storeName} onChange={handleChange} className="saas-input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1 flex items-center"><Receipt size={14} className="mr-1.5 text-text-muted"/> GST / Tax Number</label>
              <input type="text" name="gstNumber" value={settings.gstNumber} onChange={handleChange} className="saas-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1 flex items-center"><Phone size={14} className="mr-1.5 text-text-muted"/> Phone Number</label>
              <input type="text" name="phone" value={settings.phone} onChange={handleChange} className="saas-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1 flex items-center"><Mail size={14} className="mr-1.5 text-text-muted"/> Email Address</label>
              <input type="email" name="email" value={settings.email} onChange={handleChange} className="saas-input" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text mb-1 flex items-center"><MapPin size={14} className="mr-1.5 text-text-muted"/> Physical Address</label>
              <input type="text" name="address" value={settings.address} onChange={handleChange} className="saas-input" />
            </div>
          </div>
        </div>

        {/* Invoice & Tax Settings */}
        <div className="saas-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-surface-hover/30">
            <h2 className="text-base font-bold text-secondary">Invoice & Tax Settings</h2>
            <p className="text-sm text-text-muted mt-1">Configure global tax rates and invoice generation formats.</p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text mb-1 flex items-center"><Receipt size={14} className="mr-1.5 text-text-muted"/> Invoice Prefix</label>
              <input type="text" name="invoicePrefix" value={settings.invoicePrefix} onChange={handleChange} className="saas-input" placeholder="e.g. INV-" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1 flex items-center"><Percent size={14} className="mr-1.5 text-text-muted"/> Default Tax Percentage (%)</label>
              <input type="number" name="taxPercentage" value={settings.taxPercentage} onChange={handleChange} className="saas-input" min="0" step="0.1" />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="flex items-center space-x-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg transition-colors font-medium shadow-sm"
          >
            <Save size={18} />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
