import { redirect } from 'next/navigation';

export default async function StationIndex({ params }: { params: Promise<{ stationId: string }> }) {
  const { stationId } = await params;
  redirect(`/station/${stationId}/start`);
}
