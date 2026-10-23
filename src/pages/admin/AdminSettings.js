import React, { useState, useEffect } from 'react';
import { Settings, Save, ShieldCheck, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';
import {
  validateName,
  validateEmail,
  validatePhone,
  validateDiscount
} from '../../utils/validation';

export default function AdminSettings() {
  const { showToast } = useToast();
  const { settings, loading: settingsLoading, updateSettings, refreshSettings } = useSettings();

  const [storeName, setStoreName] = useState(settings?.storeName || 'TICKING LUXARY WATCH');
  const [currency, setCurrency] = useState(
    settings?.currency && !settings.currency.includes('?') ? settings.currency : 'INR (₹)'
  );
  const [taxRate, setTaxRate] = useState(settings?.taxRate ?? 5);
  const [shippingPolicy, setShippingPolicy] = useState(
    settings?.shippingPolicy || 'Free Worldwide Insured Shipping'
  );
  const [supportEmail, setSupportEmail] = useState(settings?.supportEmail || 'ticking@gmail.com');
  const [phone, setPhone] = useState(settings?.phone || '9909225852');

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Sync state whenever settings from context loads or updates
  useEffect(() => {
    if (settings) {
      setStoreName(settings.storeName || 'TICKING LUXARY WATCH');
      setCurrency(
        settings.currency && !settings.currency.includes('?') ? settings.currency : 'INR (₹)'
      );
      setTaxRate(settings.taxRate ?? 5);
      setShippingPolicy(settings.shippingPolicy || 'Free Worldwide Insured Shipping');
      setSupportEmail(settings.supportEmail || 'ticking@gmail.com');
      setPhone(settings.phone || '9909225852');
    }
  }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();

    const newErrors = {};
    const nameErr = validateName(storeName, 'Brand identity name');
    if (nameErr) newErrors.storeName = nameErr;

    const emailErr = validateEmail(supportEmail);
    if (emailErr) newErrors.supportEmail = emailErr;

    const phoneErr = validatePhone(phone, true);
    if (phoneErr) newErrors.phone = phoneErr;

    const taxErr = validateDiscount(taxRate);
    if (taxErr) newErrors.taxRate = taxErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please correct highlighted configuration errors', 'error');
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      await updateSettings({
        storeName: storeName.trim(),
        currency: currency && !currency.includes('?') ? currency.trim() : 'INR (₹)',
        taxRate: Number(taxRate),
        shippingPolicy: shippingPolicy.trim(),
        supportEmail: supportEmail.trim(),
        phone: phone.trim()
      });
      showToast('Platform configuration saved successfully to MongoDB Atlas!', 'success');
    } catch (err) {
      console.error('Failed to save settings:', err);
      showToast(err.message || 'Failed to persist settings in MongoDB', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (settingsLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-stone-400 gap-3">
        <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs uppercase tracking-widest text-[#D4AF37]">Loading Store Settings...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-left max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
            SYSTEM CONFIGURATION
          </span>
          <h1 className="font-serif text-3xl font-bold text-white mt-0.5">
            Store & Boutique Settings
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Persisted in MongoDB Atlas. Changes reflect instantly across header, footer, emails, and customer touchpoints.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            refreshSettings();
            showToast('Refreshed configuration from MongoDB Atlas', 'info');
          }}
          className="w-fit px-3.5 py-2 bg-stone-900 border border-stone-800 hover:border-[#D4AF37]/50 text-stone-300 hover:text-white rounded-xl text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload</span>
        </button>
      </div>

      <form
        onSubmit={handleSave}
        noValidate
        className="bg-[#0D0D11] border border-stone-800/80 rounded-2xl p-8 flex flex-col gap-6 shadow-2xl relative"
      >
        {/* Brand Identity Name */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
            Brand Identity Name *
          </label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => {
              setStoreName(e.target.value);
              if (errors.storeName) setErrors((prev) => ({ ...prev, storeName: '' }));
            }}
            placeholder="e.g. TICKING LUXARY WATCH"
            className={`w-full bg-[#131317] border ${
              errors.storeName ? 'border-rose-500/70' : 'border-stone-800 focus:border-[#D4AF37]'
            } text-xs text-white p-3 rounded-xl outline-none transition-colors font-medium`}
          />
          {errors.storeName ? (
            <p className="flex items-center gap-1.5 text-rose-400 text-[11px] mt-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.storeName}</span>
            </p>
          ) : (
            <p className="text-[10px] text-stone-500 mt-1">
              Displays on the storefront navbar, footer, invoices, and system emails.
            </p>
          )}
        </div>

        {/* Currency and Tax Rate */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
              Base Currency Format
            </label>
            <input
              type="text"
              disabled
              value={currency}
              className="w-full bg-[#18181D] border border-stone-800 text-xs text-[#F3E5AB] font-bold p-3 rounded-xl outline-none cursor-not-allowed"
            />
            <p className="text-[10px] text-stone-500 mt-1">
              Standard Indian Rupee (₹) format with luxury symbol styling.
            </p>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
              Luxury Duty / VAT Rate (%) *
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={taxRate}
              onChange={(e) => {
                setTaxRate(e.target.value);
                if (errors.taxRate) setErrors((prev) => ({ ...prev, taxRate: '' }));
              }}
              className={`w-full bg-[#131317] border ${
                errors.taxRate ? 'border-rose-500/70' : 'border-stone-800 focus:border-[#D4AF37]'
              } text-xs text-white p-3 rounded-xl outline-none transition-colors`}
            />
            {errors.taxRate ? (
              <p className="flex items-center gap-1.5 text-rose-400 text-[11px] mt-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.taxRate}</span>
              </p>
            ) : (
              <p className="text-[10px] text-stone-500 mt-1">
                Applied during checkout and cart calculation (Default: 5%).
              </p>
            )}
          </div>
        </div>

        {/* Global Shipping Policy */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
            Global Shipping Policy Note
          </label>
          <input
            type="text"
            value={shippingPolicy}
            onChange={(e) => setShippingPolicy(e.target.value)}
            className="w-full bg-[#131317] border border-stone-800 focus:border-[#D4AF37] text-xs text-white p-3 rounded-xl outline-none"
            placeholder="e.g. Free Worldwide Insured Shipping"
          />
          <p className="text-[10px] text-stone-500 mt-1">
            Displayed on header announcement bar and order acquisition notes.
          </p>
        </div>

        {/* Concierge Email and Boutique Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
              Concierge Email *
            </label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => {
                setSupportEmail(e.target.value);
                if (errors.supportEmail) setErrors((prev) => ({ ...prev, supportEmail: '' }));
              }}
              placeholder="e.g. ticking@gmail.com"
              className={`w-full bg-[#131317] border ${
                errors.supportEmail ? 'border-rose-500/70' : 'border-stone-800 focus:border-[#D4AF37]'
              } text-xs text-white p-3 rounded-xl outline-none transition-colors`}
            />
            {errors.supportEmail && (
              <p className="flex items-center gap-1.5 text-rose-400 text-[11px] mt-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.supportEmail}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 font-medium">
              Boutique Phone *
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
              }}
              placeholder="e.g. 9909225852"
              className={`w-full bg-[#131317] border ${
                errors.phone ? 'border-rose-500/70' : 'border-stone-800 focus:border-[#D4AF37]'
              } text-xs text-white p-3 rounded-xl outline-none transition-colors`}
            />
            {errors.phone && (
              <p className="flex items-center gap-1.5 text-rose-400 text-[11px] mt-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.phone}</span>
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex items-center justify-between">
          <button
            type="submit"
            disabled={saving}
            className="w-fit px-8 py-3.5 bg-[#D4AF37] hover:bg-[#F3E5AB] disabled:opacity-60 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <span>Saving to MongoDB...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Configuration</span>
              </>
            )}
          </button>

          <span className="text-[11px] text-stone-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>MongoDB Atlas Persistent</span>
          </span>
        </div>
      </form>
    </div>
  );
}
