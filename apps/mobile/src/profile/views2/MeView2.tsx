import { StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable } from 'react-native';
import { TOKENS } from '@math/design-system';
import { Text } from '../../ui/AppText';
import { Chip, ProgressBar } from '../../ui/v2/core';
import { ClaySurface } from '../../ui/v2/clay';
import { ListRow2 } from '../../ui/v2/shell';
import { Body2, Screen2 } from '../../ui/v2/shell';
import { C2, R2, S2, type2 } from '../../ui/v2/tokens';

export type AchievementRowItem = { id: string; title: string; kicker: string; unlocked: boolean };
export type ActionRowItem = { id: string; title: string; subtitle: string; icon: React.ComponentProps<typeof Ionicons>['name'] };

type Props = {
  settingsLabel: string;
  onSettings: () => void;
  avatarIcon: React.ComponentProps<typeof Ionicons>['name'];
  avatarLabel: string;
  name: string;
  gradeLabel: string;
  progressLabel: string;
  progress: number;
  progressFieldLabel: string;
  achievementsFieldLabel: string;
  achievementsA11y: string;
  achievements: AchievementRowItem[];
  actions: ActionRowItem[];
  onAction: (id: string) => void;
  /** Opens the achievement detail sheet (S18); the rows are not pressable without it. */
  onAchievement?: ((id: string) => void) | undefined;
};

/**
 * Playbook 14 (the «من» tab), V2. Measured page-14 values (avatar/card proportions) still come
 * from the single token source (`ui.me` group — same precedent as the path geometry in `ui.path`);
 * every color/spacing/typography resolves through tokens.v2.
 */
export function MeView2(p: Props) {
  const M = TOKENS.ui.me;
  return (
    <Screen2>
      <Body2 gap={S2.xl} paddingTop={M.bodyTop} align="stretch">
        <View style={styles.settingsRow}>
          <Pressable accessibilityRole="button" accessibilityLabel={p.settingsLabel} onPress={p.onSettings} style={styles.settingsHit}>
            <Ionicons name="settings-outline" size={24} color={C2.ink2} />
          </Pressable>
        </View>
        <ClaySurface tone="primarySoft" radius={M.cardRadius} style={styles.card}>
          <View style={styles.avatar} accessibilityLabel={p.avatarLabel}>
            <Ionicons name={p.avatarIcon} size={M.avatarIcon} color={C2.amber} />
          </View>
          <Text style={[type2('title'), styles.name]}>{p.name}</Text>
          <Chip label={p.gradeLabel} />
        </ClaySurface>
        <View style={styles.field}>
          <Text style={styles.lab}>{p.progressFieldLabel}</Text>
          <View style={styles.progressRow}>
            <View style={styles.bar}>
              <ProgressBar ratio={p.progress} accessibilityLabel={p.progressLabel} />
            </View>
            <Text style={[type2('caption'), styles.cap]}>{p.progressLabel}</Text>
          </View>
        </View>
        <View style={styles.field} accessibilityLabel={p.achievementsA11y}>
          <Text style={styles.lab}>{p.achievementsFieldLabel}</Text>
          {p.achievements.map((item) => (
            <ListRow2
              key={item.id}
              icon="medal"
              title={item.title}
              kicker={item.kicker}
              off={!item.unlocked}
              trailing={!item.unlocked ? <Ionicons name="lock-closed" size={18} color={C2.muted} /> : null}
              onPress={p.onAchievement ? () => p.onAchievement?.(item.id) : undefined}
            />
          ))}
          {p.actions.map((action) => (
            <ListRow2 key={action.id} icon={action.icon} title={action.title} kicker={action.subtitle} onPress={() => p.onAction(action.id)} />
          ))}
        </View>
      </Body2>
    </Screen2>
  );
}

const M = TOKENS.ui.me;
const styles = StyleSheet.create({
  settingsRow: { height: 48, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  settingsHit: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: R2.pill },
  card: { alignItems: 'center', gap: M.cardGap, paddingVertical: M.cardPadY, paddingHorizontal: M.cardPadX },
  avatar: { width: M.avatar, height: M.avatar, borderRadius: M.avatar / 2, backgroundColor: C2.surface, alignItems: 'center', justifyContent: 'center' },
  name: { marginTop: M.titleTop, color: C2.ink, textAlign: 'center' },
  field: { gap: M.fieldGap },
  lab: { ...type2('body'), color: C2.ink },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: S2.md },
  bar: { flex: 1 },
  cap: { color: C2.ink2 },
});
