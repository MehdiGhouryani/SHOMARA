import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { G1_STATIONS, G1_UNITS, G1_U01 } from '@math/contracts';
import { Text } from '../../src/ui/AppText';
import { DS } from '../../src/ui/design-system';

export default function UnitScreen() {
  const router = useRouter();
  const { unitId } = useLocalSearchParams<{ unitId: string }>();
  const unit = G1_UNITS.find((item) => item.id === unitId) ?? G1_U01;
  const stations = G1_STATIONS.filter((station) => station.unitId === unit.id);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Pressable accessibilityRole="button" accessibilityLabel="بازگشت به مسیر" style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-forward" size={22} color={DS.color.text.primary} />
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
              <Ionicons name="chevron-back" size={22} color={DS.color.brand.primaryDark} />
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
  safe: { flex: 1, backgroundColor: DS.color.bg.canvas },
  container: { padding: DS.space[4], paddingBottom: DS.space[12] },
  back: { minHeight: 48, alignSelf: 'flex-start', flexDirection: 'row-reverse', alignItems: 'center', gap: 4, paddingHorizontal: 8 },
  backText: { color: DS.color.brand.primaryDark, fontSize: DS.type.sm.fontSize, fontWeight: '900' },
  header: { marginTop: DS.space[4], alignItems: 'flex-end' },
  kicker: { color: DS.color.text.muted, fontSize: DS.type.xs.fontSize, fontWeight: '900' },
  title: { marginTop: 2, color: DS.color.text.primary, fontSize: DS.type.displaySm.fontSize, lineHeight: DS.type.displaySm.lineHeight, fontWeight: '900', textAlign: 'right' },
  subtitle: { marginTop: 5, color: DS.color.text.secondary, fontSize: DS.type.sm.fontSize, lineHeight: 22, textAlign: 'right' },
  sectionTitle: { marginTop: DS.space[6], marginBottom: DS.space[2], color: DS.color.text.primary, fontSize: DS.type.lg.fontSize, fontWeight: '900', textAlign: 'right' },
  list: { borderRadius: DS.radius['2xl'], borderWidth: 1, borderColor: DS.color.border.subtle, backgroundColor: DS.color.bg.surface, overflow: 'hidden' },
  row: { minHeight: 72, paddingHorizontal: DS.space[4], flexDirection: 'row-reverse', alignItems: 'center', gap: DS.space[3], borderBottomWidth: 1, borderBottomColor: DS.color.border.subtle },
  copy: { flex: 1, alignItems: 'flex-end' },
  stationTitle: { color: DS.color.text.primary, fontSize: DS.type.sm.fontSize, fontWeight: '900', textAlign: 'right' },
  meta: { marginTop: 2, color: DS.color.text.muted, fontSize: DS.type.xs.fontSize, textAlign: 'right' },
  pressed: { opacity: 0.82 },
});
