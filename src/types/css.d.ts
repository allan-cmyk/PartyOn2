// CSS custom properties for animations
import 'react';

declare module 'react' {
  interface CSSProperties {
    '--scroll-reveal-delay'?: string;
    '--scroll-reveal-duration'?: string;
    '--scroll-reveal-distance'?: string;
  }
}
