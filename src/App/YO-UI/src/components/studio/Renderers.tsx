import type { CSSProperties } from "react";
import type { YoRendererProps } from '../../types/yoPageTypes';
import { componentInlineStyle, componentStyleClasses } from '../../utils/style';
import { resolveImageUrl } from '../../utils/image';
import { useStudioTheme } from '../../context/StudioThemeContext';

function wrapperClasses(base: string, style: YoRendererProps['style']) {
  return `${base} ${componentStyleClasses(style)}`;
}

/* ── Typography ──────────────────────────────────────────── */
export function HeadingRenderer({ config, style }: YoRendererProps) {
  const text = String(config.text ?? 'Heading');
  const level = String(config.level ?? 'h2');
  const headingClass =
    level === 'h1' ? 'yo-heading-1'
      : level === 'h3' || level === 'h4' ? 'yo-heading-3'
        : 'yo-heading-2';
  const className = wrapperClasses(headingClass, style);
  const inlineStyle = componentInlineStyle(style);
  if (level === 'h1') return <h1 className={className} style={inlineStyle}>{text}</h1>;
  if (level === 'h3') return <h3 className={className} style={inlineStyle}>{text}</h3>;
  if (level === 'h4') return <h4 className={className} style={inlineStyle}>{text}</h4>;
  return <h2 className={className} style={inlineStyle}>{text}</h2>;
}

export function TextRenderer({ config, style }: YoRendererProps) {
  return (
    <div
      className={wrapperClasses('yo-body prose-headings:font-[var(--font-heading)] max-w-none leading-7', style)}
      style={componentInlineStyle(style)}
      dangerouslySetInnerHTML={{ __html: String(config.body ?? 'Write your content here.') }}
    />
  );
}

/* ── Button ──────────────────────────────────────────────── */
export function ButtonRenderer({ config, style }: YoRendererProps) {
  const variant = String(config.variant ?? 'primary');
  const variantClass =
    variant === 'secondary' ? 'yo-btn yo-btn-secondary'
      : variant === 'ghost' ? 'yo-btn yo-btn-text'
        : 'yo-btn yo-btn-primary';
  const { resolveComponent } = useStudioTheme();
  const variantExtra = resolveComponent('button').classes;
  return (
    <div className={componentStyleClasses(style)} style={componentInlineStyle(style)}>
      <a href={String(config.url ?? '#')} className={`${variantClass} ${variantExtra} no-underline`}>
        {String(config.label ?? 'Click here')}
      </a>
    </div>
  );
}

/* ── Image ───────────────────────────────────────────────── */
export function ImageRenderer({ config, style }: YoRendererProps) {
  const src = resolveImageUrl(config.src || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop');
  const alt = String(config.alt ?? 'Content image');
  const objectFit = String(config.objectFit ?? 'cover');
  const width = config.width ? String(config.width) : undefined;
  const height = config.height ? String(config.height) : undefined;
  const sized = Boolean(width || height);
  return (
    <figure className={componentStyleClasses(style)} style={componentInlineStyle(style)}>
      <img
        src={src}
        alt={alt}
        style={sized ? { width, height, objectFit: objectFit as CSSProperties['objectFit'] } : undefined}
        className={`${sized ? '' : 'w-full'} ${objectFit === 'contain' ? 'object-contain' : 'object-cover'} rounded-[var(--radius-lg,0.75rem)]`}
      />
      {config.caption ? <figcaption className="mt-2 text-sm" style={{ color: 'rgb(var(--c-muted))' }}>{String(config.caption)}</figcaption> : null}
    </figure>
  );
}

/* ── Hero ────────────────────────────────────────────────── */
export function HeroRenderer({ config, style }: YoRendererProps) {
  const backgroundImage = String(config.backgroundImage ?? '');
  const hasImage = Boolean(backgroundImage);

  const heroStyle: CSSProperties = {
    ...componentInlineStyle(style),
    backgroundColor: 'var(--yo-card, #ffffff)',
    color: 'var(--yo-cardForeground, rgb(var(--c-text)))',
    border: '1px solid rgb(var(--c-border))',
    fontFamily: 'var(--font-body, system-ui, sans-serif)',
  };

  const titleClass = hasImage ? 'text-5xl font-bold tracking-tight text-white' : 'yo-heading-1';
  const subColor = hasImage ? '#cbd5e1' : 'rgb(var(--c-muted))';
  const eyebrowColor = hasImage ? '#e2e8f0' : 'rgb(var(--c-primary))';

  if (hasImage) {
    heroStyle.backgroundImage = `linear-gradient(rgba(2,6,23,.6),rgba(2,6,23,.6)), url(${resolveImageUrl(backgroundImage)})`;
    heroStyle.backgroundColor = 'transparent';
    heroStyle.border = 'none';
    heroStyle.backgroundSize = 'cover';
    heroStyle.backgroundPosition = 'center';
  }

  return (
    <section className={wrapperClasses('yo-section relative overflow-hidden rounded-2xl', style)} style={heroStyle}>
      <div className="max-w-3xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ color: eyebrowColor }}>{String(config.eyebrow ?? 'CMS Studio')}</p>
        <h1 className={titleClass}>{String(config.title ?? 'Build dynamic pages visually')}</h1>
        <p className="mt-5 text-lg leading-8" style={{ color: subColor }}>{String(config.subtitle ?? 'Drag components, configure content, apply animations, and publish structured JSON pages.')}</p>
        <div className="mt-8">
          <a href={String(config.ctaUrl ?? '#')} className="yo-btn yo-btn-primary no-underline">{String(config.ctaLabel ?? 'Get Started')}</a>
        </div>
      </div>
    </section>
  );
}

/* ── Card Grid ───────────────────────────────────────────── */
export function CardGridRenderer({ config, style }: YoRendererProps) {
  const { resolveComponent } = useStudioTheme();
  const cardVariantClasses = resolveComponent('card').classes;
  const rawItems = Array.isArray(config.items) ? config.items : [];
  const items = rawItems.length > 0 ? rawItems : [
    { title: 'Visual Editor', body: 'Compose pages from reusable content blocks.' },
    { title: 'JSON Config', body: 'Each block owns schema-driven settings.' },
    { title: 'Runtime Renderer', body: 'Render saved JSON safely on public routes.' }
  ];
  return (
    <div className={componentStyleClasses(style)} style={componentInlineStyle(style)}>
        <div className="yo-grid yo-grid-cols-2 md:yo-grid-cols-3">
        {items.map((item: any, index: number) => (
          <div key={index} className={`yo-card yo-card-hover ${cardVariantClasses}`}>
            <div className="yo-card-body">
              <div className="yo-badge yo-badge-primary mb-3">{index + 1}</div>
              <h3 className="text-lg font-semibold" style={{ color: 'rgb(var(--c-text))' }}>{String(item.title ?? 'Card')}</h3>
              <p className="mt-2 text-sm leading-6" style={{ color: 'rgb(var(--c-muted))' }}>{String(item.body ?? '')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Spacer ──────────────────────────────────────────────── */
export function SpacerRenderer({ config, style }: YoRendererProps) {
  const height = Number(config.height ?? 48);
  return <div className={componentStyleClasses(style)} style={{ ...componentInlineStyle(style), height }} />;
}

/* ── Navigation Menu ────────────────────────────────────── */
function MenuItem({ item, depth = 0 }: { item: any; depth?: number }) {
  const hasChildren = item.children && Array.isArray(item.children) && item.children.length > 0;
  return (
    <li className="relative group">
      <a href={item.url ?? '#'}
        className="block whitespace-nowrap px-3 py-2 text-sm font-medium rounded-lg text-[rgb(var(--c-muted))] transition hover:bg-[color-mix(in_srgb,rgb(var(--c-text))_8%,transparent)] hover:text-[rgb(var(--c-text))]">
        {item.label ?? 'Link'}
        {hasChildren && <span className="ml-1 inline-block text-xs">{'▼'}</span>}
      </a>
      {hasChildren && (
        <ul className="absolute left-0 top-full z-50 hidden min-w-44 space-y-1 rounded-xl border p-2 shadow-lg group-hover:block bg-[var(--yo-card)] border-[rgb(var(--c-border))]">
          {item.children.map((child: any, ci: number) => (
            <li key={ci}>
              <a href={child.url ?? '#'}
                className="block rounded-lg px-3 py-2 text-sm font-medium transition text-[rgb(var(--c-muted))] hover:bg-[color-mix(in_srgb,rgb(var(--c-text))_8%,transparent)] hover:text-[rgb(var(--c-text))]">
                {child.label ?? 'Link'}
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/* ── Layout: Header ──────────────────────────────────────── */
export function LayoutHeaderRenderer({ config, style }: YoRendererProps) {
  const logoUrl = String(config.logoUrl ?? '');
  const logoAlt = String(config.logoAlt ?? 'Logo');
  const brandName = String(config.brandName ?? 'SiteName');
  const rawNav = typeof config.navItems === 'string' ? safeJsonParse(config.navItems) : config.navItems;
  const nav = Array.isArray(rawNav) ? rawNav : [];
  const ctaLabel = String(config.ctaLabel ?? '');
  const ctaUrl = String(config.ctaUrl ?? '#');
  const ctaVariant = String(config.ctaVariant ?? 'primary');
  const ctaClass = ctaVariant === 'outline'
    ? 'yo-btn yo-btn-outline'
    : ctaVariant === 'ghost'
      ? 'yo-btn yo-btn-text'
      : 'yo-btn yo-btn-primary';
  return (
    <div className={componentStyleClasses(style)} style={componentInlineStyle(style)}>
      <header className="yo-navbar sticky top-0 z-20 backdrop-blur-xl bg-[color-mix(in_srgb,var(--yo-card)_88%,transparent)]">
        <div className="yo-container flex items-center justify-between gap-5">
          <div className="yo-navbar-brand flex items-center gap-3">
            {logoUrl ? (
              <img src={resolveImageUrl(logoUrl)} alt={logoAlt} className="h-9 w-auto rounded" />
            ) : (
              <>{brandName}</>
            )}
          </div>
          <nav className="hidden gap-1 text-sm font-medium md:flex">
            <ul className="flex items-center gap-1">{nav.map((item: any, i: number) => <MenuItem key={i} item={item} />)}</ul>
          </nav>
          {ctaLabel ? <a href={ctaUrl} className={`${ctaClass} no-underline`}>{ctaLabel}</a> : <span />}
        </div>
      </header>
    </div>
  );
}

/* ── Layout: Footer ──────────────────────────────────────── */
export function LayoutFooterRenderer({ config, style }: YoRendererProps) {
  const logoUrl = String(config.logoUrl ?? '');
  const logoAlt = String(config.logoAlt ?? 'Logo');
  const brandName = String(config.brandName ?? 'SiteName');
  const description = String(config.description ?? '');
  const position = String(config.position ?? 'center');
  const rawLinks = typeof config.quickLinks === 'string' ? safeJsonParse(config.quickLinks) : config.quickLinks;
  const quickLinks = Array.isArray(rawLinks) ? rawLinks : [];
  const rawSocials = typeof config.socialLinks === 'string' ? safeJsonParse(config.socialLinks) : config.socialLinks;
  const socialLinks = Array.isArray(rawSocials) ? rawSocials : [];
  const footerText = String(config.footerText ?? '');
  const displayText = footerText || `© ${new Date().getFullYear()} ${brandName}`;

  const justify = position === 'left' ? 'justify-start' : position === 'right' ? 'justify-end' : 'justify-center';
  const textAlign = position === 'left' ? 'text-left' : position === 'right' ? 'text-right' : 'text-center';

  return (
    <div className={componentStyleClasses(style)} style={componentInlineStyle(style)}>
      <footer className="yo-footer">
        <div className={`yo-container flex flex-col items-center gap-8 ${textAlign} md:flex-row md:flex-wrap md:${justify} md:items-start`}>
          <div className="max-w-sm space-y-3">
            {logoUrl ? <img src={resolveImageUrl(logoUrl)} alt={logoAlt} className="h-9 w-auto rounded" /> : <div className="font-bold text-[rgb(var(--c-text))]">{brandName}</div>}
            {description && <p className="text-sm leading-6" style={{ color: 'rgb(var(--c-muted))' }}>{description}</p>}
          </div>
          {quickLinks.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--c-text))' }}>Quick Links</p>
              <ul className="space-y-1.5">
                {quickLinks.map((link: any, i: number) => (
                  <li key={i}><a href={link.url ?? '#'} className="yo-footer-link">{link.label ?? 'Link'}</a></li>
                ))}
              </ul>
            </div>
          )}
          {socialLinks.filter((s: any) => s.enabled !== false).length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--c-text))' }}>Follow Us</p>
              <div className="flex flex-wrap gap-2">
                {socialLinks.filter((s: any) => s.enabled !== false).map((s: any, i: number) => (
                  <a key={i} href={s.url ?? '#'} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[rgb(var(--c-border))] bg-[color-mix(in_srgb,rgb(var(--c-text))_4%,transparent)] px-3 py-1.5 text-sm text-[rgb(var(--c-text))] hover:bg-[color-mix(in_srgb,rgb(var(--c-text))_8%,transparent)] transition">
                    <SocialIcon platform={s.platform} />
                    {s.platform ?? 'Link'}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className={`yo-container mt-8 border-t pt-6 border-[rgb(var(--c-border))] ${textAlign}`}>
          <p className="text-sm" style={{ color: 'rgb(var(--c-muted))' }}>{displayText}</p>
        </div>
      </footer>
    </div>
  );
}

/* ── Layout: Sidebar ─────────────────────────────────────── */
export function LayoutSidebarRenderer({ config, style }: YoRendererProps) {
  const items = Array.isArray(config.items) ? config.items : ['Overview', 'Components', 'Layouts'];
  const title = String(config.title ?? 'Navigation');
  return (
    <div className={componentStyleClasses(style)} style={componentInlineStyle(style)}>
      <aside className="yo-sidebar h-full">
        <div className="font-bold text-[var(--yo-sidebarForeground,rgb(var(--c-text)))]">{title}</div>
        <ul className="mt-4 space-y-2 font-medium">
          {items.map((item: any, i: number) => <li key={i} className="yo-sidebar-item">{String(item?.label ?? item ?? '')}</li>)}
        </ul>
      </aside>
    </div>
  );
}

/* ── HTML Component ──────────────────────────────────────── */
const SOCIAL_ICONS: Record<string, string> = {
  Twitter: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  GitHub: "M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z",
  LinkedIn: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  Facebook: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  Instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  YouTube: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  Discord: "M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z",
  TikTok: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  Website: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
};

function SocialIcon({ platform, className = "h-4 w-4" }: { platform: string; className?: string }) {
  const path = SOCIAL_ICONS[platform];
  if (!path) return <span className="text-xs font-medium">{platform.slice(0, 2)}</span>;
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d={path} /></svg>;
}

export function HtmlComponentRenderer({ config, style }: YoRendererProps) {
  const template = config.__htmlTemplate as string ?? '';
  if (!template) {
    return <div className={componentStyleClasses(style)} style={componentInlineStyle(style)}>
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-sm text-gray-400 dark:border-gray-600 dark:bg-gray-800">HTML Component</div>
    </div>;
  }

  const rendered = renderHtmlTemplate(template, config);
  return (
    <div className={componentStyleClasses(style)} style={componentInlineStyle(style)}>
      <div dangerouslySetInnerHTML={{ __html: rendered }} />
    </div>
  );
}

function safeJsonParse(value: string): unknown {
  try { return JSON.parse(value); } catch { return value; }
}

function renderHtmlTemplate(template: string, config: Record<string, unknown>): string {
  let html = template;

  // Handle {{#if content/settings.key}}...{{else}}...{{/if}} (single-level, non-nested)
  html = html.replace(/\{\{#if\s+(?:content|settings)\.([a-zA-Z0-9_]+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g, (_match, key, ifBlock, elseBlock) => {
    const value = config[key];
    const isTruthy = value && value !== 'false' && value !== '0';
    return isTruthy ? ifBlock : (elseBlock ?? '');
  });

  // Remove {{#each}} blocks (simplified: don't iterate in preview)
  html = html.replace(/\{\{#each\s+content\.([a-zA-Z0-9_]+)\}\}[\s\S]*?\{\{\/each\}\}/g, '');

  // Replace {{content.key}} and {{settings.key}} with config values
  html = html.replace(/\{\{(?:content|settings)\.([a-zA-Z0-9_]+)\}\}/g, (_match, key) => {
    const val = config[key];
    if (val === undefined || val === null) return '';
    return String(val);
  });

  return html;
}
