import { StyleSheet, View } from 'react-native';
import { Body, C, Chip, H1, Icon, IconButton, ListRow, ProgressBar, Screen, UI, typeStyle } from '../../ui/v1';
import { Text } from '../../ui/AppText';
import type { IconName } from '../../ui/v1/icons';

export type AchievementRowItem = { id: string; title: string; kicker: string; unlocked: boolean };
export type ActionRowItem = { id: string; title: string; subtitle: string; icon: IconName };

type Props = {
  settingsLabel: string;
  onSettings: () => void;
  avatarIcon: IconName;
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

/** Page 14: the «من» tab. Pure view; the container owns state, the achievement dialog and navigation. */
export function MeView(p: Props) {
  const M = UI.me;
  return (
    <Screen>
      <Body gap={20} paddingTop={M.bodyTop} align="stretch">
        <View style={styles.settingsRow}>
          <IconButton icon="settings" label={p.settingsLabel} onPress={p.onSettings} />
        </View>
        <View style={styles.card}>
          <View style={styles.avatar} accessibilityLabel={p.avatarLabel}>
            <Icon name={p.avatarIcon} size={M.avatarIcon} color={C.amber} />
          </View>
          <H1 style={styles.name}>{p.name}</H1>
          <Chip label={p.gradeLabel} />
        </View>
        <View style={styles.field}>
          <Text style={styles.lab}>{p.progressFieldLabel}</Text>
          <View style={styles.progressRow}>
            <View style={styles.bar}>
              <ProgressBar value={p.progress} label={p.progressLabel} />
            </View>
            <Text style={[typeStyle('caption'), styles.cap]}>{p.progressLabel}</Text>
          </View>
        </View>
        <View style={styles.field} accessibilityLabel={p.achievementsA11y}>
          <Text style={styles.lab}>{p.achievementsFieldLabel}</Text>
          {p.achievements.map((item) => (
            <ListRow key={item.id} icon="medal" title={item.title} kicker={item.kicker} tone={item.unlocked ? 'plain' : 'off'} trailingIcon={item.unlocked ? undefined : 'lock'} onPress={p.onAchievement ? () => p.onAchievement?.(item.id) : undefined} />
          ))}
          {p.actions.map((action) => (
            <ListRow key={action.id} icon={action.icon} title={action.title} kicker={action.subtitle} tone="plain" onPress={() => p.onAction(action.id)} />
          ))}
        </View>
      </Body>
    </Screen>
  );
}

const M = UI.me;
const styles = StyleSheet.create({
  settingsRow: { height: 48, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  card: { alignItems: 'center', gap: M.cardGap, paddingVertical: M.cardPadY, paddingHorizontal: M.cardPadX, borderRadius: M.cardRadius, backgroundColor: C.primaryC },
  avatar: { width: M.avatar, height: M.avatar, borderRadius: M.avatar / 2, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  name: { marginTop: M.titleTop },
  field: { gap: M.fieldGap },
  lab: { fontSize: 16, lineHeight: 24, fontWeight: '600', color: C.ink },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bar: { flex: 1 },
  cap: { fontSize: M.capSize },
});
