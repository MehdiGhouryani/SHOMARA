import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text } from '../src/ui/AppText';
import { DS } from '../src/ui/design-system';
import { DSSurface, DSButton } from '../src/ui/design-system/components';
import { getMissionHub, type MissionHubView } from '../src/station/runtimeApi';

export default function MissionsScreen() {
  const router = useRouter();
  const [hub, setHub] = useState<MissionHubView | null>(null);
  const [error, setError] = useState(false);
  useFocusEffect(useCallback(() => {
    let alive = true;
    void getMissionHub().then((value) => { if (alive) setHub(value); }).catch(() => { if (alive) setError(true); });
    return () => { alive = false; };
  }, []));
  return <SafeAreaView style={styles.safe}>
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}><DSButton variant="outline" onPress={() => router.back()}>بازگشت</DSButton><Text style={styles.title}>ماموریت‌ها</Text></View>
      {error && <DSSurface elevated><Text style={styles.copy}>ماموریت‌ها فعلاً آماده نیستند. مسیرت همچنان ذخیره است.</Text><DSButton onPress={() => { setError(false); void getMissionHub().then(setHub).catch(() => setError(true)); }}>دوباره</DSButton></DSSurface>}
      {!hub && !error && <DSSurface elevated><Text style={styles.copy}>ماموریت‌های امروز را آماده می‌کنیم…</Text></DSSurface>}
      {hub && <><DSSurface elevated style={styles.summary}><Ionicons name="sparkles" size={24} color={DS.color.brand.primary} /><Text style={styles.summaryText}>{hub.summary.dailyCompleted} از {hub.summary.dailyTotal} ماموریت امروز</Text></DSSurface>
        {hub.daily.map((mission) => <MissionCard key={mission.instanceId} mission={mission} />)}
        {hub.station && <><Text style={styles.section}>ماموریت ایستگاه</Text><MissionCard mission={hub.station} /></>}
      </>}
    </ScrollView>
  </SafeAreaView>;
}

function MissionCard({ mission }: { mission: MissionHubView['daily'][number] }) {
  return <DSSurface elevated style={styles.card}>
    <View style={styles.cardTop}><View style={[styles.status, mission.status === 'COMPLETED' && styles.statusDone]}><Text style={styles.statusText}>{mission.status === 'COMPLETED' ? 'کامل شد' : `${mission.progress} از ${mission.maxProgress}`}</Text></View><Text style={styles.cardTitle}>{mission.titleFa}</Text></View>
    <Text style={styles.copy}>{mission.objectiveFa}</Text>
    <View style={styles.track}><View style={[styles.fill, { width: `${Math.min(100, (mission.progress / Math.max(1, mission.maxProgress)) * 100)}%` }]} /></View>
    <Text style={styles.reward}>پاداش: {mission.rewardPreviewFa}</Text>
  </DSSurface>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS.color.bg.canvas },
  container: { padding: DS.space[4], gap: DS.space[3] },
  header: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', minHeight: 52 },
  title: { fontSize: 26, fontWeight: '900', color: DS.color.text.primary },
  section: { textAlign: 'right', fontSize: 18, fontWeight: '900', color: DS.color.text.primary, marginTop: 8 },
  summary: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8 },
  summaryText: { color: DS.color.text.primary, fontWeight: '900' },
  card: { gap: 10 },
  cardTop: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  cardTitle: { flex: 1, color: DS.color.text.primary, fontSize: 18, fontWeight: '900', textAlign: 'right' },
  status: { minWidth: 70, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 99, backgroundColor: DS.color.brand.tealSoft },
  statusDone: { backgroundColor: DS.color.brand.emeraldSoft },
  statusText: { color: DS.color.text.secondary, fontSize: 11, fontWeight: '900', textAlign: 'center' },
  copy: { color: DS.color.text.secondary, fontSize: 15, lineHeight: 24, textAlign: 'right' },
  track: { height: 9, borderRadius: 99, backgroundColor: DS.color.state.disabledSoft, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 99, backgroundColor: DS.color.brand.primary },
  reward: { color: DS.color.brand.primaryDark, fontSize: 13, fontWeight: '800', textAlign: 'right' },
});
