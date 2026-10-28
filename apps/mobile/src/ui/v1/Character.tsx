import { Image } from 'react-native';
import { CHARACTER_ART, CHARACTER_SIZE, type CharacterPose } from './characters';

type Props = {
  pose: CharacterPose;
  /** Rendered height in dp; the width follows the image's own aspect (`height: N; width: auto`). */
  height: number;
  /** Alt text from the approved page (screen readers). */
  label: string;
};

/** Hero character image (`.hero`): never cropped, never stretched. */
export function Character({ pose, height, label }: Props) {
  const { width, height: h } = CHARACTER_SIZE[pose];
  return (
    <Image
      source={CHARACTER_ART[pose]}
      style={{ width: (height * width) / h, height }}
      resizeMode="contain"
      accessible
      accessibilityLabel={label}
    />
  );
}
