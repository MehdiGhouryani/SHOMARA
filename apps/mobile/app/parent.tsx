import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppState } from '../src/state/AppStateContext';
import { isStationPassed } from '../src/state/appStateCore';
import {
  buildParentProgressSummary,
  reminderControlCopyFa,
  shouldShowParentGuidance,
  stationPresentationById,
} from '@math/contracts';
import { Text } from '../src/ui/AppText';
import { S } from '../src/ui/strings.fa';
import { toFa } from '../src/ui/digits';
import { clearAccessToken } from '../src/auth/AuthSession';
import { isReLoginNeeded, subscribeAuthExpired } from '../src/auth/authExpiry';
import { clearClientInstallationId } from '../src/auth/ClientInstallation';
import { DS } from '../src/ui/design-system';

/** Read-only family summary. Access is provided by the signed-in account; there is no second parent-auth gate. */
export default function ParentScreen() {
  const router = useRouter();
  const { state, resetAll } = useAppState();
  const [failed, setFailed] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [typed, setTyped] = useState('');
  // R-009/D3: the "needs re-login" note lives only in the parent area; the child flow is never interrupted.
  const [reloginNeeded, setReloginNeeded] = useState(isReLoginNeeded());
  useEffect(() => {
    setReloginNeeded(isReLoginNeeded());
    return subscribeAuthExpired(() => setReloginNeeded(true));
  }, []);
  const canDelete = typed.trim() === S.parent.deleteTypeWord;

  function askDelete() {
    setTyped('');
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!canDelete) return;
    setConfirmOpen(false);
    const ok = await resetAll();
    if (ok) { await clearAccessToken(); await clearClientInstallationId(); router.replace('/onboarding'); }
    else setFailed(true);
  }

  const completed = Array.from({ length: 25 }, (_, index) => `ST${String(index + 1).padStart(2, '0')}`).filter((id) => isStationPassed(state, id));
  const summary = buildParentProgressSummary({
    gradeId: state?.profile.gradeId ?? null,
    completedStationIds: completed,
  });
  const recentDone = completed.slice(-3).reverse();
  const reminderCopy = reminderControlCopyFa(state?.profile.gradeId);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="بازگشت" onPress={() => router.back()} style={styles.back}><Ionicons name="chevron-forward" size={22} color={DS.color.text.primary} /></Pressable>
          <View style={styles.headerCopy}><Text style={styles.kicker}>فضای والدین</Text><Text style={styles.title}>گزارش کودک</Text><Text style={styles.subtitle}>یک نمای ساده از روند یادگیری</Text></View>
        </View>

        <View style={styles.heroGrid}>
              <View style={styles.heroCard}><Text style={styles.label}>ایستگاه‌های کامل</Text><Text style={styles.heroValue}>{toFa(summary.completedCount)}</Text><Text style={styles.heroMeta}>از {toFa(summary.totalStations)} ایستگاه</Text></View>
              <View style={styles.heroCard}><Text style={styles.label}>زمان تقریبی</Text><Text style={styles.heroValue}>{toFa(summary.approxMinutes)}</Text><Text style={styles.heroMeta}>دقیقه یادگیری مسیر</Text></View>
            </View>

            <View style={styles.section}><Text style={styles.kicker}>نقطه فعلی</Text><Text style={styles.sectionTitle}>{summary.currentStationLabelFa}</Text><View style={styles.focusCard}><Text style={styles.focusMark}>+</Text><Text style={styles.focusText}>مسیر بدون نمرهٔ ترسناک ادامه پیدا می‌کند.</Text></View></View>

            <View style={styles.section}><Text style={styles.kicker}>یادگیری اخیر</Text><Text style={styles.sectionTitle}>ایستگاه‌هایی که تمام شده‌اند</Text><View style={styles.list}>{recentDone.length === 0 ? <Text style={styles.empty}>{summary.emptyFa}</Text> : recentDone.map((id) => <View key={id} style={styles.row}><Text style={styles.rowTitle}>{stationPresentationById(id)?.title ?? id}</Text><Text style={styles.rowMeta}>تکمیل شد</Text></View>)}</View></View>

            <View style={styles.section}>
              <Text style={styles.kicker}>راهنمای والدین</Text>
              <Text style={styles.sectionTitle}>{reminderCopy.titleFa}</Text>
              <View style={styles.homeCard}>
                <Text style={styles.homeTitle}>{summary.guidanceFa}</Text>
                <Text style={styles.homeBody}>{reminderCopy.bodyFa}</Text>
              </View>
            </View>

            {reloginNeeded ? (
              <View style={styles.section}>
                <Text style={styles.kicker}>ورود</Text>
                <View style={styles.homeCard}>
                  <Text style={styles.homeBody}>{S.parent.reloginNotice}</Text>
                </View>
              </View>
            ) : null}

            {shouldShowParentGuidance(state?.profile.gradeId) ? (
              <View style={styles.section}>
                <Text style={styles.kicker}>یادآوری</Text>
                <Text style={styles.sectionTitle}>کنترل یادآور در تنظیمات کودک</Text>
                <View style={styles.homeCard}>
                  <Text style={styles.homeBody}>از مسیر من ← تنظیمات می‌توانید یادآور ملایم را خاموش کنید. خاموش کردن جریمه ندارد.</Text>
                </View>
              </View>
            ) : null}

            <View style={styles.section}><Text style={styles.kicker}>در خانه</Text><Text style={styles.sectionTitle}>تمرین کوتاه و بدون صفحه‌نمایش</Text><View style={styles.homeCard}><Text style={styles.homeTitle}>یک الگوی دو مرحله‌ای بسازید</Text><Text style={styles.homeBody}>با مهره یا اسباب‌بازی یک الگو بسازید و از کودک بخواهید آن را ادامه دهد.</Text></View></View>

            <View style={styles.dangerCard}>
              <Text style={styles.dangerTitle}>حذف پروفایل کودک</Text>
              <Text style={styles.dangerBody}>این کار اطلاعات ذخیره‌شده روی این دستگاه را پاک می‌کند.</Text>
              {failed ? <Text style={styles.err}>{S.parent.deleteFailed}</Text> : null}
              <Pressable accessibilityRole="button" style={styles.danger} onPress={askDelete}><Text style={styles.dangerText}>{S.parent.deleteTitle}</Text></Pressable>
            </View>
      </ScrollView>
      <Modal visible={confirmOpen} transparent animationType="fade" onRequestClose={() => setConfirmOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.dangerTitle}>{S.parent.deleteTitle}</Text>
            <Text style={styles.dangerBody}>{S.parent.deleteBody}</Text>
            <Text style={styles.dangerBody}>{S.parent.deleteTypeHint}</Text>
            <TextInput
              value={typed}
              onChangeText={setTyped}
              autoFocus
              autoCorrect={false}
              accessibilityLabel={S.parent.deleteTypeHint}
              style={styles.modalInput}
            />
            <Pressable accessibilityRole="button" accessibilityState={{ disabled: !canDelete }} disabled={!canDelete} style={[styles.danger, !canDelete && styles.dangerDisabled]} onPress={confirmDelete}>
              <Text style={styles.dangerText}>{S.parent.deleteConfirm}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" style={styles.modalCancel} onPress={() => setConfirmOpen(false)}>
              <Text style={styles.dangerBody}>{S.parent.deleteCancel}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS.color.bg.canvas },
  container: { padding: 16, paddingBottom: 48, gap: 18 },
  headerRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  headerCopy: { flex: 1, alignItems: 'flex-end' },
  back: { width: 48, height: 48, borderRadius: 14, borderWidth: 1, borderColor: DS.color.border.default, backgroundColor: DS.color.bg.surface, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 30, lineHeight: 32, color: DS.color.text.primary, fontWeight: '500' },
  kicker: { color: DS.color.text.muted, fontSize: 11, fontWeight: '900', textAlign: 'right' },
  title: { color: DS.color.text.primary, fontSize: 28, lineHeight: 36, fontWeight: '900', textAlign: 'right' },
  subtitle: { color: DS.color.text.secondary, fontSize: 12, lineHeight: 20, textAlign: 'right', marginTop: 2 },
  heroGrid: { flexDirection: 'row-reverse', gap: 10 },
  heroCard: { flex: 1, minHeight: 124, padding: 16, borderRadius: 22, backgroundColor: DS.color.bg.surface, borderWidth: 1, borderColor: DS.color.border.subtle, justifyContent: 'center' },
  label: { color: DS.color.text.muted, fontSize: 11, fontWeight: '900', textAlign: 'right' },
  heroValue: { color: DS.color.brand.primaryDark, fontSize: 30, lineHeight: 36, fontWeight: '900', textAlign: 'right', marginTop: 4 },
  heroMeta: { color: DS.color.text.secondary, fontSize: 12, lineHeight: 19, fontWeight: '700', textAlign: 'right' },
  section: { gap: 6 },
  sectionTitle: { color: DS.color.text.primary, fontSize: 18, lineHeight: 26, fontWeight: '900', textAlign: 'right' },
  focusCard: { marginTop: 4, padding: 14, borderRadius: 18, backgroundColor: DS.color.brand.primarySoft, flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  focusMark: { width: 44, height: 44, borderRadius: 14, backgroundColor: DS.color.bg.surface, color: DS.color.brand.primaryDark, textAlign: 'center', lineHeight: 42, fontSize: 24, fontWeight: '900' },
  focusText: { flex: 1, color: DS.color.brand.primaryDark, fontSize: 13, lineHeight: 21, textAlign: 'right', fontWeight: '700' },
  list: { marginTop: 4, borderRadius: 20, backgroundColor: DS.color.bg.surface, borderWidth: 1, borderColor: DS.color.border.subtle, overflow: 'hidden' },
  row: { minHeight: 62, paddingHorizontal: 14, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderBottomWidth: 1, borderBottomColor: DS.color.border.subtle },
  rowTitle: { flex: 1, color: DS.color.text.primary, fontSize: 13, fontWeight: '800', textAlign: 'right' },
  rowMeta: { color: DS.color.text.muted, fontSize: 11, fontWeight: '800' },
  empty: { padding: 16, color: DS.color.text.muted, fontSize: 12, textAlign: 'right' },
  homeCard: { marginTop: 4, padding: 16, borderRadius: 20, backgroundColor: DS.color.brand.tealSoft, borderWidth: 1, borderColor: DS.color.brand.tealSoft },
  homeTitle: { color: DS.color.brand.tealDark, fontSize: 14, fontWeight: '900', textAlign: 'right' },
  homeBody: { color: DS.color.brand.tealDark, fontSize: 12, lineHeight: 20, textAlign: 'right', marginTop: 4 },
  dangerCard: { padding: 16, borderRadius: 20, backgroundColor: DS.color.bg.surface, borderWidth: 1, borderColor: DS.color.brand.coralSoft },
  dangerTitle: { color: DS.color.text.primary, fontSize: 14, fontWeight: '900', textAlign: 'right' },
  dangerBody: { color: DS.color.text.muted, fontSize: 12, lineHeight: 20, textAlign: 'right', marginTop: 4 },
  danger: { minHeight: 50, marginTop: 12, borderRadius: 14, backgroundColor: DS.color.brand.coralSoft, alignItems: 'center', justifyContent: 'center' },
  dangerText: { color: DS.color.brand.coralDark, fontSize: 13, fontWeight: '900' },
  dangerDisabled: { opacity: 0.45 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '100%', maxWidth: 420, borderRadius: 18, backgroundColor: DS.color.bg.surface, padding: 18 },
  modalInput: { minHeight: 48, marginTop: 12, borderRadius: 12, borderWidth: 1, borderColor: DS.color.border.default, paddingHorizontal: 12, textAlign: 'right', fontSize: 16, color: DS.color.text.primary },
  modalCancel: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  err: { color: DS.color.state.error, fontSize: 12, fontWeight: '800', marginTop: 7, textAlign: 'right' },
});
