import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppState } from '../src/state/AppStateContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text } from '../src/ui/AppText';
import { C2, K2, R2, S2, type2 } from '../src/ui/v2/tokens';

interface SettingsState { sound: boolean; motion: boolean; largeText: boolean; haptics: boolean; gentleReminders: boolean; }

export default function SettingsScreen() {
  const router = useRouter();
  const { preferences, setPreference } = useAppState();
  const settings: SettingsState = {
    ...preferences,
    gentleReminders: preferences.gentleReminders ?? false,
  };
  function update(key: keyof SettingsState) {
    setPreference(key, !settings[key]);
  }
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="بازگشت به من" onPress={() => router.back()} style={styles.back}><Ionicons name="chevron-forward" size={24} color={C2.ink} /></Pressable>
          <View style={styles.headerCopy}><Text style={styles.kicker}>من</Text><Text style={styles.title}>تنظیمات</Text></View>
        </View>

        <Text style={styles.sectionTitle}>تجربه یادگیری</Text>
        <View style={styles.list}>
          <SettingRow title="صدا" description="بازخوردهای صوتی درس" value={settings.sound} onPress={() => update('sound')} />
          <SettingRow title="حرکت و انیمیشن" description="حرکت‌های کوتاه داخل مسیر و درس" value={settings.motion} onPress={() => update('motion')} />
          <SettingRow title="لرزش لمسی" description="بازخورد کوتاه هنگام لمس و پاسخ" value={settings.haptics} onPress={() => update('haptics')} last />
        </View>

        <Text style={[styles.sectionTitle, styles.sectionGap]}>یادآوری ملایم</Text>
        <View style={styles.list}>
          <SettingRow
            title="یادآور برگشت"
            description="گاهی یک پیام آرام — نه جریمه، نه از دست رفتن پاداش. هر وقت بخواهی خاموش کن."
            value={settings.gentleReminders}
            onPress={() => update('gentleReminders')}
            last
          />
        </View>

        <Text style={[styles.sectionTitle, styles.sectionGap]}>دسترس‌پذیری</Text>
        <View style={styles.list}>
          <SettingRow title="متن بزرگ‌تر" description="بزرگ‌تر شدن نوشته‌ها در کل اپ" value={settings.largeText} onPress={() => update('largeText')} />
          <SettingRow title="حرکت کمتر" description="با خاموش کردن بخش حرکت بالا، انیمیشن تزئینی کم می‌شود" value={!settings.motion} onPress={() => update('motion')} last />
        </View>

        <Text style={styles.footerNote}>
          دکمه‌های اصلی بزرگ‌اند. تنظیمات فقط این دستگاه را عوض می‌کنند. روز نیامدن چیزی از یادگیری کم نمی‌کند.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({ title, description, value, onPress, last = false }: { title: string; description: string; value: boolean; onPress: () => void; last?: boolean }) {
  return <Pressable accessibilityRole="switch" accessibilityState={{ checked: value }} onPress={onPress} style={({ pressed }) => [styles.row, !last && styles.rowBorder, pressed && styles.pressed]}>
    <View style={[styles.switch, value && styles.switchOn]}><View style={[styles.thumb, value && styles.thumbOn]} /></View>
    <View style={styles.copy}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.rowDesc}>{description}</Text></View>
  </Pressable>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C2.canvas },
  container: { padding: S2.xl, paddingBottom: S2.huge * 2 },
  headerRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: S2.md, marginBottom: S2.xl },
  headerCopy: { flex: 1, alignItems: 'flex-end' },
  back: { width: K2.touchMin, height: K2.touchMin, borderRadius: R2.sm, backgroundColor: C2.surface, borderWidth: 1.5, borderColor: C2.line, alignItems: 'center', justifyContent: 'center' },
  kicker: { ...type2('caption'), color: C2.muted, textAlign: 'right' },
  title: { ...type2('title'), color: C2.ink, marginTop: 2, textAlign: 'right' },
  sectionTitle: { ...type2('body'), color: C2.ink, textAlign: 'right', marginBottom: S2.sm },
  sectionGap: { marginTop: S2.xl },
  list: { borderRadius: R2.lg, borderWidth: 1.5, borderColor: C2.line, backgroundColor: C2.surface, overflow: 'hidden' },
  row: { minHeight: 78, paddingHorizontal: S2.lg, flexDirection: 'row-reverse', alignItems: 'center', gap: S2.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C2.line },
  pressed: { opacity: 0.86 },
  copy: { flex: 1, alignItems: 'flex-end' },
  rowTitle: { ...type2('body'), color: C2.ink, textAlign: 'right' },
  rowDesc: { ...type2('caption'), color: C2.muted, marginTop: 2, textAlign: 'right' },
  switch: { width: 52, height: 30, padding: 3, borderRadius: R2.pill, backgroundColor: C2.surfaceAlt, borderWidth: 1.5, borderColor: C2.line2, justifyContent: 'center' },
  switchOn: { backgroundColor: C2.primary, borderColor: C2.primaryDark },
  thumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: C2.surface },
  thumbOn: { alignSelf: 'flex-end' },
  footerNote: { marginTop: S2.lg, ...type2('caption'), color: C2.muted, textAlign: 'right' },
});
