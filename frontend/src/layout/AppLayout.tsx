import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLogout } from '../hooks/auth/useLogout';
import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';
import styles from './AppLayout.module.css';

type AppLayoutProps = {
  children: React.ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const logout = useLogout();
  const currentUser = useAuthStore((s) => s.currentUser);
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const language = useUiStore((s) => s.language);
  const setLanguage = useUiStore((s) => s.setLanguage);
  const { t } = useTranslation();

  return (
    <div className={styles.root}>
      <button
        className={styles.hamburger}
        onClick={() => setSidebarOpen((v) => !v)}
        aria-label="메뉴 열기"
      >
        ☰
      </button>

      {sidebarOpen && (
        <div className={styles.backdrop} onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarTop}>
          <span className={styles.appName}>{t('common.appName')}</span>
        </div>
        <nav className={styles.nav}>
          <NavLink
            to="/todos"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            {t('nav.todos')}
          </NavLink>
          <NavLink
            to="/categories"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            {t('nav.categories')}
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            {t('nav.settings')}
          </NavLink>
        </nav>
        <div className={styles.sidebarBottom}>
          {currentUser && (
            <span className={styles.userName}>{currentUser.name}</span>
          )}
          <div className={styles.sidebarActions}>
            <button
              className={styles.themeBtn}
              onClick={toggleTheme}
              aria-label="테마 전환"
              title={theme === 'dark' ? t('theme.toLightMode') : t('theme.toDarkMode')}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              className={styles.langBtn}
              onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
              aria-label="언어 변경"
            >
              {language === 'ko' ? 'EN' : 'KO'}
            </button>
            <button className={styles.logoutBtn} onClick={logout}>
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
