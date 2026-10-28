import { View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text } from '../../ui/AppText';
import { Button } from '../../ui/v2/core';
import { GradeCell2, SelectTile2, TextField2 } from '../../ui/v2/forms';
import { Body2, Foot2, GuideBubble2, Screen2, StepBar2 } from '../../ui/v2/shell';
import { C2, S2, type2 } from '../../ui/v2/tokens';

export type ProfileAvatar = { id: 'sun' | 'leaf' | 'cloud' | 'moon'; label: string; accent?: string | undefined };
export type ProfileGrade = { id: string; available: boolean };

type Props = {
  name: string;
  error: string;
  avatarId: ProfileAvatar['id'];
  gradeId: string;
  avatars: readonly ProfileAvatar[];
  grades: readonly ProfileGrade[];
  canSubmit: boolean;
  progress: { percent: number; label: string };
  onChangeName: (value: string) => void;
  onSelectAvatar: (id: ProfileAvatar['id']) => void;
  onSelectGrade: (id: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  autoFocus?: boolean;
  previewFocus?: boolean;
};

const ORDINALS = ['اول', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم'] as const;

function ordinalOf(gradeId: string): string {
  const n = Number(gradeId.replace(/\D/g, ''));
  return ORDINALS[n - 1] ?? gradeId;
}

function rowsOf<T>(items: readonly T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size));
  return rows;
}

const AVATAR_GLYPH: Record<ProfileAvatar['id'], React.ComponentProps<typeof Ionicons>['name']> = {
  sun: 'sunny',
  leaf: 'leaf',
  cloud: 'cloudy',
  moon: 'moon',
};

/** Playbook 04: name, avatar and grade on one page (the contract's GRADE and CHILD steps). */
export function ProfileView2({ name, error, avatarId, gradeId, avatars, grades, canSubmit, progress, onChangeName, onSelectAvatar, onSelectGrade, onSubmit, onBack, autoFocus = true, previewFocus }: Props) {
  return (
    <Screen2>
      <StepBar2 percent={progress.percent} label={progress.label} onBack={onBack} />
      <Body2 gap={S2.xl} paddingTop={S2.sm} align="stretch">
        <GuideBubble2 characterId="main" emotion="idle" characterLabel="شخصیت اصلی" text="دوست داری بهت چی بگیم؟" />
        <TextField2
          label="اسم یا لقب"
          value={name}
          onChangeText={onChangeName}
          placeholder="مثلاً نیما"
          maxLength={20}
          error={error || undefined}
          autoFocus={autoFocus}
          focused={previewFocus}
          testID="onboarding-name"
        />
        <View style={{ gap: S2.sm }}>
          <Text style={[type2('caption'), { color: C2.ink2 }]}>آواتارت را انتخاب کن</Text>
          <View accessibilityRole="radiogroup" style={styles.avatarRow}>
            {avatars.map((a) => (
              <SelectTile2
                key={a.id}
                label={a.label}
                selected={a.id === avatarId}
                onPress={() => onSelectAvatar(a.id)}
                glyph={<Ionicons name={AVATAR_GLYPH[a.id]} size={30} color={a.accent ?? C2.ink2} />}
              />
            ))}
          </View>
        </View>
        <View style={{ gap: S2.sm }}>
          <Text style={[type2('caption'), { color: C2.ink2 }]}>در کدام پایه درس می‌خوانی؟</Text>
          <View accessibilityRole="radiogroup" style={{ gap: 10, width: '100%' }}>
            {rowsOf(grades, 3).map((row, r) => (
              <View key={r} style={styles.gradeRow}>
                {row.map((g) => (
                  <GradeCell2
                    key={g.id}
                    label={g.available ? `پایه ${ordinalOf(g.id)}` : ordinalOf(g.id)}
                    selected={g.id === gradeId}
                    locked={!g.available}
                    onPress={() => onSelectGrade(g.id)}
                  />
                ))}
              </View>
            ))}
          </View>
          <Text style={[type2('caption'), { color: C2.muted }]}>پایه‌های دوم تا ششم به‌زودی باز می‌شوند.</Text>
        </View>
      </Body2>
      <Foot2>
        <Button label="ادامه" onPress={onSubmit} disabled={!canSubmit} testID="onboarding-continue" />
      </Foot2>
    </Screen2>
  );
}

const styles = {
  avatarRow: { flexDirection: 'row', gap: S2.md, width: '100%' },
  gradeRow: { flexDirection: 'row', gap: 10 },
} as const;
