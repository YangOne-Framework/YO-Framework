import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { ColorField, FontField } from "./ThemeTokenFields";
import { deriveDarkFromLight, generatePalette, THEME_PRESETS } from "./themeUtils";
import { ensurePublishableTokens, LEGACY_ROLE_MAP } from "../../../services/themeMigration";
import type { StudioThemeConfig } from "../../../types/yoThemeStudioTypes";
import type { StudioSectionProps } from "./studioShared";

/**
 * Simple mode (blueprint §26–§29) — a guided, plain-language flow that produces
 * the same three-level token config as Designer mode. Steps: identity →
 * personality → colors → typography → shape → component style → review.
 */
export function SimpleWizard({ config, update }: StudioSectionProps) {
  const steps = ["Start", "Personality", "Colors", "Typography", "Shape", "Style", "Review"] as const;
  const [step, setStep] = useState(0);

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <ol className="flex items-center gap-1.5">
        {steps.map((label, i) => (
          <li key={label} className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setStep(i)}
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                i < step
                  ? "bg-emerald-100 text-emerald-600"
                  : i === step
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              {i < step ? <Check size={11} /> : i + 1}
            </button>
            <span className={`text-[10px] font-medium ${i === step ? "text-gray-700" : "text-gray-400"}`}>{label}</span>
            {i < steps.length - 1 && <span className="mx-0.5 h-px w-4 bg-gray-200" />}
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
        {step === 0 && <IdentityStep config={config} />}
        {step === 1 && <PersonalityStep config={config} update={update} />}
        {step === 2 && <ColorsStep config={config} update={update} />}
        {step === 3 && <TypographyStep config={config} update={update} />}
        {step === 4 && <ShapeStep config={config} update={update} />}
        {step === 5 && <StyleStep config={config} update={update} />}
        {step === 6 && <ReviewStep config={config} />}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
        >
          <ArrowLeft size={13} /> Back
        </button>
        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
          >
            Continue <ArrowRight size={13} />
          </button>
        ) : (
          <span className="text-xs text-gray-400">Use Save Draft / Publish in the bar below to apply your theme.</span>
        )}
      </div>
    </div>
  );
}

/* ── Step implementations ── */

function IdentityStep({ config }: { config: StudioThemeConfig }) {
  const primary = config.tokens.primitive["color.brand.primary"]?.value;
  return (
    <div className="space-y-3 text-center">
      <div
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-md"
        style={{ backgroundColor: primary ?? "#6366f1" }}
      >
        ✦
      </div>
      <h3 className="text-base font-semibold text-gray-800">Let's set up your theme</h3>
      <p className="mx-auto max-w-sm text-xs leading-relaxed text-gray-500">
        Answer a few questions and we'll generate a complete, accessible design system —
        colors, typography, shapes and component styles. You can refine everything later in Designer mode.
      </p>
    </div>
  );
}

function PersonalityStep({ config, update }: Pick<StudioSectionProps, "config" | "update">) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-800">What personality should your product have?</h3>
      <p className="text-xs text-gray-500">Pick a starting point — every choice stays editable.</p>
      <div className="grid grid-cols-2 gap-3">
        {THEME_PRESETS.map((preset) => {
          const palette = generatePalette(preset.seed, preset.harmony);
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPresetColors(config, update, preset)}
              className="rounded-2xl border border-gray-200/80 bg-white p-4 text-left transition-all hover:border-indigo-300 hover:shadow-md"
            >
              <div className="flex items-center gap-1.5">
                {[palette.light.primary, palette.light.secondary, palette.light.accent, palette.light.bg]
                  .filter(Boolean)
                  .map((s) => (
                    <span key={s} className="h-5 w-5 rounded-md border border-black/5" style={{ backgroundColor: s }} />
                  ))}
              </div>
              <div className="mt-2 text-xs font-semibold text-gray-700">{preset.name}</div>
              <div className="text-[10px] text-gray-400">{preset.fonts.heading} + {preset.fonts.body}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function applyPresetColors(
  config: StudioThemeConfig,
  update: StudioSectionProps["update"],
  preset: (typeof THEME_PRESETS)[number],
) {
  update("wizard.preset", (cfg) => {
    const palette = generatePalette(preset.seed, preset.harmony);
    const primitive = { ...cfg.tokens.primitive };
    const semantic = { ...cfg.tokens.semantic };
    Object.entries(palette.light).forEach(([key, value]) => {
      const path = `color.brand.${key}`;
      primitive[path] = {
        value,
        ...(palette.dark[key] ? { dark: palette.dark[key] } : {}),
        type: "color",
        legacyKey: key,
      };
      const semanticPath = LEGACY_ROLE_MAP[key];
      if (semanticPath) semantic[semanticPath] = { ref: path, type: "color" };
    });
    const withTokens = { ...cfg, tokens: { ...cfg.tokens, primitive, semantic } };
    ensurePublishableTokens(withTokens);
    const baseRadius = parseFloat(preset.radius) || 0.5;
    return {
      ...withTokens,
      shape: {
        ...cfg.shape,
        radius: {
          none: "0",
          sm: `${baseRadius * 0.5}rem`,
          md: `${baseRadius}rem`,
          lg: `${baseRadius * 1.5}rem`,
          xl: `${baseRadius * 2}rem`,
          full: "9999px",
        },
      },
      typography: {
        ...cfg.typography,
        fonts: {
          ...cfg.typography.fonts,
          heading: { family: preset.fonts.heading, source: "google", weights: [600, 700] },
          body: { family: preset.fonts.body, source: "google", weights: [400, 500, 700] },
        },
      },
    };
  });
}

function ColorsStep({ config, update }: Pick<StudioSectionProps, "config" | "update">) {
  const primaryToken = config.tokens.primitive["color.brand.primary"];
  const primary = primaryToken?.value ?? "#2563eb";

  const regenerate = (seed: string) => {
    const palette = generatePalette(seed, "complementary");
    update("wizard.colors", (cfg) => {
      const primitive = { ...cfg.tokens.primitive };
      const semantic = { ...cfg.tokens.semantic };
      Object.entries(palette.light).forEach(([key, value]) => {
        const path = `color.brand.${key}`;
        primitive[path] = {
          value,
          ...(palette.dark[key] ? { dark: palette.dark[key] } : {}),
          type: "color",
          legacyKey: key,
        };
        const semanticPath = LEGACY_ROLE_MAP[key];
        if (semanticPath) semantic[semanticPath] = { ref: path, type: "color" };
      });
      const withTokens = { ...cfg, tokens: { ...cfg.tokens, primitive, semantic } };
      ensurePublishableTokens(withTokens);
      return withTokens;
    });
  };

  const fillDark = () =>
    update("wizard.dark", (cfg) => {
      const legacyColors: Record<string, { default: string; dark?: string }> = {};
      Object.values(cfg.tokens.primitive).forEach((t) => {
        if (t.legacyKey && t.value) legacyColors[t.legacyKey] = { default: t.value, dark: t.dark };
      });
      const derived = deriveDarkFromLight(legacyColors);
      const primitive = { ...cfg.tokens.primitive };
      Object.entries(primitive).forEach(([path, token]) => {
        if (token.type === "color" && !token.dark && token.legacyKey && derived[token.legacyKey]?.dark) {
          primitive[path] = { ...token, dark: derived[token.legacyKey].dark };
        }
      });
      return { ...cfg, tokens: { ...cfg.tokens, primitive } };
    });

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-800">Your brand color</h3>
      <p className="text-xs text-gray-500">We build a full, balanced palette around it — light and dark.</p>
      <div className="max-w-xs">
        <ColorField
          label="Brand color"
          value={primary}
          onChange={(v) => regenerate(v)}
        />
      </div>
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {Object.entries(config.tokens.primitive)
            .filter(([, t]) => t.legacyKey)
            .slice(0, 8)
            .map(([path, t]) => (
              <span key={path} className="h-7 w-7 rounded-lg border border-black/5" style={{ backgroundColor: t.value }} title={path} />
            ))}
        </div>
        <button
          type="button"
          onClick={fillDark}
          className="ml-auto rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
        >
          Derive dark values
        </button>
      </div>
    </div>
  );
}

function TypographyStep({ config, update }: Pick<StudioSectionProps, "config" | "update">) {
  const body = config.typography.fonts.body ?? { family: "Inter", source: "google" as const, weights: [400, 500, 700] };
  const heading = config.typography.fonts.heading ?? body;

  const setFont = (key: "body" | "heading", patch: Partial<typeof body>) =>
    update(`wizard.typography.${key}`, (cfg) => ({
      ...cfg,
      typography: {
        ...cfg.typography,
        fonts: {
          ...cfg.typography.fonts,
          [key]: { weights: [400], source: "google", ...cfg.typography.fonts[key], ...patch },
        },
      },
    }));

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-800">How should your text feel?</h3>
      <FontField
        label="Headings"
        family={heading.family}
        source={heading.source ?? "google"}
        weights={heading.weights ?? [600, 700]}
        onFamilyChange={(v) => setFont("heading", { family: v })}
        onSourceChange={(v) => setFont("heading", { source: v as "google" | "self-hosted" })}
        onWeightsChange={(v) => setFont("heading", { weights: v })}
      />
      <FontField
        label="Body text"
        family={body.family}
        source={body.source ?? "google"}
        weights={body.weights ?? [400, 500, 700]}
        onFamilyChange={(v) => setFont("body", { family: v })}
        onSourceChange={(v) => setFont("body", { source: v as "google" | "self-hosted" })}
        onWeightsChange={(v) => setFont("body", { weights: v })}
      />
    </div>
  );
}

function ShapeStep({ config, update }: Pick<StudioSectionProps, "config" | "update">) {
  const base = parseFloat(config.shape.radius.md ?? "0.375") || 0.375;
  const options = [
    { label: "Sharp", value: 0 },
    { label: "Slightly rounded", value: 0.25 },
    { label: "Rounded", value: 0.5 },
    { label: "Very rounded", value: 1 },
  ];
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-800">How round should corners be?</h3>
      <div className="grid grid-cols-4 gap-2">
        {options.map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={() =>
              update("wizard.shape", (cfg) => {
                const scale = (n: number) => `${Math.max(0, opt.value * n)}rem`;
                return {
                  ...cfg,
                  shape: {
                    ...cfg.shape,
                    radius: { none: "0", sm: scale(0.5), md: scale(1), lg: scale(1.5), xl: scale(2), full: "9999px" },
                  },
                };
              })
            }
            className={`rounded-2xl border p-3 text-center transition-all ${
              Math.abs(base - opt.value) < 0.2
                ? "border-indigo-300 bg-indigo-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="mx-auto h-8 w-8 border-2 border-indigo-400 bg-indigo-100" style={{ borderRadius: `${opt.value * 12}px` }} />
            <div className="mt-1.5 text-[10px] font-medium text-gray-600">{opt.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StyleStep({ config, update }: Pick<StudioSectionProps, "config" | "update">) {
  const buttonVariant = (config.components.button as { variant?: string } | undefined)?.variant ?? "default";
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-800">Pick a component style</h3>
      <div className="grid grid-cols-3 gap-2">
        {[
          { key: "default", label: "Solid" },
          { key: "soft", label: "Soft" },
          { key: "outline", label: "Outline" },
        ].map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() =>
              update("wizard.style", (cfg) => {
                const existing = cfg.components.button;
                return {
                  ...cfg,
                  components: {
                    ...cfg.components,
                    button: {
                      variant: opt.key,
                      variants: existing?.variants ?? {},
                      ...(existing ?? {}),
                    },
                  },
                };
              })
            }
            className={`rounded-2xl border p-3 text-center transition-all ${
              buttonVariant === opt.key
                ? "border-indigo-300 bg-indigo-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <span className={opt.key === "default" ? "yo-btn-primary" : opt.key === "soft" ? "yo-btn-soft" : "yo-btn-outline"}>
              Button
            </span>
            <div className="mt-1.5 text-[10px] font-medium text-gray-600">{opt.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ReviewStep({ config }: { config: StudioThemeConfig }) {
  const counts = useMemo(
    () => ({
      primitives: Object.keys(config.tokens.primitive).length,
      semantics: Object.keys(config.tokens.semantic).length,
      componentTokens: Object.keys(config.tokens.component).length,
      fonts: Object.keys(config.typography.fonts).length,
      darkValues: Object.values(config.tokens.primitive).filter((t) => t.dark).length,
    }),
    [config],
  );
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-800">Your theme is ready</h3>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <ReviewCard label="Color tokens" value={counts.primitives} />
        <ReviewCard label="Semantic mappings" value={counts.semantics} />
        <ReviewCard label="Component tokens" value={counts.componentTokens} />
        <ReviewCard label="Dark-mode values" value={counts.darkValues} />
      </div>
      <p className="rounded-xl bg-indigo-50 px-4 py-3 text-xs leading-relaxed text-indigo-700">
        Save the draft to keep editing, or publish when you're happy — publishing runs the
        accessibility gate first so nothing unreadable goes live.
      </p>
    </div>
  );
}

function ReviewCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-200/70 bg-gray-50/60 p-3">
      <div className="text-lg font-bold text-gray-800">{value}</div>
      <div className="text-[10px] font-medium uppercase tracking-wider text-gray-400">{label}</div>
    </div>
  );
}
