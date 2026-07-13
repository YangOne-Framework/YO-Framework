import type { LayoutPreset, MasterLayoutDefinition } from '../types/yoPageTypes';

export const layoutPresets: LayoutPreset[] = [
  { id: 'full-row', name: 'Full Row', description: 'One full-width content room.', columns: [{ desktop: 12, tablet: 12, mobile: 12 }] },
  { id: 'two-columns', name: '2 Columns', description: 'Two equal columns in the same row.', columns: [{ desktop: 6, tablet: 6, mobile: 12 }, { desktop: 6, tablet: 6, mobile: 12 }] },
  { id: 'three-columns', name: '3 Columns', description: 'Three equal product cards or feature columns.', columns: [{ desktop: 4, tablet: 6, mobile: 12 }, { desktop: 4, tablet: 6, mobile: 12 }, { desktop: 4, tablet: 12, mobile: 12 }] },
  { id: 'four-columns', name: '4 Columns', description: 'Four compact metric/card columns.', columns: [{ desktop: 3, tablet: 6, mobile: 12 }, { desktop: 3, tablet: 6, mobile: 12 }, { desktop: 3, tablet: 6, mobile: 12 }, { desktop: 3, tablet: 6, mobile: 12 }] },
  { id: 'two-by-two', name: '2 × 2 Grid', description: 'Four rooms arranged as two columns and two rows.', columns: [{ desktop: 6, tablet: 6, mobile: 12 }, { desktop: 6, tablet: 6, mobile: 12 }, { desktop: 6, tablet: 6, mobile: 12 }, { desktop: 6, tablet: 6, mobile: 12 }] },
  { id: 'one-two', name: '1 : 2', description: 'Narrow left, wider right.', columns: [{ desktop: 4, tablet: 5, mobile: 12 }, { desktop: 8, tablet: 7, mobile: 12 }] },
  { id: 'two-one', name: '2 : 1', description: 'Wider left, narrow right.', columns: [{ desktop: 8, tablet: 7, mobile: 12 }, { desktop: 4, tablet: 5, mobile: 12 }] },
  { id: 'one-three', name: '1 : 3', description: 'Quarter left and three-quarter right.', columns: [{ desktop: 3, tablet: 4, mobile: 12 }, { desktop: 9, tablet: 8, mobile: 12 }] },
  { id: 'three-one', name: '3 : 1', description: 'Three-quarter left and quarter right.', columns: [{ desktop: 9, tablet: 8, mobile: 12 }, { desktop: 3, tablet: 4, mobile: 12 }] },
  { id: 'one-five', name: '1 : 5', description: 'Slim supporting column and dominant content area.', columns: [{ desktop: 2, tablet: 3, mobile: 12 }, { desktop: 10, tablet: 9, mobile: 12 }] },
  { id: 'five-one', name: '5 : 1', description: 'Dominant content area and slim supporting column.', columns: [{ desktop: 10, tablet: 9, mobile: 12 }, { desktop: 2, tablet: 3, mobile: 12 }] },
  { id: 'two-three', name: '2 : 3', description: 'Balanced asymmetric product section.', columns: [{ desktop: 5, tablet: 6, mobile: 12 }, { desktop: 7, tablet: 6, mobile: 12 }] },
  { id: 'three-two', name: '3 : 2', description: 'Balanced asymmetric editorial/product section.', columns: [{ desktop: 7, tablet: 6, mobile: 12 }, { desktop: 5, tablet: 6, mobile: 12 }] },
  { id: 'split-center', name: '2 : 8 : 2', description: 'Centered content with narrow side rooms.', columns: [{ desktop: 2, tablet: 12, mobile: 12 }, { desktop: 8, tablet: 12, mobile: 12 }, { desktop: 2, tablet: 12, mobile: 12 }] },
  { id: 'sidebar-content', name: 'Sidebar + Content', description: 'Navigation/filter column with content area.', columns: [{ desktop: 3, tablet: 4, mobile: 12 }, { desktop: 9, tablet: 8, mobile: 12 }] },
  { id: 'content-sidebar', name: 'Content + Sidebar', description: 'Content area with secondary right rail.', columns: [{ desktop: 9, tablet: 8, mobile: 12 }, { desktop: 3, tablet: 4, mobile: 12 }] }
];

export const masterLayouts: MasterLayoutDefinition[] = [
  { id: 'none', name: 'Standalone / No Master', description: 'Only page content is rendered.', hasHeader: false, hasFooter: false, sidebar: 'none' },
  { id: 'default-site', name: 'Default Website', description: 'Editable header and footer around page content.', hasHeader: true, hasFooter: true, sidebar: 'none' },
  { id: 'landing', name: 'Landing Page', description: 'Minimal campaign layout with compact nav.', hasHeader: true, hasFooter: true, sidebar: 'none' },
  { id: 'docs-left-sidebar', name: 'Docs Left Sidebar', description: 'Header, footer, and editable left sidebar shell.', hasHeader: true, hasFooter: true, sidebar: 'left' }
];
