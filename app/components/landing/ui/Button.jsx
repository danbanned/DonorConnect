import Link from 'next/link';
import styles from './Button.module.css';

export default function Button({ href, children, variant = 'primary', fullWidth = false, className = '' }) {
  const classNames = [styles.button, styles[variant], fullWidth ? styles.fullWidth : '', className].filter(Boolean).join(' ');

  if (href) {
    return (
      <Link href={href} className={classNames}>
        {children}
      </Link>
    );
  }

  return <button className={classNames}>{children}</button>;
}
