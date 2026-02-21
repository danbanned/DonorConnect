'use client';

import { useState } from 'react';
import Link from 'next/link';
import Container from './ui/Container';
import Button from './ui/Button';
import styles from './Header.module.css';

const navGroups = [
  {
    label: 'Platform',
    items: [
      { label: 'The Solution', href: '#solution' },
      { label: 'Why DonorConnect', href: '#why-donorconnect' },
      { label: 'Built for Real Life', href: '#built-for-real-life' }
    ]
  },
  {
    label: 'Features',
    items: [
      { label: 'Human-First Profiles', href: '#human-first-profiles' },
      { label: 'Actionable Insights', href: '#actionable-insights' },
      { label: 'Smart Communication', href: '#smart-communication' },
      { label: 'Visual Dashboards', href: '#visual-dashboards' },
      { label: 'Helpful Automation', href: '#helpful-automation' }
    ]
  },
  {
    label: 'Resources',
    items: [
      { label: 'Case Study', href: '#case-study' },
      { label: 'Testimonials', href: '#testimonials' },
      { label: 'FAQ', href: '#faq' }
    ]
  }
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  return (
    <header className={styles.header}>
      <Container className={styles.row}>
        <Link href="/" className={styles.logoWrap}>
          <span className={styles.logo}>DONORCONNECT</span>
          <span className={styles.tagline}>Intelligent Fundraising</span>
        </Link>

        <button className={styles.menuBtn} onClick={() => setOpen(!open)} aria-label="Toggle menu">
          ☰
        </button>

        <nav className={`${styles.nav} ${open ? styles.open : ''}`}>
          {navGroups.map((group) => (
            <div key={group.label} className={styles.dropdown}>
              <button
                type="button"
                className={`${styles.navLink} ${styles.navButton}`}
                onClick={() => setOpenDropdown(openDropdown === group.label ? null : group.label)}
              >
                {group.label} ▼
              </button>
              <div className={`${styles.dropdownMenu} ${openDropdown === group.label ? styles.dropdownOpen : ''}`}>
                {group.items.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={styles.dropdownItem}
                    onClick={() => {
                      setOpen(false);
                      setOpenDropdown(null);
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <Link href="#pricing" className={styles.navLink} onClick={() => setOpen(false)}>Pricing</Link>
          <Button href="/login" variant="secondary" className={styles.loginBtn}>LOG IN</Button>
          <Button href="/login" className={styles.signupBtn}>SIGN UP FREE</Button>
        </nav>
      </Container>
    </header>
  );
}
