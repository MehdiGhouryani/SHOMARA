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
import { DS } from '../src/ui/design-system';
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
      <Pressable onPress={() => router.back()} style={styles.back} accessibilityRole="button">
        <Text style={styles.backText}>بازگشت به من</Text>
      </Pressable>
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
                  name={item.owned ? 'sparkles' : 'lock-closed-outline'}
                  size={24}
                  color={item.owned ? DS.color.brand.secondaryDark : DS.color.text.muted}
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
        <Pressable accessibilityRole="button" style={styles.primaryButton} onPress={() => void onSave()}>
          <Text style={styles.primaryText}>{saved ? 'ذخیره شد' : 'ذخیره'}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" style={styles.ghostButton} onPress={onCancel}>
          <Text style={styles.ghostText}>لغو</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS.color.bg.canvas },
  container: { padding: DS.space[4], paddingBottom: DS.space[12] },
  back: { minHeight: 48, justifyContent: 'center' },
  backText: { color: DS.color.text.muted, fontSize: DS.type.sm.fontSize, fontWeight: '800', textAlign: 'right' },
  kicker: { marginTop: 4, color: DS.color.text.muted, fontSize: DS.type.xs.fontSize, fontWeight: '800', textAlign: 'right' },
  title: { marginTop: 2, color: DS.color.text.primary, fontSize: DS.type.displaySm.fontSize, lineHeight: DS.type.displaySm.lineHeight, fontWeight: '900', textAlign: 'right' },
  preview: { marginTop: 18, borderRadius: 24, borderWidth: 1, borderColor: DS.color.border.subtle, backgroundColor: DS.color.bg.surface, padding: 18, alignItems: 'center' },
  previewTitle: { color: DS.color.text.primary, fontSize: DS.type.title.fontSize, fontWeight: '900', marginTop: 8 },
  previewBody: { color: DS.color.text.muted, fontSize: DS.type.xs.fontSize, textAlign: 'center', marginTop: 4 },
  cats: { flexDirection: 'row-reverse', gap: 8, marginTop: 14, paddingVertical: 4 },
  cat: { minHeight: DS.size.touchMin, paddingHorizontal: 14, borderRadius: 99, borderWidth: 1, borderColor: DS.color.border.subtle, backgroundColor: DS.color.bg.surface, justifyContent: 'center' },
  catOn: { borderColor: DS.color.brand.primary, backgroundColor: DS.color.brand.primarySoft },
  catText: { color: DS.color.text.secondary, fontWeight: '800', fontSize: 13 },
  catTextOn: { color: DS.color.brand.primaryDark },
  grid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  choice: { width: '47%', minHeight: 120, borderRadius: DS.radius.xl, borderWidth: 1.5, borderColor: DS.color.border.subtle, backgroundColor: DS.color.bg.surface, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10 },
  choiceSelected: { borderColor: DS.color.brand.primary, backgroundColor: DS.color.brand.primarySoft },
  choiceLocked: { opacity: 0.55 },
  choiceText: { color: DS.color.text.primary, fontSize: DS.type.sm.fontSize, fontWeight: '900', textAlign: 'center' },
  locked: { color: DS.color.text.muted, fontSize: 11, fontWeight: '700' },
  iconPlaceholder: { width: 64, height: 64, borderRadius: 18, backgroundColor: DS.color.bg.subtle, alignItems: 'center', justifyContent: 'center' },
  iconGlyph: { fontSize: 22 },
  errorBox: { marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: DS.color.state.errorSoft },
  errorText: { color: DS.color.state.error, textAlign: 'right', fontWeight: '800' },
  actions: { marginTop: 14, gap: 10 },
  primaryButton: { minHeight: 52, borderRadius: 15, backgroundColor: DS.color.brand.primary, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: DS.color.text.inverse, fontSize: DS.type.sm.fontSize, fontWeight: '900' },
  ghostButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  ghostText: { color: DS.color.text.muted, fontSize: DS.type.sm.fontSize, fontWeight: '800' },
});
