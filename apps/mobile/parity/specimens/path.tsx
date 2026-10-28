import { View } from 'react-native';
import fixture from '../../src/path/__fixtures__/design-trail.json';
import { PathView, type ChapterView } from '../../src/path/PathView';
import type { StationNodeState } from '../../src/path/layout';
import { C, TabBar } from '../../src/ui/v1';

const noop = () => undefined;

/** Chapters exactly as the approved page lists them (names, kickers and the progress of chapter one). */
const chapters: ChapterView[] = fixture.chapters.map((c, ci) => ({
  kicker: c.k,
  title: c.title,
  stations: Array.from({ length: 5 }, (_, i): ChapterView['stations'][number] => {
    const state: StationNodeState = i < c.done ? 'done' : i === c.cur ? 'cur' : 'lock';
    return { id: `c${ci}s${i}`, title: state === 'cur' ? 'عدد و جمع' : `ایستگاه ${i + 1}`, state, accessibilityLabel: `ایستگاه ${i + 1}` };
  }),
}));

export const TABS = [
  { key: 'path', label: 'مسیر', icon: 'route' },
  { key: 'practice', label: 'تمرین', icon: 'bolt' },
  { key: 'me', label: 'من', icon: 'person' },
] as const;

/** Page 05 (v1): the real PathView plus the tab bar, at the scroll offset the page opens with. */
export const PathPage = ({ scrollY = 0 }: { scrollY?: number }) => (
  <View style={{ flex: 1, backgroundColor: C.canvas }}>
    <PathView width={390} gradeLabel="پایهٔ ۱" chapters={chapters} onStationPress={noop} initialScrollY={scrollY} />
    <TabBar items={TABS} activeKey="path" />
  </View>
);
