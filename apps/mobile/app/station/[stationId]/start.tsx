import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { G1_STATIONS, primaryContinueLabelFa } from '@math/contracts';
import { useAppState } from '../../../src/state/AppStateContext';
import { toFa } from '../../../src/ui/digits';
import { getAuthHeaders } from '../../../src/auth/AuthSession';
import { MobileContentManager } from '../../../src/content/ContentManager';
import type { ContentManifest, EntitlementCheck } from '@math/contracts';
import { StageIntroView, type StageIntroNotice } from '../../../src/station/views/StageIntroView';
import { MACRO_LABELS } from '../../../src/station/macro';
import { C } from '../../../src/ui/v1';
import { S } from '../../../src/ui/strings.fa';

import { API_BASE_URL, productionConfigError } from '../../../src/config/runtime';

export default function StationStartScreen() {
  const router = useRouter();
  const { state } = useAppState();
  const { stationId } = useLocalSearchParams<{ stationId?: string }>();
  const station = useMemo(() => G1_STATIONS.find((x) => x.id === stationId) ?? G1_STATIONS[0]!, [stationId]);
  const startLabel = primaryContinueLabelFa(state?.profile.gradeId) === 'ادامه' ? S.stage.start : 'شروع ایستگاه';
  const [manifest, setManifest] = useState<ContentManifest | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [downloading, setDownloading] = useState(false);
  const [cached, setCached] = useState(false);

  useEffect(() => {
    let alive = true;
    const configError = productionConfigError();
    if (configError) { if (alive) setStatus('error'); return () => { alive = false; }; }
    const authHeaders = getAuthHeaders();
    const manager = new MobileContentManager({
      getManifest: async (_gradeId: string) => {
        const response = await fetch(`${API_BASE_URL}/api/v1/content/manifest?gradeId=G1`, { headers: { Accept: 'application/json', ...authHeaders } });
        if (!response.ok) throw new Error(`MANIFEST_${response.status}`);
        return (await response.json()) as ContentManifest;
      },
      getEntitlement: async (packageId: string) => {
        const response = await fetch(`${API_BASE_URL}/api/v1/content/entitlements/${packageId}`, { headers: { Accept: 'application/json', ...authHeaders } });
        if (!response.ok) throw new Error(`ENTITLEMENT_${response.status}`);
        return (await response.json()) as EntitlementCheck;
      },
    }, API_BASE_URL);
    void manager.getManifest('G1')
      .then(async (data) => {
        const entries = await manager.getCacheEntries();
        const cachedIds = new Set(entries.map((entry) => `${entry.packageId}:${entry.version}`));
        const currentPackage = [...data.current, ...data.next, ...data.recent, ...data.future].find((item) => item.stationId === `G1-${station.id}`);
        if (alive) {
          setManifest(data);
          setCached(Boolean(currentPackage && cachedIds.has(`${currentPackage.id}:${currentPackage.version}`)));
          setStatus('ready');
        }
      })
      .catch(() => { if (alive) setStatus('error'); });
    return () => { alive = false; };
  }, [station.id]);

  const pkg = manifest ? [...manifest.current, ...manifest.next, ...manifest.recent, ...manifest.future].find((x) => x.stationId === `G1-${station.id}`) ?? null : null;

  async function prepare() {
    if (!pkg) { setStatus('error'); return; }
    setDownloading(true);
    try {
      const authHeaders = getAuthHeaders();
      const contentApi = {
        getManifest: async (_gradeId: string) => manifest!,
        getEntitlement: async (packageId: string) => {
          const response = await fetch(`${API_BASE_URL}/api/v1/content/entitlements/${packageId}`, { headers: { Accept: 'application/json', ...authHeaders } });
          if (!response.ok) throw new Error(`ENTITLEMENT_${response.status}`);
          return (await response.json()) as EntitlementCheck;
        },
      };
      const entitlement = await contentApi.getEntitlement(pkg.id);
      if (!entitlement.entitled) throw new Error('NOT_ENTITLED');
      const manager = new MobileContentManager(contentApi, API_BASE_URL);
      await manager.downloadPackage(pkg, 3);
      setCached(true);
      setStatus('ready');
    } catch {
      setStatus('error');
    } finally {
      setDownloading(false);
    }
  }

  const notice: StageIntroNotice | undefined = status === 'loading'
    ? { tone: 'info', text: S.stage.checking }
    : status === 'error'
      ? { tone: 'error', text: S.stage.prepareFailed }
      : undefined;
  const sections = toFa(MACRO_LABELS.length);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.canvas }} edges={['top']}>
      <StageIntroView
        stageLabel={`${S.stage.word} ${toFa(station.number)}`}
        title={station.title}
        subtitle={station.subtitle}
        sectionsLabel={S.stage.sections(sections)}
        minutesLabel={S.stage.about(toFa(station.estimatedMinutes))}
        progress={0}
        progressLabel={S.stage.progressNone}
        startLabel={cached ? startLabel : downloading ? S.lesson.preparing : S.stage.prepare}
        busy={downloading}
        startDisabled={!cached && !pkg}
        notice={notice}
        backLabel={S.stage.backToPath}
        closeLabel={S.lesson.close}
        heroLabel={S.stage.heroA11y}
        onStart={cached ? () => router.push(`/station/${station.id}/play`) : prepare}
        onBack={() => router.replace('/(tabs)')}
        onClose={() => router.replace('/(tabs)')}
      />
    </SafeAreaView>
  );
}
