import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RegisterForm } from '../features/auth/RegisterForm';
import styles from './AuthPage.module.css';

export function RegisterPage() {
  const { t } = useTranslation();
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <RegisterForm />
        <p className={styles.link}>
          {t('auth.registerPrompt')} <Link to="/login">{t('auth.login')}</Link>
        </p>
      </div>
    </div>
  );
}
