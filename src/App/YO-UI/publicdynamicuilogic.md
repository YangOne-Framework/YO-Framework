# Public Dynamic UI — Logic & Implementation

## Overview

Converted the root `/` route from a static `<SignIn />` page into a dynamic page renderer that reads a `CmsPage` JSON payload and renders it using the existing Content Studio component system (built-in + HtmlComponent builder).

---

## Architecture — How It Works

```
Browser hits "/"
       │
       ▼
RouteRegistrar.tsx
  path: "/" ──> <DynamicPage />
       │
       ▼
DynamicPage.tsx
  ├── Data-source resolution (priority order):
  │     1. prop `page` passed by parent
  │     2. First published CmsPage from Content Studio (localStorage)
  │     3. Fallback → sampleLandingPage (hardcoded sample JSON)
  │
  ├── Component registration (runs on mount):
  │     ├── Registers sample `html-component-1` (Feature Highlight)
  │     │     └── renderer → sampleHtmlComponentRenderer → <HtmlComponentPlayer />
  │     ├── Registers sample `html-component-2` (User Cards w/ API+Events+Pagination)
  │     │     └── renderer → sampleHtmlComponentRenderer → <HtmlComponentPlayer />
  │     └── Fetches active HtmlComponents from backend API
  │           └── Registers each via toCmsDefinition()
  │                 └── Overrides renderer → sampleHtmlComponentRenderer
  │
  └── Render:
        └── <PageRenderer page={pageData} />
              │
              ▼
        PageRenderer.tsx  (Content Studio)
          ├── MasterLayoutRenderer — wraps page in header/footer shell
          ├── section loop — each section = a row
          │     └── column loop — 12-col grid, responsive spans
          │           └── component loop — by componentId
          │                 │
          │                 ▼
          │           ComponentRenderer.tsx
          │             ├── Looks up componentRegistry[instance.type]
          │             ├── Built-in: heading, text, button, hero, cardGrid, spacer
          │             ├── Dynamic: html-component-{id}
          │             │     └── sampleHtmlComponentRenderer()
          │             │           └── Separates settings vs content from instance.config
          │             │                 using __htmlSettings / __htmlContentStructure
          │             │           └── <HtmlComponentPlayer />
          │             │                 ├── Full template engine (data-if, data-repeat,
          │             │                 │   data-event-*, {{content.*}}, {{settings.*}},
          │             │                 │   {{state.*}}, {{Math.*}}, {{user.name}} aliases)
          │             │                 ├── Runtime state management (settings, content, state)
          │             │                 ├── Lifecycle hooks (onInit, onLoad → API calls)
          │             │                 ├── API binding execution (fetch, response mapping)
          │             │                 ├── Event system (click, change, submit, keydown, etc.)
          │             │                 └── Pagination (page, pageSize, totalRecords, totalPages)
          │             └── Wraps in AnimationWrapper (framer-motion)
```

---

## Files Changed / Created

| File | Action | Purpose |
|---|---|---|
| `src/routes/RouteRegistrar.tsx:71,75` | **Modified** | Changed `/` from `<SignIn />` to `<DynamicPage />`; added import |
| `src/pages/Public/DynamicPage.tsx` | **Modified** | HtmlComponent renderer override → `HtmlComponentPlayer`, registers sample `html-component-1` & `html-component-2` |
| `src/data/sampleLandingPage.ts` | **Created** | Full `CmsPage` JSON payload (hero, features, HtmlComponent demo, User Cards with API/events, CTA) |
| `src/data/sampleHtmlComponent.ts` | **Created** | Two sample `HtmlComponent` records: `featureHighlight` (static) + `userCards` (API bindings, events, pagination) |
| `src/components/htmlbuilder/HtmlComponentPlayer.tsx` | **Created** | Standalone component with full lifecycle: template engine, API binding, events, state management, pagination |

---

## HtmlComponentPlayer — Full Lifecycle

```
<HtmlComponentPlayer
  htmlTemplate={string}
  config={{ settings, state, apiConfig, events, runtimeOptions }}
  contentStructure={[{ key, label, type, defaultValue }]}
/>
         │
         ▼
    Mount
      │
      ├── buildRuntime(contentStructure, config)
      │     ├── settings = { bgColor: "#fff", padding: "md", ... }
      │     ├── content = { title: "...", users: [], ... }
      │     └── state = { loading: false, page: 1, totalPages: 0, ... }
      │
      ├── Lifecycle: onInit events
      │     └── executeActions([...])
      │
      ├── Lifecycle: onLoad events
      │     └── executeActions([{ type: "api", binding: "loadUsers" }])
      │           │
      │           ├── beforeActions: setState(loading=true)
      │           ├── fetchFromBinding()
      │           │     ├── buildUrl() → evaluates {{state.*}} in URL
      │           │     ├── fetch(url, { method, headers, body })
      │           │     └── Returns { data, message, source, ... }
      │           ├── applyResponseMap() → maps API fields to runtime
      │           │     ├── content.allUsers = response.data
      │           │     └── state.totalRecords = data.length
      │           ├── successActions: setState(loading=false), paginate()
      │           └── Or errorActions: setState(loading=false, error="...")
      │
      ├── renderTemplateToHtml(template, runtime)
      │     ├── DOM parsing (createElement("div"))
      │     ├── Text nodes: evaluateExpression( "{{content.title}}" )
      │     ├── <template data-repeat="content.users" data-as="user">
      │     │     └── Iterates list, clones template content for each item
      │     │     └── Recursively processes child nodes with {{user.name}} scope
      │     ├── data-if="state.loading" → evaluates condition, removes if false
      │     ├── Attributes: evaluates {{ }} expressions in attr values
      │     └── Returns innerHTML
      │
      ├── dangerouslySetInnerHTML={{ __html: renderedHtml }}
      │
      └── Event binding (useEffect)
            ├── Listens for: click, dblclick, change, input, submit, keydown, etc.
            ├── Uses event delegation via closest("[data-event-*]")
            └── executeActions([...], { type, key, dataset, value, keyboardKey })
                  ├── setState: setByPath(runtime, path, evaluated value)
                  ├── setContent: setByPath(runtime.content, path, value)
                  ├── paginate: slice source, update page/totalPages/totalRecords
                  └── api: calls fetchFromBinding() again
```

## Data Flow Diagrams

### Page Data Resolution

```
DynamicPage({ page? })
       │
       ├── prop `page` provided?
       │     └─ YES → use that page
       │
       ├── localStorage has published pages?
       │     └─ YES → use first published CmsPage (from Content Studio)
       │
       └── fallback → use sampleLandingPage
```

### Component Registration Flow

```
Mount
  │
  ├── (1) Sample HtmlComponents (runs once on mount)
  │     registerSampleHtmlComponents()
  │       ├── toCmsDefinition(sampleFeatureHighlight)
  │       │     └─ Converts record → CmsComponentDefinition
  │       │         ├── type: "html-component-1"
  │       │         ├── configSchema + defaultConfig
  │       │         └── renderer OVERRIDDEN → sampleHtmlComponentRenderer
  │       ├── registerDynamicDefinition(def1)
  │       ├── toCmsDefinition(sampleUserCardsComponent)
  │       │     └── renderer OVERRIDDEN → sampleHtmlComponentRenderer
  │       └── registerDynamicDefinition(def2)
  │
  └── (2) Backend API HtmlComponents (fetches on mount)
        useGetActiveHtmlComponentsQuery()
          ├── Success → htmlComponentsData.Data[]
          │     └── for each item:
          │           toCmsDefinition(item)
          │             └── renderer OVERRIDDEN → sampleHtmlComponentRenderer
          │           registerDynamicDefinition(def)
          └── Error/Fail → silently ignored (sample still works)
```

### CmsComponentInstance Config Shape (for html-component-*)

```
instance.config = {
  // Content values (from HtmlComponent ContentStructure)
  title: "User Cards",
  subtitle: "API loaded...",
  users: [],
  selectedUser: null,

  // Settings values (from HtmlComponent Config.settings)
  Columns: "grid-cols-3",

  // Metadata (used by HtmlComponentPlayer)
  __htmlTemplate: "<section>...{{content.title}}...{{settings.Columns}}...</section>",
  __htmlSettings: [{ key: "Columns", label, type, options, defaultValue }],
  __htmlContentStructure: [{ key: "title", label, type, defaultValue }, ...],
  __htmlState: { loading: false, page: 1, ... },
  __htmlApiBindings: { loadUsers: { url, method, responseMap, ... } },
  __htmlEventBindings: { onLoad: [...], onClick: { viewUser: [...] }, ... },
  __htmlRuntimeOptions: { sanitizeHtml, useRealApi, ... }
}
```

### sampleHtmlComponentRenderer (the registry renderer)

```
sampleHtmlComponentRenderer({ config, style })
  │
  ├── Extract metadata from config.__html*
  ├── Separate settings values from content values
  │     (by iterating __htmlSettings vs __htmlContentStructure keys)
  ├── Build HtmlComponentPlayer config object
  └── Return <HtmlComponentPlayer ... />
```

### Rendering Pipeline

```
CmsPage JSON
  │
  ├── masterLayoutId: "landing"
  │     └─ MasterLayoutRenderer
  │           ├── Gets layout from localStorageDb
  │           ├── Falls through to built-in: <Header compact> + <Footer>
  │           └── Wraps children (<main>)
  │
  ├── settings.backgroundColor
  │     └─ Applied to outer <div>
  │
  ├── settings.containerMode ("boxed" | "fluid")
  │     └─ max-w-7xl mx-auto | w-full
  │
  └── sections[]
        └── section.settings (paddingY, backgroundColor, backgroundImage)
              └── <section> with Tailwind classes
                    └── columns[]
                          └── column.span (desktop, tablet, mobile)
                                └── responsiveColumnClasses()
                                      └── col-span-{n} md:col-span-{n} lg:col-span-{n}
                                            └── components[]
                                                  │
                                                  ▼
                                          ComponentRenderer
                                            ├── instance.visibility[device] check
                                            ├── componentRegistry[instance.type] lookup
                                            ├── definition.renderer({ config, style })
                                            │     ├── HeadingRenderer  → <h1>-<h4>
                                            │     ├── TextRenderer     → dangerouslySetInnerHTML
                                            │     ├── ButtonRenderer   → <a> CTA
                                            │     ├── HeroRenderer     → Hero section
                                            │     ├── CardGridRenderer → 3-col grid
                                             │     ├── SpacerRenderer   → <div style={{height}}>
                                             │     └── sampleHtmlComponentRenderer (for html-component-*)
                                             │           └── Extracts __html* metadata from config
                                             │           └── <HtmlComponentPlayer />
                                             │                 ├── Template: data-if, data-repeat, data-event-*,
                                             │                 │   {{content.X}}, {{settings.X}}, {{state.X}},
                                             │                 │   {{Math.*}}, aliases (user.name, etc.)
                                             │                 ├── Runtime: { settings, content, state }
                                             │                 ├── Lifecycle: onInit → onLoad → API calls
                                             │                 ├── API bindings: fetch, responseMap, paginate
                                             │                 ├── Events: click handlers, pagination CTA
                                             │                 └── State: loading, error, page, totalPages
                                            └── AnimationWrapper
                                                  └── framer-motion (fade, slide, scale, etc.)
```

---

## How Content Studio Connects

### Content Studio Page → DynamicPage

1. Admin creates a page in `/admin/content/studio` using the visual editor
2. Page data is saved to `localStorage` under key: `cms-studio.pages.v1`
3. When status is `"published"`, DynamicPage picks it up at resolution step 2:

```typescript
const published = localStorageDb.listPages()
  .filter(p => p.status === "published");
if (published.length > 0) return published[0];
```

### HtmlComponent Builder → DynamicPage

1. Admin creates a component in `/admin/componentbuilder/new` (or edit)
2. Defines settings (Config), content fields (ContentStructure), and HTML template with `{{ }}` placeholders
3. Saved to backend at `POST /api/v1/html-component/save`
4. DynamicPage fetches via:

```typescript
const { data } = useGetActiveHtmlComponentsQuery({ offset: 1, limit: 200, query: "" });
```

5. Each record is converted via `toCmsDefinition(item)` — same function used by CmsStudioPage:

```typescript
interface BackendHtmlComponent {
  HtmlComponentId: number;
  Name: string;
  DisplayName: string;
  Config: string;            // JSON: { settings: [{ key, label, type, defaultValue }] }
  ContentStructure: string;  // JSON: [{ key, label, type, defaultValue }]
  HtmlTemplate: string;      // HTML with {{settings.KEY}} / {{content.KEY}}
}
```

6. Resulting `CmsComponentDefinition` gets type `html-component-{HtmlComponentId}` and is registered into `componentRegistry`
7. Any `CmsPage` referencing a component with that type will render via `sampleHtmlComponentRenderer` → `<HtmlComponentPlayer />`

### HtmlComponentPlayer — the new renderer

```
sampleHtmlComponentRenderer({ config, style })
  │
  ├── Extracts from instance.config:
  │     ├── __htmlTemplate        → htmlTemplate
  │     ├── __htmlSettings        → config.settings[]
  │     ├── __htmlContentStructure → contentStructure[]
  │     ├── __htmlState           → config.state
  │     ├── __htmlApiBindings     → config.apiConfig.bindings
  │     ├── __htmlEventBindings   → config.events
  │     └── __htmlRuntimeOptions  → config.runtimeOptions
  │
  ├── Separates settings values vs content values
  │     (by checking each config key against __htmlSettings / __htmlContentStructure)
  │
  └── Returns:
      <HtmlComponentPlayer
        htmlTemplate={template}
        config={{ settings, state, apiConfig, events, runtimeOptions }}
        contentStructure={[...]}
      />
        │
        └── HtmlComponentPlayer manages its own:
              ├── Runtime state: { settings, content, state }
              ├── Lifecycle: onInit → onLoad → API calls
              ├── Template engine: data-if, data-repeat, data-event-*, {{ }} aliases
              ├── API fetch + response map + pagination
              └── DOM event delegation → action chains
```

---

## Sample Payload Structure

### CmsPage Shape (sampleLandingPage)

```
CmsPage
 ├── id: string
 ├── title: string
 ├── slug: string
 ├── status: "draft" | "published" | "archived"
 ├── masterLayoutId: string | null         → "landing" | "none" | null
 ├── masterLayoutConfig: MasterLayoutConfig → brandName, navItems, headerStyle, footerText, etc.
 ├── seo: SeoSettings                        → metaTitle, metaDescription, keywords, ogImage
 ├── settings: { containerMode, backgroundColor, customCss? }
 ├── sections: CmsSection[]
 │    └── id, name, layoutPresetId
 │        settings: { layoutMode, fullWidth, paddingY, backgroundColor, backgroundImage }
 │        columns: CmsColumn[]
 │          └── id, title, span: { desktop, tablet, mobile }
 │              components: string[]  (references component IDs)
 ├── components: Record<string, CmsComponentInstance>
│    └── id, type, name
│        config: Record<string, unknown>   (component-specific data + __html* metadata)
│        │  └── For built-in types: plain key-value pairs matching ConfigFields
│        │  └── For html-component-* types (CmsComponentInstance):
│        │        ├── Content values: title, description, icon, users, selectedUser, ...
│        │        ├── Settings values: bgColor, padding, Columns, ...
│        │        ├── __htmlTemplate: string        ← HTML template with {{ }} placeholders
│        │        ├── __htmlSettings: array          ← Settings field definitions
│        │        ├── __htmlContentStructure: array  ← Content field definitions
│        │        ├── __htmlState: object            ← State schema (loading, page, etc.)
│        │        ├── __htmlApiBindings: object      ← API binding configs
│        │        ├── __htmlEventBindings: object    ← Event handler configs
│        │        └── __htmlRuntimeOptions: object    ← Runtime flags
│        style: { padding, margin, backgroundColor, textColor, borderRadius, shadow, align }
│        visibility: { desktop, tablet, mobile }
│        animation?: { presetId, trigger, duration, delay }
│        locked: boolean
 └── version, createdAt, updatedAt, publishedAt
```

### HtmlComponent Record Shapes

#### Static Component (sampleFeatureHighlight — html-component-1)

```
SampleHtmlComponentRecord
 ├── HtmlComponentId: 1
 ├── Name: "featureHighlight"
 ├── DisplayName: "Feature Highlight"
 ├── Config: JSON({ settings: [
 │     { key: "bgColor", label: "Background Color", type: "color", defaultValue: "#ffffff" },
 │     { key: "padding", label: "Padding", type: "select", options: ["sm","md","lg","xl"], defaultValue: "md" }
 │   ]})
 ├── ContentStructure: JSON([
 │     { key: "title", label: "Title", type: "text", defaultValue: "Feature Title" },
 │     { key: "description", label: "Description", type: "textarea", defaultValue: "..." },
 │     { key: "icon", label: "Icon URL", type: "image", defaultValue: "" }
 │   ])
 ├── HtmlTemplate: `<div>...{{settings.bgColor}}...{{content.title}}...</div>`
 ├── StateSchema: JSON({})              ← No state (static)
 ├── ApiBindings: JSON({})              ← No API binding
 ├── EventBindings: JSON({ onInit: [], onLoad: [] })  ← No events
 └── RuntimeOptions: JSON({ useRealApi: true, ... })
```

#### Full-Lifecycle Component (sampleUserCardsComponent — html-component-2)

```
SampleHtmlComponentRecord
 ├── HtmlComponentId: 2
 ├── Name: "userCards"
 ├── DisplayName: "User Cards"
 ├── Config: JSON({ settings: [{ key: "Columns", label: "Card Columns", ... }] })
 ├── ContentStructure: JSON([
 │     { key: "title", type: "text" },
 │     { key: "subtitle", type: "textarea" },
 │     { key: "allUsers", type: "array" },       ← populated by API
 │     { key: "users", type: "array" },            ← paginated slice
 │     { key: "selectedUser", type: "object" }     ← populated by detail API
 │   ])
 ├── HtmlTemplate: `<section>...<template data-repeat="content.users" data-as="user">...
 │     {{user.name}}...<button data-event-click="viewUser">...</button>...
 │     <button data-event-click="prevPage">Previous</button>...</section>`
 ├── StateSchema: JSON({ loading: false, error: null, page: 1, pageSize: 3,
 │     totalRecords: 0, totalPages: 1, selectedId: null })
 ├── ApiBindings: JSON({
 │     loadUsers: { url: "https://jsonplaceholder.typicode.com/users",
 │       method: "GET", trigger: "onLoad", responseMap: {
 │         "content.allUsers": "$.data",
 │         "state.totalRecords": "$.data.length"
 │       }, beforeActions: [...], successActions: [...], errorActions: [...] },
 │     loadUserDetail: { url: "https://jsonplaceholder.typicode.com/users/{{state.selectedId}}",
 │       method: "GET", trigger: "onClick", responseMap: {
 │         "content.selectedUser": "$.data"
 │       }, ... }
 │   })
 ├── EventBindings: JSON({
 │     onInit: [],
 │     onLoad: [{ type: "api", binding: "loadUsers" }],
 │     onClick: {
 │       viewUser: [{ type: "setState", path: "state.selectedId", value: "{{Number(event.dataset.id)}}" },
 │                  { type: "api", binding: "loadUserDetail" }],
 │       closeDetail: [{ type: "setContent", path: "content.selectedUser", value: null }],
 │       nextPage: [{ type: "setState", path: "state.page", value: "..." },
 │                  { type: "paginate", source: "content.allUsers", target: "content.users" }],
 │       prevPage: [{ type: "setState", path: "state.page", value: "..." },
 │                  { type: "paginate", source: "content.allUsers", target: "content.users" }]
 │     }
 │   })
 └── RuntimeOptions: JSON({ useRealApi: true, sanitizeHtml: true, allowScript: false, ... })
```

---

## Key Files & Responsibilities

```
src/
├── pages/
│   └── Public/
│       └── DynamicPage.tsx          ← Public page entry: data resolution + component reg
│
├── pages/Admin/ContentStudio/
│   ├── CmsStudioPage.tsx            ← Admin page builder (loads from localStorage + API)
│   ├── types/cms.ts                 ← CmsPage, CmsComponentInstance, CmsSection, etc.
│   ├── renderer/
│   │   ├── PageRenderer.tsx         ← Section → Column → Component traversal
│   │   ├── ComponentRenderer.tsx    ← Registry lookup → renderer dispatch
│   │   ├── MasterLayoutRenderer.tsx ← Header/Footer/Shell wrapping
│   │   ├── RenderLayoutComponents.tsx
│   │   └── AnimationWrapper.tsx     ← Framer-motion wrapper
│   ├── registry/
│   │   ├── componentRegistry.ts     ← Built-in + dynamic component store
│   │   └── htmlComponentRegistry.ts ← Backend→CMS definition converter
│   ├── components/Renderers.tsx      ← All renderer implementations (built-in)
│   └── services/localStorageDb.ts    ← Client-side page CRUD
│
├── components/
│   └── htmlbuilder/
│       ├── HtmlComponentPlayer.tsx   ← Standalone HtmlComponent renderer with full
│       │                               lifecycle: template engine, API bindings,
│       │                               events, state management, pagination
│       └── Builder/
│           └── ComponentBuilderPlayground.tsx  ← Admin builder (DynamicRenderer inside)
│
├── data/
│   ├── sampleLandingPage.ts          ← Sample CmsPage payload (5 sections, 9 components)
│   └── sampleHtmlComponent.ts        ← Two sample HtmlComponent records:
│                                        featureHighlight (static) + userCards (API+events)
│
├── routes/RouteRegistrar.tsx         ← Route definitions (/) -> DynamicPage
│
└── redux/htmlbuilder/htmlBuilderAPI.tsx  ← RTK Query: HtmlComponent CRUD + active list
```

---

## Migration Path: Sample → API

Current state uses hardcoded `sampleLandingPage.ts` with embedded `__html*` metadata. To go live:

### Page data (replace sampleLandingPage):
```typescript
// DynamicPage.tsx — replace `useMemo` sample fallback with API call
const { data: pageData } = useGetPageBySlugQuery("/");
// or fetch("/api/v1/pages/home").then(res => res.json())
```

### HtmlComponent configs (add __html* metadata to API response):
For the `HtmlComponentPlayer` to work, each `CmsComponentInstance` of type `html-component-{id}` needs `__html*` metadata in its `config`. When rendering from a real API:

**Option A** — Extend `toCmsDefinition()` to store metadata in `defaultConfig`:
```typescript
// In htmlComponentRegistry.ts, add to defaultConfig:
defaultConfig.__htmlSettings = settings;
defaultConfig.__htmlContentStructure = contentStructure;
defaultConfig.__htmlState = parsedState || {};
defaultConfig.__htmlApiBindings = parsedApiBindings || {};
defaultConfig.__htmlEventBindings = parsedEventBindings || {};
defaultConfig.__htmlRuntimeOptions = parsedRuntimeOptions || {};
```

**Option B** — Return the full `HtmlComponentDetailDto` alongside the `CmsPage` so the renderer can look it up from a separate registry at render time.

### HtmlComponent API (already wired):
```typescript
useGetActiveHtmlComponentsQuery()  // already called on mount — registers
                                    // components into componentRegistry
```
