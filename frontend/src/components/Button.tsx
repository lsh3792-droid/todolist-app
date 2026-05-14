import { type ButtonHTMLAttributes } from 'react';
import { Spinner } from './Spinner';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

export function Button({
  variant = 'primary',
  loading = false,
  disabled,
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`${styles.btn} ${styles[variant]} ${className ?? ''}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
