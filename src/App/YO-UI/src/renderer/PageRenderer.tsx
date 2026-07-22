import type { YoPage, DeviceMode } from '../types/yoPageTypes';
import { sectionClasses, responsiveColumnClasses } from '../utils/style';
import { resolveImageUrl } from '../utils/image';
import { ComponentRenderer } from './ComponentRenderer';
import { MasterLayoutRenderer } from './MasterLayoutRenderer';

export function PageRenderer({ page, device = 'desktop', isEditing = false }: { page: YoPage; device?: DeviceMode; isEditing?: boolean }) {
  const pageShell = page.settings.containerMode === 'boxed' ? 'yo-container' : 'w-full';

  return (
    <MasterLayoutRenderer layoutId={page.masterLayoutId} layoutDef={page.masterLayout} config={page.masterLayoutConfig}>
      <div style={{ backgroundColor: page.settings.backgroundColor || undefined }}>
        <div className={pageShell}>
          {page.sections.map(section => {
            const inner = section.settings.layoutMode === 'fluid' ? 'yo-container-fluid' : 'yo-container';
            return (
              <section
                key={section.id}
                className={sectionClasses(section)}
                style={{ backgroundColor: section.settings.backgroundColor || undefined, backgroundImage: section.settings.backgroundImage ? `url(${resolveImageUrl(section.settings.backgroundImage)})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                <div className={inner}>
                  <div className="grid grid-cols-12 gap-6">
                    {section.columns.map(column => (
                      <div key={column.id} className={responsiveColumnClasses(column.span.desktop, column.span.tablet, column.span.mobile)}>
                        <div className="space-y-4">
                          {column.components.map(componentId => {
                            const component = page.components[componentId];
                            return component ? <ComponentRenderer key={component.id} instance={component} device={device} isEditing={isEditing} /> : null;
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </MasterLayoutRenderer>
  );
}
