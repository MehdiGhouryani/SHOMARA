import { Redirect, Tabs } from 'expo-router';
import { useAppState } from '../../src/state/AppStateContext';
import { ChildTabBar } from '../../src/navigation/ChildTabBar';

// Child shell: مسیر / تمرین / من. Achievements and future appearance stay inside Profile; adult destinations stay outside this shell.
// The tab bar is the approved page's (v1 TabBar); expo-router only supplies the routes.
export default function TabsLayout() {
  const { entry } = useAppState();
  // First run vs returning (DEC-010): only a valid saved profile reaches Home.
  if (entry.kind !== 'RETURNING') return <Redirect href="/onboarding" />;
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <ChildTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'مسیر' }} />
      <Tabs.Screen name="practice" options={{ title: 'تمرین' }} />
      <Tabs.Screen name="profile" options={{ title: 'من' }} />
    </Tabs>
  );
}
