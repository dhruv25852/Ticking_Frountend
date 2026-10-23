import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Crown, Globe, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { validateName, validateRequired } from '../../utils/validation';

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [errors, setErrors] = useState({});
  const [brandForm, setBrandForm] = useState({
    name: '',
    tagline: '',
    description: '',
    foundedYear: 1905,
    country: 'Switzerland'
  });
  const { showToast } = useToast();

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const data = await api.get('/brands');
      setBrands(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();

    const newErrors = {};
    const nameErr = validateName(brandForm.name, 'Brand name');
    if (nameErr) newErrors.name = nameErr;

    const descErr = validateRequired(brandForm.description, 'Description');
    if (descErr) newErrors.description = descErr;

    if (brandForm.foundedYear) {
      const yr = Number(brandForm.foundedYear);
      if (isNaN(yr) || yr < 1600 || yr > new Date().getFullYear()) {
        newErrors.foundedYear = `Founded year must be between 1600 and ${new Date().getFullYear()}`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please correct the highlighted errors', 'error');
      return;
    }

    setErrors({});
    try {
      const created = await api.post('/brands', brandForm);
      setBrands([...brands, created]);
      setBrandForm({
        name: '',
        tagline: '',
        description: '',
        foundedYear: 1905,
        country: 'Switzerland'
      });
      setShowAdd(false);
      showToast('Brand house added successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to add brand', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete brand "${name}"?`)) return;
    try {
      await api.delete(`/brands/id/${id}`);
      setBrands(brands.filter((b) => b._id !== id));
      showToast('Brand removed', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete brand', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex items-center justify-between border-b border-stone-800 pb-4">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
            PRESTIGIOUS HOUSES
          </span>
          <h1 className="font-serif text-3xl font-bold text-white mt-0.5">
            Manufacture Houses Management
          </h1>
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-[#D4AF37] text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{showAdd ? 'Close' : 'Add Brand'}</span>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} noValidate className="bg-[#0E0E12] border border-[#D4AF37]/40 rounded-2xl p-6 flex flex-col gap-4">
          <h3 className="text-xs uppercase font-bold text-[#D4AF37]">New Manufacture Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                placeholder="Brand Name *"
                value={brandForm.name}
                onChange={(e) => {
                  setBrandForm({ ...brandForm, name: e.target.value });
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                className={`w-full bg-[#141418] border ${
                  errors.name ? 'border-rose-500/70' : 'border-stone-800 focus:border-[#D4AF37]'
                } text-xs text-white p-3 rounded-xl outline-none transition-colors`}
              />
              {errors.name && (
                <p className="flex items-center gap-1.5 text-rose-400 text-[11px] mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            <div>
              <input
                type="text"
                placeholder="Tagline / Motto"
                value={brandForm.tagline}
                onChange={(e) => setBrandForm({ ...brandForm, tagline: e.target.value })}
                className="w-full bg-[#141418] border border-stone-800 text-xs text-white p-3 rounded-xl outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <input
                type="number"
                placeholder="Founded Year"
                value={brandForm.foundedYear}
                onChange={(e) => {
                  setBrandForm({ ...brandForm, foundedYear: Number(e.target.value) });
                  if (errors.foundedYear) setErrors((prev) => ({ ...prev, foundedYear: '' }));
                }}
                className={`w-full bg-[#141418] border ${
                  errors.foundedYear ? 'border-rose-500/70' : 'border-stone-800 focus:border-[#D4AF37]'
                } text-xs text-white p-3 rounded-xl outline-none transition-colors`}
              />
              {errors.foundedYear && (
                <p className="flex items-center gap-1.5 text-rose-400 text-[11px] mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.foundedYear}</span>
                </p>
              )}
            </div>
          </div>

          <div>
            <textarea
              rows="2"
              placeholder="Heritage Story & Description *"
              value={brandForm.description}
              onChange={(e) => {
                setBrandForm({ ...brandForm, description: e.target.value });
                if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
              }}
              className={`w-full bg-[#141418] border ${
                errors.description ? 'border-rose-500/70' : 'border-stone-800 focus:border-[#D4AF37]'
              } text-xs text-white p-3 rounded-xl outline-none transition-colors`}
            ></textarea>
            {errors.description && (
              <p className="flex items-center gap-1.5 text-rose-400 text-[11px] mt-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.description}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-fit px-6 py-2.5 bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
          >
            Save Brand House
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {brands.map((brand) => (
          <div key={brand._id} className="bg-[#0D0D11] border border-stone-800 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-serif text-lg font-bold text-white">{brand.name}</span>
                <span className="text-[11px] font-mono text-[#D4AF37]">#{brand.number || '01'}</span>
              </div>
              <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-2">
                {brand.country || 'Switzerland'} • Since {brand.foundedYear}
              </p>
              <p className="text-xs text-stone-400 font-light line-clamp-3">{brand.description}</p>
            </div>

            <div className="pt-4 border-t border-stone-800/80 mt-4 flex justify-end">
              <button
                onClick={() => handleDelete(brand._id, brand.name)}
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
