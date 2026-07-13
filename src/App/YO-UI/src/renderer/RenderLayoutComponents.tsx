import { ComponentRenderer } from './ComponentRenderer';
import type { MasterLayoutDefinition, DeviceMode } from '../types/yoPageTypes';

export function RenderLayoutComponents({ layout, device = 'desktop' }: { layout: MasterLayoutDefinition; device?: DeviceMode }) {
  if (!layout.componentIds || layout.componentIds.length === 0) return null;

  return (
    <div className="layout-shell">
      {layout.componentIds.map(id => {
        const component = layout.components?.[id];
        if (!component) return null;
        return (
          <div key={id} className="layout-component">
            <ComponentRenderer instance={component} device={device} />
          </div>
        );
      })}
    </div>
  );
}
