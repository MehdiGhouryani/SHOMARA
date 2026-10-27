// Minimal expo-font stand-in for the flow harness only: the Ionicons font is embedded as a CSS
// @font-face in index.html, so the JS font loader never needs to fetch or cache anything.
export function loadAsync(): Promise<boolean> {
  return Promise.resolve(true);
}
export function isLoaded(): boolean {
  return true;
}
export function useFonts(): [boolean, Error | null] {
  return [true, null];
}
export default { loadAsync, isLoaded, useFonts };
