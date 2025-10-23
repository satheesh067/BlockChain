// Validation utilities for the frontend
export const validators = {
  // Email validation
  email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),

  // Ethereum address validation
  ethereumAddress: (address) => /^0x[a-fA-F0-9]{40}$/.test(address),

  // GPS coordinates validation
  coordinates: (coords) => {
    if (!coords || typeof coords !== 'string') return false;
    const parts = coords.split(',');
    if (parts.length !== 2) return false;

    const lat = parseFloat(parts[0].trim());
    const lng = parseFloat(parts[1].trim());

    return !isNaN(lat) && !isNaN(lng) &&
           lat >= -90 && lat <= 90 &&
           lng >= -180 && lng <= 180;
  },

  // Date validation
  date: (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  },

  // Future date validation
  futureDate: (dateString) => {
    if (!validators.date(dateString)) return false;
    const date = new Date(dateString);
    return date > new Date();
  },

  // Past date validation
  pastDate: (dateString) => {
    if (!validators.date(dateString)) return false;
    const date = new Date(dateString);
    return date < new Date();
  },

  // Date range validation
  dateRange: (startDate, endDate) => {
    if (!validators.date(startDate) || !validators.date(endDate)) return false;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start < end;
  },

  // Positive number validation
  positiveNumber: (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
  },

  // Integer validation
  integer: (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && Number.isInteger(num);
  },

  // Positive integer validation
  positiveInteger: (value) => validators.integer(value) && parseInt(value) > 0,

  // String length validation
  stringLength: (str, minLength = 0, maxLength = Infinity) => {
    if (typeof str !== 'string') return false;
    return str.length >= minLength && str.length <= maxLength;
  },

  // Required field validation
  required: (value) => {
    if (typeof value === 'string') return value.trim().length > 0;
    return value !== null && value !== undefined && value !== '';
  },

  // File validation
  file: (file, options = {}) => {
    if (!file) return false;

    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
      allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf']
    } = options;

    if (file.size > maxSize) return false;
    if (!allowedTypes.includes(file.type)) return false;

    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) return false;

    return true;
  },

  // Batch number validation
  batchNumber: (batchNumber) => {
    if (!validators.required(batchNumber)) return false;
    return /^[A-Z0-9-_]+$/i.test(batchNumber);
  },

  // Crop name validation
  cropName: (name) => {
    if (!validators.required(name)) return false;
    if (!validators.stringLength(name, 2, 100)) return false;
    return /^[a-zA-Z0-9\s\-_&()]+$/.test(name);
  },

  // Price validation (ETH)
  price: (price) => {
    const num = parseFloat(price);
    return !isNaN(num) && num >= 0 && num <= 1000; // Reasonable ETH range
  },

  // Quantity validation
  quantity: (quantity) => validators.positiveInteger(quantity) && parseInt(quantity) <= 1000000
};

// --------------------------------------------------
// Error Messages
// --------------------------------------------------
export const errorMessages = {
  required: (field) => `${field} is required`,
  invalid: (field) => `Invalid ${field}`,
  tooShort: (field, min) => `${field} must be at least ${min} characters`,
  tooLong: (field, max) => `${field} must be no more than ${max} characters`,
  tooLarge: (field, max) => `${field} must be no more than ${max}`,
  tooSmall: (field, min) => `${field} must be at least ${min}`,
  fileTooLarge: (maxSize) => `File size must be less than ${getFileSizeMB(maxSize)}MB`,
  invalidFileType: (allowedTypes) => `File type must be one of: ${allowedTypes.join(', ')}`,
  invalidDate: (field) => `Invalid ${field} date`,
  futureDate: (field) => `${field} must be in the future`,
  pastDate: (field) => `${field} must be in the past`,
  dateRange: (startField, endField) => `${endField} must be after ${startField}`,
  invalidCoordinates: () => 'Coordinates must be in format: latitude,longitude',
  invalidAddress: () => 'Invalid Ethereum address',
  invalidEmail: () => 'Invalid email address',
  invalidBatchNumber: () => 'Batch number can only contain letters, numbers, hyphens, and underscores',
  invalidCropName: () => 'Crop name can only contain letters, numbers, spaces, and the characters -_&()'
};

// --------------------------------------------------
// Validation Helpers
// --------------------------------------------------
export const validateField = (value, rules, fieldName) => {
  const errors = [];

  for (const rule of rules) {
    const { validator, message, params = [] } = rule;
    if (!validator(value, ...params)) {
      errors.push(message || errorMessages.invalid(fieldName));
    }
  }

  return errors;
};

export const validateForm = (formData, validationRules) => {
  const errors = {};

  for (const [fieldName, rules] of Object.entries(validationRules)) {
    const fieldErrors = validateField(formData[fieldName], rules, fieldName);
    if (fieldErrors.length > 0) {
      errors[fieldName] = fieldErrors;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// --------------------------------------------------
// Utility Functions
// --------------------------------------------------
export const getFileSizeMB = (bytes) => (bytes / (1024 * 1024)).toFixed(2);

export const sanitizeInput = (input) =>
  typeof input === 'string' ? input.trim().replace(/[<>]/g, '') : input;

export const formatValidationErrors = (errors) => {
  const allErrors = [];
  for (const fieldErrors of Object.values(errors)) {
    allErrors.push(...fieldErrors);
  }
  return allErrors;
};

// --------------------------------------------------
// Common Validation Rules
// --------------------------------------------------
export const commonRules = {
  required: (fieldName) => ({
    validator: validators.required,
    message: errorMessages.required(fieldName)
  }),

  email: () => ({
    validator: validators.email,
    message: errorMessages.invalidEmail()
  }),

  ethereumAddress: () => ({
    validator: validators.ethereumAddress,
    message: errorMessages.invalidAddress()
  }),

  coordinates: () => ({
    validator: validators.coordinates,
    message: errorMessages.invalidCoordinates()
  }),

  positiveNumber: (fieldName) => ({
    validator: validators.positiveNumber,
    message: errorMessages.tooSmall(fieldName, 0)
  }),

  positiveInteger: (fieldName) => ({
    validator: validators.positiveInteger,
    message: errorMessages.tooSmall(fieldName, 1)
  }),

  stringLength: (fieldName, min, max) => ({
    validator: (value) => validators.stringLength(value, min, max),
    message:
      min === max
        ? `${fieldName} must be exactly ${min} characters`
        : `${fieldName} must be between ${min} and ${max} characters`
  }),

  date: (fieldName) => ({
    validator: validators.date,
    message: errorMessages.invalidDate(fieldName)
  }),

  futureDate: (fieldName) => ({
    validator: validators.futureDate,
    message: errorMessages.futureDate(fieldName)
  }),

  pastDate: (fieldName) => ({
    validator: validators.pastDate,
    message: errorMessages.pastDate(fieldName)
  }),

  file: (options = {}) => ({
    validator: (file) => validators.file(file, options),
    message: options.maxSize
      ? errorMessages.fileTooLarge(options.maxSize)
      : errorMessages.invalidFileType(options.allowedTypes || [])
  }),

  cropName: () => ({
    validator: validators.cropName,
    message: errorMessages.invalidCropName()
  }),

  batchNumber: () => ({
    validator: validators.batchNumber,
    message: errorMessages.invalidBatchNumber()
  }),

  price: () => ({
    validator: validators.price,
    message: 'Price must be between 0 and 1000 ETH'
  }),

  quantity: () => ({
    validator: validators.quantity,
    message: 'Quantity must be a positive integer less than 1,000,000'
  })
};

// --------------------------------------------------
// Validation Schemas
// --------------------------------------------------
export const validationSchemas = {
  userRegistration: {
    name: [
      commonRules.required('Name'),
      commonRules.stringLength('Name', 2, 50)
    ],
    email: [
      commonRules.required('Email'),
      commonRules.email()
    ],
    role: [commonRules.required('Role')]
  },

  cropRegistration: {
    name: [
      commonRules.required('Crop Name'),
      commonRules.cropName()
    ],
    quantity: [
      commonRules.required('Quantity'),
      commonRules.quantity()
    ],
    price: [
      commonRules.required('Price'),
      commonRules.price()
    ],
    batchNumber: [
      commonRules.required('Batch Number'),
      commonRules.batchNumber()
    ],
    harvestDate: [
      commonRules.required('Harvest Date'),
      commonRules.date('Harvest Date'),
      commonRules.pastDate('Harvest Date')
    ],
    expiryDate: [
      commonRules.required('Expiry Date'),
      commonRules.date('Expiry Date'),
      commonRules.futureDate('Expiry Date')
    ],
    farmCoords: [
      commonRules.required('Farm Coordinates'),
      commonRules.coordinates()
    ]
  },

  cropTransfer: {
    toAddress: [
      commonRules.required('Recipient Address'),
      commonRules.ethereumAddress()
    ],
    note: [commonRules.stringLength('Note', 0, 500)]
  }
};

// Default export
export default {
  validators,
  errorMessages,
  validateField,
  validateForm,
  commonRules,
  validationSchemas,
  getFileSizeMB,
  sanitizeInput,
  formatValidationErrors
};
