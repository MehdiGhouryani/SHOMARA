import { View, type ViewProps } from 'react-native';
export function SafeAreaView(props: ViewProps & { edges?: string[] }) {
  const { edges: _edges, ...rest } = props;
  return <View {...rest} />;
}
export function useSafeAreaInsets() {
  return { top: 0, bottom: 0, left: 0, right: 0 };
}
