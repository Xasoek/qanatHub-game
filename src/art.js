// Role 2 graphics. The game shows a real-time 3D outpost (src/art/world.js).
// renderBase() stays as the 2D SVG fallback for browsers without WebGL 2.
export { createWorld, hasCapableGpu, OBJECT_IDS } from "./art/world.js";
export { missionSnapshot, TRANSFER_DAYS, SOL_DAYS } from "./art/orbits.js";

/** Material embedded in the 3D scene. Titles are proper names; the descriptions live in TEXT (ui.credit.*). */
export const ART_CREDITS = [
  { id: "rover", title: "NASA/JPL-Caltech — Mars 2020 Perseverance 3D model", url: "https://science.nasa.gov/3d-resources/mars-2020-perseverance-rover/" },
  { id: "map", title: "NASA/JPL/USGS — Viking Mars surface map", url: "https://space.jpl.nasa.gov/tmaps/mars.html" },
  { id: "trek", title: "NASA Mars Trek — MGS MOLA color hillshade", url: "https://trek.nasa.gov/mars/" },
  { id: "donki", title: "NASA DONKI — FLR 2024-05-10T06:27Z (X3.9)", url: "https://ccmc.gsfc.nasa.gov/DONKI/view/FLR/30666/-1" },
  { id: "radlab", title: "NASA OSDR RadLab — ISS DosTel2", url: "https://visualization.osdr.nasa.gov/radlab/gui/data-api/" },
  { id: "moxie", title: "NASA — MOXIE on Perseverance", url: "https://science.nasa.gov/mission/mars-2020-perseverance/science-instruments/" },
  { id: "earth", title: "NASA Earth Observatory — Blue Marble Next Generation (Dec 2004)", url: "https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-topography-bathymetry/" },
];

const PANEL_STATES = ["#203653", "#9a7451", "#3b3533"];

/** 2D fallback scene that follows STATE: weather, phase, panels and crop. */
export function renderBase(state) {
  const night = state?.phase === "night", storm = state?.weather === "storm", dusty = state?.weather === "dusty";
  const sky = night ? "#1d2c4a" : storm ? "#8f5a3b" : "#793747";
  const broken = state?.panels?.broken ?? 0, dust = state?.panels?.dusty ?? 0;
  const panels = [405, 459, 513, 567].map((x, i) => {
    const fill = PANEL_STATES[i < broken ? 2 : i < broken + dust ? 1 : 0];
    return `<path d="M${x} 153l13-23h40l-13 23z" fill="${fill}" stroke="#97b7d6" stroke-width="2"/>`;
  }).join("");
  const crop = state?.crop ? Math.min(1, state.crop.progress / 5) : 0.3;
  return `<svg viewBox="0 0 600 220" aria-hidden="true" focusable="false">
    <rect width="600" height="220" fill="${sky}"/>
    ${night ? "" : `<circle cx="470" cy="70" r="40" fill="#f7b586" opacity="${storm ? 0.25 : dusty ? 0.6 : 1}"/>`}
    <path d="M0 163 100 120l75 35 106-48 118 53 105-18 96 34v44H0Z" fill="#c36750"/>
    <path d="M0 184q200-38 350-5t250-4v45H0Z" fill="#e39465"/>
    <path data-object="air" d="M182 180v-22a54 54 0 0 1 108 0v22Z" fill="#dee7ee"/>
    <path d="M204 150h64l-9 17h-46Z" fill="#426a94"/>
    <path data-object="farm" d="M288 180v-13h28v-15a35 35 0 0 1 70 0v28Z" fill="#82b6a7"/>
    <rect x="300" y="${166 - crop * 10}" width="70" height="${crop * 10}" fill="#5f9a4a"/>
    <path d="M430 178v-28m54 28v-28m54 28v-28" stroke="#273c55" stroke-width="5"/>
    <g data-object="panels">${panels}</g>
    ${storm ? '<rect width="600" height="220" fill="#c08a5a" opacity=".45"/>' : ""}
  </svg>`;
}

/** Small elevation profile for the site picker, from SITES[site].profile (Mars Trek MOLA). */
export function renderProfile(profile) {
  if (!profile?.length) return "";
  const ys = profile.map((p) => p.elevationM), min = Math.min(...ys), max = Math.max(...ys), span = Math.max(200, max - min);
  const pts = profile.map((p, i) => `${(i / (profile.length - 1)) * 200},${54 - ((p.elevationM - min) / span) * 46}`).join(" ");
  return `<svg viewBox="0 0 200 60" aria-hidden="true" focusable="false" preserveAspectRatio="none"><polygon points="0,60 ${pts} 200,60" fill="rgba(214,140,96,.35)"/><polyline points="${pts}" fill="none" stroke="#f2c08f" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;
}
