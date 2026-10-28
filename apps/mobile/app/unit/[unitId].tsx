import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { G1_STATIONS, G1_UNITS, G1_U01 } from '@math/contracts';
import { Text } from '../../src/ui/AppText';
import { C2, K2, R2, S2 } from '../../src/ui/v2/tokens';

export default function UnitScreen() {
  const router = useRouter();
  const { unitId } = useLocalSearchParams<{ unitId: string }>();
  const unit = G1_UNITS.find((item) => item.id === unitId) ?? G1_U01;
  const stations = G1_STATIONS.filter((station) => station.unitId === unit.id);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Pressable accessibilityRole="button" accessibilityLabel="بازگشت به مسیر" style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-forward" size={22} color={C2.ink} />
          <Text style={styles.backText}>مسیر</Text>
        </Pressable>
        <View style={styles.header}>
          <Text style={styles.kicker}>واحد {toFa(unit.number)}</Text>
          <Text style={styles.title}>{unit.title}</Text>
          <Text style={styles.subtitle}>{unit.subtitle}</Text>
        </View>
        <Text style={styles.sectionTitle}>ایستگاه‌ها</Text>
        <View style={styles.list}>
          {stations.map((station) => (
            <Pressable key={station.id} accessibilityRole="button" style={({ pressed }) => [styles.row, pressed && styles.pressed]} onPress={() => router.push(`/station/${station.id}/start`)}>
              <Ionicons name="chevron-back" size={22} color={C2.primaryDark} />
              <View style={styles.copy}><Text style={styles.stationTitle}>{station.title}</Text><Text style={styles.meta}>{toFa(station.estimatedMinutes)} دقیقه</Text></View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function toFa(value: number) { return String(value).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]!); }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C2.canvas },
  container: { padding: S2.xl, paddingBottom: S2.huge * 3 },
  back: { minHeight: 48, alignSelf: 'flex-start', flexDirection: 'row-reverse', alignItems: 'center', gap: 4, paddingHorizontal: 8 },
  backText: { color: C2.primaryDark, fontSize: 13, fontWeight: '900' },
  header: { marginTop: S2.xl, alignItems: 'flex-end' },
  kicker: { color: C2.muted, fontSize: 11, fontWeight: '900' },
  title: { marginTop: 2, color: C2.ink, fontSize: 22, lineHeight: 30, fontWeight: '900', textAlign: 'right' },
  subtitle: { marginTop: 5, color: C2.ink2, fontSize: 13, lineHeight: 22, textAlign: 'right' },
  sectionTitle: { marginTop: S2.xl, marginBottom: S2.sm, color: C2.ink, fontSize: 17, fontWeight: '900', textAlign: 'right' },
  list: { borderRadius: R2.xl, borderWidth: 1, borderColor: C2.line, backgroundColor: C2.surface, overflow: 'hidden' },
  row: { minHeight: 72, paddingHorizontal: S2.xl, flexDirection: 'row-reverse', alignItems: 'center', gap: S2.md, borderBottomWidth: 1, borderBottomColor: C2.line },
  copy: { flex: 1, alignItems: 'flex-end' },
  stationTitle: { color: C2.ink, fontSize: 13, fontWeight: '900', textAlign: 'right' },
  meta: { marginTop: 2, color: C2.muted, fontSize: 11, textAlign: 'right' },
  pressed: { opacity: 0.82 },
});
