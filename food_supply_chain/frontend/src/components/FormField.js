import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { validateField, errorMessages } from '../utils/validation';

const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  validationRules = [],
  showValidation = true,
  className = '',
  ...props
}) => {
  const [errors, setErrors] = useState([]);
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Validate field when value changes
  useEffect(() => {
    if (touched && validationRules.length > 0) {
      setIsValidating(true);
      const fieldErrors = validateField(value, validationRules, label);
      setErrors(fieldErrors);
      setIsValidating(false);
    }
  }, [value, touched, validationRules, label]);

  const handleBlur = (e) => {
    setTouched(true);
    if (onBlur) {
      onBlur(e);
    }
  };

  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  const getInputType = () => {
    if (type === 'password') {
      return showPassword ? 'text' : 'password';
    }
    return type;
  };

  const hasErrors = errors.length > 0 && touched;
  const isValid = errors.length === 0 && touched && value;

  const getInputClasses = () => {
    let classes = 'w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-offset-0 transition-colors';
    
    if (disabled) {
      classes += ' bg-gray-50 text-gray-500 cursor-not-allowed';
    } else if (hasErrors) {
      classes += ' border-red-300 focus:border-red-500 focus:ring-red-500';
    } else if (isValid) {
      classes += ' border-green-300 focus:border-green-500 focus:ring-green-500';
    } else {
      classes += ' border-gray-300 focus:border-green-500 focus:ring-green-500';
    }
    
    return classes + ' ' + className;
  };

  const renderInput = () => {
    const inputProps = {
      name,
      type: getInputType(),
      value: value || '',
      onChange: handleChange,
      onBlur: handleBlur,
      placeholder,
      disabled,
      className: getInputClasses(),
      ...props
    };

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...inputProps}
            rows={props.rows || 3}
            className={getInputClasses() + ' resize-none'}
          />
        );
      
      case 'select':
        return (
          <select {...inputProps}>
            {props.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      default:
        return <input {...inputProps} />;
    }
  };

  return (
    <div className="space-y-1">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {renderInput()}
        
        {/* Password Toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
        
        {/* Validation Icons */}
        {showValidation && touched && !isValidating && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {hasErrors ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : isValid ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : null}
          </div>
        )}
        
        {/* Loading Indicator */}
        {isValidating && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
          </div>
        )}
      </div>

      {/* Error Messages */}
      {showValidation && hasErrors && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Help Text */}
      {props.helpText && !hasErrors && (
        <p className="text-sm text-gray-500">{props.helpText}</p>
      )}
    </div>
  );
};

// Specialized form field components
export const TextField = (props) => <FormField {...props} type="text" />;
export const EmailField = (props) => <FormField {...props} type="email" />;
export const PasswordField = (props) => <FormField {...props} type="password" />;
export const NumberField = (props) => <FormField {...props} type="number" />;
export const TextAreaField = (props) => <FormField {...props} type="textarea" />;
export const SelectField = (props) => <FormField {...props} type="select" />;
export const DateField = (props) => <FormField {...props} type="date" />;
export const FileField = (props) => <FormField {...props} type="file" />;

export default FormField;
