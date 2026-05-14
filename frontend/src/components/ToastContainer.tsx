import { useUiStore } from '../stores/uiStore';
import { Toast } from './Toast';
import styles from './ToastContainer.module.css';

export function ToastContainer() {
  const toasts = useUiStore((s) => s.toasts);

  return (
    <div className={styles.container}>
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} />
      ))}
    </div>
  );
}
