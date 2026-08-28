/**
 * Client-side YOTheme Studio compiler (blueprint §20) — full fidelity.
 *
 * The output has two layers:
 *   1. Token layer — systematic three-level token variables
 *      (--yo-color-brand-primary, semantic/component chains), appearance-mode
 *      blocks, scoped selectors and responsive rules. Mirrors YOThemeCompiler.cs
 *      so /compile and studio preview agree.
 *   2. Component layer — the existing .yo-* class contract, produced by
 *      buildTokenCss from the derived runtime view so legacy themes and
 *      migrated themes emit byte-compatible output.
 */

import { buildTokenCss } from './runtimeThemeCss';
import type { ParsedThemeConfig } from '../types/yoThemeTypes';
import type {
  StudioThemeConfig,
  StudioToken,
  ValidationItem,
} from '../types/yoThemeStudioTypes';
import { toRuntimeConfig } from './themeMigration';
import { contrastRatio } from '../pages/Admin/ThemeStudio/themeUtils';

export interface ResolvedToken {
  value?: string;
  dark?: string;
  isColor: boolean;
}

export interface StudioCompileOutput {
  css: string;
  variablesCss: string;
  criticalCss: string;
  resolvedTokens: Record<string, string>;
  validation: ValidationItem[];
  sizeBytes: number;
  success: boolean;
}

const REF_RE = /^\{(.+)\}$/;
const TOKEN_NAME_RE = /^[a-z][a-z0-9-]*(\.[a-zA-Z][a-zA-Z0-9-]*)+$/;
const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const REQUIRED_SEMANTIC_TOKENS = [
  'color.background.page',
  'color.background.surface',
  'color.text.primary',
  'color.action.primary',
  'color.border.default',
];

const item = (
  Type: string,
  Severity: ValidationItem['Severity'],
  Section: string,
  PropertyPath: string | null,
  Message: string,
  SuggestedFix?: string | null,
): ValidationItem => ({ Type, Severity, Section, PropertyPath, Message, SuggestedFix: SuggestedFix ?? undefined });

export const tokenVarName = (path: string): string => path.replace(/\./g, '-').toLowerCase();

const rgbChannels = (hex: string): string => {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return '0 0 0';
  return `${parseInt(h.slice(0, 2), 16)} ${parseInt(h.slice(2, 4), 16)} ${parseInt(h.slice(4, 6), 16)}`;
};

/* ── Reference resolution with circular detection (mirrors C#) ── */

export const resolveTokens = (
  config: StudioThemeConfig,
): { resolved: Map<string, ResolvedToken>; validation: ValidationItem[] } => {
  const validation: ValidationItem[] = [];
  const all = new Map<string, StudioToken>();
  const tokens = config?.tokens ?? { primitive: {}, semantic: {}, component: {} };
  const primitive = tokens.primitive ?? {};
  const semantic = tokens.semantic ?? {};
  const component = tokens.component ?? {};
  [primitive, semantic, component].forEach((dict) => {
    Object.entries(dict ?? {}).forEach(([path, token]) => all.set(path, token));
  });

  const resolved = new Map<string, ResolvedToken>();

  const resolveOne = (path: string, stack: string[]): void => {
    if (resolved.has(path)) return;
    if (stack.includes(path)) {
      validation.push(
        item('reference', 'error', 'tokens', path,
          `Circular token reference detected: ${[...stack, path].join(' → ')}.`,
          'Break the reference cycle.'),
      );
      resolved.set(path, { isColor: false });
      return;
    }
    const raw = all.get(path);
    if (!raw) {
      validation.push(
        item('reference', 'error', 'tokens', path,
          `Token reference "${path}" could not be resolved.`,
          'Create the missing token or fix the reference.'),
      );
      resolved.set(path, { isColor: false });
      return;
    }

    const resolveTarget = (target: string): ResolvedToken | undefined => {
      const targetPath = REF_RE.exec(target)?.[1] ?? target;
      resolveOne(targetPath, [...stack, path]);
      return resolved.get(targetPath);
    };

    if (raw.ref) {
      const target = resolveTarget(raw.ref);
      resolved.set(path, {
        value: raw.value ?? target?.value,
        dark: raw.dark ?? target?.dark,
        isColor: raw.type === 'color' || target?.isColor || HEX_RE.test(raw.value ?? ''),
      });
      return;
    }

    resolved.set(path, {
      value: raw.value,
      dark: raw.dark,
      isColor: raw.type === 'color' || HEX_RE.test(raw.value ?? ''),
    });
  };

  [...all.keys()].forEach((path) => resolveOne(path, []));
  return { resolved, validation };
};

/* ── Custom CSS sanitization (§66) ── */

export const sanitizeCustomCss = (
  css: string,
): { css: string; validation: ValidationItem[] } => {
  const validation: ValidationItem[] = [];
  if (!css?.trim()) return { css: '', validation };

  const unsafe: Array<[RegExp, string]> = [
    [/@import/i, 'External imports are blocked'],
    [/url\(\s*['"]?https?:\/\//i, 'External url() references are blocked'],
    [/expression\(/i, 'CSS expressions are not allowed'],
    [/javascript:/i, 'javascript: URLs are not allowed'],
    [/behavior\s*:/i, 'IE behavior property is not allowed'],
  ];

  const kept = css.split('\n').filter((line) => {
    const hit = unsafe.find(([re]) => re.test(line));
    if (hit) {
      validation.push(
        item('css', 'error', 'customCss', null, `${hit[1]}: "${line.trim()}"`,
          'Replace with token-based values or theme assets.'),
      );
      return false;
    }
    return true;
  });

  return { css: kept.join('\n').trim(), validation };
};

/* ── Theme validation (§84) ── */

export const validateTheme = (
  config: StudioThemeConfig,
  resolved: Map<string, ResolvedToken>,
): ValidationItem[] => {
  const validation: ValidationItem[] = [];
  const tokens = config?.tokens ?? { primitive: {}, semantic: {}, component: {} };
  const primitive = tokens.primitive ?? {};
  const semantic = tokens.semantic ?? {};

  Object.entries(tokens).forEach(([group, dict]) => {
    Object.keys(dict ?? {}).forEach((path) => {
      if (!TOKEN_NAME_RE.test(path)) {
        validation.push(
          item('naming', 'error', group, path,
            `Token "${path}" does not follow the {category}.{property}[.{variant}][.{state}] naming standard.`,
            'Rename using dotted segments, e.g. color.action.primary.'),
        );
      }
    });
  });

  REQUIRED_SEMANTIC_TOKENS.forEach((path) => {
    if (!semantic[path]) {
      validation.push(
        item('schema', 'error', 'semantic', path,
          `Required semantic token "${path}" is missing.`,
          'Add the token so components receive safe fallback values.'),
      );
    }
  });

  const checkContrast = (fg: string, bg: string, min: number, label: string) => {
    const f = resolved.get(fg)?.value;
    const b = resolved.get(bg)?.value;
    if (!f || !b || !HEX_RE.test(f) || !HEX_RE.test(b)) return;
    const ratio = contrastRatio(f, b);
    if (ratio < min) {
      validation.push(
        item('accessibility', 'error', 'colors', fg,
          `${label} contrast is ${ratio.toFixed(2)}:1 (minimum ${min}:1) — this text may be difficult to read.`,
          'Use a darker text color or a lighter background.'),
      );
    }
  };
  checkContrast('color.text.primary', 'color.background.page', 4.5, 'Body text');
  checkContrast('color.text.inverse', 'color.action.primary', 4.5, 'Primary button text');
  checkContrast('color.text.muted', 'color.background.page', 3.0, 'Muted text');

  Object.entries(primitive).forEach(([path, token]) => {
    if (token.type === 'color' && !token.dark) {
      validation.push(
        item('accessibility', 'warning', 'appearance', path,
          `Color token "${path}" has no dark-mode value.`,
          'Add a dark value so dark mode stays complete.'),
      );
    }
  });

  return validation;
};

/* ── Full compile ── */

export const compileTheme = (config: StudioThemeConfig): StudioCompileOutput => {
  const tokens = config?.tokens ?? { primitive: {}, semantic: {}, component: {} };
  const primitive = tokens.primitive ?? {};
  const semantic = tokens.semantic ?? {};
  const component = tokens.component ?? {};

  const { resolved, validation } = resolveTokens(config ?? { tokens: { primitive: {}, semantic: {}, component: {} }, version: 2 } as StudioThemeConfig);
  validation.push(...validateTheme(config, resolved));
  const { css: safeCustomCss, validation: cssValidation } = sanitizeCustomCss(config?.customCss ?? '');
  validation.push(...cssValidation);

  const rootVars: string[] = [];
  const darkVars: string[] = [];
  const resolvedTokens: Record<string, string> = {};

  /* primitive systematic vars (+ legacy channels for non-legacy colors) */
  Object.entries(primitive).forEach(([path, token]) => {
    const t = resolved.get(path);
    if (!t?.value) return;
    const varName = `--yo-${tokenVarName(path)}`;
    rootVars.push(`  ${varName}: ${t.value};`);
    if (!token.legacyKey && t.isColor) {
      rootVars.push(`  ${varName}-rgb: ${rgbChannels(t.value)};`);
    }
    if (t.dark) {
      darkVars.push(`  ${varName}: ${t.dark};`);
    }
    resolvedTokens[path] = t.value;
  });

  /* semantic + component chains */
  (['semantic', 'component'] as const).forEach((group) => {
    const groupDict = group === 'semantic' ? semantic : component;
    Object.entries(groupDict).forEach(([path, token]) => {
      const t = resolved.get(path);
      if (!t?.value) return;
      const varName = `--yo-${tokenVarName(path)}`;
      if (token.ref) {
        rootVars.push(`  ${varName}: var(--yo-${tokenVarName(token.ref)}, ${t.value});`);
      } else {
        rootVars.push(`  ${varName}: ${t.value};`);
      }
      resolvedTokens[path] = t.value;
    });
  });

  /* scopes (§56) */
  const scopeBlocks: string[] = [];
  Object.entries(config.scopes ?? {}).forEach(([key, scope]) => {
    if (!scope?.selector || !/^\[data-theme-scope=/.test(scope.selector)) {
      if (scope?.selector) {
        validation.push(
          item('css', 'error', 'scopes', key,
            `Scope selector "${scope.selector}" is not allowed.`,
            "Use a [data-theme-scope='key'] attribute selector."),
        );
      }
      return;
    }
    const lines = Object.keys(scope.overrides ?? {})
      .map((path) => {
        const t = resolved.get(path);
        if (!t?.value) return null;
        const entries = [`  --yo-${tokenVarName(path)}: ${t.value};`];
        const raw = primitive[path] ?? semantic[path] ?? component[path];
        if (raw?.legacyKey) {
          entries.push(`  --yo-${raw.legacyKey}: ${t.value};`);
          if (t.isColor) entries.push(`  --c-${raw.legacyKey}: ${rgbChannels(t.value)};`);
        }
        return entries.join('\n');
      })
      .filter(Boolean) as string[];
    if (lines.length > 0) scopeBlocks.push(`${scope.selector} {\n${lines.join('\n')}\n}`);
  });

  /* responsive token rules (§57) */
  const responsiveBlocks: string[] = [];
  Object.entries(config.responsive ?? {}).forEach(([, bp]) => {
    if (!bp?.minWidth || !bp.tokens) return;
    const lines = Object.keys(bp.tokens)
      .map((path) => {
        if (path.startsWith('spacing.')) {
          const v = bp.tokens?.[path]?.value;
          return v ? `  --spacing-${path.slice('spacing.'.length)}: ${v};` : null;
        }
        const t = resolved.get(path);
        return t?.value ? `  --yo-${tokenVarName(path)}: ${t.value};` : null;
      })
      .filter(Boolean) as string[];
    if (lines.length > 0) {
      responsiveBlocks.push(`@media (min-width: ${bp.minWidth}) {\n:root {\n${lines.join('\n')}\n}\n}`);
    }
  });

  const variablesCss = `:root {\n${rootVars.join('\n')}\n}${
    darkVars.length
      ? `\n\n@media (prefers-color-scheme: dark) {\n:root {\n${darkVars.join('\n')}\n}\n}\n\n[data-yo-theme-mode='dark'] {\n${darkVars.join('\n')}\n}`
      : ''
  }`;

  /* component layer — reuse the existing .yo-* contract via the runtime view */
  const runtime: ParsedThemeConfig = { ...toRuntimeConfig(config), customCss: undefined };
  /* honor the theme's chosen defaultMode in the compiled snapshot so it stays
     in sync with how DynamicPage renders the live page. */
  const pageMode = config?.appearance?.defaultMode === 'dark' || config?.appearance?.defaultMode === 'light'
    ? config.appearance.defaultMode
    : 'auto';
  const componentLayer = buildTokenCss(runtime.tokens, runtime.components, pageMode);

  const parts = [
    variablesCss,
    componentLayer,
    ...scopeBlocks,
    ...responsiveBlocks,
    safeCustomCss,
  ].filter(Boolean);

  const css = parts.join('\n\n');
  const criticalCss = buildCriticalCss(resolved);
  const sizeBytes = new Blob([css]).size;

  // Budget mirrors YOThemeCompiler.cs (30 KB raw) so studio preview and the
  // publish gate warn identically.
  if (sizeBytes > 30 * 1024) {
    validation.push(
      item('performance', 'warning', 'css', null,
        `Compiled token CSS is ${Math.round(sizeBytes / 1024)} KB raw (gzip budget target: under 15 KB).`,
        'Remove unused tokens and duplicate declarations.'),
    );
  }

  return {
    css,
    variablesCss,
    criticalCss,
    resolvedTokens,
    validation,
    sizeBytes,
    success: !validation.some((v) => v.Severity === 'error'),
  };
};

const buildCriticalCss = (resolved: Map<string, ResolvedToken>): string => {
  const get = (path: string, fallback: string) => resolved.get(path)?.value ?? fallback;
  return `:root {
  --yo-background-page: ${get('color.background.page', '#ffffff')};
  --yo-text-primary: ${get('color.text.primary', '#1e293b')};
  --yo-action-primary: ${get('color.action.primary', '#2563eb')};
  --yo-border-default: ${get('color.border.default', '#e2e8f0')};
}
html, body { background: var(--yo-background-page); color: var(--yo-text-primary); margin: 0; }`;
};
