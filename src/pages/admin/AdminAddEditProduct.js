import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Upload,
  Check,
  Plus,
  Trash2,
  Watch,
  Sparkles,
  AlertCircle,
  Image as ImageIcon,
  Star,
  Loader2,
  Cloud,
  CheckCircle2
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  validateName,
  validatePrice,
  validateStock,
  validateRequired
} from '../../utils/validation';

export default function AdminAddEditProduct() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    brand: 'Rolex',
    collectionName: 'Submariner',
    category: 'Luxury Watches',
    price: '',
    originalPrice: '',
    stock: 10,
    sku: '',
    images: [''],
    imagePublicIds: [],
    description: '',
    shortDescription: '',
    specifications: {
      caseMaterial: 'Oystersteel 904L',
      strapMaterial: 'Oyster, flat three-piece links',
      movement: 'Perpetual, mechanical, self-winding',
      waterResistance: '300 metres / 1,000 feet',
      dialColor: 'Midnight Black',
      caseSize: '41 mm',
      warranty: '5 Years International Warranty',
      gender: "Men's"
    },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true
  });

  useEffect(() => {
    if (isEdit) {
      api.get(`/products/${id}`)
        .then((data) => {
          setFormData({
            ...data,
            images: data.images && data.images.length > 0 ? data.images : [''],
            imagePublicIds: data.imagePublicIds || [],
            specifications: {
              ...formData.specifications,
              ...(data.specifications || {})
            }
          });
        })
        .catch(() => {
          showToast('Failed to load product details', 'error');
          navigate('/admin/products');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleImageChange = (index, value) => {
    const updated = [...formData.images];
    updated[index] = value;
    setFormData({ ...formData, images: updated });
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const removeImage = async (index) => {
    const targetUrl = formData.images[index];
    const updatedImages = formData.images.filter((_, i) => i !== index);
    const updatedPublicIds = formData.imagePublicIds
      ? formData.imagePublicIds.filter((_, i) => i !== index)
      : [];

    setFormData({
      ...formData,
      images: updatedImages.length > 0 ? updatedImages : [''],
      imagePublicIds: updatedPublicIds
    });

    // Safely notify backend to check & delete from Cloudinary if unshared
    if (targetUrl && targetUrl.includes('res.cloudinary.com')) {
      try {
        await api.post('/products/delete-image', { url: targetUrl, productId: id || null });
      } catch (err) {
        console.warn('Could not clean Cloudinary asset:', err.message);
      }
    }
  };

  const setPrimaryImage = (index) => {
    if (index === 0) return;
    const updatedImages = [...formData.images];
    const [selectedImg] = updatedImages.splice(index, 1);
    updatedImages.unshift(selectedImg);

    const updatedPublicIds = formData.imagePublicIds ? [...formData.imagePublicIds] : [];
    if (updatedPublicIds.length > index) {
      const [selectedPid] = updatedPublicIds.splice(index, 1);
      updatedPublicIds.unshift(selectedPid);
    }

    setFormData({
      ...formData,
      images: updatedImages,
      imagePublicIds: updatedPublicIds
    });
    showToast('Set as primary cover image', 'success');
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate image types
    const validFiles = files.filter((f) =>
      ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(f.type)
    );

    if (validFiles.length === 0) {
      showToast('Please select valid JPEG, PNG, or WEBP images', 'error');
      return;
    }

    setUploading(true);
    setUploadProgress(`Uploading ${validFiles.length} watch photo(s) to Cloudinary...`);

    const uploadData = new FormData();
    validFiles.forEach((file) => {
      uploadData.append('images', file);
    });

    try {
      const res = await api.post('/products/upload', uploadData);
      const newUrls = res.urls || (res.url ? [res.url] : []);
      const newPublicIds = res.images
        ? res.images.map((img) => img.public_id).filter(Boolean)
        : res.public_id
        ? [res.public_id]
        : [];

      if (newUrls.length > 0) {
        const cleanExisting = formData.images.filter(Boolean);
        const cleanPids = formData.imagePublicIds || [];

        setFormData({
          ...formData,
          images: [...cleanExisting, ...newUrls],
          imagePublicIds: [...cleanPids, ...newPublicIds]
        });
        showToast(res.message || `${newUrls.length} image(s) uploaded to Cloudinary successfully!`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Image upload failed. Please verify Cloudinary credentials.', 'error');
    } finally {
      setUploading(false);
      setUploadProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    const nameErr = validateName(formData.name, 'Product name');
    if (nameErr) newErrors.name = nameErr;

    const brandErr = validateRequired(formData.brand, 'Brand');
    if (brandErr) newErrors.brand = brandErr;

    const catErr = validateRequired(formData.category, 'Category');
    if (catErr) newErrors.category = catErr;

    const priceErr = validatePrice(formData.price, 'Price');
    if (priceErr) newErrors.price = priceErr;

    if (formData.originalPrice !== '' && formData.originalPrice !== null && formData.originalPrice !== undefined) {
      const origPriceErr = validatePrice(formData.originalPrice, 'Original price');
      if (origPriceErr) newErrors.originalPrice = origPriceErr;
    }

    const stockErr = validateStock(formData.stock, 'Inventory units');
    if (stockErr) newErrors.stock = stockErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please correct the highlighted form errors', 'error');
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      const cleanImages = formData.images.filter((img) => img && img.trim() !== '');
      const payload = {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : Number(formData.price),
        stock: Number(formData.stock) || 0,
        images: cleanImages.length > 0 ? cleanImages : ['/images/watches/hero_chronograph.jpg'],
        imagePublicIds: formData.imagePublicIds || []
      };

      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        showToast('Watch reference updated successfully!', 'success');
      } else {
        await api.post('/products', payload);
        showToast('New watch added to catalog successfully!', 'success');
      }
      navigate('/admin/products');
    } catch (err) {
      showToast(err.message || 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-stone-400">
        <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-left max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
              {isEdit ? 'EDIT EXISTING RECORD' : 'NEW HOROLOGICAL RECORD'}
            </span>
            <h1 className="font-serif text-3xl font-bold text-white">
              {isEdit ? `Edit: ${formData.name}` : 'Add New Watch Reference'}
            </h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
        {/* Basic Info */}
        <div className="bg-[#0D0D11] border border-stone-800/80 rounded-2xl p-6 flex flex-col gap-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] border-b border-stone-800 pb-2">
            1. Basic Identification
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
                Product / Model Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Rolex Submariner Date 41mm"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                className={`w-full bg-[#131317] border ${
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
              <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
                SKU (Stock Keeping Unit)
              </label>
              <input
                type="text"
                placeholder="e.g. TCK-RLX-SUB01 (Auto-generated if empty)"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full bg-[#131317] border border-stone-800 focus:border-[#D4AF37] text-xs text-white p-3 rounded-xl outline-none uppercase font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
                Manufacture Brand *
              </label>
              <select
                value={formData.brand}
                onChange={(e) => {
                  setFormData({ ...formData, brand: e.target.value });
                  if (errors.brand) setErrors((prev) => ({ ...prev, brand: '' }));
                }}
                className={`w-full bg-[#131317] border ${
                  errors.brand ? 'border-rose-500/70' : 'border-stone-800 focus:border-[#D4AF37]'
                } text-xs text-white p-3 rounded-xl outline-none transition-colors`}
              >
                <option value="Rolex">Rolex</option>
                <option value="Patek Philippe">Patek Philippe</option>
                <option value="Omega">Omega</option>
                <option value="Cartier">Cartier</option>
                <option value="Audemars Piguet">Audemars Piguet</option>
                <option value="Vacheron Constantin">Vacheron Constantin</option>
                <option value="IWC Schaffhausen">IWC Schaffhausen</option>
                <option value="Breitling">Breitling</option>
                <option value="A. Lange & Söhne">A. Lange & Söhne</option>
                <option value="TAG Heuer">TAG Heuer</option>
              </select>
              {errors.brand && (
                <p className="flex items-center gap-1.5 text-rose-400 text-[11px] mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.brand}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  setFormData({ ...formData, category: e.target.value });
                  if (errors.category) setErrors((prev) => ({ ...prev, category: '' }));
                }}
                className={`w-full bg-[#131317] border ${
                  errors.category ? 'border-rose-500/70' : 'border-stone-800 focus:border-[#D4AF37]'
                } text-xs text-white p-3 rounded-xl outline-none transition-colors`}
              >
                <option value="Luxury Watches">Luxury Watches</option>
                <option value="Classic Watches">Classic Watches</option>
                <option value="Sports Watches">Sports Watches</option>
                <option value="Smart Watches">Smart Watches</option>
                <option value="Heritage Watches">Heritage Watches</option>
                <option value="Limited Editions">Limited Editions</option>
              </select>
              {errors.category && (
                <p className="flex items-center gap-1.5 text-rose-400 text-[11px] mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.category}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
                Collection Line
              </label>
              <input
                type="text"
                placeholder="e.g. Submariner, Daytona, Royal Oak"
                value={formData.collectionName}
                onChange={(e) => setFormData({ ...formData, collectionName: e.target.value })}
                className="w-full bg-[#131317] border border-stone-800 focus:border-[#D4AF37] text-xs text-white p-3 rounded-xl outline-none"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-[#0D0D11] border border-stone-800/80 rounded-2xl p-6 flex flex-col gap-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] border-b border-stone-800 pb-2">
            2. Valuation & Inventory
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
                Price in Indian Rupees (₹) *
              </label>
              <input
                type="number"
                placeholder="e.g. 1245000"
                value={formData.price}
                onChange={(e) => {
                  setFormData({ ...formData, price: e.target.value });
                  if (errors.price) setErrors((prev) => ({ ...prev, price: '' }));
                }}
                className={`w-full bg-[#131317] border ${
                  errors.price ? 'border-rose-500/70' : 'border-stone-800 focus:border-[#D4AF37]'
                } text-xs text-white p-3 rounded-xl outline-none transition-colors`}
              />
              {errors.price && (
                <p className="flex items-center gap-1.5 text-rose-400 text-[11px] mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.price}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
                Original Price (Optional) (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 1380000"
                value={formData.originalPrice}
                onChange={(e) => {
                  setFormData({ ...formData, originalPrice: e.target.value });
                  if (errors.originalPrice) setErrors((prev) => ({ ...prev, originalPrice: '' }));
                }}
                className={`w-full bg-[#131317] border ${
                  errors.originalPrice ? 'border-rose-500/70' : 'border-stone-800 focus:border-[#D4AF37]'
                } text-xs text-white p-3 rounded-xl outline-none transition-colors`}
              />
              {errors.originalPrice && (
                <p className="flex items-center gap-1.5 text-rose-400 text-[11px] mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.originalPrice}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
                Inventory Units in Vault *
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => {
                  setFormData({ ...formData, stock: e.target.value });
                  if (errors.stock) setErrors((prev) => ({ ...prev, stock: '' }));
                }}
                className={`w-full bg-[#131317] border ${
                  errors.stock ? 'border-rose-500/70' : 'border-stone-800 focus:border-[#D4AF37]'
                } text-xs text-white p-3 rounded-xl outline-none transition-colors`}
              />
              {errors.stock && (
                <p className="flex items-center gap-1.5 text-rose-400 text-[11px] mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.stock}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Product Images & Cloudinary Upload */}
        <div className="bg-[#0D0D11] border border-stone-800/80 rounded-2xl p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                3. Visual Assets & Cloudinary Media Gallery
              </h2>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Upload luxury watch photos directly to Cloudinary or manage image URLs.
              </p>
            </div>
            <button
              type="button"
              onClick={addImageField}
              className="text-[11px] text-[#D4AF37] hover:underline flex items-center gap-1 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom URL</span>
            </button>
          </div>

          {/* Cloudinary Drag & Drop / Upload Box */}
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`p-6 border-2 border-dashed ${
              uploading
                ? 'border-[#D4AF37] bg-[#D4AF37]/5 cursor-wait'
                : 'border-stone-700 hover:border-[#D4AF37] bg-[#141418] hover:bg-[#18181D] cursor-pointer'
            } rounded-2xl flex flex-col items-center justify-center text-center gap-3 transition-all group`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />

            <div className="w-12 h-12 rounded-full bg-[#1C1C22] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] group-hover:scale-110 transition-transform shadow-lg">
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-white">
                {uploading ? uploadProgress : 'Click to Upload Watch Photos to Cloudinary'}
              </p>
              <p className="text-[11px] text-stone-400 mt-1">
                Upload one or multiple images simultaneously. Supports JPEG, PNG, and WebP (up to 10MB each).
              </p>
            </div>

            <button
              type="button"
              disabled={uploading}
              className="px-4 py-1.5 bg-[#D4AF37] hover:bg-[#F3E5AB] text-black text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors shadow"
            >
              {uploading ? 'Processing...' : 'Browse Images'}
            </button>
          </div>

          {/* Live Preview Grid of Uploaded / Existing Watch Images */}
          {formData.images.filter(Boolean).length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-300">
                Gallery Previews ({formData.images.filter(Boolean).length} {formData.images.filter(Boolean).length === 1 ? 'Asset' : 'Assets'}):
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {formData.images.filter(Boolean).map((imgUrl, idx) => {
                  const isPrimary = idx === 0;
                  const isCloudinary = imgUrl.includes('res.cloudinary.com');

                  return (
                    <div
                      key={idx}
                      className={`relative bg-[#141418] border ${
                        isPrimary ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/40' : 'border-stone-800'
                      } rounded-xl p-2 flex flex-col gap-2 group transition-all`}
                    >
                      {/* Image Thumbnail Preview */}
                      <div className="w-full h-32 rounded-lg bg-black flex items-center justify-center overflow-hidden border border-stone-800/80 relative">
                        <img
                          src={imgUrl}
                          alt={`Watch preview ${idx + 1}`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = '/images/watches/hero_chronograph.jpg';
                          }}
                        />

                        {/* Badges */}
                        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 items-start">
                          {isPrimary && (
                            <span className="px-1.5 py-0.5 bg-[#D4AF37] text-black text-[9px] font-bold uppercase tracking-wider rounded shadow flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-black" />
                              <span>Cover</span>
                            </span>
                          )}
                          {isCloudinary && (
                            <span className="px-1.5 py-0.5 bg-blue-950/80 border border-blue-500/40 text-blue-300 text-[8px] font-semibold uppercase tracking-wider rounded shadow flex items-center gap-0.5">
                              <Cloud className="w-2.5 h-2.5" />
                              <span>Cloud</span>
                            </span>
                          )}
                        </div>

                        {/* Quick Delete Overlay Button */}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          title="Remove this image"
                          className="absolute top-1.5 right-1.5 p-1 bg-black/80 hover:bg-rose-900/90 text-stone-300 hover:text-white rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        {!isPrimary ? (
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(idx)}
                            className="text-[#D4AF37] hover:underline flex items-center gap-1 text-[10px] uppercase font-semibold"
                          >
                            <Star className="w-3 h-3" />
                            <span>Make Cover</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-stone-500 uppercase font-semibold">
                            Primary Asset
                          </span>
                        )}

                        <span className="text-[10px] text-stone-500">#{idx + 1}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Editable URL Fields (For advanced manual management) */}
          <div className="flex flex-col gap-2 pt-2 border-t border-stone-800/80">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
              Direct Image Source URLs:
            </span>
            {formData.images.map((img, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="https://res.cloudinary.com/... or /images/watches/..."
                  value={img}
                  onChange={(e) => handleImageChange(idx, e.target.value)}
                  className="flex-1 bg-[#131317] border border-stone-800 focus:border-[#D4AF37] text-xs text-white p-2.5 rounded-xl outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  title="Remove URL"
                  className="p-2.5 bg-stone-900 text-stone-400 hover:text-rose-400 rounded-xl"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-[#0D0D11] border border-stone-800/80 rounded-2xl p-6 flex flex-col gap-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] border-b border-stone-800 pb-2">
            4. Horological Specifications
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1 font-medium">Case Material</label>
              <input
                type="text"
                value={formData.specifications.caseMaterial}
                onChange={(e) => setFormData({ ...formData, specifications: { ...formData.specifications, caseMaterial: e.target.value } })}
                className="w-full bg-[#131317] border border-stone-800 focus:border-[#D4AF37] text-xs text-white p-2.5 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1 font-medium">Strap Material</label>
              <input
                type="text"
                value={formData.specifications.strapMaterial}
                onChange={(e) => setFormData({ ...formData, specifications: { ...formData.specifications, strapMaterial: e.target.value } })}
                className="w-full bg-[#131317] border border-stone-800 focus:border-[#D4AF37] text-xs text-white p-2.5 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1 font-medium">Movement Calibre</label>
              <input
                type="text"
                value={formData.specifications.movement}
                onChange={(e) => setFormData({ ...formData, specifications: { ...formData.specifications, movement: e.target.value } })}
                className="w-full bg-[#131317] border border-stone-800 focus:border-[#D4AF37] text-xs text-white p-2.5 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1 font-medium">Water Resistance</label>
              <input
                type="text"
                value={formData.specifications.waterResistance}
                onChange={(e) => setFormData({ ...formData, specifications: { ...formData.specifications, waterResistance: e.target.value } })}
                className="w-full bg-[#131317] border border-stone-800 focus:border-[#D4AF37] text-xs text-white p-2.5 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1 font-medium">Dial Color</label>
              <input
                type="text"
                value={formData.specifications.dialColor}
                onChange={(e) => setFormData({ ...formData, specifications: { ...formData.specifications, dialColor: e.target.value } })}
                className="w-full bg-[#131317] border border-stone-800 focus:border-[#D4AF37] text-xs text-white p-2.5 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1 font-medium">Case Diameter</label>
              <input
                type="text"
                value={formData.specifications.caseSize}
                onChange={(e) => setFormData({ ...formData, specifications: { ...formData.specifications, caseSize: e.target.value } })}
                className="w-full bg-[#131317] border border-stone-800 focus:border-[#D4AF37] text-xs text-white p-2.5 rounded-xl outline-none"
              />
            </div>
          </div>
        </div>

        {/* Narrative & Descriptions */}
        <div className="bg-[#0D0D11] border border-stone-800/80 rounded-2xl p-6 flex flex-col gap-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] border-b border-stone-800 pb-2">
            5. Narrative & Placement Flags
          </h2>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
              Detailed Horological Description
            </label>
            <textarea
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#131317] border border-stone-800 focus:border-[#D4AF37] text-xs text-white p-3 rounded-xl outline-none"
            ></textarea>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-300">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="accent-[#D4AF37]"
              />
              <span>Featured on Homepage</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-300">
              <input
                type="checkbox"
                checked={formData.isBestSeller}
                onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                className="accent-[#D4AF37]"
              />
              <span>Best Seller</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-300">
              <input
                type="checkbox"
                checked={formData.isNewArrival}
                onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                className="accent-[#D4AF37]"
              />
              <span>New Arrival Tag</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Link
            to="/admin/products"
            className="px-6 py-3 border border-stone-800 text-stone-400 hover:text-white rounded-xl text-xs uppercase tracking-wider font-semibold transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#F3E5AB] hover:to-[#D4AF37] text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl shadow-xl transition-all disabled:opacity-50"
          >
            {saving ? 'Committing Changes...' : isEdit ? 'Save Changes' : 'Publish Timepiece'}
          </button>
        </div>
      </form>
    </div>
  );
}
