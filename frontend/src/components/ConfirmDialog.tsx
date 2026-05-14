import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import styles from './ConfirmDialog.module.css';

type ConfirmDialogProps = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export function ConfirmDialog({ message, onConfirm, onCancel, loading }: ConfirmDialogProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()} role="alertdialog" aria-modal="true">
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {t('common.confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
}
