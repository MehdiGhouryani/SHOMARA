'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { G1_STATIONS, G1_UNITS, G1_U01 } from '@math/contracts';
import { ChildRouteShell } from '../../../components/ChildRouteShell';
import styles from '../../../components/UnitOverview.module.css';

export default function UnitPage() {
  const params = useParams<{ unitId: string }>();
  const unit = G1_UNITS.find((item) => item.id === params?.unitId) ?? G1_U01;
  const stations = G1_STATIONS.filter((station) => station.unitId === unit.id);

  return (
    <ChildRouteShell activeTab="PATH">
      <div dir="rtl" className={styles.root}>
        <Link href="/" className={styles.back}>← مسیر</Link>
        <header className={styles.header}>
          <p className={styles.kicker}>واحد {unit.number}</p>
          <h1 className={styles.title}>{unit.title}</h1>
          <p className={styles.subtitle}>{unit.subtitle}</p>
        </header>
        <section className={styles.section} aria-labelledby="unit-stations">
          <h2 id="unit-stations" className={styles.sectionTitle}>ایستگاه‌ها</h2>
          <div className={styles.list}>
            {stations.map((station) => (
              <Link key={station.id} href={`/station/${station.id}/start`} className={styles.row}>
                <span className={styles.arrow} aria-hidden="true">←</span>
                <span className={styles.copy}><strong className={styles.stationTitle}>{station.title}</strong><small className={styles.meta}>{station.estimatedMinutes} دقیقه</small></span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </ChildRouteShell>
  );
}
