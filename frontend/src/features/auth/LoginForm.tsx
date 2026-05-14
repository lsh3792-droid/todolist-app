import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLogin } from '../../hooks/auth/useLogin';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import styles from './AuthForm.module.css';

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function LoginForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; api?: string }>({});

  const login = useLogin();

  function validate() {
    const next: typeof errors = {};
    if (!validateEmail(email)) next.email = t('auth.errors.invalidEmail');
    if (password.length < 8) next.password = t('auth.errors.passwordTooShort');
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    login.mutate(
      { email, password },
      {
        onError: (err) => {
          const msg =
            (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ??
            t('auth.errors.loginFailed');
          setErrors({ api: msg });
        },
      }
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h1 className={styles.title}>{t('auth.login')}</h1>
      {errors.api && <p className={styles.apiError}>{errors.api}</p>}
      <Input
        id="email"
        type="email"
        label={t('auth.email')}
        placeholder={t('auth.emailPlaceholder')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        autoComplete="email"
      />
      <Input
        id="password"
        type="password"
        label={t('auth.password')}
        placeholder={t('auth.passwordPlaceholder')}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        autoComplete="current-password"
      />
      <Button type="submit" variant="primary" loading={login.isPending} className={styles.submitBtn}>
        {t('auth.login')}
      </Button>
    </form>
  );
}
