import { View } from 'react-native';
import { Text } from '../../ui/AppText';
import { Body, Button, Cap, Foot, GradeCell, GuideBubble, Screen, TextField, Tile, UI, typeStyle } from '../../ui/v1';
import { StepBar } from './StepBar';

export type ProfileAvatar = { id: 'sun' | 'leaf' | 'cloud' | 'moon'; label: string };
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

/** Page 04: name, avatar and grade on one page (the contract's GRADE and CHILD steps). */
export function ProfileView({ name, error, avatarId, gradeId, avatars, grades, canSubmit, progress, onChangeName, onSelectAvatar, onSelectGrade, onSubmit, onBack, autoFocus = true, previewFocus }: Props) {
  return (
    <Screen>
      <StepBar percent={progress.percent} label={progress.label} onBack={onBack} />
      <Body gap={20} paddingTop={4} align="stretch">
        <GuideBubble pose="main-front" tone="main" portraitLabel="شخصیت اصلی" text="دوست داری بهت چی بگیم؟" />
        <TextField
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
        <View style={{ gap: 8 }}>
          <Text style={typeStyle('label')}>آواتارت را انتخاب کن</Text>
          <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
            {avatars.map((a) => (
              <Tile key={a.id} icon={a.id} iconColor={UI.avatar[a.id]} label={a.label} selected={a.id === avatarId} onPress={() => onSelectAvatar(a.id)} />
            ))}
          </View>
        </View>
        <View style={{ gap: 8 }}>
          <Text style={typeStyle('label')}>در کدام پایه درس می‌خوانی؟</Text>
          <View accessibilityRole="radiogroup" style={{ gap: 10, width: '100%' }}>
            {rowsOf(grades, 3).map((row, r) => (
              <View key={r} style={{ flexDirection: 'row', gap: 10 }}>
                {row.map((g) => (
                  <GradeCell
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
          <Cap>پایه‌های دوم تا ششم به‌زودی باز می‌شوند.</Cap>
        </View>
      </Body>
      <Foot>
        <Button label="ادامه" onPress={onSubmit} disabled={!canSubmit} testID="onboarding-continue" />
      </Foot>
    </Screen>
  );
}
