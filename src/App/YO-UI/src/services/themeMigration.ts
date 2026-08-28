/**
 * Legacy flat-token ↔ three-level token mapping (blueprint §7, §14).
 *
 * migrateLegacyConfig mirrors the SQL migration in
 * db/1.1.0/mssql/upgrade/1_0_0_to_1_1_0/002_theme_studio.sql and is used when
 * a legacy theme (or legacy export) is opened/imported before the server-side
 * migration has touched it.
 *
 * toRuntimeConfig derives the flat ParsedThemeConfig runtime view from a v2
 * config so every existing consumer (buildTokenCss, DynamicPage, page
 * builder, reflex engine) keeps working unchanged.
 */

import type { ParsedThemeConfig, ThemeTokens } from '../types/yoThemeTypes';
import type {
  MigrationSummary,
  StudioThemeConfig,
  StudioToken,
  TokenDict,
} from '../types/yoThemeStudioTypes';
import {
  accessibleActionColor,
  deriveDarkFromLight,
  generatePalette,
  isValidHex,
  mergeStandardComponents,
  STANDARD_COMPONENTS,
} from '../pages/Admin/ThemeStudio/themeUtils';

/** Known legacy color keys → semantic token paths (mirrors SQL @RoleMap). */
export const LEGACY_ROLE_MAP: Record<string, string> = {
  primary: 'color.action.primary',
  secondary: 'color.action.secondary',
  accent: 'color.accent',
  bg: 'color.background.page',
  card: 'color.background.surface',
  text: 'color.text.primary',
  muted: 'color.text.muted',
  border: 'color.border.default',
  ring: 'color.border.focus',
  success: 'color.status.success',
  warning: 'color.status.warning',
  danger: 'color.status.error',
  error: 'color.status.error',
  info: 'color.status.info',
};

const LEGACY_REQUIRED_SEMANTICS = [
  'color.background.page',
  'color.background.surface',
  'color.text.primary',
  'color.action.primary',
  'color.border.default',
];

export const isStudioConfig = (config: unknown): config is StudioThemeConfig =>
  !!config && typeof config === 'object' && (config as { version?: number }).version === 2;

/* ── Complete default token/settings set (mobile-first, responsive out of the box) ── */
const FONT_DEFAULTS: StudioThemeConfig['typography']['fonts'] = {
  body: { family: 'Inter', source: 'google', weights: [400, 500, 600] },
  heading: { family: 'Inter', source: 'google', weights: [600, 700, 800] },
  mono: { family: 'JetBrains Mono', source: 'google', weights: [400, 500] },
};

const FLUID_DEFAULTS: StudioThemeConfig['typography']['fluid'] = {
  base: '1rem',
  ratio: 1.25,
  min: 360,
  max: 1280,
};

const SPACING_DEFAULTS: Record<string, string> = {
  '0': '0', 'px': '1px',
  '0.5': '0.125rem', '1': '0.25rem', '1.5': '0.375rem', '2': '0.5rem', '2.5': '0.625rem',
  '3': '0.75rem', '3.5': '0.875rem', '4': '1rem', '5': '1.25rem', '6': '1.5rem',
  '7': '1.75rem', '8': '2rem', '9': '2.25rem', '10': '2.5rem', '11': '2.75rem', '12': '3rem',
  '14': '3.5rem', '16': '4rem', '20': '5rem', '24': '6rem', '32': '8rem',
  '40': '10rem', '48': '12rem', '64': '16rem', '96': '24rem',
  'section-padding': '4rem 1rem',
  'section-padding-md': '5rem 2rem',
  'container-max': '1280px',
  'container-padding': '1rem',
  'gap': '1.5rem',
};

const RADIUS_DEFAULTS: Record<string, string> = {
  none: '0',
  xs: '0.125rem',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  '3xl': '2rem',
  full: '9999px',
};

const SHADOW_DEFAULTS: Record<string, string> = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
};

/* Breakpoints every new theme starts with — mobile-first (min-width). */
const RESPONSIVE_DEFAULTS: StudioThemeConfig['responsive'] = {
  tablet: {
    minWidth: '768px',
    tokens: {
      'spacing.section-padding-md': { value: '4.5rem 2rem', type: 'string' },
      'spacing.container-max': { value: '720px', type: 'dimension' },
    },
  },
  desktop: {
    minWidth: '1024px',
    tokens: {
      'spacing.section-padding': { value: '5rem 2rem', type: 'string' },
      'spacing.section-padding-md': { value: '5rem 2.5rem', type: 'string' },
      'spacing.container-max': { value: '1140px', type: 'dimension' },
    },
  },
  widescreen: {
    minWidth: '1440px',
    tokens: {
      'spacing.container-max': { value: '1320px', type: 'dimension' },
    },
  },
};

export const createEmptyStudioConfig = (): StudioThemeConfig => {
  const config: StudioThemeConfig = {
    version: 2,
    appearance: { defaultMode: 'light', supportedModes: ['light', 'dark'] },
    brand: {
      primaryColor: '#6366f1',
      secondaryColor: '#0ea5e9',
      accentColor: '#f59e0b',
      primaryFont: 'Inter',
      headingFont: 'Inter',
    },
    tokens: { primitive: {}, semantic: {}, component: {} },
    typography: { fonts: { ...FONT_DEFAULTS }, fluid: { ...FLUID_DEFAULTS } },
    spacing: { scale: { ...SPACING_DEFAULTS } },
    shape: { radius: { ...RADIUS_DEFAULTS }, focus: { width: '2px', color: 'rgb(var(--c-ring))', offset: '2px' } },
    elevation: { shadows: { ...SHADOW_DEFAULTS } },
    motion: { duration: '0.2s', easing: 'cubic-bezier(0.4, 0, 0.2, 1)', reduced: false },
    components: { ...STANDARD_COMPONENTS },
    structure: {
      layoutType: 'DefaultShell',
      layoutTypes: {
        'public-website': { shell: 'DefaultShell' },
        'application-shell': { shell: 'SidebarLeftShell' },
      },
    },
    layouts: {
      'public-website': {
        name: 'Public Website',
        shell: 'DefaultShell',
        zones: { header: { order: 1 }, footer: { order: 2 } },
      },
      'application-shell': {
        name: 'Application Shell',
        shell: 'SidebarLeftShell',
        zones: { header: { order: 1 }, sidebar: { order: 2 }, footer: { order: 3 } },
      },
    },
    templates: {},
    responsive: { ...RESPONSIVE_DEFAULTS },
    scopes: {},
    assets: {},
    accessibility: {},
    extensions: {},
    customCss: '',
  };
  const { config: seeded } = seedDefaultPalette(config);
  return seeded;
};

/** Seed a fresh config with the default (indigo) palette + semantic map. */
export const seedDefaultPalette = (config: StudioThemeConfig): { config: StudioThemeConfig } => {
  const palette = generatePalette('#6366f1', 'complementary');
  const primitive = { ...config.tokens.primitive };
  const semantic = { ...config.tokens.semantic };
  Object.entries(palette.light).forEach(([key, value]) => {
    const path = `color.brand.${key}`;
    primitive[path] = {
      value,
      ...(palette.dark[key] ? { dark: palette.dark[key] } : {}),
      type: 'color',
      legacyKey: key,
    };
    const semanticPath = LEGACY_ROLE_MAP[key];
    if (semanticPath) semantic[semanticPath] = { ref: `{${path}}`, value, type: 'color' };
  });
  const withTokens = { ...config, tokens: { ...config.tokens, primitive, semantic } };
  ensurePublishableTokens(withTokens);
  return { config: withTokens };
};

/** Flat ParsedThemeConfig → v2 StudioThemeConfig. */
export const migrateLegacyConfig = (
  legacy: ParsedThemeConfig,
): { config: StudioThemeConfig; summary: MigrationSummary } => {
  const config = createEmptyStudioConfig();
  const summary: MigrationSummary = {
    recognizedTokens: 0,
    generatedPrimitives: [],
    generatedSemanticMappings: [],
    componentMappings: [],
    unknownFieldsPreserved: [],
    missingDarkModeValues: [],
    accessibilityIssues: [],
    requiresManualReview: false,
  };

  const tokens: ThemeTokens = legacy.tokens ?? ({} as ThemeTokens);

  /* colors → primitive + semantic (preserve key case — the wizard/seed uses
     camelCase palette names like cardForeground; lowercasing here created
     case-insensitive duplicates the backend linter rejects) */
  const colors = tokens.colors ?? {};
  Object.entries(colors).forEach(([key, color]) => {
    const path = `color.brand.${key}`;
    config.tokens.primitive[path] = {
      value: color.default,
      ...(color.dark ? { dark: color.dark } : {}),
      type: 'color',
      legacyKey: key,
    };
    summary.generatedPrimitives.push(path);
    summary.recognizedTokens += 1;
    if (!color.dark) summary.missingDarkModeValues.push(path);

    const semanticPath = LEGACY_ROLE_MAP[key.toLowerCase()];
    if (semanticPath) {
      config.tokens.semantic[semanticPath] = { ref: `{${path}}`, value: color.default, type: 'color' };
      summary.generatedSemanticMappings.push(`${semanticPath} → ${path}`);
    }
  });

  config.tokens.primitive['color.neutral.white'] = {
    value: '#ffffff',
    dark: '#0f172a',
    type: 'color',
  };
  config.tokens.semantic['color.text.inverse'] = {
    ref: 'color.neutral.white',
    type: 'color',
  };

  /* core component tokens — only when the referenced role exists */
  const has = (legacyKey: string) => !!colors[legacyKey];
  const componentCandidates: Array<[string, string, string | null]> = [
    ['button.primary.background', 'color.action.primary', 'primary'],
    ['button.primary.text', 'color.text.inverse', null],
    ['button.primary.border', 'color.action.primary', 'primary'],
    ['input.background', 'color.background.page', 'bg'],
    ['input.border', 'color.border.default', 'border'],
    ['input.focusBorder', 'color.border.focus', 'ring'],
    ['card.background', 'color.background.surface', 'card'],
    ['card.border', 'color.border.default', 'border'],
  ];
  componentCandidates.forEach(([path, ref, requires]) => {
    if (requires && !has(requires)) return;
    config.tokens.component[path] = { ref, type: 'color' };
    summary.componentMappings.push(`${path} → ${ref}`);
  });

  /* groups — empty/missing legacy groups keep the seeded defaults */
  if (tokens.fonts && Object.keys(tokens.fonts).length > 0) config.typography.fonts = tokens.fonts;
  if (tokens.fluid && Object.keys(tokens.fluid).length > 0) config.typography.fluid = tokens.fluid;
  if (tokens.spacing && Object.keys(tokens.spacing).length > 0) config.spacing.scale = tokens.spacing;
  if (tokens['border-radius'] && Object.keys(tokens['border-radius']).length > 0) config.shape.radius = tokens['border-radius'];
  if (tokens.shadows && Object.keys(tokens.shadows).length > 0) config.elevation.shadows = tokens.shadows;
  if (tokens.focus) {
    config.shape.focus = {
      width: tokens.focus.width ?? '2px',
      color: tokens.focus.color ?? 'rgb(var(--c-ring))',
      offset: tokens.focus.offset ?? '2px',
    };
  }
  if (tokens.motion) {
    config.motion = {
      duration: tokens.motion.duration ?? '0.2s',
      easing: tokens.motion.easing ?? 'cubic-bezier(0.4, 0, 0.2, 1)',
      ...(tokens.motion.reduced !== undefined ? { reduced: tokens.motion.reduced } : {}),
    };
  }

  config.components = legacy.components ?? {};
  config.structure = legacy.structure ?? { layoutType: 'DefaultShell', layoutTypes: {} };
  config.layouts = legacy.layouts ?? {};
  config.templates = legacy.templates ?? {};
  config.customCss = legacy.customCss ?? '';

  /* preserve unknown fields (blueprint §3) */
  const known = ['tokens', 'components', 'structure', 'layouts', 'templates', 'customCss', 'customizer', 'version'];
  Object.entries(legacy as unknown as Record<string, unknown>).forEach(([key, value]) => {
    if (!known.includes(key) && value !== undefined) {
      config.extensions[key] = value;
      summary.unknownFieldsPreserved.push(key);
    }
  });

  /* ── Completeness + accessibility pass (publish gate §84) ── */
  const pass = ensurePublishableTokens(config);
  summary.accessibilityIssues.push(...pass.darkened.map((p) => `color token "${p}" darkened to 4.5:1 white-text contrast`));
  summary.missingDarkModeValues = summary.missingDarkModeValues.filter(
    (p) => !pass.filledDark.includes(p),
  );
  summary.generatedPrimitives.push(...pass.addedPrimitives);

  summary.requiresManualReview =
    summary.missingDarkModeValues.length > 0 ||
    summary.unknownFieldsPreserved.length > 0 ||
    summary.accessibilityIssues.length > 0;

  return { config, summary };
};

export interface PublishablePassResult {
  darkened: string[];
  filledDark: string[];
  addedPrimitives: string[];
}

/**
 * Collapse case-insensitive duplicate token paths (e.g. color.brand.cardForeground
 * vs color.brand.cardforeground). The backend linter rejects such duplicates as
 * errors, and mixed-case duplicates arise when wizard-seeded camelCase palette
 * names collide with legacy lowercased keys. Keeps the first occurrence and
 * rewrites references to the removed path.
 */
export const dedupeTokenPaths = (config: StudioThemeConfig): void => {
  const groups = ['primitive', 'semantic', 'component'] as const;
  const removed = new Map<string, string>();

  groups.forEach((group) => {
    const dict = config.tokens[group];
    const seen = new Map<string, string>();
    Object.keys(dict).forEach((path) => {
      const lower = path.toLowerCase();
      const existing = seen.get(lower);
      if (existing) {
        removed.set(path, existing);
        delete dict[path];
      } else {
        seen.set(lower, path);
      }
    });
  });

  if (removed.size === 0) return;

  groups.forEach((group) => {
    const dict = config.tokens[group];
    Object.entries(dict).forEach(([path, token]) => {
      if (!token) return;
      if (typeof token.ref === 'string') {
        const target = removed.get(token.ref);
        if (target) token.ref = target;
      }
      if (typeof token.value === 'string') {
        const m = /^\{(.+)\}$/.exec(token.value);
        if (m) {
          const target = removed.get(m[1]);
          if (target) token.value = `{${target}}`;
        }
      }
      if (typeof token.dark === 'string') {
        const m = /^\{(.+)\}$/.exec(token.dark);
        if (m) {
          const target = removed.get(m[1]);
          if (target) token.dark = `{${target}}`;
        }
      }
    });
  });
};

/**
 * Guarantee a publishable token set — used by the migration and the wizard so
 * both flows pass the publish accessibility gate:
 *   1. white/black neutrals + color.text.inverse so buttons always resolve,
 *   2. status colors (success/warning/error/info) for badges/alerts,
 *   3. a dark value for EVERY color primitive (dark-mode coverage),
 *   4. action surfaces darkened until white text meets 4.5:1.
 * Idempotent: never overwrites existing values, only fills gaps.
 */
export const ensurePublishableTokens = (config: StudioThemeConfig): PublishablePassResult => {
  const result: PublishablePassResult = { darkened: [], filledDark: [], addedPrimitives: [] };
  dedupeTokenPaths(config);
  const primitive = config.tokens.primitive;

  /* 1 + 2 — guaranteed neutrals + status semantics */
  const addPrimitive = (path: string, value: string, dark: string, legacyKey?: string) => {
    if (primitive[path] && primitive[path].value) return;
    primitive[path] = { value, dark, type: 'color', ...(legacyKey ? { legacyKey } : {}) };
    result.addedPrimitives.push(path);
  };
  addPrimitive('color.neutral.white', '#ffffff', '#0f172a');
  addPrimitive('color.neutral.black', '#0f172a', '#ffffff');
  if (!config.tokens.semantic['color.text.inverse']) {
    config.tokens.semantic['color.text.inverse'] = { ref: 'color.neutral.white', type: 'color' };
  }

  const statusDefaults: Record<string, [string, string]> = {
    'color.status.success': ['#16a34a', '#4ade80'],
    'color.status.warning': ['#d97706', '#fbbf24'],
    'color.status.error': ['#dc2626', '#f87171'],
    'color.status.info': ['#0284c7', '#38bdf8'],
  };
  Object.entries(statusDefaults).forEach(([path, [light, dark]]) => {
    if (config.tokens.semantic[path]) return;
    addPrimitive(`color.brand.status.${path.split('.').pop()}`, light, dark);
    config.tokens.semantic[path] = { ref: `color.brand.status.${path.split('.').pop()}`, type: 'color' };
  });

  /* 3 — dark value for every color primitive */
  const missingDark = Object.entries(primitive).filter(([, t]) => t.type === 'color' && !t.dark);
  if (missingDark.length > 0) {
    const legacyColors: ThemeTokens['colors'] = {};
    Object.entries(primitive).forEach(([, t]) => {
      if (t.legacyKey && t.value) legacyColors[t.legacyKey] = { default: t.value, dark: t.dark };
    });
    const derived = deriveDarkFromLight(legacyColors);
    Object.entries(primitive).forEach(([path, t]) => {
      if (t.type === 'color' && !t.dark && t.legacyKey && derived[t.legacyKey]?.dark) {
        primitive[path] = { ...t, dark: derived[t.legacyKey].dark };
        result.filledDark.push(path);
      }
    });
  }

  /* 4 — action surfaces readable with white inverse text */
  const actionRoles: Array<[string, string]> = [
    ['color.action.primary', 'primary'],
    ['color.action.secondary', 'secondary'],
  ];
  actionRoles.forEach(([semanticPath, role]) => {
    const sem = config.tokens.semantic[semanticPath];
    const target = typeof sem?.ref === 'string' ? sem.ref : null;
    const tok = target ? primitive[target] : null;
    if (!tok?.value || !isValidHex(tok.value)) return;
    const fixed = accessibleActionColor(tok.value);
    if (fixed !== tok.value) {
      primitive[target!] = { ...tok, value: fixed };
      result.darkened.push(`color.action.${role}`);
    }
  });

  /* 5 — component-tier color tokens (surface refs) so the three-level token
     chain (primitive → semantic → component) isn't an empty floor for fresh
     themes. Idempotent: never overwrites an existing component token. */
  const component = config.tokens.component ?? (config.tokens.component = {});
  const hasSemantic = (path: string) => !!config.tokens.semantic[path];
  const componentCandidates: Array<[string, string]> = [
    ['button.primary.background', 'color.action.primary'],
    ['button.primary.text', 'color.text.inverse'],
    ['button.primary.border', 'color.action.primary'],
    ['input.background', 'color.background.page'],
    ['input.border', 'color.border.default'],
    ['input.focusBorder', 'color.border.focus'],
    ['card.background', 'color.background.surface'],
    ['card.border', 'color.border.default'],
  ];
  componentCandidates.forEach(([path, ref]) => {
    if (component[path]) return;
    if (!hasSemantic(ref)) return;
    component[path] = { ref, type: 'color' };
  });

  return result;
};

/** v2 StudioThemeConfig → flat ParsedThemeConfig runtime view. */
export const toRuntimeConfig = (studio: StudioThemeConfig): ParsedThemeConfig => {
  const colors: NonNullable<ParsedThemeConfig['tokens']['colors']> = {};

  Object.entries(studio.tokens?.primitive ?? {}).forEach(([, token]) => {
    if (!token?.legacyKey) return;
    colors[token.legacyKey] = {
      default: token.value ?? '',
      ...(token.dark ? { dark: token.dark } : {}),
    };
  });

  /* Responsive breakpoints → runtime CSS-variable overrides, so buildTokenCss
     (live preview + dynamic page) and both compilers agree on the media
     queries. `spacing.` paths become --spacing-*; token paths resolve to the
     legacy variables the runtime :root actually emits (--yo-* + --c-*). */
  const responsive: NonNullable<ParsedThemeConfig['tokens']['responsive']> = {};
  Object.entries(studio.responsive ?? {}).forEach(([name, bp]) => {
    if (!bp?.minWidth) return;
    const vars: Record<string, string> = {};
    Object.entries(bp.tokens ?? {}).forEach(([path, tok]) => {
      const value = tok?.value;
      if (!value) return;
      if (path.startsWith('spacing.')) {
        vars[`spacing-${path.slice('spacing.'.length)}`] = value;
        return;
      }
      const primitiveToken = studio.tokens?.primitive?.[path];
      const legacy = primitiveToken?.legacyKey;
      if (!legacy) return;
      vars[`yo-${legacy}`] = value;
      if (primitiveToken?.type === 'color') vars[`c-${legacy}`] = colorToChannels(value);
    });
    if (Object.keys(vars).length > 0) responsive[name] = { minWidth: bp.minWidth, vars };
  });

  /* A legacy theme may carry plain colors not registered as primitives */
  const result: ParsedThemeConfig = {
    appearance: studio.appearance,
    tokens: {
      colors,
      fonts: studio.typography?.fonts ?? {},
      spacing: studio.spacing?.scale ?? {},
      'border-radius': studio.shape?.radius ?? {},
      shadows: studio.elevation?.shadows ?? {},
      motion: studio.motion,
      focus: studio.shape?.focus,
      fluid: studio.typography?.fluid ?? {},
      responsive,
    },
    components: studio.components ?? {},
    structure: studio.structure ?? { layoutType: 'DefaultShell', layoutTypes: {} },
    layouts: studio.layouts ?? {},
    templates: studio.templates ?? {},
    customCss: studio.customCss,
  };
  /* Guarantee every standard .yo-* component is present for the runtime /
     page builder even when a legacy/partial config omitted them. */
  return mergeStandardComponents(result);
};

/** #rrggbb (or already channel-value) → "r g b" for the --c-* shadow vars. */
export const colorToChannels = (value: string): string => {
  if (!/^#[0-9a-fA-F]{6}$/.test(value)) return value;
  return `${parseInt(value.slice(1, 3), 16)} ${parseInt(value.slice(3, 5), 16)} ${parseInt(value.slice(5, 7), 16)}`;
};

/** Normalize any stored config payload (v1 or v2) to the runtime view. */
export const normalizeToRuntimeConfig = (config: unknown): ParsedThemeConfig => {
  if (isStudioConfig(config)) return toRuntimeConfig(config);
  return (config ?? {}) as ParsedThemeConfig;
};

/** Normalize any stored config payload to the v2 authoring model. */
export const normalizeToStudioConfig = (
  config: unknown,
): { config: StudioThemeConfig; summary: MigrationSummary | null } => {
  if (isStudioConfig(config)) {
    const c = config as StudioThemeConfig;
    if (!c.tokens) c.tokens = { primitive: {}, semantic: {}, component: {} };
    if (!c.tokens.primitive) c.tokens.primitive = {};
    if (!c.tokens.semantic) c.tokens.semantic = {};
    if (!c.tokens.component) c.tokens.component = {};
    dedupeTokenPaths(c);
    return { config: c, summary: null };
  }
  if (config && typeof config === 'object' && Object.keys(config as object).length > 0) {
    const migrated = migrateLegacyConfig(config as ParsedThemeConfig);
    return migrated;
  }
  return { config: createEmptyStudioConfig(), summary: null };
};

/** Default value + dark value editing helper. */
export const withTokenValue = (token: StudioToken | undefined, patch: Partial<StudioToken>): StudioToken => ({
  ...(token ?? {}),
  ...patch,
});

export const requiredSemanticMissing = (config: StudioThemeConfig): string[] =>
  LEGACY_REQUIRED_SEMANTICS.filter((path) => !config.tokens.semantic[path]);

/** Collect all token dicts for editor enumeration. */
export const allTokenDicts = (config: StudioThemeConfig): TokenDict[] => [
  config.tokens.primitive,
  config.tokens.semantic,
  config.tokens.component,
];
