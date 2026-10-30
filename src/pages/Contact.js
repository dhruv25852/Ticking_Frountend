import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Headphones,
  Clock,
  Lock,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useSettings } from '../context/SettingsContext';
import { validateName, validateEmail, validatePhone } from '../utils/validation';

export default function Contact() {
  const { showToast } = useToast();
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};

    const nameErr = validateName(formData.fullName, 'Full Name');
    if (nameErr) newErrors.fullName = nameErr;

    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    if (formData.phone) {
      const phoneErr = validatePhone(formData.phone, false);
      if (phoneErr) newErrors.phone = phoneErr;
    }

    if (!formData.message || !formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      showToast('Thank you! Your message has been routed to our Geneva concierge.', 'success');
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setErrors({});
      setSubmitting(false);
    }, 800);
  };

  return (
    <div className="w-full bg-[#080809] min-h-screen text-stone-200 py-16 px-4 sm:px-8 relative overflow-hidden">
      {/* Background Ambience from Image 5 */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[radial-gradient(circle,_rgba(212,175,55,0.1)_0%,_transparent_70%)] pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,_rgba(212,175,55,0.1)_0%,_transparent_70%)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header matching Reference Image 5 */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
            GET IN TOUCH
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-white mt-2 tracking-tight">
            We'd Love to Hear from You
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 font-light mt-3 leading-relaxed">
            Have a question or need assistance? Our team of certified master horologists and private client advisors is here to assist you.
          </p>
        </div>

        {/* 2-Column Layout matching Reference Image 5 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Card: Send Us a Message */}
          <div className="lg:col-span-6 bg-[#0E0E12] border border-[#D4AF37]/30 rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-6">
                SEND US A MESSAGE
              </h2>

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      className={`w-full bg-[#141418] border text-xs text-white p-3 rounded-xl outline-none placeholder:text-stone-500 transition-colors ${
                        errors.fullName ? 'border-rose-500/80 focus:border-rose-500' : 'border-stone-800 focus:border-[#D4AF37]'
                      }`}
                    />
                    {errors.fullName && (
                      <p className="text-[11px] text-rose-400 mt-1 font-medium">{errors.fullName}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Email Address *"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={`w-full bg-[#141418] border text-xs text-white p-3 rounded-xl outline-none placeholder:text-stone-500 transition-colors ${
                        errors.email ? 'border-rose-500/80 focus:border-rose-500' : 'border-stone-800 focus:border-[#D4AF37]'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-[11px] text-rose-400 mt-1 font-medium">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className={`w-full bg-[#141418] border text-xs text-white p-3 rounded-xl outline-none placeholder:text-stone-500 transition-colors ${
                        errors.phone ? 'border-rose-500/80 focus:border-rose-500' : 'border-stone-800 focus:border-[#D4AF37]'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-rose-400 mt-1 font-medium">{errors.phone}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Subject"
                      value={formData.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      className="w-full bg-[#141418] border border-stone-800 focus:border-[#D4AF37] text-xs text-white p-3 rounded-xl outline-none placeholder:text-stone-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <textarea
                    rows="5"
                    placeholder="Your Message *"
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    className={`w-full bg-[#141418] border text-xs text-white p-3 rounded-xl outline-none placeholder:text-stone-500 transition-colors ${
                      errors.message ? 'border-rose-500/80 focus:border-rose-500' : 'border-stone-800 focus:border-[#D4AF37]'
                    }`}
                  ></textarea>
                  {errors.message && (
                    <p className="text-[11px] text-rose-400 mt-1 font-medium">{errors.message}</p>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#F3E5AB] hover:to-[#D4AF37] text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl flex items-center gap-2 transition-all shadow-lg disabled:opacity-50"
                  >
                    <span>{submitting ? 'Sending...' : 'Send Message'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-6 pt-4 border-t border-stone-800/80">
              <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Your information is secure and will never be shared.</span>
            </div>
          </div>

          {/* Right Card: Contact Information & Boutique Map Graphic */}
          <div className="lg:col-span-6 bg-[#0E0E12] border border-[#D4AF37]/30 rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-6">
                CONTACT INFORMATION
              </h2>

              <div className="flex flex-col gap-6 text-xs">
                {/* Visit Our Boutique */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 flex items-center justify-center shrink-0 text-[#D4AF37]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs uppercase font-bold tracking-wider text-white">
                      VISIT OUR BOUTIQUE
                    </h3>
                    <p className="text-stone-400 mt-0.5 leading-relaxed">
                      123 Luxury Avenue, Ahemdabad, india
                    </p>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 flex items-center justify-center shrink-0 text-[#D4AF37]">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs uppercase font-bold tracking-wider text-white">
                      BOUTIQUE PHONE
                    </h3>
                    <a
                      href={`tel:${settings?.phone || '9909225852'}`}
                      className="text-stone-300 hover:text-[#D4AF37] font-medium mt-0.5 block transition-colors"
                    >
                      {settings?.phone || '9909225852'}
                    </a>
                    <p className="text-[11px] text-stone-500">Mon - Sat: 9AM - 7PM IST</p>
                  </div>
                </div>

                {/* Email Address */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 flex items-center justify-center shrink-0 text-[#D4AF37]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs uppercase font-bold tracking-wider text-white">
                      CONCIERGE EMAIL
                    </h3>
                    <a
                      href={`mailto:${settings?.supportEmail || 'ticking@gmail.com'}`}
                      className="text-stone-300 hover:text-[#D4AF37] font-medium mt-0.5 block transition-colors"
                    >
                      {settings?.supportEmail || 'ticking@gmail.com'}
                    </a>
                    <p className="text-[11px] text-stone-500">We'll respond within 24 hours</p>
                  </div>
                </div>

                {/* Customer Support */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 flex items-center justify-center shrink-0 text-[#D4AF37]">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs uppercase font-bold tracking-wider text-white">
                      CUSTOMER SUPPORT
                    </h3>
                    <a
                      href={`mailto:${settings?.supportEmail || 'ticking@gmail.com'}`}
                      className="text-stone-300 hover:text-[#D4AF37] font-medium mt-0.5 block transition-colors"
                    >
                      {settings?.supportEmail || 'ticking@gmail.com'}
                    </a>
                    <p className="text-[11px] text-stone-500">For acquisitions, tracking & client care</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Time Badge matching Image 5 */}
            <div className="mt-8 p-4 bg-[#141419] border border-stone-800 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-[#F3E5AB]">
                  RESPONSE TIME
                </p>
                <p className="text-xs text-stone-400 mt-0.5">
                  We typically respond within 24 hours on business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
