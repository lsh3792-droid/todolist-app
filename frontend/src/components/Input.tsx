import { type InputHTMLAttributes, forwardRef } from 'react';
import styles from './Input.module.css';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, className, ...rest },
  ref
) {
  return (
    <div className={styles.wrapper}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={`${styles.input} ${error ? styles.inputError : ''} ${className ?? ''}`}
        {...rest}
      />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
});
