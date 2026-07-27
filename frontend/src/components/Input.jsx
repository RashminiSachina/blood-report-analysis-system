import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './Input.module.css';

export default function Input({
  label,
  id,
  type = 'text',
  error,
  helperText,
  icon: Icon,
  rightElement,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const inputClasses = [
    styles.input,
    Icon ? styles.inputWithPrefix : '',
    (isPassword || rightElement) ? styles.inputWithSuffix : '',
    error ? styles.inputError : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.container}>
      {label && (
        <div className={styles.labelRow}>
          <label htmlFor={id} className={styles.label}>
            {label}
          </label>
          {rightElement}
        </div>
      )}
      <div className={styles.inputWrapper}>
        {Icon && (
          <span className={styles.prefixIcon}>
            <Icon size={18} />
          </span>
        )}
        <input
          id={id}
          type={inputType}
          className={inputClasses}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className={styles.suffixButton}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
      {!error && helperText && <span className={styles.helperText}>{helperText}</span>}
    </div>
  );
}
