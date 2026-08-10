import type { ThemeTokens, BlockStyleOverrides, StyleValue } from "../types/yoThemeTypes";

function resolveStyleValue(sv: StyleValue, tokens?: ThemeTokens): string {
  switch (sv.mode) {
    case "token": {
      const color = tokens?.colors?.[sv.value];
      if (color?.default) return `rgb(var(--c-${sv.value}))`;
      return `rgb(var(--c-${sv.value}, 0 0 0))`;
    }
    case "cssVar":
      return `var(--${sv.value})`;
    case "raw":
    default:
      return sv.value;
  }
}

export function compileBlockStyles(
  blockId: string,
  styleOverrides: BlockStyleOverrides,
  tokens?: ThemeTokens,
): string {
  const rules = Object.entries(styleOverrides)
    .map(([property, sv]) => `  ${property}: ${resolveStyleValue(sv, tokens)};`)
    .join("\n");
  if (!rules) return "";
  return `/* Block: ${blockId} */\n[data-block-id="${blockId}"] {\n${rules}\n}\n`;
}

export function compileComponentStyles(
  namespace: string,
  slotStyles: Record<string, BlockStyleOverrides>,
  tokens?: ThemeTokens,
): string {
  const blocks: string[] = [];
  for (const [slot, overrides] of Object.entries(slotStyles)) {
    const selector = slot === "root" ? `.${namespace}` : `.${namespace}__${slot}`;
    const rules = Object.entries(overrides)
      .map(([property, sv]) => `  ${property}: ${resolveStyleValue(sv, tokens)};`)
      .join("\n");
    if (rules) blocks.push(`${selector} {\n${rules}\n}`);
  }
  return blocks.join("\n");
}
