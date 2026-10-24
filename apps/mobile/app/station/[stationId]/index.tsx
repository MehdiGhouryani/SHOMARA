import { Redirect, useLocalSearchParams } from 'expo-router';

export default function StationIndexRedirect() {
  const { stationId } = useLocalSearchParams<{ stationId?: string }>();
  return <Redirect href={`/station/${stationId ?? 'ST01'}/start`} />;
}
