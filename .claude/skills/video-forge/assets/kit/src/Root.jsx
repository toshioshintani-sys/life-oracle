import React from 'react';
import {Composition} from 'remotion';
import {compositions} from './compositions/index.js';

export const RemotionRoot = () => (
  <>
    {compositions.map((c) => (
      <Composition
        key={c.id}
        id={c.id}
        component={c.component}
        width={c.width}
        height={c.height}
        fps={c.fps}
        durationInFrames={c.durationInFrames}
        defaultProps={c.defaultProps}
      />
    ))}
  </>
);
