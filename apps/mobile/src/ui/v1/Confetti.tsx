import { StyleSheet, View } from 'react-native';
import { C, UI } from './tokens';

const TONE = {
  amber: C.amber,
  violet: C.violet,
  sky: UI.result.confettiSky,
} as const;

/**
 * The celebration confetti of page 11: six fixed pieces around the top of the screen. The positions are the
 * page's own authored values (frozen there too); motion stays deferred with the rest of the feel work.
 */
export function Confetti() {
  return (
    <View pointerEvents="none" style={styles.layer}>
      {UI.result.confetti.map((piece, index) => (
        <View
          key={index}
          style={[
            styles.piece,
            {
              top: piece.top,
              start: piece.insetStart,
              backgroundColor: TONE[piece.tone as keyof typeof TONE],
              transform: [{ rotate: `${piece.rotate}deg` }],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', top: 0, start: 0, end: 0, bottom: 0 },
  piece: { position: 'absolute', width: UI.result.confettiW, height: UI.result.confettiH, borderRadius: 99 },
});
