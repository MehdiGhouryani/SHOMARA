'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './AdultRouteShell.module.css';

export function AdultRouteShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <main className={styles.shell} dir="rtl">
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>فضای والدین</p>
          <h1>{title}</h1>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>
        <Link href="/" className={styles.back}>بازگشت به مسیر کودک</Link>
      </header>
      {children}
    </main>
  );
}
