import { useEffect, useState } from 'react';
import { continueRender, delayRender } from 'remotion';

// Loads DM Sans and Instrument Serif from Google Fonts before rendering begins.
export function useFonts() {
  const [handle] = useState(() => delayRender('Loading Google Fonts'));

  useEffect(() => {
    const css = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Instrument+Serif:ital@0;1&display=block');
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    document.fonts.ready
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));

    return () => {
      document.head.removeChild(style);
    };
  }, [handle]);
}
