import type { YoComponentDefinition } from '../types/yoPageTypes';
import { ButtonRenderer, CardGridRenderer, HeadingRenderer, HeroRenderer, ImageRenderer, LayoutFooterRenderer, LayoutHeaderRenderer, LayoutSidebarRenderer, SpacerRenderer, TextRenderer } from '../components/studio/Renderers';

export const componentRegistry: Record<string, YoComponentDefinition> = {
  heading: {
    type: 'heading',
    label: 'Heading',
    group: 'Basic',
    description: 'Page or section heading text.',
    defaultConfig: { text: 'New Heading', level: 'h2' },
    defaultStyle: { padding: 'none', margin: 'none', align: 'left', borderRadius: 'none', shadow: 'none' },
    configSchema: [
      { key: 'text', label: 'Text', type: 'text', required: true, defaultValue: 'New Heading' },
      { key: 'level', label: 'Level', type: 'select', defaultValue: 'h2', options: [
        { label: 'H1', value: 'h1' }, { label: 'H2', value: 'h2' }, { label: 'H3', value: 'h3' }, { label: 'H4', value: 'h4' }
      ] }
    ],
    renderer: HeadingRenderer
  },
  text: {
    type: 'text',
    label: 'Rich Text',
    group: 'Basic',
    description: 'HTML capable text block.',
    defaultConfig: { body: '<p>Write useful content for your visitors here.</p>' },
    defaultStyle: { padding: 'none', margin: 'none', align: 'left', borderRadius: 'none', shadow: 'none' },
    configSchema: [
      { key: 'body', label: 'Body HTML', type: 'richtext', required: true, defaultValue: '<p>Write useful content for your visitors here.</p>' }
    ],
    renderer: TextRenderer
  },
  button: {
    type: 'button',
    label: 'Button',
    group: 'Basic',
    description: 'CTA button with URL.',
    defaultConfig: { label: 'Click here', url: '#', variant: 'primary' },
    defaultStyle: { padding: 'none', margin: 'none', align: 'left', borderRadius: 'none', shadow: 'none' },
    configSchema: [
      { key: 'label', label: 'Label', type: 'text', required: true, defaultValue: 'Click here' },
      { key: 'url', label: 'URL', type: 'url', defaultValue: '#' },
      { key: 'variant', label: 'Variant', type: 'select', defaultValue: 'primary', options: [
        { label: 'Primary', value: 'primary' }, { label: 'Secondary', value: 'secondary' }, { label: 'Ghost', value: 'ghost' }
      ] }
    ],
    renderer: ButtonRenderer
  },
  image: {
    type: 'image',
    label: 'Image',
    group: 'Media',
    description: 'Responsive image with caption.',
    defaultConfig: { src: '', alt: 'Content image', caption: '', objectFit: 'cover' },
    defaultStyle: { padding: 'none', margin: 'none', align: 'left', borderRadius: 'none', shadow: 'none' },
    configSchema: [
      { key: 'src', label: 'Image URL', type: 'image', required: true },
      { key: 'alt', label: 'Alt Text', type: 'text' },
      { key: 'caption', label: 'Caption', type: 'text' },
      { key: 'objectFit', label: 'Fit', type: 'select', options: [{ label: 'Cover', value: 'cover' }, { label: 'Contain', value: 'contain' }], defaultValue: 'cover' }
    ],
    renderer: ImageRenderer
  },
  hero: {
    type: 'hero',
    label: 'Hero Section',
    group: 'Marketing',
    description: 'Landing page hero with CTA.',
    defaultConfig: { eyebrow: 'CMS Studio', title: 'Build pages visually', subtitle: 'Create production-ready content with reusable components.', ctaLabel: 'Learn More', ctaUrl: '#', backgroundImage: '' },
    defaultStyle: { padding: 'none', margin: 'none', align: 'left', borderRadius: 'xl', shadow: 'none' },
    configSchema: [
      { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
      { key: 'ctaLabel', label: 'CTA Label', type: 'text' },
      { key: 'ctaUrl', label: 'CTA URL', type: 'url' },
      { key: 'backgroundImage', label: 'Background Image URL', type: 'image' }
    ],
    renderer: HeroRenderer
  },
  cardGrid: {
    type: 'cardGrid',
    label: 'Card Grid',
    group: 'Marketing',
    description: 'Three-card feature grid.',
    defaultConfig: { items: [
      { title: 'Visual Builder', body: 'Drag content into sections.' },
      { title: 'Dynamic Config', body: 'Render settings from schema.' },
      { title: 'Publish JSON', body: 'Save and render from localStorage now.' }
    ] },
    defaultStyle: { padding: 'none', margin: 'none', align: 'left', borderRadius: 'none', shadow: 'none' },
    configSchema: [
      { key: 'items', label: 'Cards JSON', type: 'textarea', helpText: 'Array of { title, body }. JSON is parsed automatically.' }
    ],
    renderer: CardGridRenderer
  },
  spacer: {
    type: 'spacer',
    label: 'Spacer',
    group: 'Layout',
    description: 'Vertical space block.',
    defaultConfig: { height: 48 },
    defaultStyle: { padding: 'none', margin: 'none', align: 'left', borderRadius: 'none', shadow: 'none' },
    configSchema: [
      { key: 'height', label: 'Height', type: 'number', min: 8, max: 240, defaultValue: 48 }
    ],
    renderer: SpacerRenderer
  },
  'layout-header': {
    type: 'layout-header',
    label: 'Header',
    group: 'Layout',
    description: 'Site header with logo, navigation, and CTA.',
    defaultConfig: {
      logoUrl: '', logoAlt: 'Logo',
      brandName: 'SiteName',
      navItems: [{ label: 'Home', url: '/' }, { label: 'About', url: '/about' }, { label: 'Services', url: '/services', children: [{ label: 'Web', url: '/services/web' }, { label: 'Mobile', url: '/services/mobile' }] }, { label: 'Contact', url: '/contact' }],
      ctaLabel: 'Get started', ctaUrl: '#', ctaVariant: 'primary',
      headerStyle: 'glass'
    },
    defaultStyle: { padding: 'none', margin: 'none', align: 'left', borderRadius: 'none', shadow: 'none' },
    configSchema: [
      { key: 'logoUrl', label: 'Logo URL', type: 'image', helpText: 'Upload or paste logo image URL', defaultValue: '' },
      { key: 'logoAlt', label: 'Logo alt text', type: 'text', defaultValue: 'Logo' },
      { key: 'brandName', label: 'Brand name (fallback)', type: 'text', helpText: 'Shown when no logo is set', defaultValue: 'SiteName' },
      { key: 'navItems', label: 'Menu items (JSON)', type: 'textarea', helpText: 'Array of { label, url, children: [{ label, url }] }', defaultValue: JSON.stringify([{ label: 'Home', url: '/' }, { label: 'About', url: '/about' }, { label: 'Services', url: '/services', children: [{ label: 'Web', url: '/services/web' }, { label: 'Mobile', url: '/services/mobile' }] }, { label: 'Contact', url: '/contact' }], null, 2) },
      { key: 'ctaLabel', label: 'CTA label', type: 'text', defaultValue: 'Get started' },
      { key: 'ctaUrl', label: 'CTA URL', type: 'url', defaultValue: '#' },
      { key: 'ctaVariant', label: 'CTA style', type: 'select', defaultValue: 'primary', options: [
        { label: 'Primary (dark)', value: 'primary' }, { label: 'Outline', value: 'outline' }, { label: 'Ghost', value: 'ghost' }
      ] },
      { key: 'headerStyle', label: 'Header style', type: 'select', defaultValue: 'glass', options: [
        { label: 'Clean', value: 'clean' }, { label: 'Glass', value: 'glass' }, { label: 'Dark', value: 'dark' }
      ] }
    ],
    renderer: LayoutHeaderRenderer
  },
  'layout-footer': {
    type: 'layout-footer',
    label: 'Footer',
    group: 'Layout',
    description: 'Site footer with logo, links, and socials.',
    defaultConfig: {
      logoUrl: '', logoAlt: 'Logo', brandName: 'SiteName',
      description: 'Building digital experiences since 2024.',
      position: 'center',
      quickLinks: [{ label: 'Privacy', url: '/privacy' }, { label: 'Terms', url: '/terms' }, { label: 'Support', url: '/support' }],
      socialLinks: [{ platform: 'Twitter', url: 'https://twitter.com', enabled: true }, { platform: 'GitHub', url: 'https://github.com', enabled: true }],
      footerText: ''
    },
    defaultStyle: { padding: 'none', margin: 'none', align: 'left', borderRadius: 'none', shadow: 'none' },
    configSchema: [
      { key: 'logoUrl', label: 'Logo URL', type: 'image', helpText: 'Upload or paste logo image URL', defaultValue: '' },
      { key: 'logoAlt', label: 'Logo alt text', type: 'text', defaultValue: 'Logo' },
      { key: 'brandName', label: 'Brand name (fallback)', type: 'text', helpText: 'Shown when no logo is set', defaultValue: 'SiteName' },
      { key: 'description', label: 'Description', type: 'textarea', defaultValue: '' },
      { key: 'position', label: 'Content position', type: 'select', defaultValue: 'center', options: [
        { label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }
      ] },
      { key: 'quickLinks', label: 'Quick links (JSON)', type: 'textarea', helpText: 'Array of { label, url }', defaultValue: JSON.stringify([{ label: 'Privacy', url: '/privacy' }, { label: 'Terms', url: '/terms' }, { label: 'Support', url: '/support' }], null, 2) },
      { key: 'socialLinks', label: 'Social links (JSON)', type: 'textarea', helpText: 'Array of { platform, url, enabled }', defaultValue: JSON.stringify([{ platform: 'Twitter', url: 'https://twitter.com', enabled: true }, { platform: 'GitHub', url: 'https://github.com', enabled: true }], null, 2) },
      { key: 'footerText', label: 'Copyright text', type: 'text', helpText: 'Leave empty for auto copyright', defaultValue: '' }
    ],
    renderer: LayoutFooterRenderer
  },
  'layout-sidebar': {
    type: 'layout-sidebar',
    label: 'Sidebar',
    group: 'Layout',
    description: 'Navigation sidebar with menu items.',
    defaultConfig: { title: 'Navigation', items: [{ label: 'Overview' }, { label: 'Components' }, { label: 'Layouts' }] },
    defaultStyle: { padding: 'none', margin: 'none', align: 'left', borderRadius: 'none', shadow: 'none' },
    configSchema: [
      { key: 'title', label: 'Title', type: 'text', defaultValue: 'Navigation' },
      { key: 'items', label: 'Menu items JSON', type: 'textarea', helpText: 'Array of { label }. JSON is parsed automatically.', defaultValue: JSON.stringify([{ label: 'Overview' }, { label: 'Components' }, { label: 'Layouts' }]) }
    ],
    renderer: LayoutSidebarRenderer
  }
};

export const componentDefinitions = Object.values(componentRegistry);

export function registerDynamicDefinition(def: YoComponentDefinition) {
  if (componentRegistry[def.type]) return;
  componentRegistry[def.type] = def;
  componentDefinitions.push(def);
}
