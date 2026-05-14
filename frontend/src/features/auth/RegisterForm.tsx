import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRegister } from '../../hooks/auth/useRegister';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import styles from './AuthForm.module.css';

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function RegisterForm() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    api?: string;
  }>({});

  const register = useRegister();

  function validate() {
    const next: typeof errors = {};
    if (!name.trim()) next.name = t('auth.errors.nameRequired');
    if (!validateEmail(email)) next.email = t('auth.errors.invalidEmail');
    if (password.length < 8) next.password = t('auth.errors.passwordTooShort');
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    register.mutate(
      { name, email, password },
      {
        onError: (err) => {
          const code =
            (err as { response?: { data?: { error?: { code?: string; message?: string } } } })?.response?.data?.error
              ?.code;
          const message =
            (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ??
            t('auth.errors.registerFailed');
          if (code === 'CONFLICT') {
            setErrors({ email: t('auth.errors.emailConflict') });
          } else {
            setErrors({ api: message });
          }
        },
      }
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h1 className={styles.title}>{t('auth.register')}</h1>
      {errors.api && <p className={styles.apiError}>{errors.api}</p>}
      <Input
        id="name"
        type="text"
        label={t('auth.name')}
        placeholder={t('auth.namePlaceholder')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        autoComplete="name"
      />
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
        autoComplete="new-password"
      />
      <Button type="submit" variant="primary" loading={register.isPending} className={styles.submitBtn}>
        {t('auth.register')}
      </Button>
    </form>
  );
}
