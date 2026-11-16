// Shared positions for the film (world units ~ metres, base layout from the game).
export const RAVINE = {
  x0: 20.5, x1: 33, z: 6.6, half: 2.6, depth: 1.55,
  // safety line poles, from Mark's weather mast towards the landing pad
  line: [[27.2, 2.6], [25.6, 2.25], [24.0, 1.9], [22.4, 1.55]],
};
export const MAST = [28.3, 3.0];
export const FPS = 24;
// shot boundaries (frames @24fps); transitions are 12 frames centred on each cut
export const SHOTS = [
  {id: 1, start: 0, end: 168},
  {id: 2, start: 168, end: 360},
  {id: 3, start: 360, end: 552},
  {id: 4, start: 552, end: 744},
  {id: 5, start: 744, end: 960},
];
export const TRANS = 12;
