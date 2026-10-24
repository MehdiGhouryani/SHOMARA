import { useLocalSearchParams } from 'expo-router';
import { StationFlow } from '../../../src/station/StationFlow';

export default function StationPlayScreen() {
  const { stationId } = useLocalSearchParams<{ stationId?: string }>();
  return <StationFlow stationId={stationId ?? 'ST01'} />;
}
