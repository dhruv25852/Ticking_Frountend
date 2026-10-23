// Reusable JavaScript Form Validation Utilities for TICKING Luxury Horology

// Email regex according to standard RFC 5322 format
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Phone regex allowing standard 10-digit Indian numbers, optional +91 or international formats
export const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,15}$/;

// Pincode regex (6 digits)
export const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

// Name validation: required, at least 2 characters, letters and basic punctuation
export const validateName = (name, fieldName = 'Full Name') => {
  if (!name || !name.trim()) {
    return `${fieldName} is required`;
  }
  const clean = name.trim();
  if (clean.length < 2) {
    return `${fieldName} must be at least 2 characters`;
  }
  if (!/^[a-zA-Z\s.'-]+$/.test(clean)) {
    return `${fieldName} must contain valid characters only`;
  }
  return '';
};

// Email validation
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return 'Email is required';
  }
  const clean = email.trim();
  if (!EMAIL_REGEX.test(clean)) {
    return 'Please enter a valid email address';
  }
  return '';
};

// Password validation: required, minimum length
export const validatePassword = (password, minLength = 6) => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters`;
  }
  return '';
};

// Confirm Password validation
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return '';
};

// Phone validation
export const validatePhone = (phone, isRequired = true) => {
  if (!phone || !phone.trim()) {
    return isRequired ? 'Phone number is required' : '';
  }
  const digitsOnly = phone.replace(/[^0-9]/g, '');
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    return 'Please enter a valid 10-digit phone number';
  }
  if (!PHONE_REGEX.test(phone.trim())) {
    return 'Please enter a valid phone number';
  }
  return '';
};

// Generic required field validation
export const validateRequired = (value, fieldName) => {
  if (value === null || value === undefined || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return '';
};

// Number validation (Price)
export const validatePrice = (price, fieldName = 'Price') => {
  if (price === '' || price === null || price === undefined) {
    return `${fieldName} is required`;
  }
  const num = Number(price);
  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }
  if (num <= 0) {
    return `${fieldName} must be greater than ₹0`;
  }
  return '';
};

// Quantity / Stock validation
export const validateStock = (stock, fieldName = 'Stock quantity') => {
  if (stock === '' || stock === null || stock === undefined) {
    return `${fieldName} is required`;
  }
  const num = Number(stock);
  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }
  if (!Number.isInteger(num)) {
    return `${fieldName} must be an integer`;
  }
  if (num < 0) {
    return `${fieldName} cannot be negative`;
  }
  return '';
};

// Discount percentage validation
export const validateDiscount = (discount) => {
  if (discount === '' || discount === null || discount === undefined) return '';
  const num = Number(discount);
  if (isNaN(num)) return 'Discount must be a valid number';
  if (num < 0 || num > 100) return 'Discount must be between 0 and 100%';
  return '';
};

// Pincode validation
export const validatePincode = (pincode) => {
  if (!pincode || !pincode.trim()) {
    return 'Pincode is required';
  }
  const clean = pincode.trim();
  if (!PINCODE_REGEX.test(clean)) {
    return 'Please enter a valid 6-digit postal pincode';
  }
  return '';
};

// Coupon code validation
export const validateCouponCode = (code) => {
  if (!code || !code.trim()) {
    return 'Coupon code is required';
  }
  if (code.trim().length < 3) {
    return 'Coupon code must be at least 3 characters';
  }
  return '';
};
