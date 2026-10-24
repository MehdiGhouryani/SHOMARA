/**
 * Browser entry for the visual-parity harness. It renders one specimen from the URL hash
 * (#id=...&x=...&y=...&w=...) inside a 390x844 right-to-left frame using react-native-web.
 * Only the harness bundles this file; the app never imports it.
 */
import { AppRegistry, View } from 'react-native';
import { C } from '../src/ui/v1';
import { SPECIMENS } from './specimens/index';

const RTL_WEB_PROP = { dir: 'rtl' } as object;

function Root() {
  const q = new URLSearchParams(window.location.hash.slice(1));
  const spec = SPECIMENS[q.get('id') ?? ''];
  if (!spec) return null;
  const x = Number(q.get('x') ?? 0);
  const y = Number(q.get('y') ?? 0);
  const w = Number(q.get('w') ?? 390);
  const bg = q.get('bg') ?? C.canvas;
  const sy = Number(q.get('sy') ?? 0);
  return (
    // `dir` is a react-native-web prop: it makes start/end resolve like the native app (RTL is forced on Android).
    <View {...RTL_WEB_PROP} style={{ width: 390, height: 844, backgroundColor: bg, overflow: 'hidden' }}>
      {spec.full ? (
        spec.render({ sy })
      ) : (
        // `end` is the physical left edge in the RTL frame, so this places the component at page x.
        <View style={{ position: 'absolute', top: y, end: x, width: w }}>{spec.render({ sy })}</View>
      )}
    </View>
  );
}

AppRegistry.registerComponent('Parity', () => Root);
AppRegistry.runApplication('Parity', { rootTag: document.getElementById('root') });
document.documentElement.setAttribute('data-ready', '1');
