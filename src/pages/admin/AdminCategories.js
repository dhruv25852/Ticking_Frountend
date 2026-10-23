import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, FolderTree, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { validateName } from '../../utils/validation';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [catNameError, setCatNameError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const { showToast } = useToast();

  const fetchCats = async () => {
    setLoading(true);
    try {
      const data = await api.get('/categories');
      setCategories(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const err = validateName(newCatName, 'Category name');
    if (err) {
      setCatNameError(err);
      showToast('Please enter a valid category name', 'error');
      return;
    }

    setCatNameError('');
    try {
      const created = await api.post('/categories', {
        name: newCatName.trim(),
        description: newCatDesc.trim()
      });
      setCategories([...categories, created]);
      setNewCatName('');
      setNewCatDesc('');
      setShowAdd(false);
      showToast('Category created successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to create category', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await api.delete(`/categories/id/${id}`);
      setCategories(categories.filter((c) => c._id !== id));
      showToast('Category removed', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete category', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex items-center justify-between border-b border-stone-800 pb-4">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
            CLASSIFICATION SYSTEM
          </span>
          <h1 className="font-serif text-3xl font-bold text-white mt-0.5">
            Category Management
          </h1>
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-[#D4AF37] text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{showAdd ? 'Close' : 'Add Category'}</span>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} noValidate className="bg-[#0E0E12] border border-[#D4AF37]/40 rounded-2xl p-6 flex flex-col gap-4">
          <h3 className="text-xs uppercase font-bold text-[#D4AF37]">New Category Definition</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="Category Name *"
                value={newCatName}
                onChange={(e) => {
                  setNewCatName(e.target.value);
                  if (catNameError) setCatNameError('');
                }}
                className={`w-full bg-[#141418] border ${
                  catNameError ? 'border-rose-500/70' : 'border-stone-800 focus:border-[#D4AF37]'
                } text-xs text-white p-3 rounded-xl outline-none transition-colors`}
              />
              {catNameError && (
                <p className="flex items-center gap-1.5 text-rose-400 text-[11px] mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{catNameError}</span>
                </p>
              )}
            </div>
            <div>
              <input
                type="text"
                placeholder="Description"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                className="w-full bg-[#141418] border border-stone-800 text-xs text-white p-3 rounded-xl outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-fit px-6 py-2.5 bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
          >
            Create Category
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat._id} className="bg-[#0D0D11] border border-stone-800 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-serif text-lg font-bold text-white">{cat.name}</span>
                <span className="text-[10px] bg-stone-900 border border-stone-800 text-[#D4AF37] px-2 py-0.5 rounded-full font-bold">
                  {cat.itemCount || 0} Pieces
                </span>
              </div>
              <p className="text-xs text-stone-400 font-light line-clamp-2">{cat.description || 'Horological division.'}</p>
            </div>

            <div className="pt-4 border-t border-stone-800/80 mt-4 flex justify-end">
              <button
                onClick={() => handleDelete(cat._id, cat.name)}
                className="p-1.5 text-stone-500 hover:text-rose-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
