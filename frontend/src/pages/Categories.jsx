import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Layers, Search } from 'lucide-react';
import api from '../utils/axios';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, newCategory);
      } else {
        await api.post('/categories', newCategory);
      }
      setShowModal(false);
      setNewCategory({ name: '', description: '' });
      setEditingId(null);
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save category');
    } finally {
      setProcessing(false);
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setNewCategory({ name: cat.name, description: cat.description || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category? Products in this category might be affected.")) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const filteredCategories = (categories || []).filter(cat => 
    (cat.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex h-full items-center justify-center text-text-muted">Loading categories...</div>;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary flex items-center">
          <div className="w-1.5 h-7 bg-primary mr-3 shadow-sm"></div>
          Category Management
        </h1>
        <button 
          onClick={() => {
            setEditingId(null);
            setNewCategory({ name: '', description: '' });
            setShowModal(true);
          }}
          className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-sm flex items-center text-sm font-bold transition-colors shadow-sm"
        >
          <Plus size={18} className="mr-2" /> New Category
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-surface border border-border shadow-sm">
        {/* Search Bar */}
        <div className="p-4 border-b border-border bg-surface-hover/30 flex justify-between items-center">
          <div className="relative w-80">
            <input 
              type="text" 
              placeholder="Search categories..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-background text-text border border-border rounded-sm focus:border-primary outline-none transition-colors text-sm font-medium"
            />
            <Search size={16} className="absolute left-3.5 top-2.5 text-text-muted" />
          </div>
          <div className="text-sm font-bold text-secondary">
            Total: <span className="text-primary">{filteredCategories.length}</span>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-border text-xs uppercase tracking-wider text-text-muted">
                <th className="p-4 font-bold w-1/4">Category Name</th>
                <th className="p-4 font-bold w-2/4">Description</th>
                <th className="p-4 font-bold text-center w-1/4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-text-muted">
                    <div className="flex flex-col items-center justify-center">
                      <Layers size={32} className="opacity-20 mb-3" />
                      <p className="font-medium text-sm">No categories found matching your search.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat._id} className="border-b border-border/50 hover:bg-surface-hover/50 transition-colors group">
                    <td className="p-4 align-middle">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center mr-3 border border-primary/20">
                          <Layers size={14} className="text-primary" />
                        </div>
                        <span className="font-bold text-secondary text-sm group-hover:text-primary transition-colors">{cat.name}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle text-sm text-text-muted">
                      {cat.description ? (
                        <span className="line-clamp-1">{cat.description}</span>
                      ) : (
                        <span className="italic opacity-50">No description provided</span>
                      )}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex justify-center items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(cat)} 
                          className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-sm transition-colors"
                          title="Edit Category"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(cat._id)} 
                          className="p-1.5 text-text-muted hover:text-danger hover:bg-danger-bg rounded-sm transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-secondary/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-surface shadow-2xl w-full max-w-md border border-border rounded-sm overflow-hidden animate-fade-in-up">
            <div className="p-5 border-b border-border flex justify-between items-center bg-surface-hover/30">
              <h3 className="text-lg font-bold text-secondary uppercase tracking-wide">
                {editingId ? 'Edit Category' : 'Create Category'}
              </h3>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">Category Name <span className="text-danger">*</span></label>
                <input 
                  type="text" 
                  required 
                  value={newCategory.name} 
                  onChange={e => setNewCategory({...newCategory, name: e.target.value})} 
                  className="w-full bg-background border border-border focus:border-primary rounded-sm px-3 py-2.5 text-sm transition-colors outline-none text-secondary font-semibold" 
                  placeholder="e.g. Cones" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wider">Description</label>
                <textarea 
                  rows="3"
                  value={newCategory.description} 
                  onChange={e => setNewCategory({...newCategory, description: e.target.value})} 
                  className="w-full bg-background border border-border focus:border-primary rounded-sm px-3 py-2.5 text-sm transition-colors outline-none text-secondary custom-scrollbar" 
                  placeholder="Brief description of the category..." 
                />
              </div>
              
              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => {setShowModal(false); setEditingId(null);}} 
                  className="py-2 px-4 bg-background hover:bg-danger-bg hover:text-danger border border-border text-text-muted font-bold rounded-sm transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={processing} 
                  className="py-2 px-6 bg-primary hover:bg-primary-hover text-white font-bold rounded-sm transition-colors shadow-sm disabled:opacity-70 text-sm"
                >
                  {processing ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
