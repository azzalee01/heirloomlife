import React from 'react';
import { Composition } from 'remotion';
import { DesktopFilm } from './compositions/DesktopFilm';
import { MobileFilm } from './compositions/MobileFilm';
import { FPS, TOTAL_FRAMES } from './tokens/design';

// Registers both compositions for Remotion Studio and rendering.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Desktop 16:9 — 1920×1080 @ 30fps — 18 seconds */}
      <Composition
        id="DesktopFilm"
        component={DesktopFilm}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* Mobile 9:16 — 1080×1920 @ 30fps — 18 seconds */}
      <Composition
        id="MobileFilm"
        component={MobileFilm}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
    </>
  );
};
