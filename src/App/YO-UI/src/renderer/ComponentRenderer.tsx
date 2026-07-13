import { componentRegistry } from '../registry/componentRegistry';
import type { YoComponentInstance, DeviceMode } from '../types/yoPageTypes';
import { AnimationWrapper } from './AnimationWrapper';

export function ComponentRenderer({ instance, device, isEditing = false }: { instance: YoComponentInstance; device: DeviceMode; isEditing?: boolean }) {
  if (!instance.visibility[device] && !isEditing) return null;
  const definition = componentRegistry[instance.type];
  if (!definition) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Unknown component: {instance.type}</div>;
  }
  const Renderer = definition.renderer;
  return (
    <AnimationWrapper animation={instance.animation}>
      <Renderer config={instance.config} style={instance.style} isEditing={isEditing} />
    </AnimationWrapper>
  );
}
