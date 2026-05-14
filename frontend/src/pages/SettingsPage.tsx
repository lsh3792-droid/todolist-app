import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api/userApi';
import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ConfirmDialog } from '../components/ConfirmDialog';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const addToast = useUiStore((s) => s.addToast);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => userApi.getMe().then((r) => r.data),
  });

  const [name, setName] = useState(me?.name ?? '');
  const [nameError, setNameError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwErrors, setPwErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const updateMe = useMutation({
    mutationFn: userApi.updateMe,
    onSuccess: () => addToast(t('settings.profile.updated'), 'success'),
    onError: () => addToast(t('settings.profile.updateFailed'), 'error'),
  });

  const deleteMe = useMutation({
    mutationFn: userApi.deleteMe,
    onSuccess: () => {
      clearAuth();
      navigate('/login');
    },
    onError: () => addToast(t('settings.danger.deleteFailed'), 'error'),
  });

  function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(t('settings.profile.nameRequired'));
      return;
    }
    setNameError('');
    updateMe.mutate({ name });
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof pwErrors = {};
    if (!currentPassword) next.currentPassword = t('settings.password.errors.currentRequired');
    if (newPassword.length < 8) next.newPassword = t('settings.password.errors.newTooShort');
    if (newPassword !== confirmPassword) next.confirmPassword = t('settings.password.errors.mismatch');
    setPwErrors(next);
    if (Object.keys(next).length > 0) return;
    updateMe.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          addToast(t('settings.password.changed'), 'success');
        },
        onError: (err) => {
          const code =
            (err as { response?: { data?: { error?: { code?: string } } } })?.response?.data?.error?.code;
          if (code === 'UNAUTHORIZED') {
            setPwErrors({ currentPassword: t('settings.password.errors.wrongCurrent') });
          } else {
            addToast(t('settings.password.changeFailed'), 'error');
          }
        },
      }
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t('settings.title')}</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('settings.profile.title')}</h2>
        <form onSubmit={handleNameSubmit} className={styles.form}>
          <Input
            id="settings-email"
            label={t('settings.profile.email')}
            value={me?.email ?? ''}
            readOnly
            className={styles.readOnly}
          />
          <Input
            id="settings-name"
            label={t('settings.profile.name')}
            value={name || me?.name || ''}
            onChange={(e) => setName(e.target.value)}
            error={nameError}
          />
          <Button type="submit" variant="primary" loading={updateMe.isPending}>
            {t('settings.profile.save')}
          </Button>
        </form>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('settings.password.title')}</h2>
        <form onSubmit={handlePasswordSubmit} className={styles.form} noValidate>
          <Input
            id="current-password"
            type="password"
            label={t('settings.password.current')}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            error={pwErrors.currentPassword}
            autoComplete="current-password"
          />
          <Input
            id="new-password"
            type="password"
            label={t('settings.password.new')}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={pwErrors.newPassword}
            autoComplete="new-password"
          />
          <Input
            id="confirm-password"
            type="password"
            label={t('settings.password.confirm')}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={pwErrors.confirmPassword}
            autoComplete="new-password"
          />
          <Button type="submit" variant="primary" loading={updateMe.isPending}>
            {t('settings.password.save')}
          </Button>
        </form>
      </section>

      <section className={styles.section}>
        <h2 className={`${styles.sectionTitle} ${styles.dangerTitle}`}>{t('settings.danger.title')}</h2>
        <p className={styles.dangerDesc}>{t('settings.danger.description')}</p>
        <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
          {t('settings.danger.button')}
        </Button>
      </section>

      {showDeleteConfirm && (
        <ConfirmDialog
          message={t('settings.danger.confirm')}
          onConfirm={() => deleteMe.mutate()}
          onCancel={() => setShowDeleteConfirm(false)}
          loading={deleteMe.isPending}
        />
      )}
    </div>
  );
}
