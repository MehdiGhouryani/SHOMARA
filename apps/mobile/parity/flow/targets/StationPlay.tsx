import { StationFlow } from '../../../src/station/StationFlow';

/** The real lesson player for station 1 (the play route renders exactly this). With no API base it runs on the local lesson content. */
export default function StationPlayTarget() {
  return <StationFlow stationId="ST01" />;
}
