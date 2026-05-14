import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoginForm } from '../features/auth/LoginForm';
import styles from './AuthPage.module.css';

export function LoginPage() {
  const { t } = useTranslation();
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <LoginForm />
        <p className={styles.link}>
          {t('auth.loginPrompt')} <Link to="/register">{t('auth.register')}</Link>
        </p>
      </div>
    </div>
  );
}
