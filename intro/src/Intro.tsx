import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Film} from './Film';
import {HelmetHud} from './HelmetHud';
import {Soundtrack} from './Soundtrack';
export const Intro: React.FC<{sound: boolean}> = ({sound}) => (
  <AbsoluteFill style={{backgroundColor: '#0d1b30'}}>
    <Film />
    <HelmetHud />
    {sound ? <Soundtrack /> : null}
  </AbsoluteFill>
);
