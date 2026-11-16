import React from 'react';
import {Composition, AbsoluteFill} from 'remotion';
import {Intro} from './Intro';
import {Soundtrack} from './Soundtrack';
const AudioOnly: React.FC = () => <AbsoluteFill style={{backgroundColor: '#000'}}><Soundtrack /></AbsoluteFill>;
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="OneSolIntro" component={Intro} durationInFrames={960} fps={24} width={1920} height={1080} defaultProps={{sound: true}} />
    <Composition id="OneSolAudio" component={AudioOnly} durationInFrames={960} fps={24} width={1920} height={1080} />
  </>
);
