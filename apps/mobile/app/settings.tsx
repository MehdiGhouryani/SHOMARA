import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppState } from '../src/state/AppStateContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text } from '../src/ui/AppText';
import { DS } from '../src/ui/design-system';

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
          <Pressable accessibilityRole="button" accessibilityLabel="بازگشت به من" onPress={() => router.back()} style={styles.back}><Ionicons name="chevron-forward" size={24} color={DS.color.text.primary} /></Pressable>
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
  safe: { flex: 1, backgroundColor: DS.color.bg.canvas },
  container: { padding: DS.space[4], paddingBottom: DS.space[12] },
  headerRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: DS.space[3], marginBottom: DS.space[6] },
  headerCopy: { flex: 1, alignItems: 'flex-end' },
  back: { width: 48, height: 48, borderRadius: 14, backgroundColor: DS.color.bg.surface, borderWidth: 1, borderColor: DS.color.border.default, alignItems: 'center', justifyContent: 'center' },
  kicker: { color: DS.color.text.muted, fontSize: DS.type.xs.fontSize, fontWeight: '900', textAlign: 'right' },
  title: { color: DS.color.text.primary, fontSize: DS.type.displaySm.fontSize, lineHeight: DS.type.displaySm.lineHeight, fontWeight: '900', marginTop: 2, textAlign: 'right' },
  sectionTitle: { color: DS.color.text.primary, fontSize: DS.type.lg.fontSize, fontWeight: '900', textAlign: 'right', marginBottom: DS.space[2] },
  sectionGap: { marginTop: DS.space[6] },
  list: { borderRadius: DS.radius['2xl'], borderWidth: 1, borderColor: DS.color.border.subtle, backgroundColor: DS.color.bg.surface, overflow: 'hidden' },
  row: { minHeight: 78, paddingHorizontal: DS.space[4], flexDirection: 'row-reverse', alignItems: 'center', gap: DS.space[3] },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: DS.color.border.subtle },
  pressed: { opacity: 0.86 },
  copy: { flex: 1, alignItems: 'flex-end' },
  rowTitle: { color: DS.color.text.primary, fontSize: DS.type.body.fontSize, fontWeight: '900', textAlign: 'right' },
  rowDesc: { color: DS.color.text.muted, fontSize: DS.type.xs.fontSize, marginTop: 2, textAlign: 'right' },
  switch: { width: 52, height: 30, padding: 3, borderRadius: 999, backgroundColor: DS.color.state.disabledSoft, borderWidth: 1, borderColor: DS.color.border.default, justifyContent: 'center' },
  switchOn: { backgroundColor: DS.color.brand.primary, borderColor: DS.color.brand.primaryDark },
  thumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: DS.color.bg.surface },
  thumbOn: { alignSelf: 'flex-end' },
  footerNote: { marginTop: DS.space[4], color: DS.color.text.muted, fontSize: DS.type.xs.fontSize, lineHeight: 20, textAlign: 'right' },
});
