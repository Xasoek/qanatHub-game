import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
// Inside Mark's helmet (shot 3, end): soft light-blue display loses the signal.
// Icons only: signal bars and an antenna — no letters or numbers.
const START = 360 + 150, END = 558, TRANS_START = 546;
const BLUE = '#abd0ff';
export const HelmetHud: React.FC = () => {
  const f = useCurrentFrame();
  if (f < START || f >= END) return null;
  const t = f - 360;
  const s = (x: number) => x * x * (3 - 2 * x);
  const fadeOut = f >= TRANS_START ? 1 - s(Math.min(1, (f - TRANS_START + .5) / 12)) : 1;
  const fadeIn = Math.min(1, (f - START) / 4);
  const bars = t < 152 ? 3 : t < 161.6 ? 2 : t < 171.2 ? 1 : 0;
  const lost = t >= 181;
  const blink = lost ? ((Math.floor((t - 181) / 5) % 2) === 0 ? 1 : .35) : 1;
  const flicker = (k: number) => (bars === k - 1 && t - [0, 152, 161.6, 171.2][3 - bars] < 3) ? .4 : 1;
  return (
    <AbsoluteFill style={{opacity: fadeOut * fadeIn}}>
      {/* visor rim: soft navy vignette, as if seen from inside the helmet */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 62% 66% at 50% 52%, rgba(13,27,48,0) 58%, rgba(13,27,48,.55) 78%, rgba(13,27,48,.97) 100%)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(171,208,255,.07), rgba(0,0,0,0) 40%)'}} />
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <g filter="url(#glow)" transform="translate(560 690)" opacity={.92}>
          {/* display frame: curved panel on the inside of the visor */}
          <rect x="0" y="0" width="330" height="190" rx="34" fill="rgba(171,208,255,.08)" stroke={BLUE} strokeOpacity=".55" strokeWidth="4" />
          {/* antenna icon */}
          <g transform="translate(78 98)" opacity={blink} stroke={BLUE} strokeWidth="9" strokeLinecap="round" fill="none">
            <line x1="0" y1="-10" x2="0" y2="58" />
            <path d="M -22 -30 A 30 30 0 0 0 -22 10" /><path d="M 22 -30 A 30 30 0 0 1 22 10" />
            <path d="M -40 -46 A 54 54 0 0 0 -40 26" opacity={lost ? .35 : 1} /><path d="M 40 -46 A 54 54 0 0 1 40 26" opacity={lost ? .35 : 1} />
            <circle cx="0" cy="-10" r="7" fill={BLUE} stroke="none" />
            {lost ? <line x1="-52" y1="58" x2="52" y2="-62" stroke="#ffd0a0" strokeWidth="10" /> : null}
          </g>
          {/* three signal bars */}
          {[0, 1, 2].map((i) => {
            const on = i < bars;
            const h = 36 + i * 30;
            return <rect key={i} x={170 + i * 46} y={150 - h} width="30" height={h} rx="8" fill={on ? BLUE : 'none'} fillOpacity={on ? .95 * flicker(i + 1) : 0} stroke={BLUE} strokeOpacity={on ? 1 : .35} strokeWidth="4" />;
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
