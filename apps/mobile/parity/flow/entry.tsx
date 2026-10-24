/**
 * Flow harness entry: renders a REAL screen (react-native-web) with its native/app dependencies replaced
 * by recording stubs, so a script can click, type and scroll through it. The scenario comes from the URL
 * hash (#scenario=fresh|mid|jump|offline) and only matters for the path screen.
 */
import { Alert, AppRegistry, BackHandler, View } from 'react-native';
import { G1_STATIONS } from '@math/contracts';
import Screen from 'onboarding-under-test';

const scenario = new URLSearchParams(window.location.hash.slice(1)).get('scenario') ?? 'fresh';
const passedCount = { fresh: 0, offline: 0, mid: 7, jump: 5 }[scenario as 'fresh'] ?? 0;
const allIds = G1_STATIONS.map((s) => s.id);

(window as unknown as { __flow: unknown }).__flow = {
  otpRequests: [],
  verifications: [],
  completed: null,
  replaced: [],
  pushed: [],
  prepared: [],
  backed: 0,
  passedStations: [],
  spoken: [],
  stops: 0,
  submits: [],
  alerts: [],
  cacheEntries: scenario === 'cached' ? [{ packageId: 'pkg-ST01', version: '1' }] : [],
  manifest: scenario === 'error' ? null : { current: [{ id: 'pkg-ST01', version: '1', stationId: 'G1-ST01' }], next: [], recent: [], future: [] },
  content: scenario === 'offline' ? null : { ids: allIds },
  state: {
    profile: { gradeId: 'G1' },
    passed: allIds.slice(0, passedCount),
    resume: scenario === 'mid' ? { [allIds[7]!]: { stage: 'GUIDED' } } : {},
    jumpUnlockedStationIds: [],
    // Fields the real appStateCore reads (lesson player); the path flow's stubbed core ignores them.
    progress: {},
    placementFastTrack: false,
    preferences: { sound: true, motion: false, largeText: false, haptics: false, gentleReminders: false },
  },
};
// react-native-web's Alert is a no-op; record what the screen asks so a script can answer it.
Alert.alert = (title, message, buttons) => {
  (window as unknown as { __flow: { alerts: unknown[] } }).__flow.alerts.push({ title, message, buttons });
};
// The hardware back button does not exist on the web build.
BackHandler.addEventListener = () => ({ remove: () => undefined });
const RTL_WEB_PROP = { dir: 'rtl' } as object;

function Root() {
  return (
    <View {...RTL_WEB_PROP} style={{ width: 390, height: 844, backgroundColor: '#F5F7F8', overflow: 'hidden' }}>
      <Screen />
    </View>
  );
}

AppRegistry.registerComponent('Flow', () => Root);
AppRegistry.runApplication('Flow', { rootTag: document.getElementById('root') });
document.documentElement.setAttribute('data-ready', '1');
