import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Phone,
  MapPin,
  Lock,
  Shield,
  Package,
  Heart,
  LogOut,
  AlertCircle,
  CheckCircle,
  Camera,
  Trash2,
  Loader2,
  Upload
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { validateName, validatePhone, validatePincode } from '../utils/validation';
import ChangePasswordModal from '../components/ChangePasswordModal';

export default function Profile() {
  const { user, updateProfile, updateUser, logout, isAdmin } = useAuth();
  const { showToast } = useToast();

  const fileInputRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);

  const defaultAddr = user?.addresses?.[0] || {};
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(defaultAddr.address || '');
  const [city, setCity] = useState(defaultAddr.city || '');
  const [state, setState] = useState(defaultAddr.state || '');
  const [pincode, setPincode] = useState(defaultAddr.pincode || '');
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Please select a valid image (JPEG, PNG, or WEBP)', 'error');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Profile photo must be less than 5MB', 'error');
      return;
    }

    // Set immediate client preview
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);

    // Upload to Cloudinary via backend
    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await api.post('/auth/profile/photo', formData);
      if (res && res.avatar) {
        updateUser({ avatar: res.avatar });
        showToast('Profile photo updated successfully!', 'success');
      }
    } catch (err) {
      setPhotoPreview(null);
      showToast(err.message || 'Failed to upload profile photo to Cloudinary', 'error');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    if (!user?.avatar && !photoPreview) return;

    setRemovingPhoto(true);
    try {
      await api.delete('/auth/profile/photo');
      setPhotoPreview(null);
      updateUser({ avatar: '' });
      showToast('Profile photo removed', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to remove profile photo', 'error');
    } finally {
      setRemovingPhoto(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    const nameErr = validateName(name, 'Full Name');
    if (nameErr) newErrors.name = nameErr;

    if (phone) {
      const phoneErr = validatePhone(phone, false);
      if (phoneErr) newErrors.phone = phoneErr;
    }

    if (pincode) {
      const pinErr = validatePincode(pincode);
      if (pinErr) newErrors.pincode = pinErr;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        address: {
          fullName: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          isDefault: true
        }
      });
      showToast('Profile and preferences updated successfully', 'success');
      setErrors({});
    } catch {
      // Handled
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full bg-[#080809] min-h-screen text-stone-200 py-12 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-left border-b border-stone-800 pb-4 flex items-baseline justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
              CONNOISSEUR ACCOUNT
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-1">
              My Profile & Preferences
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/orders"
              className="px-4 py-2 bg-stone-900 border border-stone-800 hover:border-[#D4AF37] rounded-lg text-xs uppercase tracking-wider font-semibold text-stone-300 transition-colors flex items-center gap-2"
            >
              <Package className="w-4 h-4 text-[#D4AF37]" />
              <span>My Orders</span>
            </Link>
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="px-4 py-2 bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-lg text-xs uppercase tracking-wider font-semibold text-[#D4AF37] transition-colors flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Panel</span>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Summary Card (4 cols) */}
          <div className="lg:col-span-4 bg-[#0E0E12] border border-[#D4AF37]/30 rounded-2xl p-6 flex flex-col items-center text-center">
            {/* Avatar Container with Camera Overlay */}
            <div className="relative mb-3 group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#16161B] to-[#26242B] border-2 border-[#D4AF37] flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(212,175,55,0.25)] relative">
                {photoPreview || user?.avatar ? (
                  <img
                    src={photoPreview || user?.avatar}
                    alt={user?.name || 'Profile'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-serif text-[#D4AF37] font-bold">
                    {user?.name?.[0] || 'T'}
                  </span>
                )}

                {/* Uploading Overlay */}
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-1 z-10">
                    <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
                    <span className="text-[9px] uppercase tracking-wider text-stone-300 font-semibold">
                      Uploading...
                    </span>
                  </div>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handlePhotoSelect}
                disabled={uploadingPhoto || removingPhoto}
                className="hidden"
              />

              {/* Camera Trigger Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto || removingPhoto}
                title="Upload Profile Photo"
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#D4AF37] hover:bg-[#F3E5AB] text-black flex items-center justify-center shadow-lg transition-transform hover:scale-110 disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Photo Action Links */}
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto || removingPhoto}
                className="text-[11px] text-[#D4AF37] hover:text-[#F3E5AB] transition-colors flex items-center gap-1 font-medium"
              >
                <Upload className="w-3 h-3" />
                <span>{user?.avatar ? 'Change Photo' : 'Upload Photo'}</span>
              </button>

              {(user?.avatar || photoPreview) && (
                <>
                  <span className="text-stone-700">|</span>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={uploadingPhoto || removingPhoto}
                    className="text-[11px] text-stone-500 hover:text-rose-400 transition-colors flex items-center gap-1"
                  >
                    {removingPhoto ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                    <span>Remove</span>
                  </button>
                </>
              )}
            </div>

            <h2 className="font-serif text-xl font-bold text-white">{user?.name}</h2>
            <p className="text-xs text-stone-400 mt-0.5">{user?.email}</p>

            {isAdmin && (
              <span className="mt-3 px-3 py-1 bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] text-[10px] uppercase font-bold tracking-widest rounded-full">
                Master Administrator
              </span>
            )}

            <div className="w-full border-t border-stone-800/80 my-5"></div>

            <div className="w-full flex flex-col gap-2">
              <Link
                to="/orders"
                className="w-full py-2.5 px-4 bg-[#141418] hover:bg-stone-800 rounded-xl text-xs text-stone-300 flex items-center justify-between transition-colors"
              >
                <span>Orders History</span>
                <Package className="w-4 h-4 text-[#D4AF37]" />
              </Link>
              <Link
                to="/wishlist"
                className="w-full py-2.5 px-4 bg-[#141418] hover:bg-stone-800 rounded-xl text-xs text-stone-300 flex items-center justify-between transition-colors"
              >
                <span>Wishlist</span>
                <Heart className="w-4 h-4 text-[#D4AF37]" />
              </Link>
              <button
                type="button"
                onClick={() => setIsChangePasswordOpen(true)}
                className="w-full py-2.5 px-4 bg-[#141418] hover:bg-stone-800 rounded-xl text-xs text-stone-300 flex items-center justify-between transition-colors"
              >
                <span>Change Password</span>
                <Lock className="w-4 h-4 text-[#D4AF37]" />
              </button>
              <button
                onClick={logout}
                className="w-full py-2.5 px-4 bg-rose-950/20 hover:bg-rose-900/40 text-rose-300 rounded-xl text-xs flex items-center justify-between transition-colors mt-2"
              >
                <span>Sign Out</span>
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Edit Form (8 cols) */}
          <div className="lg:col-span-8 bg-[#0E0E12] border border-stone-800/80 rounded-2xl p-8 text-left">
            <h3 className="font-serif text-xl font-bold text-white mb-6 border-b border-stone-800 pb-3">
              Account Details & Delivery Address
            </h3>

            <form onSubmit={handleSave} noValidate className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                    }}
                    className={`w-full bg-[#141418] border text-xs text-white p-3 rounded-xl outline-none transition-colors ${
                      errors.name ? 'border-rose-500/80 focus:border-rose-500' : 'border-stone-800 focus:border-[#D4AF37]'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
                    Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                    }}
                    className={`w-full bg-[#141418] border text-xs text-white p-3 rounded-xl outline-none transition-colors ${
                      errors.phone ? 'border-rose-500/80 focus:border-rose-500' : 'border-stone-800 focus:border-[#D4AF37]'
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
                  Default Street Address
                </label>
                <input
                  type="text"
                  placeholder="Street, Building, Villa number"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#141418] border border-stone-800 focus:border-[#D4AF37] text-xs text-white p-3 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#141418] border border-stone-800 focus:border-[#D4AF37] text-xs text-white p-3 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-[#141418] border border-stone-800 focus:border-[#D4AF37] text-xs text-white p-3 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
                    Pincode
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 560001"
                    value={pincode}
                    onChange={(e) => {
                      setPincode(e.target.value);
                      if (errors.pincode) setErrors((prev) => ({ ...prev, pincode: '' }));
                    }}
                    className={`w-full bg-[#141418] border text-xs text-white p-3 rounded-xl outline-none transition-colors ${
                      errors.pincode ? 'border-rose-500/80 focus:border-rose-500' : 'border-stone-800 focus:border-[#D4AF37]'
                    }`}
                  />
                  {errors.pincode && (
                    <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.pincode}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-stone-800/80 flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-[#D4AF37] hover:bg-[#E5C378] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <span>Update Profile</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(true)}
                  className="px-6 py-3 border border-[#D4AF37]/60 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 text-[#F3E5AB] hover:text-[#D4AF37] font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Change Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Dedicated Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
}
