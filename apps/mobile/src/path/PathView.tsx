import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Text } from '../ui/AppText';
import { toFa } from '../ui/digits';
import { Button } from '../ui/v1/Button';
import { EdgeBox } from '../ui/v1/EdgeBox';
import { Icon } from '../ui/v1/Icon';
import { Portrait } from '../ui/v1/Portrait';
import { C, UI, typeStyle } from '../ui/v1/tokens';
import { ChapterBand } from './ChapterBand';
import { PathNode } from './PathNode';
import { chapterTheme } from './chapterTheme';
import { activeChapter, buildPathLayout, jumpTarget, type NodeRow, type StationNodeState } from './layout';

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

const P = UI.path;

/** Reached segments are solid; the rest are dotted (`1 14` with round caps). Spread so no explicit `undefined` is passed. */
const dashProps = (reached: boolean) => (reached ? {} : { strokeDasharray: P.trail.todoDash.join(' ') });

/** Page 05 (v1): grade chip, chapter band, scrolling trail of nodes and the "back to current" button. */
export function PathView({ gradeLabel, chapters, onStationPress, onGradePress, onGuidePress, notice, banner, initialScrollY, width, goText = 'ادامه بده', ringFraction }: Props) {
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
      setShowFab(y > P.fab.showAfter);
    },
    [layout.starts],
  );
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => sync(e.nativeEvent.contentOffset.y);
  const onContentSizeChange = () => {
    if (initialized.current) return;
    initialized.current = true;
    const target = initialScrollY ?? (layout.curY !== null && layout.curY > P.fab.showAfter ? jumpTarget(layout.curY) : 0);
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
            <EdgeBox
              edge={P.grade.edge}
              edgeColor={C.line2}
              radius={P.grade.radius}
              lift={pressed ? P.grade.edge - 1 : 0}
              faceStyle={{ height: P.grade.height, borderWidth: 2, borderColor: C.line2, backgroundColor: C.surface, flexDirection: 'row', alignItems: 'center', gap: 6, paddingStart: 14, paddingEnd: 12 }}
            >
              <Icon name="plus" size={P.grade.icon} color={C.primary} />
              <Text style={typeStyle('label')}>{gradeLabel}</Text>
            </EdgeBox>
          )}
        </Pressable>
      </View>

      {bandChapter ? (
        <ChapterBand chapter={active} kicker={bandChapter.kicker} title={bandChapter.title} done={done} onGuidePress={() => onGuidePress?.(active)} />
      ) : null}
      {banner}

      <View style={styles.trailWrap}>
        <ScrollView
          ref={scroll}
          style={{ flex: 1, backgroundColor: chapterTheme(0).tint }}
          contentContainerStyle={{ width: w }}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onContentSizeChange={onContentSizeChange}
          showsVerticalScrollIndicator={false}
        >
          {layout.rows.map((row, i) => {
            const theme = chapterTheme(row.chapter);
            if (row.kind === 'spacer') return <View key={i} style={{ height: row.height, backgroundColor: theme.tint }} />;
            if (row.kind === 'divider') {
              const prev = chapterTheme(row.chapter - 1);
              const c = chapters[row.chapter];
              return (
                <View key={i} style={{ height: row.height }}>
                  <View style={{ flex: 1, backgroundColor: prev.tint }} />
                  <View style={{ flex: 1, backgroundColor: theme.tint }} />
                  <View style={styles.dividerContent} accessibilityRole="header">
                    <View style={[styles.line, { backgroundColor: theme.pm }]} />
                    <Text style={[typeStyle('label'), { color: theme.pe }]} numberOfLines={1}>{`فصل ${toFa(row.chapter + 1)} · ${c?.title ?? ''}`}</Text>
                    <View style={[styles.line, { backgroundColor: theme.pm }]} />
                  </View>
                </View>
              );
            }
            if (row.kind === 'jump') {
              const offer = chapters[row.chapter]?.jumpOffer;
              return (
                <View key={i} style={{ height: row.height, backgroundColor: theme.tint, alignItems: 'center', justifyContent: 'center' }}>
                  {offer ? <Button variant="secondary" compact icon="arrowUp" label={offer.label} onPress={offer.onPress} /> : null}
                </View>
              );
            }
            return <NodeRowView key={i} row={row} width={w} chapters={chapters} notice={notice} onStationPress={onStationPress} goText={goText} ringFraction={ringFraction} />;
          })}
        </ScrollView>
        {showFab && target !== null ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="برو به مرحلهٔ فعلی"
            onPress={() => scroll.current?.scrollTo({ y: target, animated: true })}
            style={styles.fabHit}
          >
            {({ pressed }) => (
              <EdgeBox
                edge={P.fab.edge}
                edgeColor={C.line2}
                radius={P.fab.radius}
                lift={pressed ? P.fab.edge - 1 : 0}
                faceStyle={{ width: P.fab.size, height: P.fab.size, borderWidth: 2, borderColor: C.line2, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' }}
              >
                <Icon name="arrowUp" size={28} color={C.primary} />
              </EdgeBox>
            )}
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
  ringFraction: number | undefined;
};

function NodeRowView({ row, width, chapters, notice, onStationPress, goText, ringFraction }: NodeRowProps) {
  const theme = chapterTheme(row.chapter);
  const station = row.stationIndex === null ? undefined : chapters[row.chapter]?.stations[row.stationIndex];
  const half = P.node.size / 2;
  const current = row.state === 'cur';
  const mateAtStart = row.x < width / 2; // the page puts the guide character on the emptier side of the zigzag
  const a11y = row.state === 'chest' ? 'گنج، قفل' : station?.accessibilityLabel ?? '';
  return (
    <View style={{ height: row.height, backgroundColor: theme.tint }}>
      <Svg width={width} height={row.height} style={styles.curves} pointerEvents="none">
        {row.dTop ? (
          <Path d={row.dTop} fill="none" strokeLinecap="round" stroke={row.topReached ? theme.pm : theme.lke} strokeWidth={row.topReached ? P.trail.doneStroke : P.trail.todoStroke} {...dashProps(row.topReached)} />
        ) : null}
        {row.dBot ? (
          <Path d={row.dBot} fill="none" strokeLinecap="round" stroke={row.botReached ? theme.pm : theme.lke} strokeWidth={row.botReached ? P.trail.doneStroke : P.trail.todoStroke} {...dashProps(row.botReached)} />
        ) : null}
      </Svg>
      {/* `end` is the physical left in the RTL screen: x is measured from the left like the page. */}
      <View style={{ position: 'absolute', top: row.cy - half, end: row.x - half, width: P.node.size, height: P.node.size }}>
        <PathNode
          state={row.state}
          theme={theme}
          accessibilityLabel={a11y}
          accessibilityHint={row.state === 'chest' ? undefined : station?.hint}
          onPress={station ? () => onStationPress(station.id, station.state) : undefined}
          label={current ? station?.title : undefined}
          goText={current ? goText : undefined}
          ringFraction={ringFraction}
          notice={station && notice?.stationId === station.id ? notice.text : null}
        />
      </View>
      {current ? (
        <View style={{ position: 'absolute', top: row.cy - UI.portrait.size / 2, ...(mateAtStart ? { start: P.mate.offset } : { end: P.mate.offset }) }}>
          <Portrait pose="dana-portrait" cover edge size={P.mate.size} label="دانا، راهنمای مسیر" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.canvas },
  stats: {
    height: P.stats.height,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: P.stats.padding,
    backgroundColor: C.canvas,
    borderBottomWidth: P.stats.borderBottom,
    borderBottomColor: C.line,
  },
  gradeHit: { height: UI.path.grade.hit, minHeight: UI.path.grade.hit, justifyContent: 'center' },
  trailWrap: { flex: 1, minHeight: 0 },
  curves: { position: 'absolute', top: 0, start: 0 },
  dividerContent: { position: 'absolute', top: 0, bottom: 0, start: 0, end: 0, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: UI.screen.margin },
  line: { flex: 1, height: 3, borderRadius: 99 },
  // Physical left (`end` in RTL), 16 from the left and the bottom like the page.
  fabHit: { position: 'absolute', end: UI.path.fab.inset, bottom: UI.path.fab.inset, width: UI.path.fab.size, height: UI.path.fab.size, zIndex: 4 },
});
