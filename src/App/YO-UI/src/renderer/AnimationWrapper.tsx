import { motion, type TargetAndTransition } from 'framer-motion';
import type { PropsWithChildren } from 'react';
import type { YoAnimationConfig } from '../types/yoPageTypes';
import { animationPresets } from '../registry/animationPresets';

export function AnimationWrapper({ animation, children }: PropsWithChildren<{ animation?: YoAnimationConfig }>) {
  if (!animation || animation.presetId === 'none') return <>{children}</>;
  const preset = animationPresets.find(x => x.id === animation.presetId);
  if (!preset) return <>{children}</>;

  const transition = { duration: animation.duration, delay: animation.delay, ease: 'easeOut' } as const;
  const initial = preset.initial as TargetAndTransition;
  const animate = preset.animate as TargetAndTransition;

  if (animation.trigger === 'onHover') {
    return <motion.div whileHover={animate} transition={transition}>{children}</motion.div>;
  }

  if (animation.trigger === 'onView') {
    return <motion.div initial={initial} whileInView={animate} viewport={{ once: true, amount: 0.25 }} transition={transition}>{children}</motion.div>;
  }

  return <motion.div initial={initial} animate={animate} transition={transition}>{children}</motion.div>;
}
