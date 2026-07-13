import React, { useMemo, type PropsWithChildren } from 'react';
import { localStorageDb } from '../services/localStorageDb';
import type { MasterLayoutConfig, MasterLayoutDefinition, YoComponentInstance, DeviceMode } from '../types/yoPageTypes';
import { ComponentRenderer } from './ComponentRenderer';

function Header({ config, compact = false }: { config: MasterLayoutConfig; compact?: boolean }) {
  const nav = config.navItems.split(',').map(x => x.trim()).filter(Boolean);
  const dark = config.headerStyle === 'dark';
  const glass = config.headerStyle === 'glass';
  const headerClass = dark
    ? 'border-b border-white/10 bg-gray-900 text-white'
    : glass
      ? 'sticky top-0 z-20 border-b border-white/70 bg-white/75 text-gray-900 backdrop-blur-xl'
      : 'border-b border-gray-200 bg-white text-gray-900';
  const buttonClass = dark ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-800';

  return (
    <header className={headerClass}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold ${dark ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'}`}>{config.brandName.slice(0, 1).toUpperCase()}</div>
          <div className="font-bold tracking-tight">{config.brandName}</div>
        </div>
        <nav className={`hidden gap-6 text-sm font-medium ${dark ? 'text-gray-400' : 'text-gray-600'} md:flex`}>
          {nav.map(item => <a href="#" key={item} className="hover:text-current">{item}</a>)}
        </nav>
        {!compact && config.ctaLabel ? <a href={config.ctaUrl || '#'} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${buttonClass}`}>{config.ctaLabel}</a> : <span />}
      </div>
    </header>
  );
}

function Footer({ config }: { config: MasterLayoutConfig }) {
  return (
    <footer className="border-t border-gray-200 bg-white px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-sm text-gray-500">
        <div className="font-bold text-gray-900">{config.brandName}</div>
        <div>{config.footerText || `© ${new Date().getFullYear()} ${config.brandName}`}</div>
      </div>
    </footer>
  );
}

const defaultConfig: MasterLayoutConfig = {
  brandName: 'StudioSite',
  navItems: 'Home, Work, Pricing, Contact',
  ctaLabel: 'Get started',
  ctaUrl: '#',
  footerText: 'Designed with CMS Studio',
  headerStyle: 'glass',
  containerMode: 'boxed'
};

function RenderZoneComponents({ ids, components, device = 'desktop' }: { ids: string[]; components?: Record<string, YoComponentInstance>; device?: DeviceMode }) {
  if (!ids || ids.length === 0 || !components) return null;
  return <>{ids.map(id => { const c = components[id]; if (!c) return null; return <ComponentRenderer key={id} instance={c} device={device} />; })}</>;
}

function getZoneComponents(layout: MasterLayoutDefinition) {
  const zones = layout.zones ?? { header: [], sidebar: [], footer: [] };
  const hasZones = zones.header.length > 0 || zones.sidebar.length > 0 || zones.footer.length > 0;

  if (hasZones) {
    return {
      header: zones.header.filter(id => layout.components?.[id]),
      footer: zones.footer.filter(id => layout.components?.[id]),
      sidebar: zones.sidebar.filter(id => layout.components?.[id]),
    };
  }

  const header: string[] = [];
  const footer: string[] = [];
  const sidebar: string[] = [];
  for (const id of layout.componentIds ?? []) {
    const comp = layout.components?.[id];
    if (!comp) continue;
    const zone = (comp.config?.__layoutZone as string) || '';
    const typeZone = comp.type === 'layout-footer' ? 'footer' : comp.type === 'layout-sidebar' ? 'sidebar' : 'header';
    const target = zone || typeZone;
    if (target === 'footer') footer.push(id);
    else if (target === 'sidebar') sidebar.push(id);
    else header.push(id);
  }
  return { header, footer, sidebar };
}

function renderShell(layout: MasterLayoutDefinition | null, zoneComponents: ReturnType<typeof getZoneComponents>, layoutConfig: MasterLayoutConfig, children: React.ReactNode) {
  const zones = layout?.zones ?? { header: [], sidebar: [], footer: [] };
  const hasDesign = layout && (
    zones.header.length > 0 || zones.sidebar.length > 0 || zones.footer.length > 0 ||
    (layout.componentIds && layout.componentIds.length > 0)
  );

  if (layout?.id === 'landing') {
    if (hasDesign) return (
      <div>
        <RenderZoneComponents ids={zoneComponents.header} components={layout?.components} />
        <main>{children}</main>
        <RenderZoneComponents ids={zoneComponents.footer} components={layout?.components} />
      </div>
    );
    return <><Header config={layoutConfig} compact /><main>{children}</main><Footer config={layoutConfig} /></>;
  }

  if (layout?.id === 'docs-left-sidebar') {
    if (hasDesign) return (
      <div>
        <RenderZoneComponents ids={zoneComponents.header} components={layout?.components} />
        <div className="mx-auto grid max-w-7xl grid-cols-12 gap-8 px-6 py-8">
          <aside className="col-span-12 lg:col-span-3">
            <RenderZoneComponents ids={zoneComponents.sidebar} components={layout?.components} />
          </aside>
          <main className="col-span-12 lg:col-span-9">{children}</main>
        </div>
        <RenderZoneComponents ids={zoneComponents.footer} components={layout?.components} />
      </div>
    );
    return (
      <>
        <Header config={layoutConfig} />
        <div className="mx-auto grid max-w-7xl grid-cols-12 gap-8 px-6 py-8">
          <aside className="col-span-12 rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-600 shadow-theme-sm lg:col-span-3">
            <div className="font-bold text-gray-900">Documentation</div>
            <ul className="mt-4 space-y-2 font-medium"><li>Overview</li><li>Components</li><li>Layouts</li></ul>
          </aside>
          <main className="col-span-12 lg:col-span-9">{children}</main>
        </div>
        <Footer config={layoutConfig} />
      </>
    );
  }

  if (hasDesign) {
    return (
      <div>
        <RenderZoneComponents ids={zoneComponents.header} components={layout?.components} />
        {zoneComponents.sidebar.length > 0 ? (
          <div className="mx-auto grid max-w-7xl grid-cols-12 gap-8 px-6 py-8">
            <aside className={`col-span-12 ${layout?.sidebar === 'left' ? 'lg:col-span-3' : 'lg:col-span-9'} order-1`}>
              <RenderZoneComponents ids={zoneComponents.sidebar} components={layout?.components} />
            </aside>
            <main className={`col-span-12 ${layout?.sidebar === 'left' ? 'lg:col-span-9' : 'lg:col-span-3'} order-2`}>{children}</main>
          </div>
        ) : (
          <main>{children}</main>
        )}
        <RenderZoneComponents ids={zoneComponents.footer} components={layout?.components} />
      </div>
    );
  }

  return <><Header config={layoutConfig} /><main>{children}</main><Footer config={layoutConfig} /></>;
}

export function MasterLayoutRenderer({ layoutId, layoutDef, config = defaultConfig, children }: PropsWithChildren<{ layoutId: string | null; layoutDef?: MasterLayoutDefinition | null; config?: MasterLayoutConfig }>) {
  const layoutConfig = { ...defaultConfig, ...config };

  const layout = useMemo(() => {
    if (layoutDef) return layoutDef;
    if (!layoutId || layoutId === 'none') return null;
    return localStorageDb.getMasterLayoutSync(layoutId);
  }, [layoutId, layoutDef]);

  if (!layoutId || layoutId === 'none') return <>{children}</>;

  const zc = useMemo(() => getZoneComponents(layout ?? { id: layoutId } as MasterLayoutDefinition), [layout]);
  return renderShell(layout, zc, layoutConfig, children);
}