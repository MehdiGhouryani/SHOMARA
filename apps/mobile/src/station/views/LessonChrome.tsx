import { Text } from '../../ui/AppText';
import { ProgressBar, TopBar, C, UI, typeStyle } from '../../ui/v1';

type TopProps = { progress: number; progressLabel: string; closeLabel: string; onClose: () => void };

/** `.top` of the lesson pages (07 to 09): close button at the reading start and the 16px section progress bar. */
export function LessonTopBar({ progress, progressLabel, closeLabel, onClose }: TopProps) {
  return (
    <TopBar action={{ icon: 'close', label: closeLabel, onPress: onClose }}>
      <ProgressBar value={progress} label={progressLabel} />
    </TopBar>
  );
}

type CaptionProps = { label: string; position: string };

/** `.cap` at 16px: the section name in primary semibold, then " · n از 5". */
export function LessonCaption({ label, position }: CaptionProps) {
  return (
    <Text style={[typeStyle('caption'), { fontSize: UI.lesson.captionSize, color: C.ink2 }]}>
      <Text style={{ fontWeight: '600', color: C.primary }}>{label}</Text>
      {` · ${position}`}
    </Text>
  );
}
