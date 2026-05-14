import { useEffect } from 'react';
import { useUiStore, type Toast as ToastType } from '../stores/uiStore';
import styles from './Toast.module.css';

type ToastProps = {
  toast: ToastType;
};

export function Toast({ toast }: ToastProps) {
  const removeToast = useUiStore((s) => s.removeToast);

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), 3000);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  return (
    <div className={`${styles.toast} ${styles[toast.type]}`} role="alert">
      <span className={styles.indicator} />
      <span className={styles.message}>{toast.message}</span>
      <button className={styles.close} onClick={() => removeToast(toast.id)} aria-label="닫기">
        ✕
      </button>
    </div>
  );
}
