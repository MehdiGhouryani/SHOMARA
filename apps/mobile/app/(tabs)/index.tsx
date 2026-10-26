import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  G1_STATIONS,
  G1_UNITS,
  JUMP_ASSESSMENTS,
  buildPathFocus,
  deriveStationStatus,
  primaryContinueLabelFa,
  worldByUnitId,
  type ProgressionNodeStatus,
} from '@math/contracts';
import { useAppState } from '../../src/state/AppStateContext';
import { getAuthoritativeProgression, shouldUseRemoteRuntime } from '../../src/station/runtimeApi';
import { getResume, isJumpUnlocked, isStationPassed } from '../../src/state/appStateCore';
import { cachedStationIds, loadContentSnapshot } from '../../src/content/bootstrap';
import { isLocalContentPreview } from '../../src/config/runtime';
import { PathBanner } from '../../src/path/PathBanner';
import { PathView } from '../../src/path/PathView';
import { buildChapterViews, gradeChipLabel, jumpOfferUnitIds, ringFraction } from '../../src/path/pathModel';
import { C } from '../../src/ui/v1';

const JUMP_FOR_TARGET = new Map(JUMP_ASSESSMENTS.map((item) => [item.targetStationId, item]));
const NOTICE_MS = 2200;
const NOTE_MS = 3500;

/** Path tab (page 05): one scrolling trail of chapters. The data and navigation logic is unchanged. */
export default function PathScreen() {
  const router = useRouter();
  const { state, reconcileProgression } = useAppState();
  const goText = primaryContinueLabelFa(state?.profile.gradeId);
  const [notice, setNotice] = useState<{ stationId: string; text: string } | null>(null);
  const [guideChapter, setGuideChapter] = useState<number | null>(null);
  const [gradeNote, setGradeNote] = useState(false);
  const [downloaded, setDownloaded] = useState<string[]>([]);
  const [contentState, setContentState] = useState<'loading' | 'ready' | 'offline'>('loading');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const completed = useMemo(() => new Set(G1_STATIONS.filter((s) => isStationPassed(state, s.id)).map((s) => s.id)), [state]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      setContentState('loading');
      if (shouldUseRemoteRuntime()) {
        void getAuthoritativeProgression(state?.profile.gradeId ?? 'G1')
          .then((snapshot) => {
            if (alive) reconcileProgression(snapshot);
          })
          .catch(() => {
            // Preserve the cached projection during transient network failure.
          });
      }
      void loadContentSnapshot(state?.profile.gradeId ?? 'G1').then((snapshot) => {
        if (!alive) return;
        if (!snapshot) {
          // D-019: the preview APK ships no downloaded packages; station content
          // comes from the bundled local map, so every node is on-device there.
          // Any other release build honestly reports the offline state.
          if (isLocalContentPreview()) {
            setDownloaded(G1_STATIONS.map((station) => station.id));
            setContentState('ready');
            return;
          }
          setContentState('offline');
          return;
        }
        setDownloaded(cachedStationIds(snapshot));
        setContentState('ready');
      });
      return () => {
        alive = false;
      };
    }, [state?.profile.gradeId, reconcileProgression]),
  );

  const statuses = useMemo(() => {
    const out: Record<string, ProgressionNodeStatus> = {};
    for (const station of G1_STATIONS) {
      out[station.id] = deriveStationStatus({
        station,
        completedStationIds: [...completed],
        downloadedStationIds: downloaded,
        jumpUnlockedStationIds: state?.jumpUnlockedStationIds ?? [],
      });
    }
    return out;
  }, [completed, downloaded, state?.jumpUnlockedStationIds]);

  const pathFocus = useMemo(
    () => buildPathFocus({ stations: G1_STATIONS.map((s) => ({ id: s.id, number: s.number, title: s.title })), statuses }),
    [statuses],
  );
  const focusId = pathFocus.focus?.id ?? null;

  function later(fn: () => void, ms: number) {
    timers.current.push(setTimeout(fn, ms));
  }

  function openStation(stationId: string) {
    const resume = getResume(state, stationId);
    router.push(resume ? `/station/${stationId}/play` : `/station/${stationId}/start`);
  }

  function openJump(unitId: string) {
    const target = G1_UNITS.find((u) => u.id === unitId)?.stationIds[0];
    const jump = target ? JUMP_FOR_TARGET.get(target) : undefined;
    if (jump) router.push(`/unit/${jump.targetUnitId}/jump?targetStationId=${jump.targetStationId}`);
  }

  const jumpOffers = useMemo(
    () =>
      jumpOfferUnitIds({
        units: G1_UNITS,
        completed,
        hasJump: (id) => JUMP_FOR_TARGET.has(id),
        isJumpUnlocked: (id) => isJumpUnlocked(state, id),
      }),
    [completed, state],
  );

  const chapters = useMemo(
    () => buildChapterViews({ statuses, focusStationId: focusId, jumpOffers, onJump: openJump }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [statuses, focusId, jumpOffers],
  );

  const resumeStage = focusId ? getResume(state, focusId)?.stage : undefined;
  const guideStory = guideChapter !== null ? worldByUnitId(G1_UNITS[guideChapter]?.id ?? '')?.storyArcFa : undefined;

  const banner = isLocalContentPreview() ? (
    // D-019: the preview APK never reaches a server; the note states that plainly.
    <PathBanner tone="info" text="پیش‌نمایش محلی: محتوا روی دستگاه است و اتصال به سرور در این نسخه فعال نیست." />
  ) : guideStory ? (
    <PathBanner tone="story" text={guideStory} />
  ) : gradeNote ? (
    <PathBanner tone="info" text="پایه‌های دیگر به‌زودی باز می‌شوند." />
  ) : contentState === 'loading' ? (
    <PathBanner tone="info" text="محتوای مسیر در حال بررسی است…" />
  ) : contentState === 'offline' ? (
    <PathBanner tone="warning" text="محتوای دانلودشده روی دستگاه نمایش داده می‌شود؛ برای محتوای تازه، اتصال لازم است." />
  ) : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.canvas }} edges={['top']}>
      <PathView
        gradeLabel={gradeChipLabel(state?.profile.gradeId)}
        chapters={chapters}
        goText={goText}
        ringFraction={ringFraction(resumeStage)}
        banner={banner}
        notice={notice}
        onStationPress={(stationId, nodeState) => {
          if (nodeState === 'lock') {
            setNotice({ stationId, text: 'ایستگاه‌های قبل را جلو ببر.' });
            later(() => setNotice(null), NOTICE_MS);
            return;
          }
          openStation(stationId);
        }}
        onGradePress={() => {
          setGradeNote(true);
          later(() => setGradeNote(false), NOTE_MS);
        }}
        onGuidePress={(index) => setGuideChapter((current) => (current === index ? null : index))}
      />
    </SafeAreaView>
  );
}
