import { useEffect, useRef, useCallback } from "react";
import type { ParsedThemeConfig, StyleValue, BlockStyleOverrides } from "../types/yoThemeTypes";
import { compileBlockStyles, compileComponentStyles } from "./blockStyleEngine";

export type ReflexListener = (update: {
  css: string;
  blockStyles: string;
  componentStyles: string;
}) => void;

/**
 * The Reflex Engine automatically applies theme token changes to all
 * rendered preview components in real time. This creates the "instant
 * reflection" experience where any slider/color change in the theme
 * builder is immediately visible in the preview canvas.
 *
 * "Reflex All" means: apply the current theme tokens across all
 * preview layouts, components, and block overrides simultaneously,
 * rebuilding and injecting CSS on every change.
 */
class ReflexEngine {
  private listeners = new Set<ReflexListener>();
  private lastConfig: string = "";
  private frameId: number | null = null;
  private pendingConfig: ParsedThemeConfig | null = null;
  private enabled = true;

  setEnabled(on: boolean) {
    this.enabled = on;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  subscribe(fn: ReflexListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  pushUpdate(config: ParsedThemeConfig, blockOverrides?: Record<string, BlockStyleOverrides>) {
    if (!this.enabled) return;
    this.pendingConfig = config;
    if (this.frameId != null) return;
    this.frameId = requestAnimationFrame(() => {
      this.frameId = null;
      if (!this.pendingConfig) return;
      this.emitUpdate(this.pendingConfig, blockOverrides);
      this.pendingConfig = null;
    });
  }

  private emitUpdate(config: ParsedThemeConfig, blockOverrides?: Record<string, BlockStyleOverrides>) {
    const json = JSON.stringify(config);
    if (json === this.lastConfig) return;
    this.lastConfig = json;

    const tokens = config.tokens;

    const rootRules: string[] = [];
    if (tokens.colors) {
      for (const [name, val] of Object.entries(tokens.colors)) {
        if (typeof val === "object" && val.default) {
          const hex = val.default;
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          rootRules.push(`--c-${name}: ${r} ${g} ${b};`);
          rootRules.push(`--yo-${name}: ${hex};`);
        }
      }
    }
    const css = `:root {\n${rootRules.join("\n")}\n}\n`;

    let blockStyles = "";
    if (blockOverrides) {
      for (const [blockId, overrides] of Object.entries(blockOverrides)) {
        blockStyles += compileBlockStyles(blockId, overrides, tokens);
      }
    }

    let componentStyles = "";
    if (config.customCss) {
      componentStyles = config.customCss;
    }

    for (const fn of this.listeners) {
      try { fn({ css, blockStyles, componentStyles }); } catch {}
    }
  }

  forceReflexAll(config: ParsedThemeConfig, blockOverrides?: Record<string, BlockStyleOverrides>) {
    this.lastConfig = "";
    this.emitUpdate(config, blockOverrides);
  }
}

export const reflexEngine = new ReflexEngine();

/**
 * Hook to subscribe to reflex updates from any React component.
 * Injects style elements into the document head and updates them
 * when new reflex events arrive.
 */
export function useReflex(config: ParsedThemeConfig | null, blockOverrides?: Record<string, BlockStyleOverrides>) {
  const cssRef = useRef<HTMLStyleElement | null>(null);
  const blockRef = useRef<HTMLStyleElement | null>(null);
  const customRef = useRef<HTMLStyleElement | null>(null);

  const applyUpdate = useCallback((update: { css: string; blockStyles: string; componentStyles: string }) => {
    if (!cssRef.current) {
      cssRef.current = document.createElement("style");
      cssRef.current.id = "yo-reflex-css";
      document.head.appendChild(cssRef.current);
    }
    if (!blockRef.current) {
      blockRef.current = document.createElement("style");
      blockRef.current.id = "yo-reflex-blocks";
      document.head.appendChild(blockRef.current);
    }
    if (!customRef.current) {
      customRef.current = document.createElement("style");
      customRef.current.id = "yo-reflex-custom";
      document.head.appendChild(customRef.current);
    }
    cssRef.current.textContent = update.css;
    blockRef.current.textContent = update.blockStyles;
    customRef.current.textContent = update.componentStyles;
  }, []);

  useEffect(() => {
    const unsub = reflexEngine.subscribe(applyUpdate);
    return () => { unsub(); };
  }, [applyUpdate]);

  useEffect(() => {
    if (!config || !reflexEngine.isEnabled()) return;
    reflexEngine.pushUpdate(config, blockOverrides);
  }, [config, blockOverrides]);

  /** Call to force-refresh all theme styles across every block */
  const reflexAll = useCallback(() => {
    if (!config) return;
    reflexEngine.forceReflexAll(config, blockOverrides);
  }, [config, blockOverrides]);

  return { reflexAll, enabled: reflexEngine.isEnabled() };
}
