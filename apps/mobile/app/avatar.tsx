import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  COSMETIC_CATEGORIES,
  DEFAULT_AVATAR_APPEARANCE,
  applyCategorySelection,
  buildAvatarWorkshopProjection,
  sanitizeAppearance,
  type AvatarAppearance,
  type CosmeticCategory,
} from '@math/contracts';
import { CHILD_AVATAR_PRESETS, type ChildAvatarPresetId } from '@math/contracts';
import { ChildAvatar } from '../src/components/ChildAvatar';
import { Text } from '../src/ui/AppText';
import { Button } from '../src/ui/v2/core';
import { TextLink2 } from '../src/ui/v2/forms';
import { C2, K2, R2, S2, type2 } from '../src/ui/v2/tokens';
import { useAppState } from '../src/state/AppStateContext';
import { DEFAULT_CHILD_AVATAR_PRESET_ID } from '../src/state/appStateCore';
import { getAvatarWorkshop, saveAvatarAppearance } from '../src/station/runtimeApi';

export default function AvatarScreen() {
  const router = useRouter();
  const { state, updateAvatarPreset } = useAppState();
  const name = state?.profile.childName ?? 'دوست ریاضی';
  const initialPreset = (state?.profile.avatarPresetId ?? DEFAULT_CHILD_AVATAR_PRESET_ID) as ChildAvatarPresetId;

  const [category, setCategory] = useState<CosmeticCategory>('BASE_PRESET');
  const [ownedCodes, setOwnedCodes] = useState<string[]>([]);
  const [committed, setCommitted] = useState<AvatarAppearance>({
    ...DEFAULT_AVATAR_APPEARANCE,
    basePresetId: initialPreset,
  });
  const [draft, setDraft] = useState<AvatarAppearance>(committed);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remote, setRemote] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void getAvatarWorkshop()
        .then((view) => {
          if (!alive) return;
          const next: AvatarAppearance = {
            basePresetId: (view.appearance.basePresetId as ChildAvatarPresetId) || initialPreset,
            outfitId: view.appearance.outfitId,
            hatId: view.appearance.hatId,
            accessoryId: view.appearance.accessoryId,
            backgroundId: view.appearance.backgroundId,
            updatedAt: view.appearance.updatedAt,
          };
          setOwnedCodes(view.ownedRewardCodes ?? []);
          setCommitted(next);
          setDraft(next);
          setRemote(true);
          setError(null);
        })
        .catch(() => {
          if (!alive) return;
          // Offline / backend unavailable: starter cosmetics only, local preset save still works.
          setOwnedCodes([]);
          setRemote(false);
        });
      return () => {
        alive = false;
      };
    }, [initialPreset]),
  );

  const projection = useMemo(
    () => buildAvatarWorkshopProjection(draft, ownedCodes),
    [draft, ownedCodes],
  );
  const categoryItems = projection.items.filter((i) => i.category === category);

  const onSelect = (itemId: string) => {
    setDraft((prev) => applyCategorySelection(prev, category, itemId, ownedCodes));
    setSaved(false);
    setError(null);
  };

  const onSave = async () => {
    const { appearance, rejected } = sanitizeAppearance(draft, ownedCodes);
    if (rejected.length) {
      setError('بعضی آیتم‌ها هنوز مال تو نیستند.');
      setDraft(appearance);
      return;
    }
    try {
      if (remote) {
        await saveAvatarAppearance({
          basePresetId: appearance.basePresetId,
          outfitId: appearance.outfitId,
          hatId: appearance.hatId,
          accessoryId: appearance.accessoryId,
          backgroundId: appearance.backgroundId,
        });
      }
      updateAvatarPreset(appearance.basePresetId);
      setCommitted(appearance);
      setDraft(appearance);
      setSaved(true);
      setError(null);
    } catch {
      setError('ذخیره نشد. دوباره امتحان کن.');
    }
  };

  const onCancel = () => {
    setDraft(committed);
    setSaved(false);
    setError(null);
    router.back();
  };

  return (
    <ScrollView style={styles.safe} contentContainerStyle={styles.container}>
      <TextLink2 label="بازگشت به من" onPress={() => router.back()} />
      <Text style={styles.kicker}>ظاهر من</Text>
      <Text style={styles.title}>کارگاه آواتار</Text>

      <View style={styles.preview}>
        <ChildAvatar presetId={draft.basePresetId} name={name} size={132} />
        <Text style={styles.previewTitle}>
          {CHILD_AVATAR_PRESETS.find((p) => p.id === draft.basePresetId)?.label ?? 'آواتار'}
        </Text>
        <Text style={styles.previewBody}>
          {remote
            ? 'ظاهر تازه با پیشرفت مسیر باز می‌شود — خریدنی نیست.'
            : 'حالت آفلاین: فقط ظاهرهای شروع. بقیه با پیشرفت مسیر.'}
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cats}>
        {COSMETIC_CATEGORIES.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => setCategory(c.id)}
            style={[styles.cat, category === c.id && styles.catOn]}
            accessibilityRole="button"
            accessibilityState={{ selected: category === c.id }}
          >
            <Text style={[styles.catText, category === c.id && styles.catTextOn]}>{c.titleFa}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.grid} accessibilityLabel="انتخاب آیتم">
        {categoryItems.map((item) => (
          <Pressable
            key={item.id}
            disabled={!item.owned}
            onPress={() => item.owned && onSelect(item.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: item.equipped, disabled: !item.owned }}
            accessibilityLabel={`${item.titleFa}${item.owned ? '' : '، هنوز باز نشده'}`}
            style={[
              styles.choice,
              item.equipped && styles.choiceSelected,
              !item.owned && styles.choiceLocked,
            ]}
          >
            {item.category === 'BASE_PRESET' ? (
              <ChildAvatar
                presetId={(CHILD_AVATAR_PRESETS.find((p) => `cosmetic-base-${p.id}` === item.id)?.id ?? 'sun') as ChildAvatarPresetId}
                name={name}
                size={64}
              />
            ) : (
              <View style={styles.iconPlaceholder}>
                <Ionicons
                  name={item.owned ? 'sparkles' : 'lock-closed'}
                  size={24}
                  color={item.owned ? C2.amberInk : C2.muted}
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                />
              </View>
            )}
            <Text style={styles.choiceText}>{item.titleFa}</Text>
            {!item.owned && <Text style={styles.locked}>{item.lockedLabelFa}</Text>}
          </Pressable>
        ))}
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.actions}>
        <Button label={saved ? 'ذخیره شد' : 'ذخیره'} onPress={() => void onSave()} />
        <Button label="لغو" onPress={onCancel} variant="ghost" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C2.canvas },
  container: { padding: S2.xl, paddingBottom: S2.huge * 2 },
  kicker: { marginTop: S2.xs, ...type2('caption'), color: C2.muted, textAlign: 'right' },
  title: { marginTop: 2, ...type2('title'), color: C2.ink, textAlign: 'right' },
  preview: { marginTop: S2.lg, borderRadius: R2.lg, borderWidth: 1.5, borderColor: C2.line, backgroundColor: C2.surface, padding: S2.lg, alignItems: 'center' },
  previewTitle: { ...type2('title'), color: C2.ink, marginTop: S2.sm },
  previewBody: { ...type2('caption'), color: C2.muted, textAlign: 'center', marginTop: S2.xs },
  cats: { flexDirection: 'row-reverse', gap: S2.sm, marginTop: S2.md, paddingVertical: S2.xs },
  cat: { minHeight: K2.touchMin, paddingHorizontal: S2.lg, borderRadius: R2.pill, borderWidth: 1.5, borderColor: C2.line2, backgroundColor: C2.surface, justifyContent: 'center' },
  catOn: { borderColor: C2.primary, backgroundColor: C2.primarySoft },
  catText: { ...type2('caption'), color: C2.ink2 },
  catTextOn: { color: C2.primaryDark },
  grid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 10, marginTop: S2.md },
  choice: { width: '47%', minHeight: 120, borderRadius: R2.lg, borderWidth: 1.5, borderColor: C2.line2, backgroundColor: C2.surface, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10 },
  choiceSelected: { borderColor: C2.primary, backgroundColor: C2.primarySoft },
  choiceLocked: { opacity: 0.55 },
  choiceText: { ...type2('caption'), color: C2.ink, textAlign: 'center' },
  locked: { ...type2('caption'), color: C2.muted },
  iconPlaceholder: { width: 64, height: 64, borderRadius: R2.sm, backgroundColor: C2.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  errorBox: { marginTop: S2.md, padding: S2.md, borderRadius: R2.sm, backgroundColor: C2.dangerSoft },
  errorText: { color: C2.danger, textAlign: 'right', fontWeight: '700' },
  actions: { marginTop: S2.md, gap: S2.sm },
});
