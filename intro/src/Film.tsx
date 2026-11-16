import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
// @ts-ignore engine is plain JS
import {createFilm} from './engine/index.js';

let filmPromise: Promise<any> | null = null;
let glCanvas: HTMLCanvasElement | null = null;

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const outRef = useRef<HTMLCanvasElement>(null);
  const [film, setFilm] = useState<any>(null);
  const [initHandle] = useState(() => delayRender('Loading 3D world', {timeoutInMilliseconds: 600000}));
  useEffect(() => {
    if (!filmPromise) {
      glCanvas = document.createElement('canvas');
      glCanvas.width = width; glCanvas.height = height;
      const out = document.createElement('canvas'); out.width = width; out.height = height;
      filmPromise = createFilm(glCanvas, out, {modelBase: staticFile('models/'), width, height}).then((f: any) => ({...f, out}));
    }
    filmPromise.then((f) => {setFilm(f); continueRender(initHandle);}).catch((e) => {console.error(e); throw e;});
  }, []);
  useLayoutEffect(() => {
    if (!film || !outRef.current) return;
    const h = delayRender('frame ' + frame);
    film.renderFrame(frame);
    const ctx = outRef.current.getContext('2d')!;
    ctx.drawImage(film.out, 0, 0);
    continueRender(h);
  }, [film, frame]);
  return (
    <AbsoluteFill>
      <canvas ref={outRef} width={width} height={height} style={{width: '100%', height: '100%'}} />
    </AbsoluteFill>
  );
};
