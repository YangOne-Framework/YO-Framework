import type { YoPage, DeviceMode } from '../types/yoPageTypes';
import { sectionClasses, responsiveColumnClasses } from '../utils/style';
import { ComponentRenderer } from './ComponentRenderer';
import { MasterLayoutRenderer } from './MasterLayoutRenderer';

export function PageRenderer({ page, device = 'desktop', isEditing = false }: { page: YoPage; device?: DeviceMode; isEditing?: boolean }) {
  const pageShell = page.settings.containerMode === 'boxed' ? 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8' : 'w-full';

  return (
    <MasterLayoutRenderer layoutId={page.masterLayoutId} layoutDef={page.masterLayout} config={page.masterLayoutConfig}>
      <div style={{ backgroundColor: page.settings.backgroundColor || undefined }}>
        <div className={pageShell}>
          {page.sections.map(section => {
            const inner = section.settings.layoutMode === 'fluid' ? 'w-full' : 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8';
            return (
              <section
                key={section.id}
                className={sectionClasses(section)}
                style={{ backgroundColor: section.settings.backgroundColor || undefined, backgroundImage: section.settings.backgroundImage ? `url(${section.settings.backgroundImage})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}
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
