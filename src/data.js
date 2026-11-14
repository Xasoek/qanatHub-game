// Role 3 supplies the verified DONKI archive and adds the opt-in live path.
export const NASA_ARCHIVE = [];
export const SOURCES = [
  { id: "donki", title: "NASA DONKI", url: "https://kauai.ccmc.gsfc.nasa.gov/DONKI/" },
];

/**
 * @param {{mode?: "archive" | "live"}} options
 * @returns {Promise<{mode: "archive" | "live", flares: object[], asOf: string | null, noticeKey: string | null}>}
 */
export async function loadSolarData({ mode = "archive" } = {}) {
  return {
    mode: "archive",
    flares: structuredClone(NASA_ARCHIVE),
    asOf: null,
    noticeKey: mode === "live" ? "solar.liveUnavailable" : null,
  };
}
