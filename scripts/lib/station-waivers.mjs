/**
 * Station-screen features that the approved stage pages (ADR-0035, Stage U4: pages 06 and 07) do not draw.
 *
 * Same rules as `path-waivers.mjs`: the domain logic stays in the codebase and keeps being verified; what is
 * waived is only the assertion "this screen's source contains X". Every waiver names the verifier that used to
 * assert it and what has to happen for the feature to come back. `verify-ui-v1-station.mjs` pins this list.
 */
export const STATION_UI_WAIVERS = [
  {
    id: 'station-start-session-hint',
    verifier: 'verify-phase-a-grade-experience.mjs',
    feature: 'session-length hint ("پیشنهاد جلسه ...") and the ready/needs-preparing status box on the station start screen',
    stillVerified: 'sessionLengthHintFa contract and its use on the profile and me surfaces',
    restoreIn: 'owner decision U-Q15: page 06 draws no session hint (the minutes chip shows the station estimate)',
  },
];

export const isStationWaived = (id) => STATION_UI_WAIVERS.some((w) => w.id === id);
export const stationWaiverNote = (id) => {
  const w = STATION_UI_WAIVERS.find((x) => x.id === id);
  return w ? `WAIVED ${w.id} (ADR-0035 U4): ${w.feature}; still verified: ${w.stillVerified}; restore: ${w.restoreIn}` : '';
};
