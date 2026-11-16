import React from 'react';
import {Audio, Sequence, staticFile, interpolate} from 'remotion';

// SFX table: every cue pinned to a frame (24 fps) and the on-screen action it belongs to.
// AAC output adds ~1 frame of latency; sharp transients are pulled 1 frame earlier (OFF).
const OFF = 1;
type Cue = {at: number; src: string; vol: number | ((f: number) => number); dur?: number; loop?: boolean; note: string; sharp?: boolean};
const ramp = (pts: [number, number][]) => (f: number) => interpolate(f, pts.map((p) => p[0]), pts.map((p) => p[1]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const CUES: Cue[] = [
  // SHOT 1 — ordinary day (0–168)
  {at: 0, src: 'amb_day.wav', dur: 372, loop: true, vol: ramp([[0, 0], [24, .32], [300, .3], [372, 0]]), note: 'soft base hum / thin-air wash'},
  {at: 0, src: 'breath.wav', dur: 504, loop: true, vol: ramp([[0, 0], [36, .16], [480, .2], [504, 0]]), note: 'quiet suit breathing'},
  {at: 34, src: 'mech-tech-movement.mp3', dur: 60, vol: .06, note: 'Beep treads, little circle'},
  {at: 78, src: 'chirp_happy.wav', vol: .42, note: 'cheerful robot chirp', sharp: true},
  {at: 138, src: 'chirp_happy.wav', vol: .3, note: 'second, smaller chirp'},
  // SHOT 2 — alarm (168–360)
  {at: 236, src: 'radio_click.wav', vol: .5, note: 'radio static click as the band is spotted', sharp: true},
  {at: 238, src: 'alarm.wav', dur: 150, loop: true, vol: ramp([[0, 0], [6, .26], [120, .26], [150, 0]]), note: 'two-tone alarm, dome lights pulse'},
  {at: 256, src: 'chirp_alert.wav', vol: .4, note: "Beep's eyes go wide", sharp: true},
  {at: 322, src: 'hit-weak.mp3', vol: .12, note: 'dropped tool lands (muffled)', sharp: true},
  // SHOT 3 — lost in the dust (360–552)
  {at: 364, src: 'dust_hiss.wav', dur: 177, vol: ramp([[0, 0], [20, .25], [177, .75]]), note: 'dust hiss on the visor builds, hard cut at the crossed antenna (541)'},
  {at: 450 - OFF, src: 'lock-quick.mp3', dur: 18, vol: .35, note: 'old clip on the pole gives way'},
  {at: 486, src: 'sand-swish.mp3', dur: 30, vol: .4, note: 'gentle slide down the dune slope'},
  {at: 512 - OFF, src: 'signal_loss.wav', dur: 30, vol: .5, note: 'signal bars drop 3→2→1→0, lost tone at 541'},
  // SHOT 4 — liftoff (552–744): total silence, then the button and the rumble
  {at: 640 - OFF, src: 'switch-click-quick.mp3', dur: 14, vol: .55, note: 'commander presses the launch control'},
  {at: 655, src: 'ignition.wav', vol: .35, note: 'engine ignition'},
  {at: 658, src: 'rumble.wav', dur: 104, vol: ramp([[0, .9], [80, .55], [104, 0]]), note: 'deep muffled rumble fading into silence'},
  // SHOT 5 — alone, but not alone (744–960): near silence
  {at: 760, src: 'amb_day.wav', dur: 200, loop: true, vol: ramp([[0, 0], [48, .1], [170, .1], [200, 0]]), note: 'faint ambience after the storm'},
  {at: 816, src: 'breath.wav', dur: 144, vol: ramp([[0, 0], [24, .16], [120, .14], [144, 0]]), note: 'Mark stirs, breathing'},
  {at: 846, src: 'mech-tech-movement.mp3', dur: 30, vol: .05, note: 'Beep rolls carefully down the slope'},
  {at: 878, src: 'chirp_relieved.wav', vol: .42, note: 'one soft relieved robot chirp'},
];

export const Soundtrack: React.FC = () => (
  <>
    {CUES.map((c, i) => (
      <Sequence key={i} from={c.at - (c.sharp ? OFF : 0)} durationInFrames={c.dur ?? 48} name={c.note}>
        <Audio src={staticFile('audio/' + c.src)} volume={c.vol as any} loop={c.loop} />
      </Sequence>
    ))}
  </>
);
