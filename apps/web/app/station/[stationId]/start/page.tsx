'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChildRouteShell } from '../../../../components/ChildRouteShell';
import { StationStartView } from '../../../../components/StationStartView';
import { G1_STATIONS, type ContentManifest } from '@math/contracts';

export default function StationStartPage() {
  const router = useRouter();
  const params = useParams<{ stationId?: string }>();
  const stationId = String(params.stationId ?? 'ST01');
  const station = useMemo(() => G1_STATIONS.find((item) => item.id === stationId) ?? G1_STATIONS[0]!, [stationId]);
  const [manifest, setManifest] = useState<ContentManifest | null>(null);
  const [manifestState, setManifestState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'ready' | 'error'>('idle');
  const [cached, setCached] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/v1/content/manifest?gradeId=G1', { cache: 'no-store' })
      .then(async (r) => { if (!r.ok) throw new Error(String(r.status)); return r.json() as Promise<ContentManifest>; })
      .then((data) => {
        if (cancelled) return;
        setManifest(data);
        setManifestState('ready');
        const refs = [...data.current, ...data.next, ...data.recent];
        setCached(refs.some((x) => x.stationId === `G1-${station.id}` && x.cacheClass === 'CURRENT'));
      })
      .catch(() => { if (!cancelled) setManifestState('error'); });
    return () => { cancelled = true; };
  }, [station.id]);

  const packageRef = useMemo(() => manifest ? [...manifest.current, ...manifest.next, ...manifest.recent, ...manifest.future].find((item) => item.stationId === `G1-${station.id}`) ?? null : null, [manifest, station.id]);

  async function preparePackage() {
    if (!packageRef) { setDownloadState('error'); return; }
    setDownloadState('downloading');
    try {
      const response = await fetch(packageRef.downloadUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error(`PACKAGE_${response.status}`);
      const body = await response.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', body);
      const digest = Array.from(new Uint8Array(hashBuffer)).map((x) => x.toString(16).padStart(2, '0')).join('');
      if (digest !== packageRef.checksum) throw new Error('CHECKSUM_MISMATCH');
      if ('caches' in window) {
        const cache = await caches.open('math-content-v1');
        await cache.put(new Request(packageRef.downloadUrl), new Response(body, { headers: { 'Content-Type': 'application/json', 'X-Content-Checksum': digest } }));
      }
      setCached(true);
      setDownloadState('ready');
    } catch {
      setDownloadState('error');
    }
  }

  return (
    <ChildRouteShell activeTab="PATH">
      <StationStartView
        number={station.number}
        title={station.title}
        subtitle={station.subtitle}
        minutes={station.estimatedMinutes}
        cached={cached}
        manifestState={manifestState}
        downloadState={downloadState}
        packageRef={packageRef}
        onBack={() => router.push('/')}
        onPrepare={preparePackage}
        onStart={() => router.push(`/station/${station.id}/play`)}
      />
    </ChildRouteShell>
  );
}
