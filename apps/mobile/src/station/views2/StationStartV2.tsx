import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text } from '../../ui/AppText';
import { Button, Chip, ProgressBar } from '../../ui/v2/core';
import { ClaySurface } from '../../ui/v2/clay';
import { Character } from '../../ui/v2/Character';
import { C2, K2, R2, S2, type2 } from '../../ui/v2/tokens';

/**
 * UI V2 station start (DESIGN pages/PATH_STATION.md): one featured clay hero with the lesson's
 * guide character, honest meta chips, one large primary CTA with the full lip. Pure view with the
 * same props contract as the V1 StageIntroView it replaces — the route keeps content preparation,
 * entitlement and navigation untouched.
 */

export type StageIntroNoticeV2 = { tone: 'info' | 'error'; text: string };

type Props = {
  stageLabel: string;
  title: string;
  subtitle: string;
  sectionsLabel: string;
  minutesLabel: string;
  /** 0..1 share of finished sections (from real resume state; the start bar is honestly empty when there is none). */
  progress: number;
  progressLabel: string;
  startLabel: string;
  busy?: boolean | undefined;
  startDisabled?: boolean | undefined;
  notice?: StageIntroNoticeV2 | undefined;
  backLabel: string;
  closeLabel: string;
  heroLabel: string;
  onStart: () => void;
  onBack: () => void;
  onClose: () => void;
};

export function StationStartV2(p: Props) {
  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" accessibilityLabel={p.closeLabel} onPress={p.onClose} style={styles.iconHit}>
          <Ionicons name="close" size={24} color={C2.ink} />
        </Pressable>
        <Chip label={p.stageLabel} tone="amber" />
        <View style={styles.topGrow} />
        <Pressable accessibilityRole="button" accessibilityLabel={p.backLabel} onPress={p.onBack} style={styles.iconHit}>
          <Ionicons name="arrow-forward" size={24} color={C2.primaryDark} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <ClaySurface level="featured" tone="amberSoft" radius={R2.xl} style={styles.hero}>
          <Character characterId="number" emotion="idle" size={132} accessibilityLabel={p.heroLabel} />
          <Text style={[type2('title'), { color: C2.ink, textAlign: 'center' }]}>{p.title}</Text>
          <Text style={[type2('body'), { color: C2.ink2, textAlign: 'center' }]}>{p.subtitle}</Text>
          <View style={styles.chips}>
            <Chip label={p.sectionsLabel} tone="primary" />
            <Chip label={p.minutesLabel} tone="sky" />
          </View>
        </ClaySurface>
        <View style={styles.progressWrap}>
          <ProgressBar ratio={p.progress} accessibilityLabel={p.progressLabel} />
        </View>
        {p.notice ? (
          <View style={[styles.notice, { backgroundColor: p.notice.tone === 'error' ? C2.dangerSoft : C2.skySoft }]}>
            <Text
              accessibilityRole={p.notice.tone === 'error' ? 'alert' : 'text'}
              style={[type2('caption'), { color: p.notice.tone === 'error' ? C2.danger : C2.sky, textAlign: 'center' }]}
            >
              {p.notice.text}
            </Text>
          </View>
        ) : null}
      </ScrollView>
      <View style={styles.footer}>
        <Button label={p.startLabel} onPress={p.onStart} loading={p.busy ?? false} disabled={p.startDisabled ?? false} style={styles.cta} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C2.canvas },
  topBar: {
    minHeight: K2.topBarH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: S2.md,
    paddingHorizontal: S2.lg,
    paddingTop: S2.sm,
  },
  iconHit: { width: K2.touchMin, height: K2.touchMin, borderRadius: R2.md, backgroundColor: C2.surface, borderWidth: 1.5, borderColor: C2.line, alignItems: 'center', justifyContent: 'center' },
  topGrow: { flex: 1 },
  body: { padding: S2.lg, gap: S2.lg, paddingBottom: S2.xxl, flexGrow: 1, justifyContent: 'center' },
  hero: { alignItems: 'center', gap: S2.md, padding: S2.xl },
  chips: { flexDirection: 'row', gap: S2.sm, flexWrap: 'wrap', justifyContent: 'center' },
  progressWrap: { alignSelf: 'stretch', paddingHorizontal: S2.xl },
  notice: { borderRadius: R2.md, padding: S2.md },
  footer: { padding: S2.lg, paddingBottom: S2.xxl },
  cta: { alignSelf: 'stretch' },
});
