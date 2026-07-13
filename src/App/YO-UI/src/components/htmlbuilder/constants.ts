import { ComponentTemplate } from '../../types/builderTypes';

// This data matches the structure requested by the user, enhanced for the UI builder
export const AVAILABLE_TEMPLATES: ComponentTemplate[] = [
  {
    name: "HeroView",
    displayName: "Hero Banner",
    icon: "LayoutTemplate",
    settings: [
      { key: "Height", label: "Height", type: "select", options: ["auto", "full"], defaultValue: "auto" },
      { key: "Alignment", label: "Text Alignment", type: "select", options: ["text-left", "text-center", "text-right"], defaultValue: "text-center" },
    ],
    contentStructure: [
      { key: "headline", label: "Main Headline", type: "text", defaultValue: "Welcome to Our Platform" },
      { key: "subheadline", label: "Sub Headline", type: "textarea", defaultValue: "Build amazing websites with our drag and drop builder." },
      { key: "backgroundImage", label: "Background Image URL", type: "image", defaultValue: "https://picsum.photos/1200/800" },
    ],
    htmlTemplate: `
      <div class="relative flex items-center {{settings.Height}} {{settings.Alignment}} bg-slate-900 text-white overflow-hidden" style="min-height: {{settings.Height}}">
        <div class="absolute inset-0 z-0">
          {{#if content.backgroundImage}}
            <img src="{{content.backgroundImage}}" class="w-full h-full object-cover opacity-40" alt="Hero" />
          {{else}}
            <div class="w-full h-full bg-gradient-to-r from-blue-900 to-slate-900 opacity-90"></div>
          {{/if}}
        </div>
        <div class="relative z-10 container mx-auto px-6">
          <h1 class="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">{{content.headline}}</h1>
          <p class="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto mb-8">{{content.subheadline}}</p>
          <button class="px-8 py-3 bg-white text-slate-900 font-bold rounded hover:bg-gray-100">Get Started</button>
        </div>
      </div>
    `
  },
  {
    name: "2ColBoxView",
    displayName: "2-Col Feature",
    icon: "Columns",
    settings: [
      { key: "HeadingAlignment", label: "Heading Alignment", type: "select", options: ["text-left", "text-center"], defaultValue: "text-left" },
      { key: "SectionPadding", label: "Padding", type: "select", options: ["p-5", "p-10", "py-20"], defaultValue: "p-10" },
      { key: "Background", label: "Background", type: "select", options: ["layout--background-main", "layout--background-alt", "layout--background-dark"], defaultValue: "layout--background-main" },
      { key: "ShowBorder", label: "Show Border", type: "boolean", defaultValue: "false" },
      { key: "ShowShadow", label: "Show Shadow", type: "boolean", defaultValue: "false" },
    ],
    contentStructure: [
      { key: "title", label: "Section Title", type: "text", defaultValue: "Feature Highlight" },
      { key: "body", label: "Body Text", type: "textarea", defaultValue: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
      { key: "imageUrl", label: "Image URL", type: "image", defaultValue: "https://picsum.photos/600/600" },
      { key: "ctaText", label: "Button Text", type: "text", defaultValue: "Learn More" },
      { key: "icon", label: "Icon Name", type: "text", defaultValue: "Star" }
    ],
    htmlTemplate: `
      <div class="{{settings.SectionPadding}} {{settings.Background}} {{#if settings.ShowBorder}}border border-gray-200{{/if}} {{#if settings.ShowShadow}}shadow-lg{{/if}} transition-all duration-200">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div class="order-last md:order-first overflow-hidden rounded-lg bg-gray-200 h-64 relative group">
            {{#if content.imageUrl}}
              <img src="{{content.imageUrl}}" alt="Content" class="w-full h-full object-cover" />
            {{else}}
              <div class="flex items-center justify-center h-full text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              </div>
            {{/if}}
          </div>
          <div class="{{settings.HeadingAlignment}}">
            {{#if content.icon}}
              <div class="mb-4 inline-flex p-3 rounded-full bg-blue-100 text-blue-600 aspect-square items-center justify-center" data-icon="{{content.icon}}" data-icon-key="icon"></div>
            {{/if}}
            <h2 class="text-3xl font-bold mb-4">{{content.title}}</h2>
            <p class="opacity-80 leading-relaxed mb-6">{{content.body}}</p>
            {{#if content.ctaText}}
              <button class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">{{content.ctaText}}</button>
            {{/if}}
          </div>
        </div>
      </div>
    `
  },
  {
    name: "VideoFeatureView",
    displayName: "Video Feature",
    icon: "MonitorPlay",
    settings: [
      { key: "Layout", label: "Video Position", type: "select", options: ["left", "right"], defaultValue: "left" },
      { key: "Background", label: "Background", type: "select", options: ["layout--background-main", "layout--background-alt"], defaultValue: "layout--background-main" },
      { key: "Padding", label: "Padding", type: "select", options: ["p-10", "py-20"], defaultValue: "py-20" },
    ],
    contentStructure: [
      { key: "kicker", label: "Small Kicker", type: "text", defaultValue: "Watch It In Action" },
      { key: "headline", label: "Headline", type: "text", defaultValue: "Seamless integration" },
      { key: "body", label: "Description", type: "textarea", defaultValue: "See how our product works in this quick demonstration video." },
      { key: "videoUrl", label: "Video URL (Youtube/Vimeo/MP4)", type: "text", defaultValue: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
      { key: "feature1", label: "Feature Bullet 1", type: "text", defaultValue: "High Definition" },
      { key: "feature2", label: "Feature Bullet 2", type: "text", defaultValue: "Fast Streaming" },
      { key: "feature3", label: "Feature Bullet 3", type: "text", defaultValue: "No Buffering" },
      { key: "ctaText", label: "Button Text", type: "text", defaultValue: "Get Started Now" },
    ],
    htmlTemplate: `
      <div class="{{settings.Padding}} {{settings.Background}}">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="{{#if settings.Layout === 'right'}}order-last lg:order-first{{/if}}">
            <div class="aspect-video rounded-lg overflow-hidden shadow-lg bg-gray-800" data-video="{{content.videoUrl}}"></div>
          </div>
          <div>
            <div class="text-sm font-bold text-blue-600 uppercase tracking-wide mb-2">{{content.kicker}}</div>
            <h2 class="text-3xl font-bold mb-4 text-gray-900">{{content.headline}}</h2>
            <p class="text-gray-600 mb-6 leading-relaxed">{{content.body}}</p>
            <ul class="space-y-2 mb-8">
              {{#if content.feature1}}<li class="flex items-center gap-2"><div data-icon="CheckCircle" data-icon-size="18" class="text-green-500"></div><span>{{content.feature1}}</span></li>{{/if}}
              {{#if content.feature2}}<li class="flex items-center gap-2"><div data-icon="CheckCircle" data-icon-size="18" class="text-green-500"></div><span>{{content.feature2}}</span></li>{{/if}}
              {{#if content.feature3}}<li class="flex items-center gap-2"><div data-icon="CheckCircle" data-icon-size="18" class="text-green-500"></div><span>{{content.feature3}}</span></li>{{/if}}
            </ul>
            {{#if content.ctaText}}<button class="px-6 py-2.5 bg-gray-900 text-white rounded hover:bg-gray-800 transition">{{content.ctaText}}</button>{{/if}}
          </div>
        </div>
      </div>
    `
  },
  {
    name: "TabsView",
    displayName: "Tab Container",
    icon: "GalleryHorizontal",
    settings: [
      { key: "Padding", label: "Padding", type: "select", options: ["p-5", "p-10"], defaultValue: "p-10" },
    ],
    contentStructure: [
      {
        key: "tabs",
        label: "Tabs",
        type: "list",
        defaultValue: '[{"title":"Tab 1","content":"<p>Tab content here...</p>"}]',
        itemSchema: [
          { key: "title", label: "Tab Title", type: "text", defaultValue: "New Tab" },
          { key: "content", label: "Tab Content", type: "richtext", defaultValue: "<p>Add content...</p>" }
        ]
      },
    ],
    htmlTemplate: `
      <div class="{{settings.Padding}} bg-white">
        <div class="max-w-4xl mx-auto">
          <div class="flex border-b border-gray-200 mb-6 overflow-x-auto builder-tabs">
            {{#each content.tabs}}
              <button class="px-6 py-3 font-medium text-sm transition-colors border-b-2 pointer-events-auto whitespace-nowrap border-transparent text-gray-500 hover:text-gray-700" data-tab-index="{{@index}}">
                {{title}}
              </button>
            {{/each}}
          </div>
          <div class="min-h-[100px] text-gray-700 leading-relaxed bg-gray-50 p-6 rounded-lg prose max-w-none builder-tab-content">
            <!-- Content will be injected by JS or shown as first tab -->
          </div>
        </div>
      </div>
    `
  },
  {
    name: "AccordionView",
    displayName: "Accordion FAQ",
    icon: "ListCollapse",
    settings: [
      { key: "Padding", label: "Padding", type: "select", options: ["p-5", "p-10"], defaultValue: "p-10" },
    ],
    contentStructure: [
      {
        key: "items",
        label: "Accordion Items",
        type: "list",
        defaultValue: '[{"title":"Question 1","body":"<p>Answer goes here.</p>"}]',
        itemSchema: [
          { key: "title", label: "Question", type: "text", defaultValue: "New Question" },
          { key: "body", label: "Answer", type: "richtext", defaultValue: "<p>Answer...</p>" }
        ]
      },
    ],
    htmlTemplate: `
      <div class="{{settings.Padding}} bg-white">
        <div class="max-w-3xl mx-auto space-y-2 builder-accordion">
          {{#each content.items}}
            <div class="border border-gray-200 rounded-lg overflow-hidden accordion-item">
              <button class="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition text-left font-medium text-gray-800 pointer-events-auto accordion-trigger" data-item-index="{{@index}}">
                {{title}}
                <div data-icon="ChevronDown" data-icon-size="18" class="transform transition-transform accordion-icon"></div>
              </button>
              <div class="hidden p-4 bg-white text-gray-600 border-t border-gray-100 prose max-w-none accordion-content">
                {{body}}
              </div>
            </div>
          {{/each}}
        </div>
      </div>
    `
  },
  {
    name: "FeatureGridView",
    displayName: "Feature Grid",
    icon: "Grid",
    settings: [
      { key: "Columns", label: "Columns", type: "select", options: ["2", "3", "4"], defaultValue: "3" },
      { key: "Padding", label: "Padding", type: "select", options: ["p-10", "py-20"], defaultValue: "p-10" },
    ],
    contentStructure: [
      { key: "mainTitle", label: "Section Title", type: "text", defaultValue: "Why Choose Us" },
      { key: "mainDesc", label: "Section Description", type: "textarea", defaultValue: "We provide the best solutions for your business." },
      {
        key: "features",
        label: "Features",
        type: "list",
        defaultValue: '[{"title":"Fast","desc":"Optimized performance","icon":"Zap"}]',
        itemSchema: [
          { key: "title", label: "Title", type: "text", defaultValue: "Feature" },
          { key: "desc", label: "Description", type: "textarea", defaultValue: "Feature description." },
          { key: "icon", label: "Icon Name", type: "text", defaultValue: "Star" }
        ]
      }
    ],
    htmlTemplate: `
      <div class="{{settings.Padding}} bg-white">
        <div class="text-center mb-12 max-w-2xl mx-auto">
          <h2 class="text-3xl font-bold mb-4">{{content.mainTitle}}</h2>
          <p class="text-gray-600">{{content.mainDesc}}</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-{{settings.Columns}} gap-8">
          {{#each content.features}}
            <div class="p-6 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition border border-transparent hover:border-gray-100">
              <div class="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4" data-icon="{{icon}}" data-icon-size="20"></div>
              <h3 class="font-bold text-lg mb-2">{{title}}</h3>
              <p class="text-sm text-gray-500">{{desc}}</p>
            </div>
          {{/each}}
        </div>
      </div>
    `
  },
  {
    name: "TextBlockView",
    displayName: "Text Block",
    icon: "Type",
    settings: [
      { key: "Alignment", label: "Alignment", type: "select", options: ["text-left", "text-center"], defaultValue: "text-left" },
      { key: "Padding", label: "Padding", type: "select", options: ["p-5", "p-10"], defaultValue: "p-5" },
      { key: "Background", label: "Background", type: "select", options: ["layout--background-main", "layout--background-alt"], defaultValue: "layout--background-main" },
    ],
    contentStructure: [
      { key: "heading", label: "Heading", type: "text", defaultValue: "Simple Text Section" },
      { key: "text", label: "Content", type: "richtext", defaultValue: "<p>Write your main content here.</p>" },
    ],
    htmlTemplate: `
      <div class="{{settings.Padding}} {{settings.Alignment}} {{settings.Background}}">
        <div class="max-w-4xl mx-auto">
          {{#if content.heading}}
            <h3 class="text-2xl font-semibold mb-3 text-current">{{content.heading}}</h3>
          {{/if}}
          <div class="prose max-w-none text-current opacity-80">
            {{content.text}}
          </div>
        </div>
      </div>
    `
  },
  {
    name: "MultiColTextView",
    displayName: "Multi-Col Text",
    icon: "LayoutList",
    settings: [
      { key: "Columns", label: "Columns", type: "select", options: ["2", "3", "4"], defaultValue: "3" },
      { key: "Background", label: "Background", type: "select", options: ["layout--background-main", "layout--background-alt"], defaultValue: "layout--background-main" },
      { key: "Padding", label: "Padding", type: "select", options: ["p-10"], defaultValue: "p-10" },
    ],
    contentStructure: [
      { key: "col1Title", label: "Column 1 Title", type: "text", defaultValue: "Column One" },
      { key: "col1Text", label: "Column 1 Text", type: "textarea", defaultValue: "Lorem ipsum dolor sit amet." },
      { key: "col2Title", label: "Column 2 Title", type: "text", defaultValue: "Column Two" },
      { key: "col2Text", label: "Column 2 Text", type: "textarea", defaultValue: "Consectetur adipiscing elit." },
      { key: "col3Title", label: "Column 3 Title", type: "text", defaultValue: "Column Three" },
      { key: "col3Text", label: "Column 3 Text", type: "textarea", defaultValue: "Sed do eiusmod tempor incididunt." },
      { key: "col4Title", label: "Column 4 Title", type: "text", defaultValue: "Column Four" },
      { key: "col4Text", label: "Column 4 Text", type: "textarea", defaultValue: "Ut labore et dolore magna aliqua." },
    ],
    htmlTemplate: `
      <div class="{{settings.Padding}} {{settings.Background}}">
        <div class="grid grid-cols-1 md:grid-cols-{{settings.Columns}} gap-8">
          {{#if content.col1Title}}<div class="space-y-3"><h3 class="text-lg font-bold text-gray-900">{{content.col1Title}}</h3><p class="text-gray-600 leading-relaxed text-sm">{{content.col1Text}}</p></div>{{/if}}
          {{#if content.col2Title}}<div class="space-y-3"><h3 class="text-lg font-bold text-gray-900">{{content.col2Title}}</h3><p class="text-gray-600 leading-relaxed text-sm">{{content.col2Text}}</p></div>{{/if}}
          {{#if content.col3Title}}<div class="space-y-3"><h3 class="text-lg font-bold text-gray-900">{{content.col3Title}}</h3><p class="text-gray-600 leading-relaxed text-sm">{{content.col3Text}}</p></div>{{/if}}
          {{#if content.col4Title}}<div class="space-y-3"><h3 class="text-lg font-bold text-gray-900">{{content.col4Title}}</h3><p class="text-gray-600 leading-relaxed text-sm">{{content.col4Text}}</p></div>{{/if}}
        </div>
      </div>
    `
  },
  {
    name: "TitleView",
    displayName: "Title / Header",
    icon: "Heading",
    settings: [
      { key: "Size", label: "Title Size", type: "select", options: ["h1", "h2", "h3"], defaultValue: "h2" },
      { key: "Alignment", label: "Alignment", type: "select", options: ["text-left", "text-center"], defaultValue: "text-center" },
      { key: "Padding", label: "Padding", type: "select", options: ["p-5", "p-10"], defaultValue: "p-10" },
    ],
    contentStructure: [
      { key: "title", label: "Title", type: "text", defaultValue: "Section Heading" },
      { key: "subtitle", label: "Subtitle", type: "text", defaultValue: "Optional subtitle text goes here" },
      { key: "divider", label: "Show Divider", type: "text", defaultValue: "true" },
    ],
    htmlTemplate: `
      <div class="{{settings.Padding}} {{settings.Alignment}}">
        <h2 class="{{#if settings.Size}}{{#if settings.Size}}text-4xl md:text-5xl{{/if}}{{else}}text-3xl{{/if}} font-bold text-gray-900 mb-2">{{content.title}}</h2>
        {{#if content.subtitle}}
          <p class="text-xl text-gray-500 max-w-2xl mx-auto">{{content.subtitle}}</p>
        {{/if}}
        {{#if content.divider}}
          <div class="h-1 w-20 bg-blue-500 mt-4 rounded {{#if settings.Alignment}}mx-auto{{/if}}"></div>
        {{/if}}
      </div>
    `
  },
  {
    name: "BlockQuoteView",
    displayName: "Block Quote",
    icon: "Quote",
    settings: [
      { key: "Style", label: "Style", type: "select", options: ["modern", "classic"], defaultValue: "modern" },
      { key: "Alignment", label: "Alignment", type: "select", options: ["text-left", "text-center"], defaultValue: "text-center" },
      { key: "Padding", label: "Padding", type: "select", options: ["p-10"], defaultValue: "p-10" },
      { key: "Background", label: "Background", type: "select", options: ["layout--background-main", "layout--background-alt"], defaultValue: "layout--background-alt" },
    ],
    contentStructure: [
      { key: "quote", label: "Quote", type: "textarea", defaultValue: "This is one of the best services we have ever used. Highly recommended!" },
      { key: "author", label: "Author", type: "text", defaultValue: "Jane Doe" },
      { key: "role", label: "Role/Company", type: "text", defaultValue: "CEO, TechCorp" },
    ],
    htmlTemplate: `
      <div class="{{settings.Padding}} {{settings.Background}}">
        <div class="max-w-4xl mx-auto {{settings.Alignment}}">
          {{#if settings.Style}}
            <blockquote class="border-l-4 border-blue-500 pl-4 italic text-xl text-gray-700">
              "{{content.quote}}"
              <footer class="mt-4 text-sm font-semibold text-gray-900 not-italic">— {{content.author}}, <span class="text-gray-500">{{content.role}}</span></footer>
            </blockquote>
          {{else}}
            <div class="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-4 text-blue-200"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
              <p class="text-2xl font-serif italic text-gray-800 mb-6">"{{content.quote}}"</p>
              <div class="font-bold text-gray-900">{{content.author}}</div>
              <div class="text-sm text-gray-500">{{content.role}}</div>
            </div>
          {{/if}}
        </div>
      </div>
    `
  },
  {
    name: "FeatureCardView",
    displayName: "Feature Card",
    icon: "CreditCard",
    settings: [
      { key: "Alignment", label: "Alignment", type: "select", options: ["text-left", "text-center"], defaultValue: "text-left" },
      { key: "Background", label: "Background", type: "select", options: ["bg-white", "bg-blue-50", "bg-gray-50"], defaultValue: "bg-white" },
    ],
    contentStructure: [
      { key: "title", label: "Title", type: "text", defaultValue: "Feature Name" },
      { key: "description", label: "Description", type: "textarea", defaultValue: "Description of the feature." },
      { key: "icon", label: "Icon", type: "text", defaultValue: "Zap" },
      { key: "linkText", label: "Link Text", type: "text", defaultValue: "Learn more" },
    ],
    htmlTemplate: `
      <div class="p-4 md:p-8">
        <div class="h-full {{settings.Background}} p-6 rounded-xl border border-gray-100 shadow-lg hover:shadow-xl transition-shadow {{settings.Alignment}}">
          <div class="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-lg mb-4 flex-shrink-0" data-icon="{{content.icon}}" data-icon-key="icon" data-icon-size="24"></div>
          <h3 class="text-lg font-bold mb-2 text-gray-800">{{content.title}}</h3>
          <p class="text-gray-600 mb-4 text-sm leading-relaxed">{{content.description}}</p>
          {{#if content.linkText}}
            <a href="#" class="text-blue-600 font-medium text-sm hover:underline inline-flex items-center gap-1">
              {{content.linkText}} <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
          {{/if}}
        </div>
      </div>
    `
  },
  {
    name: "SimpleBoxView",
    displayName: "Simple Box",
    icon: "Square",
    settings: [
      { key: "Rounded", label: "Rounded Corners", type: "boolean", defaultValue: "true" },
      { key: "Border", label: "Show Border", type: "boolean", defaultValue: "true" },
      { key: "Padding", label: "Padding", type: "select", options: ["p-5", "p-8", "p-12"], defaultValue: "p-8" },
      { key: "Background", label: "Background", type: "select", options: ["bg-white", "bg-gray-50"], defaultValue: "bg-white" },
    ],
    contentStructure: [
      { key: "title", label: "Title", type: "text", defaultValue: "Box Title" },
      { key: "description", label: "Content", type: "textarea", defaultValue: "Box content goes here." },
    ],
    htmlTemplate: `
      <div class="p-8">
        <div class="{{settings.Padding}} {{settings.Background}} {{#if settings.Rounded}}rounded-xl{{/if}} {{#if settings.Border}}border border-gray-200{{/if}} shadow-sm">
          <h3 class="text-xl font-bold mb-2">{{content.title}}</h3>
          <p class="text-gray-600">{{content.description}}</p>
        </div>
      </div>
    `
  },
  {
    name: "VideoView",
    displayName: "Video Embed",
    icon: "Video",
    settings: [
      { key: "MaxWidth", label: "Size", type: "select", options: ["small", "medium", "large"], defaultValue: "medium" },
      { key: "AutoPlay", label: "AutoPlay (Muted)", type: "boolean", defaultValue: "false" },
      { key: "Padding", label: "Padding", type: "select", options: ["p-5", "p-10"], defaultValue: "p-10" },
    ],
    contentStructure: [
      { key: "videoUrl", label: "Video URL", type: "text", defaultValue: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    ],
    htmlTemplate: `
      <div class="{{settings.Padding}} bg-white flex justify-center">
        <div class="w-full max-w-{{#if settings.MaxWidth === 'small'}}2xl{{else}}{{#if settings.MaxWidth === 'large'}}6xl{{else}}4xl{{/if}}{{/if}} aspect-video rounded-xl overflow-hidden shadow-2xl bg-black" data-video="{{content.videoUrl}}" data-video-autoplay="{{settings.AutoPlay}}"></div>
      </div>
    `
  },
  {
    name: "BlogListView",
    displayName: "Blog List (Dynamic)",
    icon: "Newspaper",
    settings: [
      { key: "PostCount", label: "Number of Posts", type: "select", options: ["3", "6"], defaultValue: "3" },
      { key: "Padding", label: "Padding", type: "select", options: ["p-10", "py-20"], defaultValue: "p-10" },
    ],
    contentStructure: [
      { key: "sectionTitle", label: "Section Heading", type: "text", defaultValue: "Latest News" },
      { key: "showLink", label: "Show 'View All' Link", type: "text", defaultValue: "true" },
    ],
    htmlTemplate: `
      <div class="{{settings.Padding}} bg-white">
        <div class="flex justify-between items-end mb-8">
          <div>
            <h2 class="text-3xl font-bold">{{content.sectionTitle}}</h2>
          </div>
          {{#if content.showLink === 'true'}}
            <a href="#" class="text-blue-600 font-semibold hover:underline">View All Posts &rarr;</a>
          {{/if}}
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <article class="group cursor-pointer">
            <div class="rounded-xl overflow-hidden mb-4 relative aspect-[4/3]">
              <img src="https://picsum.photos/seed/blog1/400/250" alt="Blog" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
            </div>
            <div class="text-xs text-blue-600 font-bold mb-2 uppercase tracking-wide">Oct 24, 2023</div>
            <h3 class="text-xl font-bold mb-2 group-hover:text-blue-700 transition">Getting Started with Web Development</h3>
            <p class="text-gray-600 text-sm line-clamp-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </article>
          <article class="group cursor-pointer">
            <div class="rounded-xl overflow-hidden mb-4 relative aspect-[4/3]">
              <img src="https://picsum.photos/seed/blog2/400/250" alt="Blog" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
            </div>
            <div class="text-xs text-blue-600 font-bold mb-2 uppercase tracking-wide">Oct 25, 2023</div>
            <h3 class="text-xl font-bold mb-2 group-hover:text-blue-700 transition">The Future of CSS</h3>
            <p class="text-gray-600 text-sm line-clamp-2">Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          </article>
          <article class="group cursor-pointer">
            <div class="rounded-xl overflow-hidden mb-4 relative aspect-[4/3]">
              <img src="https://picsum.photos/seed/blog3/400/250" alt="Blog" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
            </div>
            <div class="text-xs text-blue-600 font-bold mb-2 uppercase tracking-wide">Oct 26, 2023</div>
            <h3 class="text-xl font-bold mb-2 group-hover:text-blue-700 transition">React vs Vue: A Comparison</h3>
            <p class="text-gray-600 text-sm line-clamp-2">Ut enim ad minim veniam, quis nostrud exercitation ullamco.</p>
          </article>
        </div>
      </div>
    `
  },
];

export const SAMPLE_HTML = `
<div class="builder-component" style="display: contents;" data-template-name="HeroView" data-id="sample-hero" data-settings='{"Height":"auto","Alignment":"text-center"}' data-content='{"headline":"Welcome to Builder","subheadline":"This is a sample layout loaded from a string constant.","backgroundImage":"https://picsum.photos/1200/800"}'></div>
<div class="builder-component" style="display: contents;" data-template-name="TextBlockView" data-id="sample-text" data-settings='{"Alignment":"text-left","Padding":"p-10","Background":"layout--background-main"}' data-content='{"heading":"Rich Text Features","text":"&lt;p&gt;You can now use &lt;strong&gt;bold&lt;/strong&gt; text, &lt;em&gt;italics&lt;/em&gt;, and lists.&lt;/p&gt;"}'></div>
<div class="builder-component" style="display: contents;" data-template-name="TabsView" data-id="sample-tabs" data-settings='{"Padding":"p-10"}' data-content='{"tabs":"[{\"title\":\"Features\",\"content\":\"&lt;p&gt;Our features are amazing.&lt;/p&gt;\"},{\"title\":\"Pricing\",\"content\":\"&lt;p&gt;Affordable plans for everyone.&lt;/p&gt;\"}]"}'></div>
`;