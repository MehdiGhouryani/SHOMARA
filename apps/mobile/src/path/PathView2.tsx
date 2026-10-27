import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text } from '../ui/AppText';
import { toFa } from '../ui/digits';
import { Button } from '../ui/v2/core';
import { ClaySurface } from '../ui/v2/clay';
import { Character } from '../ui/v2/Character';
import { PathNode, type PathNodeState } from '../ui/v2/path';
import { C2, K2, R2, S2, type2 } from '../ui/v2/tokens';
import { S } from '../ui/strings.fa';
import { activeChapter, buildPathLayout, jumpTarget, type NodeRow, type NodeState, type StationNodeState } from './layout';

/**
 * UI V2 learning path (DESIGN pages/PATH_STATION.md) — same props contract, model and trail
 * geometry as the V1 view it replaces: `buildPathLayout` stays the single geometry truth, the
 * chapter model is unchanged. V2 look: flat cream canvas, soft-clay nodes (featured only on the
 * one current node), restrained connectors, one character cameo. No V1 tokens or goldens.
 */

export type StationView = { id: string; title: string; state: StationNodeState; accessibilityLabel: string; hint?: string | undefined };
export type ChapterView = {
  kicker: string;
  title: string;
  stations: readonly StationView[];
  /** Unit-jump offer shown under the chapter divider (an addition to the page; see ADR-0035 addendum). */
  jumpOffer?: { label: string; onPress: () => void } | undefined;
};

type Props = {
  gradeLabel: string;
  chapters: readonly ChapterView[];
  onStationPress: (stationId: string, state: StationNodeState) => void;
  onGradePress?: (() => void) | undefined;
  onGuidePress?: ((chapterIndex: number) => void) | undefined;
  /** Short notice bubble over a station (tap on a locked one). */
  notice?: { stationId: string; text: string } | null | undefined;
  /** Optional strip between the band and the trail (offline state). */
  banner?: React.ReactNode;
  /** Initial scroll offset; by default the current station is brought into view. */
  initialScrollY?: number | undefined;
  /** Fixed width for tests and specimens; otherwise the window width. */
  width?: number | undefined;
  goText?: string | undefined;
  ringFraction?: number | undefined;
};

/** Chapter accents cycle through v2 hues (no raw hex; no chapter washes — the canvas stays cream). */
const CHAPTER_ACCENT = [C2.primary, C2.amber, C2.berry, C2.sky, C2.ink2] as const;
const accent = (chapter: number) => CHAPTER_ACCENT[chapter % CHAPTER_ACCENT.length] ?? C2.primary;

const TRAIL_REACHED = K2.edge; // 4dp solid stroke behind reached nodes
const TRAIL_TODO = 3; // dotted todo stroke
const TRAIL_DASH = '2 12'; // round-cap dots, warm and quiet
const SHOW_FAB_AFTER = 300; // scroll depth after which «برو به مرحلهٔ فعلی» appears

const nodeStateOf = (state: NodeState): PathNodeState =>
  state === 'done' ? 'done' : state === 'cur' ? 'current' : state === 'lock' || state === 'chest' ? 'locked' : 'available';

/** Slim strip between the band and the trail (content/preview states, honest and calm). */
export function PathBanner2({ tone, text }: { tone: 'info' | 'warning' | 'story'; text: string }) {
  const look = tone === 'info'
    ? { bg: C2.primarySoft, fg: C2.primaryDark }
    : tone === 'warning'
      ? { bg: C2.amberSoft, fg: C2.amberInk }
      : { bg: C2.surface, fg: C2.ink };
  return (
    <View style={[styles.banner, { backgroundColor: look.bg, borderColor: tone === 'story' ? C2.line : look.bg }]} accessibilityLiveRegion="polite" accessibilityRole="text">
      <Text style={[type2('caption'), { color: look.fg, textAlign: 'center' }]}>{text}</Text>
    </View>
  );
}

/** Page 05, V2: grade chip, chapter band, winding clay trail and the "back to current" affordance. */
export function PathView2({ gradeLabel, chapters, onStationPress, onGradePress, onGuidePress, notice, banner, initialScrollY, width, goText = 'ادامه بده', ringFraction }: Props) {
  const window = useWindowDimensions();
  const w = width ?? window.width;
  const layout = useMemo(
    () => buildPathLayout(chapters.map((c) => ({ stations: c.stations.map((s) => s.state), jumpOffer: Boolean(c.jumpOffer) })), w),
    [chapters, w],
  );
  const scroll = useRef<ScrollView>(null);
  const initialized = useRef(false);
  const [active, setActive] = useState(0);
  const [showFab, setShowFab] = useState(false);

  const sync = useCallback(
    (y: number) => {
      setActive(activeChapter(layout.starts, y));
      setShowFab(y > SHOW_FAB_AFTER);
    },
    [layout.starts],
  );
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => sync(e.nativeEvent.contentOffset.y);
  const onContentSizeChange = () => {
    if (initialized.current) return;
    initialized.current = true;
    const target = initialScrollY ?? (layout.curY !== null && layout.curY > SHOW_FAB_AFTER ? jumpTarget(layout.curY) : 0);
    if (target && target > 0) {
      scroll.current?.scrollTo({ y: target, animated: false });
      sync(target);
    }
  };

  const bandChapter = chapters[active] ?? chapters[0];
  const done = (bandChapter?.stations ?? []).filter((s) => s.state === 'done').length;
  const target = jumpTarget(layout.curY);

  return (
    <View style={styles.screen}>
      <View style={styles.stats}>
        <Pressable accessibilityRole="button" accessibilityLabel={gradeLabel} onPress={onGradePress} style={styles.gradeHit}>
          {({ pressed }) => (
            <View style={[styles.gradeChip, pressed && styles.gradeChipPressed]}>
              <Ionicons name="add" size={20} color={C2.primary} />
              <Text style={[type2('caption'), { color: C2.ink }]}>{gradeLabel}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {bandChapter ? (
        <View style={styles.band} accessibilityRole="header">
          <View style={[styles.bandAccent, { backgroundColor: accent(active) }]} />
          <View style={styles.bandText}>
            <Text numberOfLines={1} style={[type2('body'), { color: C2.ink }]}>{bandChapter.title}</Text>
            <Text numberOfLines={1} style={[type2('caption'), { color: C2.muted }]}>{bandChapter.kicker}</Text>
          </View>
          <View style={styles.bandMeta}>
            <Text style={[type2('caption'), { color: C2.ink2 }]}>{toFa(done)} از {toFa(bandChapter.stations.length)}</Text>
            {onGuidePress ? (
              <Pressable accessibilityRole="button" accessibilityLabel={S.v2.path.chapterGuide} onPress={() => onGuidePress(active)} style={styles.guideHit}>
                <Ionicons name="information-circle-outline" size={22} color={C2.sky} />
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}
      {banner}

      <View style={styles.trailWrap}>
        <ScrollView
          ref={scroll}
          style={{ flex: 1, backgroundColor: C2.canvas }}
          contentContainerStyle={{ width: w }}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onContentSizeChange={onContentSizeChange}
          showsVerticalScrollIndicator={false}
        >
          {layout.rows.map((row, i) => {
            if (row.kind === 'spacer') return <View key={i} style={{ height: row.height, backgroundColor: C2.canvas }} />;
            if (row.kind === 'divider') {
              const c = chapters[row.chapter];
              return (
                <View key={i} style={{ height: row.height, backgroundColor: C2.canvas }}>
                  <View style={styles.dividerContent} accessibilityRole="header">
                    <View style={[styles.line, { backgroundColor: accent(row.chapter) }]} />
                    <Text style={[type2('caption'), { color: C2.ink2 }]} numberOfLines={1}>{`فصل ${toFa(row.chapter + 1)} · ${c?.title ?? ''}`}</Text>
                    <View style={[styles.line, { backgroundColor: accent(row.chapter) }]} />
                  </View>
                </View>
              );
            }
            if (row.kind === 'jump') {
              const offer = chapters[row.chapter]?.jumpOffer;
              return (
                <View key={i} style={{ height: row.height, backgroundColor: C2.canvas, alignItems: 'center', justifyContent: 'center' }}>
                  {offer ? <Button variant="amber" label={offer.label} onPress={offer.onPress} /> : null}
                </View>
              );
            }
            return <NodeRowView key={i} row={row} width={w} chapters={chapters} notice={notice} onStationPress={onStationPress} goText={goText} />;
          })}
        </ScrollView>
        {showFab && target !== null ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={S.v2.path.goCurrent}
            onPress={() => scroll.current?.scrollTo({ y: target, animated: true })}
            style={styles.fabHit}
          >
            <ClaySurface level="soft" tone="surface" radius={R2.md} style={styles.fab}>
              <Ionicons name="arrow-up" size={26} color={C2.primary} />
            </ClaySurface>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

type NodeRowProps = {
  row: NodeRow;
  width: number;
  chapters: readonly ChapterView[];
  notice: Props['notice'];
  onStationPress: Props['onStationPress'];
  goText: string;
};

function NodeRowView({ row, width, chapters, notice, onStationPress, goText }: NodeRowProps) {
  const station = row.stationIndex === null ? undefined : chapters[row.chapter]?.stations[row.stationIndex];
  const current = row.state === 'cur';
  const size = current ? K2.nodeCurrent : K2.nodeSize;
  const half = size / 2;
  const mateAtStart = row.x < width / 2; // the cameo sits on the emptier side of the zigzag
  const a11y = row.state === 'chest' ? S.v2.path.chest : station?.accessibilityLabel ?? '';
  const showNotice = Boolean(station && notice?.stationId === station.id && notice.text);
  return (
    <View style={{ height: row.height, backgroundColor: C2.canvas }}>
      <Svg width={width} height={row.height} style={styles.curves} pointerEvents="none">
        {row.dTop ? (
          <Path d={row.dTop} fill="none" strokeLinecap="round" stroke={row.topReached ? C2.primary : C2.line2} strokeWidth={row.topReached ? TRAIL_REACHED : TRAIL_TODO} {...(row.topReached ? {} : { strokeDasharray: TRAIL_DASH })} />
        ) : null}
        {row.dBot ? (
          <Path d={row.dBot} fill="none" strokeLinecap="round" stroke={row.botReached ? C2.primary : C2.line2} strokeWidth={row.botReached ? TRAIL_REACHED : TRAIL_TODO} {...(row.botReached ? {} : { strokeDasharray: TRAIL_DASH })} />
        ) : null}
      </Svg>
      {/* `end` is the physical left in the RTL screen: x is measured from the left like the page. */}
      <View style={{ position: 'absolute', top: row.cy - half, end: row.x - half, width: size, alignItems: 'center' }}>
        {current && goText ? (
          <View style={styles.goBubble}>
            <Ionicons name="book" size={14} color={C2.white} />
            <Text style={[type2('caption'), { color: C2.white }]}>{goText}</Text>
          </View>
        ) : null}
        {showNotice ? (
          <View style={styles.noticeBubble}>
            <Text style={[type2('caption'), { color: C2.ink, textAlign: 'center' }]}>{notice?.text}</Text>
          </View>
        ) : null}
        <PathNode
          state={nodeStateOf(row.state)}
          glyph={row.state === 'chest' ? 'gift' : undefined}
          title={current ? station?.title : undefined}
          onPress={station ? () => onStationPress(station.id, station.state) : undefined}
          a11yLabel={a11y}
          a11yHint={row.state === 'chest' ? undefined : station?.hint}
        />
      </View>
      {current ? (
        <View style={{ position: 'absolute', top: row.cy - 47, ...(mateAtStart ? { start: S2.lg } : { end: S2.lg }) }} pointerEvents="none">
          <Character characterId="dana" emotion="guide" size={94} fit="cover" accessibilityLabel={S.v2.path.pathGuide} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C2.canvas },
  stats: {
    minHeight: K2.topBarH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S2.lg,
    backgroundColor: C2.canvas,
    borderBottomWidth: 1.5,
    borderBottomColor: C2.line,
  },
  gradeHit: { minHeight: K2.touchMin, justifyContent: 'center' },
  gradeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: S2.md,
    borderRadius: R2.sm,
    borderWidth: 2,
    borderColor: C2.line2,
    backgroundColor: C2.surface,
  },
  gradeChipPressed: { backgroundColor: C2.surfaceAlt },
  band: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: S2.md,
    paddingHorizontal: S2.lg,
    paddingVertical: S2.sm,
    backgroundColor: C2.canvas,
  },
  bandAccent: { width: 4, height: 36, borderRadius: R2.pill },
  bandText: { flex: 1, gap: 1 },
  bandMeta: { flexDirection: 'row', alignItems: 'center', gap: S2.sm },
  guideHit: { width: K2.touchMin, height: K2.touchMin, alignItems: 'center', justifyContent: 'center' },
  trailWrap: { flex: 1, minHeight: 0 },
  curves: { position: 'absolute', top: 0, start: 0 },
  dividerContent: { position: 'absolute', top: 0, bottom: 0, start: 0, end: 0, flexDirection: 'row', alignItems: 'center', gap: S2.md, paddingHorizontal: S2.lg },
  banner: { minHeight: 40, borderWidth: 1.5, paddingHorizontal: S2.xxl, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  line: { flex: 1, height: 3, borderRadius: R2.pill },
  fabHit: { position: 'absolute', end: S2.lg, bottom: S2.lg, width: 56, height: 56, zIndex: 4 },
  fab: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  goBubble: {
    position: 'absolute',
    top: -(K2.touchMin + 8),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: K2.touchMin,
    paddingHorizontal: S2.md,
    borderRadius: R2.pill,
    backgroundColor: C2.primary,
  },
  noticeBubble: {
    position: 'absolute',
    top: -(K2.touchMin + 12),
    width: 190,
    paddingHorizontal: S2.md,
    paddingVertical: S2.sm,
    borderRadius: R2.md,
    borderWidth: 2,
    borderColor: C2.line2,
    backgroundColor: C2.surface,
    zIndex: 3,
  },
});
