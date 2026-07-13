import type { AnimationPreset } from '../types/yoPageTypes';

export const animationPresets: AnimationPreset[] = [
  { id: 'none', name: 'None', description: 'No animation.', initial: {}, animate: {} },
  { id: 'fade-in', name: 'Fade In', description: 'Soft opacity fade.', initial: { opacity: 0 }, animate: { opacity: 1 } },
  { id: 'slide-up', name: 'Slide Up', description: 'Fade and lift into place.', initial: { opacity: 0, y: 32 }, animate: { opacity: 1, y: 0 } },
  { id: 'slide-down', name: 'Slide Down', description: 'Drops softly from top.', initial: { opacity: 0, y: -28 }, animate: { opacity: 1, y: 0 } },
  { id: 'slide-left', name: 'Slide Left', description: 'Moves in from right side.', initial: { opacity: 0, x: 48 }, animate: { opacity: 1, x: 0 } },
  { id: 'slide-right', name: 'Slide Right', description: 'Moves in from left side.', initial: { opacity: 0, x: -48 }, animate: { opacity: 1, x: 0 } },
  { id: 'scale-in', name: 'Scale In', description: 'Product-card zoom reveal.', initial: { opacity: 0, scale: 0.92 }, animate: { opacity: 1, scale: 1 } },
  { id: 'zoom-pop', name: 'Zoom Pop', description: 'CTA/product image pop.', initial: { opacity: 0, scale: 0.78 }, animate: { opacity: 1, scale: 1 } },
  { id: 'apple-rise', name: 'Apple Rise', description: 'Large product showcase lift and fade.', initial: { opacity: 0, y: 72, scale: 0.98, filter: 'blur(8px)' }, animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' } },
  { id: 'apple-blur', name: 'Apple Blur Reveal', description: 'Premium blur-to-sharp entrance.', initial: { opacity: 0, filter: 'blur(18px)', scale: 1.04 }, animate: { opacity: 1, filter: 'blur(0px)', scale: 1 } },
  { id: 'parallax-soft', name: 'Scroll Parallax Soft', description: 'Scroll-triggered product movement.', initial: { opacity: 0, y: 96 }, animate: { opacity: 1, y: 0 } },
  { id: 'stagger-card', name: 'Stagger Card Feel', description: 'Card-like delayed reveal preset.', initial: { opacity: 0, y: 38, rotateX: 8 }, animate: { opacity: 1, y: 0, rotateX: 0 } },
  { id: 'float-up', name: 'Float Up', description: 'Light floating showcase motion.', initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: -6 } },
  { id: 'rotate-in', name: 'Rotate In', description: 'Subtle product tile rotation.', initial: { opacity: 0, rotate: -4, scale: 0.96 }, animate: { opacity: 1, rotate: 0, scale: 1 } },
  { id: 'hero-focus', name: 'Hero Focus', description: 'Hero headline focus reveal.', initial: { opacity: 0, y: 24, letterSpacing: '0.04em' }, animate: { opacity: 1, y: 0, letterSpacing: '0em' } }
];
