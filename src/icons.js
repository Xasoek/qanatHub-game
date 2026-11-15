// Line icons shared by the game interface and the "How to play" guide (32×32 stroke paths).
export const ICONS = {
  air: '<path d="M8 25V14a8 8 0 0 1 16 0v11M5 25h22M12 25v-8h8v8M10 12h12"/>',
  farm: '<path d="M16 27V14m0 6C3 21 3 9 3 9s13-1 13 11Zm0-5C16 3 28 3 28 3s1 12-12 12Z"/>',
  repair: '<path d="M20 3a8 8 0 0 0-8 10L4 23a3 3 0 0 0 5 5l10-9A8 8 0 0 0 29 9l-6 5-5-5 5-6Z"/>',
  heat: '<path d="M16 4v14m0 0a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM12 8h4m-4 4h4"/><path d="M23 9c2 2 2 5 0 7m3-10c3 4 3 9 0 13"/>',
  comms: '<path d="M5 5c-2 10 4 17 14 14L5 5Zm14 14 6 8H9l4-8m5-11 6-6m-4 0h4v4M20 9a5 5 0 0 1 5 5m-5-9a9 9 0 0 1 9 9"/>',
  science: '<path d="M12 3h8m-6 0v8L6 26a2 2 0 0 0 2 3h16a2 2 0 0 0 2-3l-8-15V3M9 20h14"/>',
  oxygen: '<path d="M7 12a8 8 0 0 1 16 0v10a8 8 0 0 1-16 0V12Z"/><path d="M11 10h8m-8 13h8"/>',
  food: '<path d="M16 27V14m0 6C3 21 3 9 3 9s13-1 13 11Zm0-5C16 3 28 3 28 3s1 12-12 12Z"/>',
  energy: '<path d="M18 2 5 19h10l-1 11 13-18H17l1-10Z"/>',
  planet: '<circle cx="16" cy="16" r="10"/><path d="M4 19c-7 8 8 8 19-3S34 4 27 7"/>',
  home: '<path d="M5 15 16 5l11 10M8 13v13h16V13"/>',
  pause: '<path d="M11 7v18M21 7v18"/>',
  skip: '<path d="m6 7 10 9-10 9V7Zm10 0 10 9-10 9V7Z"/>',
  sound: '<path d="M5 12h5l7-6v20l-7-6H5Z"/><path d="M21 11a6 6 0 0 1 0 10m3-14a11 11 0 0 1 0 18"/>',
  mute: '<path d="M5 12h5l7-6v20l-7-6H5Z"/><path d="m21 12 8 8m0-8-8 8"/>',
  menu: '<path d="M5 9h22M5 16h22M5 23h22"/>',
  help: '<circle cx="16" cy="16" r="12"/><path d="M12.5 12.5a3.5 3.5 0 1 1 5 3.2c-1 .5-1.5 1.2-1.5 2.3v.5M16 23v.5"/>',
};

export const icon = (name) => `<svg class="ico" viewBox="0 0 32 32" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;
