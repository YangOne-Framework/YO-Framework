# Dynamic Page Content Component Builder — Architecture Guide

## Overview

The builder follows a **Registry → Store → Renderer** pattern. Three runtime layers work together to produce the final React DOM:

```
[Registry Layer]        [Store Layer]          [Renderer Layer]
componentRegistry       editorStore            PageRenderer
layoutPresets            |                      MasterLayoutRenderer
animationPresets         | commit(mutator)      ComponentRenderer
htmlComponentRegistry   v                      AnimationWrapper
                        CmsPage (state)        Renderers (Heading, Text, etc.)
                             |
                        [Persistence Layer]
                        localStorageDb (fetch → REST API)
                        cmsPageAPI (RTK Query hooks)
```

---

## Data Model

### CmsPage (the top-level document)

```typescript
interface CmsPage {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  masterLayoutId: string | null;
  masterLayoutConfig: MasterLayoutConfig;
  seo: SeoSettings;
  settings: { containerMode: 'boxed' | 'fluid'; backgroundColor: string };
  sections: CmsSection[];        // Layout rows, references components by ID
  components: Record<string, CmsComponentInstance>;  // Flat map of all instances
  version: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}
```

### Normalized Structure

Components are stored in a **flat map** on the page, not nested under sections/columns. Sections store arrays of **component IDs**. This design enables O(1) lookup, easy reordering, and clean cloning for undo/redo.

```
CmsPage
 ├── components: {                    ← flat map
 │     "cmp_a1b2c3": { id, type, config, style, ... },
 │     "cmp_d4e5f6": { id, type, config, style, ... }
 │   }
 ├── sections: [
 │     { id: "sec_xxx", columns: [
 │       { id: "col_yyy", components: ["cmp_a1b2c3", "cmp_d4e5f6"] },  ← IDs only
 │     ]}
 │   ]
```

### CmsComponentInstance (a placed component)

```typescript
interface CmsComponentInstance {
  id: string;             // Unique instance ID (e.g. "cmp_abc123")
  type: string;           // Matches a key in componentRegistry (e.g. "heading", "html-component-5")
  name: string;           // Human-readable instance name
  config: Record<string, unknown>;  // User-configured values
  style: CmsComponentStyle;         // Visual style settings
  animation?: CmsAnimationConfig;   // Entrance/view/hover animation
  visibility: { desktop: boolean; tablet: boolean; mobile: boolean };
  locked: boolean;
}
```

### CmsComponentDefinition (a registered component type)

```typescript
interface CmsComponentDefinition {
  type: string;                // Unique type key
  label: string;               // Display name
  group: string;               // Palette grouping ("Basic", "Marketing", "Data", etc.)
  description: string;
  defaultConfig: Record<string, unknown>;  // Default values for new instances
  defaultStyle: CmsComponentStyle;         // Default style
  configSchema: ConfigField[];             // Schema for the property panel
  renderer: (props: CmsRendererProps) => React.ReactElement;  // Rendering function
}
```

---

## Registry Layer

### componentRegistry (``src/registry/componentRegistry.ts`)

A `Record<string, CmsComponentDefinition>` that holds all available component types. Seven built-in types are registered at import time:

| Type Key | Group | Description |
|---|---|---|
| `heading` | Basic | H1–H4 heading with configurable level |
| `text` | Basic | Rich text HTML content body |
| `button` | Basic | CTA link styled as button (primary/secondary/ghost) |
| `image` | Media | Image with caption and object-fit |
| `hero` | Marketing | Full hero unit with background, eyebrow, CTA |
| `cardGrid` | Marketing | Responsive card grid from JSON array |
| `spacer` | Layout | Empty vertical spacer |

**Dynamic Registration**: `registerDynamicDefinition(def)` adds a definition at runtime. Used by the HTML component system to inject backend-defined components:

```typescript
// In CmsPageBuilder.tsx
const { data: htmlComponentsData } = useGetActiveHtmlComponentsQuery({});
useEffect(() => {
  if (htmlComponentsData?.Data) {
    for (const item of htmlComponentsData.Data) {
      const def = toCmsDefinition(item);        // Convert backend DTO → CmsComponentDefinition
      registerDynamicDefinition(def);            // Inject into registry
    }
  }
}, [htmlComponentsData]);
```

### layoutPresets (``src/registry/layoutPresets.ts`)

14 presets defining column structures (12-column grid):

```typescript
interface LayoutPreset {
  id: string;           // e.g. "two-columns"
  name: string;         // e.g. "Two Columns (6 + 6)"
  description: string;
  columns: Array<{
    desktop: number;    // lg:col-span-{n}
    tablet: number;     // md:col-span-{n}
    mobile: number;     // col-span-{n}
  }>;
}
// Example: full-row → [{12,12,12}]
// Example: two-columns → [{6,6,12}, {6,6,12}]
```

### animationPresets (``src/registry/animationPresets.ts`)

15 Framer Motion presets defining `initial` and `animate` states:
- `fade-in`, `slide-up`, `slide-down`, `slide-left`, `slide-right`
- `scale-in`, `zoom-pop`
- `apple-rise`, `apple-blur`, `parallax-soft`
- `stagger-card`, `float-up`, `rotate-in`, `hero-focus`

---

## Store Layer

### editorStore (``src/store/editorStore.ts`)

A singleton class that manages the entire editor state. Uses an **observer pattern** (subscribe/emit) — not Redux or Zustand.

```typescript
interface EditorState {
  page: CmsPage;
  selectedComponentId: string | null;
  selectedSectionId: string | null;
  activeDevice: 'desktop' | 'tablet' | 'mobile';
  history: CmsPage[];     // Undo stack (max 50)
  future: CmsPage[];       // Redo stack
  dirty: boolean;          // Unsaved changes
  editingLayout: string | null;  // Master layout ID if editing a layout
}
```

#### The commit pattern

Every mutation goes through `commit(mutator)`, which:
1. Deep-clones current page → `previous` (saved for undo)
2. Deep-clones again → `next`
3. Applies `mutator(next)`
4. Pushes `previous` onto `history` (capped at 50)
5. Clears `future` (new action invalidates redo)
6. Sets `dirty = true`
7. Calls `emit()` → notifies all subscribers (React hooks, etc.)

```typescript
private commit(mutator: (draft: CmsPage) => void) {
  const previous = clonePage(this.state.page);
  const next = clonePage(this.state.page);
  mutator(next);
  this.state = {
    ...this.state,
    page: next,
    history: [...this.state.history, previous].slice(-50),
    future: [],
    dirty: true,
  };
  this.emit();
}
```

#### Key state mutation methods

| Method | What it does |
|---|---|
| `loadPage(page)` | Load a page (resets history, normalizes) |
| `addSection(presetId)` | Creates section from layout preset, appends to sections array |
| `removeSection(sectionId)` | Removes section + clean dead component IDs from flat map |
| `duplicateSection(sectionId)` | Deep-clones section with new IDs for columns & components |
| `moveSection(sectionId, ±1)` | Reorders sections |
| `addComponent(sectionId, columnId, type)` | Creates instance from registry defaults, adds to column |
| `removeComponent(componentId)` | Deletes from flat map + all column references |
| `updateComponentConfig(id, key, value)` | Mutates a config field |
| `updateComponentStyle(id, key, value)` | Mutates a style field |
| `updateComponentAnimation(id, animation)` | Sets animation preset |
| `toggleComponentVisibility(id, device)` | Toggles per-device visibility |
| `undo()` / `redo()` | Pops from history/future stacks |
| `validate()` | Returns validation issues (empty sections, missing required fields, unknown types) |

---

## Renderer Layer

### Rendering chain

```
PageRenderer
  → MasterLayoutRenderer (header/footer shell or custom design)
    → Section loop (per CmsSection)
      → Container mode (boxed: max-w-7xl centered / fluid: w-full)
        → 12-column CSS grid (grid grid-cols-12 gap-6)
          → Column loop (per CmsColumn)
            → responsiveColumnClasses(desktop, tablet, mobile)
              → ComponentRenderer (per CmsComponentInstance)
                → checks visibility[device]
                → looks up definition from componentRegistry
                → wraps in AnimationWrapper (Framer Motion)
                  → definition.renderer({ config, style, isEditing })
```

#### PageRenderer

```tsx
// Simplified
<MasterLayoutRenderer layoutId={page.masterLayoutId} config={page.masterLayoutConfig}>
  <div style={{ backgroundColor: page.settings.backgroundColor }}>
    <div className={pageShell}>          // boxed → max-w-7xl, fluid → w-full
      {page.sections.map(section => (
        <section className={sectionClasses(section)}
                 style={{ backgroundColor: section.settings.backgroundColor }}>
          <div className={sectionInner}>   // per-section boxed/fluid
            <div className="grid grid-cols-12 gap-6">
              {section.columns.map(column => (
                <div className={responsiveColumnClasses(column.span)}>
                  {column.components.map(componentId => (
                    <ComponentRenderer instance={page.components[componentId]} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  </div>
</MasterLayoutRenderer>
```

#### ComponentRenderer — the runtime resolver

```typescript
function ComponentRenderer({ instance, device, isEditing }) {
  // Skip if hidden on this device
  if (!instance.visibility[device] && !isEditing) return null;

  const definition = componentRegistry[instance.type];
  if (!definition) return <div>Unknown component: {instance.type}</div>;

  return (
    <AnimationWrapper animation={instance.animation}>
      {definition.renderer({
        config: instance.config,
        style: instance.style,
        isEditing,
      })}
    </AnimationWrapper>
  );
}
```

Each definition carries its own `renderer` function (strategy pattern). The `renderer` receives `config` (user-configured values) and `style` (style settings), calls utilities like `componentStyleClasses(style)` and `componentInlineStyle(style)` to generate Tailwind classes and inline styles, then returns React elements.

#### Renderer example — HeadingRenderer

```typescript
function HeadingRenderer({ config, style }: CmsRendererProps) {
  const Tag = `h${config.level ?? 1}` as keyof JSX.IntrinsicElements;
  return (
    <Tag className={`font-bold tracking-tight ${componentStyleClasses(style)}`}
         style={componentInlineStyle(style)}>
      {config.text}
    </Tag>
  );
}
```

---

## API-Based Component Lifecycle

### Backend HTML Components

Non-developers can create components via the backend admin UI. These are stored in the `HtmlComponent` database table and exposed through a REST API endpoint.

#### Lifecycle steps

```
1. Admin creates HtmlComponent via backend UI
   ├── Config (JSON schema of settings with types, options, defaults)
   ├── ContentStructure (JSON schema of content fields)
   ├── HtmlTemplate (Handlebars-like template with {{settings.key}} and {{content.key}})
   ├── HtmlTemplate is the actual HTML to render
   ├── StateSchema (optional JSON for interactive state)
   └── ApiBindings (optional JSON for API-backed data)

2. CmsPageBuilder mounts → calls useGetActiveHtmlComponentsQuery()
   ├── Fetches all active HtmlComponents from /api/v1/htmlbuilder/components
   └── Response has PascalCase fields: HtmlComponentId, Name, Config, HtmlTemplate, etc.

3. For each item → toCmsDefinition(item) converts to CmsComponentDefinition
   ├── Type key: "html-component-{HtmlComponentId}"
   ├── Config schema built from both settings (Config) + content fields (ContentStructure)
   ├── Raw template + metadata stored in defaultConfig under __html* prefixed keys
   │     __htmlTemplate, __htmlSettings, __htmlContentStructure,
   │     __htmlState, __htmlApiBindings, __htmlEventBindings, __htmlRuntimeOptions
   ├── group: "Data"
   └── renderer: HtmlComponentRenderer

4. registerDynamicDefinition(def) → injected into componentRegistry

5. User can now drag this component from the palette onto the canvas
   ├── editorStore.addComponent() looks up definition for defaultConfig/defaultStyle
   └── Instance created with type "html-component-{id}"

6. In the property panel, DynamicFieldRenderer reads configSchema from the definition
   └── Renders form fields for each setting/content field

7. When rendering, HtmlComponentRenderer:
   ├── Gets __htmlTemplate from instance.config
   ├── Processes template: replaces {{content.key}} / {{settings.key}} with config values
   ├── Handles {{#if content.key}}...{{else}}...{{/if}} conditional blocks
   └── Sets innerHTML via dangerouslySetInnerHTML
```

### Backend HtmlComponent DTO

```typescript
interface BackendHtmlComponent {
  HtmlComponentId: number;
  Name: string;
  DisplayName: string;
  ShortDescription?: string;
  Icon?: string;
  Config?: string;               // JSON: [{ key, label, type, options?:[], defaultValue }]
  ContentStructure?: string;     // JSON: [{ key, label, type, defaultValue, options? }]
  HtmlTemplate?: string;         // HTML with {{placeholders}}
  StateSchema?: string;          // JSON for interactive behavior
  ApiBindings?: string;          // JSON for API data sources
  EventBindings?: string;        // JSON for event handlers
  RuntimeOptions?: string;       // JSON for runtime flags
}
```

### Config to configSchema mapping

```typescript
function toCmsDefinition(item) {
  // Settings from Config (component-wide properties)
  const settings = JSON.parse(item.Config || '[]').settings || [];

  // Content fields from ContentStructure (per-instance content)
  const contentFields = JSON.parse(item.ContentStructure || '[]');

  // Build combined schema
  const configSchema = [
    ...settings.map(setting => ({
      key: setting.key, label: setting.label,
      type: mapFieldType(setting.type),  // link→url, list→textarea, etc.
      options: setting.options?.map(opt => ({ label: opt, value: opt })),
      defaultValue: setting.defaultValue,
    })),
    ...contentFields.map(field => ({
      key: field.key, label: field.label,
      type: mapFieldType(field.type),
      defaultValue: field.defaultValue,
    })),
  ];

  return {
    type: `html-component-${item.HtmlComponentId}`,
    label: item.DisplayName,
    group: 'Data',
    configSchema,
    defaultConfig: { /* all defaults */, __htmlTemplate, __htmlSettings, ... },
    renderer: HtmlComponentRenderer,
  };
}
```

---

## Data Persistence

### Dual persistence architecture

```
┌─────────────────────┐     ┌──────────────────────┐
│  localStorageDb      │     │  cmsPageAPI           │
│  (fetch-based)       │     │  (RTK Query)          │
│                     │     │                      │
│  Used by:           │     │  Used by:            │
│  - Editor save      │     │  - CmsPageList       │
│  - Preview load     │     │  - CmsPageForm       │
│  - Publish          │     │  - Slug validation   │
│  - Layout CRUD      │     │                      │
└────────┬────────────┘     └──────────┬───────────┘
         │                             │
         └──────────┬──────────────────┘
                    ▼
          ┌─────────────────────┐
          │  REST API           │
          │  /api/v1/cmspage/*  │
          │  /api/v1/masterlayout/* │
          └─────────────────────┘
```

### DTO mapping

The backend stores content structure in a JSON string field `ContentConfig`. The `localStorageDb` service handles the impedance mismatch:

```typescript
// On load (API → CmsPage):
const contentConfig = JSON.parse(dto.ContentConfig);
page.sections = contentConfig.sections ?? [];
page.components = contentConfig.components ?? {};
page.seo = contentConfig.seo;
page.settings = contentConfig.pageSettings;

// On save (CmsPage → API):
payload.ContentConfig = JSON.stringify({
  sections: page.sections,
  components: page.components,
  seo: page.seo,
  pageSettings: page.settings,
  masterLayoutConfig: page.masterLayoutConfig,
});
```

### API Response Envelope

All endpoints return a consistent envelope:

```json
{
  "Code": 200,
  "Message": "Success",
  "Data": { /* PascalCase DTO */ }
}
```

`baseQueryWithAuth` handles the `Code` check (non-2xx → error) and the `ApiResponse` generic type. `localStorageDb` uses `json.Data ?? json` as fallback.

---

## How React Renders Components from Config

### Step-by-step rendering flow

```
1. PageRenderer reads CmsPage model
2. Iterates page.sections[]
3. For each section, creates a <section> with responsive classes
4. Inside each section, a 12-column CSS grid is created (grid grid-cols-12)
5. For each column, responsiveColumnClasses() generates:
     "col-span-12 md:col-span-6 lg:col-span-4" (for a 4/12 desktop column)
6. For each component ID in the column, looks up page.components[id]
7. ComponentRenderer resolves the definition:
     definition = componentRegistry[instance.type]
8. Calls definition.renderer({ config: instance.config, style: instance.style, isEditing })
9. The renderer function returns React elements using config values + style utilities
10. AnimationWrapper wraps the rendered element with Framer Motion
```

### Style resolution

Semantic style values are mapped to Tailwind classes:

```typescript
// componentStyleClasses(style) produces:
//   padding: 'none'|'sm'|'md'|'lg'|'xl' → 'p-0'|'p-2'|'p-4'|'p-6'|'p-8'
//   margin: same pattern
//   borderRadius: 'none'|'sm'|'md'|'lg'|'xl'|'full' → 'rounded-none'|...|'rounded-full'
//   shadow: 'none'|'sm'|'md'|'lg'|'xl' → 'shadow-none'|...|'shadow-xl'
//   align: 'left'|'center'|'right' → 'text-left'|'text-center'|'text-right'
//   border: true → 'border border-gray-200'
//   className: appended as-is

// componentInlineStyle(style) produces:
//   { backgroundColor: style.backgroundColor, color: style.textColor }
```

---

## UI Components

### CanvasEditor
The main editing surface. Renders sections inside a simulated device frame. Background color mirrors `page.settings.backgroundColor`. Includes a **BottomAddSection** dropdown to append sections at the bottom.

### PropertiesPanel
Context-sensitive panel. When nothing is selected, it shows **Page settings** (master layout, page width, background color) and **Master customization** (header/footer config). When a component is selected, it shows the component's **Content** (dynamic fields from `configSchema`), **Style** (padding, margin, colors, etc.), **Animation** (preset selection), and **Visibility** (per-device toggles).

### ComponentPalette
Lists all registered component definitions grouped by `group` field. Supports drag-to-canvas.

### EditorToolbar
Top bar with: Pages/Layouts nav, Preview/Save/Publish buttons, Add Section dropdown, centered device switcher (desktop/tablet/mobile with icons), Undo/Redo, and read-only page title/slug.

### DynamicFieldRenderer
Reads a `ConfigField` schema and renders the appropriate form control:

| type | Control |
|---|---|
| `text` | `<input type="text">` |
| `number` | `<input type="number">` |
| `textarea` | `<textarea>` |
| `richtext` | `<textarea>` |
| `select` | `<select>` with options |
| `boolean` | Checkbox toggle |
| `color` | Color picker + text input |
| `image` / `url` | `<input type="url">` |

---

## Config Sample

### Component definition example (heading)

```typescript
{
  type: 'heading',
  label: 'Heading',
  group: 'Basic',
  description: 'Section heading with configurable level',
  defaultConfig: { text: 'Heading', level: 'h2' },
  defaultStyle: {
    padding: 'none', margin: 'none', borderRadius: 'none',
    shadow: 'none', align: 'left',
    backgroundColor: '#ffffff', textColor: '#0f172a',
  },
  configSchema: [
    { key: 'text', label: 'Text', type: 'text', defaultValue: 'Heading' },
    { key: 'level', label: 'Level', type: 'select',
      options: [
        { label: 'H1', value: 'h1' }, { label: 'H2', value: 'h2' },
        { label: 'H3', value: 'h3' }, { label: 'H4', value: 'h4' },
      ],
      defaultValue: 'h2',
    },
  ],
  renderer: ({ config, style }) => {
    const Tag = config.level;
    return <Tag className={`font-bold tracking-tight ${componentStyleClasses(style)}`}
                style={componentInlineStyle(style)}>{config.text}</Tag>;
  },
}
```

### Page JSON structure (CmsPage)

```json
{
  "id": "pg_a1b2c3d4",
  "title": "About Us",
  "slug": "about-us",
  "status": "draft",
  "masterLayoutId": "default-site",
  "settings": { "containerMode": "boxed", "backgroundColor": "#f8fafc" },
  "sections": [
    {
      "id": "sec_001",
      "name": "Hero Section",
      "layoutPresetId": "full-row",
      "settings": { "layoutMode": "boxed", "paddingY": "lg", "backgroundColor": "#1e293b" },
      "columns": [
        {
          "id": "col_001",
          "title": "Main",
          "span": { "desktop": 12, "tablet": 12, "mobile": 12 },
          "components": ["cmp_hero_01", "cmp_btn_01"]
        }
      ]
    },
    {
      "id": "sec_002",
      "name": "Features",
      "layoutPresetId": "three-columns",
      "settings": { "layoutMode": "boxed", "paddingY": "md", "backgroundColor": "#ffffff" },
      "columns": [
        { "id": "col_002a", "title": "Left", "span": { "desktop": 4, "tablet": 6, "mobile": 12 }, "components": ["cmp_card_01"] },
        { "id": "col_002b", "title": "Center", "span": { "desktop": 4, "tablet": 6, "mobile": 12 }, "components": ["cmp_card_02"] },
        { "id": "col_002c", "title": "Right", "span": { "desktop": 4, "tablet": 12, "mobile": 12 }, "components": ["cmp_card_03"] }
      ]
    }
  ],
  "components": {
    "cmp_hero_01": {
      "id": "cmp_hero_01",
      "type": "hero",
      "name": "Main Hero",
      "config": {
        "eyebrow": "Welcome",
        "title": "Build Faster",
        "subtitle": "Modern CMS platform",
        "ctaLabel": "Get Started",
        "ctaUrl": "#",
        "backgroundImage": "/images/hero-bg.jpg"
      },
      "style": { "padding": "xl", "margin": "none", "borderRadius": "none", "shadow": "none", "align": "center", "backgroundColor": "transparent", "textColor": "#ffffff" },
      "animation": { "presetId": "fade-in", "trigger": "onView", "duration": 0.55, "delay": 0 },
      "visibility": { "desktop": true, "tablet": true, "mobile": true },
      "locked": false
    },
    "cmp_btn_01": {
      "id": "cmp_btn_01",
      "type": "button",
      "name": "CTA Button",
      "config": { "label": "Learn More", "url": "/features", "variant": "primary" },
      "style": { "padding": "md", "margin": "sm", "borderRadius": "lg", "shadow": "md", "align": "center" },
      "visibility": { "desktop": true, "tablet": true, "mobile": true },
      "locked": false
    }
  }
}
```

### ContentConfig in the API DTO

When persisted, the above sections/components are serialized into a single JSON string:

```json
{
  "PageGUID": "pg_a1b2c3d4",
  "Name": "About Us",
  "Slug": "about-us",
  "Status": "draft",
  "MasterLayoutId": "default-site",
  "ContentConfig": "{ \"sections\": [...], \"components\": {...}, \"seo\": {...}, \"pageSettings\": {...}, \"masterLayoutConfig\": {...} }",
  "Version": 1
}
```

---

## Key Architectural Patterns

1. **Normalized Data Model**: Components in a flat map, sections/columns reference by ID → O(1) lookup, easy reordering, clean undo/redo cloning
2. **Strategy Pattern for Rendering**: Each definition carries a `renderer` function; `ComponentRenderer` delegates to it. New component types = new definition + new renderer.
3. **Registry Pattern**: Components, layout presets, animation presets all registered in lookup tables. `registerDynamicDefinition` allows runtime extension from backend.
4. **Commit-based State**: `editorStore.commit(mutator)` clones → mutates → pushes undo → notifies subscribers. Simple single-source-of-truth without Redux.
5. **DTO Mapping Layer**: `localStorageDb` handles PascalCase↔camelCase, JSON string parsing, and field name normalization between API and frontend model.
6. **Responsive Grid**: Columns define `{desktop, tablet, mobile}` spans for a 12-column grid → mapped to Tailwind responsive classes.
7. **Backend Component Bridge**: `htmlComponentRegistry.toCmsDefinition()` parses DB-defined HTML components into first-class `CmsComponentDefinition` objects.
