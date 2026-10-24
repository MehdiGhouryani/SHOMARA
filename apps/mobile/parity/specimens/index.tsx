import type { ReactElement } from 'react';
import { BeadTray, Button, Character, Chip, GuideBubble, Portrait, TabBar } from '../../src/ui/v1';
import { Code, Phone, Profile, Welcome } from './onboarding';
import { PathPage, TABS } from './path';
import { ChallengeIntro, Correct, Lesson, Question, Retry, StageIntro, StageResult } from './station';
import { MeTab, PracticeTab } from './tabs';

export type Specimen = { full?: boolean; render: (params: { sy: number }) => ReactElement };

/** One entry per id in specimens.json. Components are composed exactly like the approved page. */
export const SPECIMENS: Record<string, Specimen> = {
  welcome: { full: true, render: () => <Welcome /> },
  phone: { full: true, render: () => <Phone /> },
  code: { full: true, render: () => <Code /> },
  profile: { full: true, render: () => <Profile /> },
  path: { full: true, render: () => <PathPage /> },
  'path-s900': { full: true, render: ({ sy }) => <PathPage scrollY={sy} /> },
  'path-s1800': { full: true, render: ({ sy }) => <PathPage scrollY={sy} /> },
  'path-s2700': { full: true, render: ({ sy }) => <PathPage scrollY={sy} /> },
  'path-s3600': { full: true, render: ({ sy }) => <PathPage scrollY={sy} /> },
  'stage-intro': { full: true, render: () => <StageIntro /> },
  lesson: { full: true, render: () => <Lesson /> },
  question: { full: true, render: () => <Question /> },
  correct: { full: true, render: () => <Correct /> },
  retry: { full: true, render: () => <Retry /> },
  'stage-result': { full: true, render: () => <StageResult /> },
  'challenge-intro': { full: true, render: () => <ChallengeIntro /> },
  practice: { full: true, render: () => <PracticeTab /> },
  me: { full: true, render: () => <MeTab /> },
  'tray-07': { render: () => <BeadTray count={3} label="۳ مهره" /> },
  'tabbar-05': { render: () => <TabBar items={TABS} activeKey="path" /> },
  'button-amber': { render: () => <Button label="بریم!" /> },
  'guide-07': { render: () => <GuideBubble pose="number-front" tone="number" portraitLabel="نامبر" text="این سه مهره است." /> },
  'tabbar-13': {
    render: () => (
      <TabBar
        variant="soft"
        activeKey="practice"
        items={[
          { key: 'path', label: 'مسیر', icon: 'route' },
          { key: 'practice', label: 'تمرین', icon: 'bolt' },
          { key: 'me', label: 'من', icon: 'person' },
        ]}
      />
    ),
  },
  'chip-06': { render: () => <Chip label="مرحله ۱" /> },
  'chip-icon-book-06': { render: () => <Chip icon="book" label="۵ بخش" /> },
  'chip-icon-clock-06': { render: () => <Chip icon="clock" label="حدود ۱۰ دقیقه" /> },
  'button-primary-09': { render: () => <Button variant="primary" label="ادامه" /> },
  'button-replay-07': { render: () => <Button variant="secondary" compact icon="speaker" label="دوباره بشنو" /> },
  'portrait-04': { render: () => <Portrait pose="main-front" tone="main" label="شخصیت اصلی" /> },
  'portrait-13': { render: () => <Portrait pose="fandogh-portrait" cover label="فندق، سنجاب سازنده" /> },
};

// Keep the import used so tree-shaking does not hide Character from type checks of specimens.
export const _unused = Character;
