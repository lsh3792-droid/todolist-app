import styles from './Spinner.module.css';

type SpinnerProps = {
  size?: 'sm' | 'md';
};

export function Spinner({ size = 'md' }: SpinnerProps) {
  return <span className={`${styles.spinner} ${styles[size]}`} role="status" aria-label="로딩 중" />;
}
