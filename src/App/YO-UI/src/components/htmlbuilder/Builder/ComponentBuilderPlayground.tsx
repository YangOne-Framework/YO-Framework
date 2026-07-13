import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { useTranslation } from "react-i18next";
import Button from "@/components/ui/button/Button";
import { Card, CardContent } from "@/components/ui/card/Card";
import Input from "@/components/ui/input/Input";
import Textarea from "@/components/ui/textarea/Textarea";
import Badge from "@/components/ui/badge/Badge";
import {
  AlertTriangle,
  Bug,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Code2,
  Database,
  Edit3,
  Eye,
  FileJson,
  Layers,
  Lightbulb,
  Loader2,
  Lock,
  Monitor,
  MousePointerClick,
  HelpCircle,
  PlugZap,
  Plus,
  RefreshCcw,
  Save,
  Settings,
  Settings2,
  Smartphone,
  Sparkles,
  Tablet,
  Trash2,
  Wand2,
  ArrowLeft,
  GripVertical,
  X
} from "lucide-react";
import { AIChatDialog } from "../../ai-chat/AIChatDialog";
import { AIChatButton } from "../../ai-chat/AIChatButton";
import { useForm, Controller } from "react-hook-form";
import { HtmlComponentDetailDto } from "../../../types/builderTypes";
import { useSaveHtmlComponentMutation, useLazyCheckHtmlComponentNameUniqueQuery } from "../../../redux/htmlbuilder/htmlBuilderAPI";
import toaster from "../../../components/toster";

const USER_CARDS_HTML_TEMPLATE = `<section class="rounded-3xl bg-white p-7 shadow-sm border border-slate-200">
  <div class="flex flex-wrap items-start justify-between gap-4">
    <div>
      <p class="text-xs font-bold uppercase tracking-widest text-red-600">API Bound Component</p>
      <h2 class="mt-2 text-3xl font-black text-slate-950">{{content.title}}</h2>
      <p class="mt-2 max-w-2xl text-slate-600">{{content.subtitle}}</p>
    </div>
    <div class="rounded-2xl bg-slate-100 px-5 py-3 text-center">
      <div class="text-xs font-semibold text-slate-500">Total Users</div>
      <div class="text-2xl font-black text-slate-900">{{state.totalRecords}}</div>
    </div>
  </div>

  <div data-if="state.loading" class="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-700">
    Loading users from configured API...
  </div>

  <div data-if="state.error" class="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
    {{state.error}}
  </div>

  <div class="mt-7 grid gap-4 {{settings.Columns}}">
    <template data-repeat="content.users" data-as="user">
      <article class="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
        <div class="flex items-start gap-4">
          <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-xl font-black text-white">
            {{user.name.charAt(0)}}
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="truncate text-lg font-black text-slate-950">{{user.name}}</h3>
            <p class="truncate text-sm font-semibold text-slate-500">@{{user.username}}</p>
          </div>
        </div>

        <div class="mt-5 space-y-2 text-sm text-slate-700">
          <div><strong>Email:</strong> {{user.email}}</div>
          <div><strong>Phone:</strong> {{user.phone}}</div>
          <div><strong>Company:</strong> {{user.company.name}}</div>
          <div><strong>City:</strong> {{user.address.city}}</div>
        </div>

        <button data-event-click="viewUser" data-id="{{user.id}}" class="mt-5 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">
          View Detail
        </button>
      </article>
    </template>
  </div>

  <div class="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-100 p-3">
    <button data-event-click="prevPage" class="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-800 shadow-sm">Previous</button>
    <div class="text-sm font-bold text-slate-700">Page {{state.page}} of {{state.totalPages}}</div>
    <button data-event-click="nextPage" class="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-800 shadow-sm">Next</button>
  </div>

  <div data-if="content.selectedUser" class="mt-7 rounded-3xl border border-red-200 bg-red-50 p-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p class="text-xs font-black uppercase tracking-widest text-red-600">Detail API Result</p>
        <h3 class="mt-2 text-2xl font-black text-red-950">{{content.selectedUser.name}}</h3>
        <p class="mt-2 text-red-900"><strong>Website:</strong> {{content.selectedUser.website}}</p>
        <p class="mt-1 text-red-900"><strong>Address:</strong> {{content.selectedUser.address.street}}, {{content.selectedUser.address.city}}</p>
      </div>
      <button data-event-click="closeDetail" class="rounded-xl bg-white px-4 py-2 text-sm font-bold text-red-700 shadow-sm">Close</button>
    </div>
  </div>
</section>`;

const USER_CARDS_CONFIG = {
  settings: [
    { key: "Columns", label: "Card Columns", type: "select", options: ["grid-cols-1", "grid-cols-2", "grid-cols-3"], defaultValue: "grid-cols-3" }
  ],
  state: { loading: false, error: null, page: 1, pageSize: 3, totalRecords: 0, totalPages: 1, selectedId: null },
  apiConfig: {
    bindings: {
      loadUsers: {
        url: "https://jsonplaceholder.typicode.com/users",
        method: "GET",
        trigger: "onLoad",
        autoFetch: true,
        query: {},
        body: null,
        responseMap: { "content.allUsers": "$.data", "state.totalRecords": "$.data.length" },
        beforeActions: [
          { type: "setState", path: "state.loading", value: true },
          { type: "setState", path: "state.error", value: null }
        ],
        successActions: [
          { type: "setState", path: "state.loading", value: false },
          { type: "paginate", source: "content.allUsers", target: "content.users" }
        ],
        errorActions: [
          { type: "setState", path: "state.loading", value: false },
          { type: "setState", path: "state.error", value: "$.message" }
        ]
      },
      loadUserDetail: {
        url: "https://jsonplaceholder.typicode.com/users/{{state.selectedId}}",
        method: "GET",
        trigger: "onClick",
        autoFetch: false,
        query: {},
        body: null,
        responseMap: { "content.selectedUser": "$.data" },
        beforeActions: [
          { type: "setState", path: "state.loading", value: true },
          { type: "setState", path: "state.error", value: null }
        ],
        successActions: [{ type: "setState", path: "state.loading", value: false }],
        errorActions: [
          { type: "setState", path: "state.loading", value: false },
          { type: "setState", path: "state.error", value: "$.message" }
        ]
      }
    }
  },
  events: {
    onInit: [],
    onLoad: [{ type: "api", binding: "loadUsers" }],
    onClick: {
      viewUser: [
        { type: "setState", path: "state.selectedId", value: "{{Number(event.dataset.id)}}" },
        { type: "api", binding: "loadUserDetail" }
      ],
      closeDetail: [
        { type: "setContent", path: "content.selectedUser", value: null },
        { type: "setState", path: "state.selectedId", value: null }
      ],
      nextPage: [
        { type: "setState", path: "state.page", value: "{{Math.min(state.page + 1, state.totalPages)}}" },
        { type: "paginate", source: "content.allUsers", target: "content.users" }
      ],
      prevPage: [
        { type: "setState", path: "state.page", value: "{{Math.max(state.page - 1, 1)}}" },
        { type: "paginate", source: "content.allUsers", target: "content.users" }
      ]
    },
    onChange: {},
    onInput: {},
    onSubmit: {},
    onKeyDown: {},
    onDoubleClick: {},
    onMouseEnter: {},
    onMouseLeave: {},
    onScroll: {},
    onClose: []
  },
  runtimeOptions: { sanitizeHtml: true, allowScript: false, useRealApi: true, fallbackToMock: false, renderMode: "client" }
};

const SIMPLE_BASIC_TEMPLATE = `<section class="rounded-2xl bg-white p-8 shadow-sm border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
  <div class="text-center max-w-2xl mx-auto {{settings.Padding}} {{settings.Background}}">
    <h2 class="text-3xl font-bold text-gray-900 dark:text-white">{{content.heading}}</h2>
    <p class="mt-3 text-gray-600 dark:text-gray-400">{{content.description}}</p>
  </div>
</section>`;

const SIMPLE_BASIC_CONFIG = {
  settings: [
    { key: "Padding", label: "Padding", type: "select", options: ["p-8", "p-12", "p-16"], defaultValue: "p-8" },
    { key: "Background", label: "Background", type: "select", options: ["bg-white", "bg-gray-50", "bg-blue-50"], defaultValue: "bg-white" }
  ],
  state: {},
  apiConfig: { bindings: {} },
  events: {},
  runtimeOptions: { sanitizeHtml: true, allowScript: false, useRealApi: true, fallbackToMock: false, renderMode: "client" }
};

const SIMPLE_BASIC_CONTENT_STRUCTURE = [
  { key: "heading", label: "Heading", type: "text", defaultValue: "Welcome to My Component" },
  { key: "description", label: "Description", type: "textarea", defaultValue: "This is a simple reusable component built with the Component Builder. Edit this text or change the style settings." }
];

const USER_CARDS_CONTENT_STRUCTURE = [
  { key: "title", label: "Section Title", type: "text", defaultValue: "User Cards" },
  { key: "subtitle", label: "Section Subtitle", type: "textarea", defaultValue: "API is invoked onLoad. Response is mapped into content.allUsers, sliced into content.users, then looped inside the HTML template." },
  { key: "allUsers", label: "All API Users", type: "array", defaultValue: [] },
  { key: "users", label: "Paged Users", type: "array", defaultValue: [] },
  { key: "selectedUser", label: "Selected User", type: "object", defaultValue: null }
];

const TAB_HELP: Record<string, string> = {
  setup: "Give your component a name and configure style settings. Internal name must be unique — use PascalCase like 'UserCards'.",
  template: "Write HTML with dynamic placeholders. Use {{content.fieldName}} for data, {{settings.styleKey}} for CSS, and {{state.key}} for runtime values.",
  content: "Define the data structure. Each field becomes {{content.fieldName}} in the template. Use 'List' type for repeatable items with data-repeat.",
  api: "Bind external REST APIs. Map response fields into content or state. Test your bindings with the Fetch button before saving.",
  events: "Wire up interactivity. Lifecycle events fire automatically. DOM events trigger when users interact with data-event-* attributes.",
  state: "Default runtime values accessible as {{state.*}}. Updated by setState, paginate, or API response map actions.",
  advanced: "Edit the full component JSON directly. Changes override all other tabs. Invalid JSON will break the component."
};

function deepClone(value: any) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function safeJsonStringify(value: any) {
  try { return JSON.stringify(value, null, 2); } catch { return "null"; }
}

function getByPath(obj: any, path: string) {
  if (!path) return undefined;
  const cleanPath = String(path).replace(/^\$\./, "");
  return cleanPath.split(".").reduce((acc: any, part: string) => {
    if (acc == null) return undefined;
    if (part === "length" && Array.isArray(acc)) return acc.length;
    return acc[part];
  }, obj);
}

function setByPath(obj: any, path: string, value: any) {
  const parts = String(path).replace(/^\$\./, "").split(".");
  const clone = deepClone(obj);
  let cursor = clone;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    if (!cursor[part] || typeof cursor[part] !== "object") cursor[part] = {};
    cursor = cursor[part];
  }
  cursor[parts[parts.length - 1]] = value;
  return clone;
}

function evaluateExpression(value: any, runtime: any, event: any = {}) {
  if (typeof value !== "string") return value;
  if (!value.includes("{{") && !value.startsWith("$.")) return value;
  if (value.startsWith("$.")) return getByPath({ data: runtime.__lastApiData, message: runtime.__lastApiMessage }, value);

  const scope = { ...runtime, event, Math, Number, String, Boolean, parseInt, parseFloat };
  const exact = value.match(/^\{\{\s*([\s\S]+?)\s*\}\}$/);
  if (exact) {
    try {
      const result = Function(...Object.keys(scope), `return (${exact[1]});`)(...Object.values(scope));
      return result == null ? "" : result;
    } catch { return value; }
  }
  return value.replace(/\{\{\s*([\s\S]+?)\s*\}\}/g, (_match: string, expression: string) => {
    try {
      const result = Function(...Object.keys(scope), `return (${expression});`)(...Object.values(scope));
      return result == null ? "" : String(result);
    } catch { return ""; }
  });
}

function buildDefaults(contentStructure: any[], config: any) {
  const settings: Record<string, any> = {};
  const content: Record<string, any> = {};
  for (const item of config.settings || []) settings[item.key] = item.defaultValue ?? "";
  for (const item of contentStructure || []) content[item.key] = deepClone(item.defaultValue ?? null);
  return { settings, content, state: deepClone(config.state || {}) };
}

function applyResponseMap(runtime: any, responseMap: any, apiResponse: any) {
  let next = { ...runtime, __lastApiData: apiResponse.data, __lastApiMessage: apiResponse.message || null };
  for (const [targetPath, sourcePath] of Object.entries(responseMap || {})) next = setByPath(next, targetPath, getByPath(apiResponse, sourcePath as string));
  return next;
}

function paginateRuntime(runtime: any, sourcePath: string, targetPath: string) {
  const source = getByPath(runtime, sourcePath) || [];
  const pageSize = Number(runtime.state.pageSize || 3);
  const totalRecords = Array.isArray(source) ? source.length : 0;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const page = Math.min(Math.max(Number(runtime.state.page || 1), 1), totalPages);
  const start = (page - 1) * pageSize;
  let next = setByPath(runtime, targetPath, Array.isArray(source) ? source.slice(start, start + pageSize) : []);
  next = setByPath(next, "state.page", page);
  next = setByPath(next, "state.totalPages", totalPages);
  next = setByPath(next, "state.totalRecords", totalRecords);
  return next;
}

function buildUrl(binding: any, runtime: any) {
  const url = evaluateExpression(binding.url || "", runtime, {});
  const params = new URLSearchParams();
  for (const [key, raw] of Object.entries(binding.query || {})) {
    const value = evaluateExpression(raw, runtime, {});
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const queryText = params.toString();
  return queryText ? `${url}?${queryText}` : url;
}

async function fetchFromBinding(binding: any, runtime: any, runtimeOptions: any) {
  const url = buildUrl(binding, runtime);
  const method = binding.method || "GET";
  const options: RequestInit = { method, headers: { "Content-Type": "application/json" }, cache: "no-store" as RequestCache };
  if (["POST", "PUT", "PATCH"].includes(method) && binding.body) options.body = JSON.stringify(binding.body);
  if (!runtimeOptions?.useRealApi) throw new Error("Real API is disabled in runtimeOptions.useRealApi.");
  const response = await fetch(url, options);
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) throw new Error(`API failed with status ${response.status}`);
  return { success: true, data, message: null, url, method, status: response.status, source: "real-api", fetchedAt: new Date().toISOString() };
}

function readTemplateExpressions(templateString: string) {
  const expressions: string[] = [];
  let cursor = 0;
  while (cursor < templateString.length) {
    const start = templateString.indexOf("{{", cursor);
    if (start < 0) break;
    const end = templateString.indexOf("}}", start + 2);
    if (end < 0) break;
    expressions.push(templateString.slice(start + 2, end).trim());
    cursor = end + 2;
  }
  return expressions;
}

function readPathFromExpression(expression: string, prefix: string) {
  const paths: string[] = [];
  let cursor = 0;
  const marker = `${prefix}.`;
  while (cursor < expression.length) {
    const start = expression.indexOf(marker, cursor);
    if (start < 0) break;
    let end = start + marker.length;
    while (end < expression.length) {
      const ch = expression[end];
      const isAllowed = /[A-Za-z0-9_$\.]/.test(ch);
      if (!isAllowed) break;
      end += 1;
    }
    const path = expression.slice(start, end);
    if (path !== marker) paths.push(path);
    cursor = end;
  }
  return paths;
}

function extractTemplateReferences(templateString: string) {
  const references: any[] = [];
  const add = (kind: string, value: string, source: string) => {
    if (!value) return;
    references.push({ kind, value, source });
  };

  const root = document.createElement("div");
  root.innerHTML = templateString;

  const aliasNames = new Set(["item", "user", "row", "record"]);
  root.querySelectorAll("[data-repeat]").forEach((el) => {
    const alias = el.getAttribute("data-as") || "item";
    aliasNames.add(alias);
  });

  for (const expression of readTemplateExpressions(templateString)) {
    let foundScopedPath = false;

    for (const prefix of ["content", "state", "settings", "event"]) {
      const paths = readPathFromExpression(expression, prefix);
      if (paths.length > 0) foundScopedPath = true;
      for (const path of paths) add("variable", path, expression);
    }

    for (const alias of aliasNames) {
      const paths = readPathFromExpression(expression, alias);
      if (paths.length > 0) foundScopedPath = true;
      for (const path of paths) add("alias", path, expression);
    }

    const trimmed = expression.trim();
    const startsWithAllowedFunction = ["Math.", "Number(", "String(", "Boolean(", "parseInt(", "parseFloat("].some((x) => trimmed.startsWith(x));
    const isStringLiteral = (trimmed.startsWith("'") && trimmed.endsWith("'")) || (trimmed.startsWith('"') && trimmed.endsWith('"'));
    const isNumberLiteral = !Number.isNaN(Number(trimmed));

    if (!foundScopedPath && !startsWithAllowedFunction && !isStringLiteral && !isNumberLiteral) {
      add("unbound", trimmed, "{{...}}");
    }
  }

  const eventAttributeMap: Record<string, string> = {
    "data-event-click": "onClick",
    "data-event-double-click": "onDoubleClick",
    "data-event-change": "onChange",
    "data-event-input": "onInput",
    "data-event-submit": "onSubmit",
    "data-event-keydown": "onKeyDown",
    "data-event-mouse-enter": "onMouseEnter",
    "data-event-mouse-leave": "onMouseLeave",
    "data-event-scroll": "onScroll"
  };

  root.querySelectorAll("[data-if]").forEach((el) => add("condition", el.getAttribute("data-if") || "", "data-if"));
  root.querySelectorAll("[data-repeat]").forEach((el) => add("repeat", el.getAttribute("data-repeat") || "", "data-repeat"));

  for (const [attr, eventType] of Object.entries(eventAttributeMap)) {
    root.querySelectorAll(`[${attr}]`).forEach((el) => add("event", `${eventType}.${el.getAttribute(attr) || ""}`, attr));
  }

  const unique = new Map();
  for (const item of references) {
    const key = `${item.kind}:${item.value}`;
    if (!unique.has(key)) unique.set(key, item);
  }
  return Array.from(unique.values());
}

function collectAssignedPaths(config: any, contentStructure: any[]) {
  const assigned = new Set<string>();
  for (const item of contentStructure || []) assigned.add(`content.${item.key}`);
  for (const item of config.settings || []) assigned.add(`settings.${item.key}`);
  for (const key of Object.keys(config.state || {})) assigned.add(`state.${key}`);

  for (const binding of Object.values(config.apiConfig?.bindings || {})) {
    const b = binding as any;
    for (const targetPath of Object.keys(b.responseMap || {})) assigned.add(targetPath);
    for (const actionList of [b.beforeActions, b.successActions, b.errorActions]) {
      for (const action of actionList || []) {
        if ((action.type === "setState" || action.type === "setContent") && action.path) assigned.add(action.path);
        if (action.type === "paginate") {
          if (action.source) assigned.add(action.source);
          if (action.target) assigned.add(action.target);
        }
      }
    }
  }

  for (const eventGroup of Object.values(config.events || {})) {
    if (Array.isArray(eventGroup)) {
      for (const action of eventGroup) {
        if ((action.type === "setState" || action.type === "setContent") && action.path) assigned.add(action.path);
        if (action.type === "paginate") {
          if (action.source) assigned.add(action.source);
          if (action.target) assigned.add(action.target);
        }
      }
      continue;
    }
    if (!eventGroup || typeof eventGroup !== "object") continue;
    for (const actions of Object.values(eventGroup as Record<string, any>)) {
      for (const action of actions || []) {
        if ((action.type === "setState" || action.type === "setContent") && action.path) assigned.add(action.path);
        if (action.type === "paginate") {
          if (action.source) assigned.add(action.source);
          if (action.target) assigned.add(action.target);
        }
      }
    }
  }

  return assigned;
}

function isPathAssigned(path: string, assignedPaths: Set<string>) {
  if (!path) return false;
  if (path.startsWith("event.")) return true;
  return Array.from(assignedPaths).some((assigned) => path === assigned || path.startsWith(`${assigned}.`));
}

function getRepeatAliasMap(htmlTemplate: string) {
  const root = document.createElement("div");
  root.innerHTML = htmlTemplate;
  const aliasMap: Record<string, string> = {};
  root.querySelectorAll("[data-repeat]").forEach((el) => {
    const source = el.getAttribute("data-repeat");
    const alias = el.getAttribute("data-as") || "item";
    if (source) aliasMap[alias] = source;
  });
  return aliasMap;
}

function hasNestedPath(value: any, path: string) {
  if (!path) return true;
  const parts = path.split(".").filter(Boolean);
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    return value.some((item) => hasNestedPath(item, path) === true);
  }
  let cursor = value;
  for (const part of parts) {
    if (cursor == null || !Object.prototype.hasOwnProperty.call(cursor, part)) return false;
    cursor = cursor[part];
  }
  return true;
}

function getTemplateValidation(htmlTemplate: string, config: any, contentStructure: any[], runtimeSnapshot: any) {
  const refs = extractTemplateReferences(htmlTemplate);
  const assignedPaths = collectAssignedPaths(config, contentStructure);
  const eventDefinitions = config.events || {};
  const aliasMap = getRepeatAliasMap(htmlTemplate);

  return refs.map((ref: any) => {
    if (ref.kind === "unbound") {
      return { ...ref, assigned: false, status: "unbound variable", assignedFrom: "not found in content/state/settings/event/loop alias" };
    }

    if (ref.kind === "alias") {
      const firstDot = ref.value.indexOf(".");
      const alias = firstDot >= 0 ? ref.value.slice(0, firstDot) : ref.value;
      const childPath = firstDot >= 0 ? ref.value.slice(firstDot + 1) : "";
      const sourcePath = aliasMap[alias];

      if (!sourcePath) {
        return { ...ref, assigned: false, status: "missing loop alias", assignedFrom: `no data-repeat data-as="${alias}"` };
      }

      const sampleValue = runtimeSnapshot ? getByPath(runtimeSnapshot, sourcePath) : undefined;
      const nestedExists = sampleValue === undefined ? null : hasNestedPath(sampleValue, childPath);

      if (nestedExists === false) {
        return { ...ref, assigned: false, status: "missing item field", assignedFrom: `${alias} from ${sourcePath}` };
      }
      if (nestedExists === null) {
        return { ...ref, assigned: true, status: "loop alias ok, sample empty", assignedFrom: `${alias} from ${sourcePath}` };
      }
      return { ...ref, assigned: true, status: "ok", assignedFrom: `${alias} from ${sourcePath}` };
    }

    if (ref.kind === "event") {
      const firstDot = ref.value.indexOf(".");
      const eventType = ref.value.slice(0, firstDot);
      const eventKey = ref.value.slice(firstDot + 1);
      const exists = Boolean(eventDefinitions?.[eventType]?.[eventKey]);
      return { ...ref, assigned: exists, status: exists ? "ok" : "missing event config", assignedFrom: exists ? "events" : "not configured" };
    }

    const assigned = isPathAssigned(ref.value, assignedPaths);
    return { ...ref, assigned, status: assigned ? "ok" : "missing source", assignedFrom: assigned ? "content/settings/state/api/actions" : "not assigned" };
  });
}

function renderTemplateToHtml(templateString: string, runtime: any) {
  const root = document.createElement("div");
  root.innerHTML = templateString;
  function processNode(node: Node, scope: any) {
    if (node.nodeType === Node.TEXT_NODE) {
      const result = evaluateExpression(node.textContent || "", scope, {});
      const str = result == null ? "" : (typeof result === "string" ? result : String(result));
      if (str === node.textContent) return;
      if (/<[a-z][\s\S]*>/i.test(str)) {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = str;
        const fragment = document.createDocumentFragment();
        while (wrapper.firstChild) fragment.appendChild(wrapper.firstChild);
        node.parentNode?.replaceChild(fragment, node);
      } else {
        node.textContent = str;
      }
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const element = node as Element;
    if (element.tagName.toLowerCase() === "template" && element.hasAttribute("data-repeat")) {
      const repeatPath = element.getAttribute("data-repeat") || "";
      const alias = element.getAttribute("data-as") || "item";
      const list = getByPath(scope, repeatPath) || [];
      const fragment = document.createDocumentFragment();
      if (Array.isArray(list)) {
        for (const item of list) {
          const wrapper = document.createElement("div");
          wrapper.appendChild((element as HTMLTemplateElement).content.cloneNode(true));
          Array.from(wrapper.childNodes).forEach((child) => processNode(child, { ...scope, [alias]: item, item }));
          while (wrapper.firstChild) fragment.appendChild(wrapper.firstChild);
        }
      }
      element.replaceWith(fragment);
      return;
    }
    if (element.hasAttribute("data-if")) {
      const condition = element.getAttribute("data-if") || "";
      if (!evaluateExpression(`{{${condition}}}`, scope, {})) {
        element.remove();
        return;
      }
      element.removeAttribute("data-if");
    }
    Array.from(element.attributes).forEach((attr) => {
      if (attr.value.includes("{{")) element.setAttribute(attr.name, evaluateExpression(attr.value, scope, {}));
    });
    Array.from(element.childNodes).forEach((child) => processNode(child, scope));
  }
  Array.from(root.childNodes).forEach((child) => processNode(child, runtime));
  return root.innerHTML;
}

function CodeEditor({ label, value, onChange, language = "json", height = 280, helper }: {
  label: string;
  value?: string;
  onChange: (val: string) => void;
  language?: string;
  height?: number;
  helper?: string;
}) {
  const [local, setLocal] = useState(value || "");
  const [valid, setValid] = useState(true);

  useEffect(() => {
    setLocal(value || "");
    setValid(true);
  }, [value]);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center justify-between gap-3 border-b bg-gray-50 dark:bg-gray-800 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300 dark:text-gray-300">{label}</div>
          {helper ? <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400">{helper}</div> : null}
        </div>
        <Badge variant={valid ? "outline" : "destructive"}>{valid ? language : "invalid"}</Badge>
      </div>
      <Editor
        height={height}
        language={language}
        value={local}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          automaticLayout: true,
          tabSize: 2,
          formatOnPaste: true,
          formatOnType: true,
          bracketPairColorization: { enabled: true },
          guides: { bracketPairs: true, indentation: true }
        }}
        onChange={(text) => {
          const next = text || "";
          setLocal(next);
          if (language === "json") {
            try {
              JSON.parse(next || "null");
              setValid(true);
            } catch {
              setValid(false);
            }
          } else {
            setValid(true);
          }
          onChange(next);
        }}
      />
    </div>
  );
}

function JsonEditor({ label, value, onChange, rows = 10 }: {
  label: string;
  value: any;
  onChange: (val: any) => void;
  rows?: number;
}) {
  const height = Math.max(160, rows * 28);
  return (
    <CodeEditor
      label={label}
      value={safeJsonStringify(value)}
      language="json"
      height={height}
      onChange={(text) => {
        try {
          onChange(JSON.parse(text || "null"));
        } catch {
          // keep invalid JSON locally
        }
      }}
    />
  );
}

function Disclosure({ title, icon: Icon, defaultOpen = false, children }: {
  title: string;
  icon: React.ElementType;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <button className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left" onClick={() => setOpen(!open)}>
        <span className="flex items-center gap-2 text-sm font-medium"><Icon className="h-4 w-4" /> {title}</span>
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      {open ? <div className="border-t border-gray-100 p-4 dark:border-gray-700">{children}</div> : null}
    </div>
  );
}

function DynamicRenderer({ htmlTemplate, config, contentStructure, onRuntimeChange, onApiResult, manualRunRequest }: {
  htmlTemplate: string;
  config: any;
  contentStructure: any[];
  onRuntimeChange?: (r: any) => void;
  onApiResult?: (r: any) => void;
  manualRunRequest?: any;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [runtime, setRuntime] = useState(() => buildDefaults(contentStructure, config));
  const runtimeRef = useRef(runtime);
  const commit = (next: any) => { runtimeRef.current = next; setRuntime(next); onRuntimeChange?.(next); };

  useEffect(() => {
    const fresh = buildDefaults(contentStructure, config);
    runtimeRef.current = fresh;
    setRuntime(fresh);
    onRuntimeChange?.(fresh);
  }, [contentStructure, config, onRuntimeChange]);

  async function executeActions(actions: any[] = [], eventPayload: any = {}) {
    for (const action of actions) {
      let working = runtimeRef.current;
      if (action.type === "setState" || action.type === "setContent") commit(setByPath(working, action.path, evaluateExpression(action.value, working, eventPayload)));
      if (action.type === "paginate") commit(paginateRuntime(working, action.source, action.target));
      if (action.type === "api") {
        const binding = config.apiConfig?.bindings?.[action.binding];
        if (!binding) continue;
        await executeActions(binding.beforeActions || [], eventPayload);
        working = runtimeRef.current;
        try {
          const response = await fetchFromBinding(binding, working, config.runtimeOptions || {});
          onApiResult?.({ binding: action.binding, url: response.url, method: response.method, status: response.status, source: response.source, fetchedAt: response.fetchedAt, rawResponse: response.data });
          commit(applyResponseMap(working, binding.responseMap, response));
          await executeActions(binding.successActions || [], eventPayload);
        } catch (error: any) {
          const message = error instanceof Error ? error.message : "Unknown API error";
          commit({ ...working, __lastApiMessage: message });
          onApiResult?.({ binding: action.binding, url: buildUrl(binding, working), method: binding.method || "GET", status: "error", source: "real-api", fetchedAt: new Date().toISOString(), rawResponse: { error: message } });
          await executeActions(binding.errorActions || [], eventPayload);
        }
      }
    }
  }

  useEffect(() => {
    let disposed = false;
    const run = async () => { if (disposed) return; await executeActions(config.events?.onInit || []); if (disposed) return; await executeActions(config.events?.onLoad || []); };
    run();
    return () => { disposed = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  useEffect(() => {
    if (!manualRunRequest?.binding) return;
    executeActions([{ type: "api", binding: manualRunRequest.binding }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manualRunRequest?.nonce]);

  const renderedHtml = useMemo(() => renderTemplateToHtml(htmlTemplate, runtime), [htmlTemplate, runtime]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const eventDefinitions = [
      { dom: "click", attr: "data-event-click", config: "onClick" },
      { dom: "dblclick", attr: "data-event-double-click", config: "onDoubleClick" },
      { dom: "change", attr: "data-event-change", config: "onChange" },
      { dom: "input", attr: "data-event-input", config: "onInput" },
      { dom: "submit", attr: "data-event-submit", config: "onSubmit" },
      { dom: "keydown", attr: "data-event-keydown", config: "onKeyDown" },
      { dom: "mouseenter", attr: "data-event-mouse-enter", config: "onMouseEnter" },
      { dom: "mouseleave", attr: "data-event-mouse-leave", config: "onMouseLeave" },
      { dom: "scroll", attr: "data-event-scroll", config: "onScroll" }
    ];

    const disposers = eventDefinitions.map((definition) => {
      const handler = (event: Event) => {
        const rawTarget = event.target;
        if (!(rawTarget instanceof Element)) return;
        const target = rawTarget.closest(`[${definition.attr}]`);
        if (!target) return;
        if (definition.dom === "submit") event.preventDefault();

        const eventKey = target.getAttribute(definition.attr) || "";
        const keyboardEvent = event as KeyboardEvent;
        const value = "value" in target ? (target as HTMLInputElement).value : undefined;
        const actions = config.events?.[definition.config]?.[eventKey] || [];

        executeActions(actions, {
          type: definition.dom,
          key: eventKey,
          dataset: { ...(target as HTMLElement).dataset },
          value,
          keyboardKey: keyboardEvent.key,
          enter: keyboardEvent.key === "Enter"
        });
      };

      el.addEventListener(definition.dom, handler, true);
      return () => el.removeEventListener(definition.dom, handler, true);
    });

    return () => disposers.forEach((dispose) => dispose());
  }, [config.events]);

  return <div ref={containerRef} dangerouslySetInnerHTML={{ __html: renderedHtml }} />;
}

const BASIC_ITEMS = [
  { key: "setup", label: "Setup", icon: Settings },
  { key: "content", label: "Content", icon: Database },
  { key: "template", label: "Template", icon: Code2 }
];

const ADVANCE_ITEMS = [
  { key: "api", label: "Data & API", icon: PlugZap },
  { key: "events", label: "Events", icon: MousePointerClick },
  { key: "state", label: "State", icon: Layers },
  { key: "advanced", label: "Advanced JSON", icon: FileJson }
];

interface ComponentBuilderPlaygroundProps {
  onBack: () => void;
  initialData?: HtmlComponentDetailDto;
}

export default function ComponentBuilderPlayground({ onBack, initialData }: ComponentBuilderPlaygroundProps) {
  const { t } = useTranslation();
  const [saveHtmlComponent, { isLoading: isSaving }] = useSaveHtmlComponentMutation();
  const [checkNameUnique] = useLazyCheckHtmlComponentNameUniqueQuery();

  const [name, setName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [icon, setIcon] = useState("LayoutTemplate");
  const [isActive, setIsActive] = useState(true);
  const [htmlTemplate, setHtmlTemplate] = useState("");
  const [config, setConfig] = useState(() => deepClone(SIMPLE_BASIC_CONFIG));
  const [contentStructure, setContentStructure] = useState(() => deepClone(SIMPLE_BASIC_CONTENT_STRUCTURE));
  const [activeStep, setActiveStep] = useState("setup");
  const [selectedApi, setSelectedApi] = useState("loadUsers");
  const [viewport, setViewport] = useState("desktop");
  const [runtimeSnapshot, setRuntimeSnapshot] = useState<any>(null);
  const [apiResult, setApiResult] = useState<any>(null);
  const [savedPayload, setSavedPayload] = useState<any>(null);
  const [manualRunRequest, setManualRunRequest] = useState<any>(null);
  const [eventEditorSelection, setEventEditorSelection] = useState<{ mode: string; type?: string; key?: string; lifecycle?: string }>({ mode: "element", type: "onClick", key: "viewUser" });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [advanceExpanded, setAdvanceExpanded] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [showAdvanceGate, setShowAdvanceGate] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [dismissedHelps, setDismissedHelps] = useState<Record<string, boolean>>({});
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);

  const { formState: { errors }, control, trigger } = useForm({ mode: "onBlur" });

  // Floating Preview State
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const [previewPosition, setPreviewPosition] = useState({ x: window.innerWidth - 520, y: 100 });
  const [previewDimensions, setPreviewDimensions] = useState({ width: 480, height: 540 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizingPreview, setIsResizingPreview] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const startDragging = useCallback((e: React.MouseEvent) => {
    if (isPreviewFullscreen) return;
    setIsDragging(true);
    setDragOffset({ x: e.clientX - previewPosition.x, y: e.clientY - previewPosition.y });
  }, [previewPosition, isPreviewFullscreen]);

  const onDrag = useCallback((e: MouseEvent) => {
    if (isDragging) setPreviewPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
  }, [isDragging, dragOffset]);

  const stopDragging = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (isDragging) { window.addEventListener("mousemove", onDrag); window.addEventListener("mouseup", stopDragging); return () => { window.removeEventListener("mousemove", onDrag); window.removeEventListener("mouseup", stopDragging); }; }
  }, [isDragging, onDrag, stopDragging]);

  const startResizingPreview = useCallback((e: React.MouseEvent) => {
    if (isPreviewFullscreen) return;
    e.stopPropagation();
    setIsResizingPreview(true);
    setResizeStart({ x: e.clientX, y: e.clientY, width: previewDimensions.width, height: previewDimensions.height });
  }, [previewDimensions, isPreviewFullscreen]);

  const onResizePreview = useCallback((e: MouseEvent) => {
    if (isResizingPreview) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      setPreviewDimensions({ width: Math.max(320, Math.min(1200, resizeStart.width + deltaX)), height: Math.max(300, Math.min(900, resizeStart.height + deltaY)) });
    }
  }, [isResizingPreview, resizeStart]);

  const stopResizingPreview = useCallback(() => setIsResizingPreview(false), []);

  useEffect(() => {
    if (isResizingPreview) { window.addEventListener("mousemove", onResizePreview); window.addEventListener("mouseup", stopResizingPreview); return () => { window.removeEventListener("mousemove", onResizePreview); window.removeEventListener("mouseup", stopResizingPreview); }; }
  }, [isResizingPreview, onResizePreview, stopResizingPreview]);

  const renderedHtml = useMemo(() => renderTemplateToHtml(htmlTemplate, runtimeSnapshot || buildDefaults(contentStructure, config)), [htmlTemplate, runtimeSnapshot, contentStructure, config]);

  // Load initial data when editing
  useEffect(() => {
    if (initialData) {
      const initialName = initialData.Name || "";
      setName(initialName);
      setOriginalName(initialName);
      setDisplayName(initialData.DisplayName || "");
      setShortDescription(initialData.ShortDescription || "");
      setIcon(initialData.Icon || "Users");
      setIsActive(initialData.IsActive);
      setHtmlTemplate(initialData.HtmlTemplate || USER_CARDS_HTML_TEMPLATE);

      if (initialData.Config) {
        try {
          const parsed = JSON.parse(initialData.Config);
          if (parsed.settings) parsed.settings = parsed.settings;
          if (parsed.apiConfig) parsed.apiConfig = parsed.apiConfig;
          setConfig((prev: any) => ({ ...prev, ...parsed }));
        } catch { /* ignore */ }
      }

      if (initialData.StateSchema) {
        try {
          const state = JSON.parse(initialData.StateSchema);
          setConfig((prev: any) => ({ ...prev, state }));
        } catch { /* ignore */ }
      }

      if (initialData.ApiBindings) {
        try {
          const apiConfig = JSON.parse(initialData.ApiBindings);
          setConfig((prev: any) => ({ ...prev, apiConfig }));
        } catch { /* ignore */ }
      }

      if (initialData.EventBindings) {
        try {
          const events = JSON.parse(initialData.EventBindings);
          setConfig((prev: any) => ({ ...prev, events }));
        } catch { /* ignore */ }
      }

      if (initialData.RuntimeOptions) {
        try {
          const runtimeOptions = JSON.parse(initialData.RuntimeOptions);
          setConfig((prev: any) => ({ ...prev, runtimeOptions }));
        } catch { /* ignore */ }
      }

      if (initialData.ContentStructure) {
        try {
          const cs = JSON.parse(initialData.ContentStructure);
          setContentStructure(cs);
        } catch { /* ignore */ }
      }

      if (initialData.Version) {
        setVersion(initialData.Version);
      }
    }
  }, [initialData]);

  const apiBindings = config.apiConfig?.bindings || {};
  const templateValidation = useMemo(() => getTemplateValidation(htmlTemplate, config, contentStructure, runtimeSnapshot), [htmlTemplate, config, contentStructure, runtimeSnapshot]);
  const missingTemplateRefs = templateValidation.filter((item: any) => !item.assigned);
  const selectedBinding = apiBindings[selectedApi] || Object.values(apiBindings)[0] || null;
  const previewWidth = viewport === "desktop" ? "w-full" : viewport === "tablet" ? "w-[760px]" : "w-[390px]";

  const refSummary = useMemo(() => {
    const vars = templateValidation.filter((i: any) => i.kind === "variable" || i.kind === "alias");
    const loops = templateValidation.filter((i: any) => i.kind === "repeat");
    const events = templateValidation.filter((i: any) => i.kind === "event");
    const missing = templateValidation.filter((i: any) => !i.assigned);
    return { total: templateValidation.length, vars: vars.length, loops: loops.length, events: events.length, missing: missing.length };
  }, [templateValidation]);

  const settingsErrors = useMemo(() => {
    const settings = config.settings || [];
    const keys = settings.map((s: any) => s.key);
    return settings.map((s: any, i: number) => ({
      key: !s.key ? "Key is required" : keys.indexOf(s.key) !== keys.lastIndexOf(s.key) ? "Key must be unique" : null,
      label: !s.label ? "Label is required" : null,
    }));
  }, [config.settings]);

  const contentErrors = useMemo(() => {
    const keys = contentStructure.map((c: any) => c.key);
    return contentStructure.map((c: any, i: number) => ({
      key: !c.key ? "Key is required" : keys.indexOf(c.key) !== keys.lastIndexOf(c.key) ? "Key must be unique" : null,
      label: !c.label ? "Label is required" : null,
    }));
  }, [contentStructure]);

  const hasValidationErrors = useMemo(() => {
    return !name || !name.trim() || !displayName || !displayName.trim() || !/^[A-Z][a-zA-Z0-9]*$/.test(name) || settingsErrors.some((e: any) => e.key || e.label) || contentErrors.some((e: any) => e.key || e.label);
  }, [name, displayName, settingsErrors, contentErrors]);

  const apiUrlError = useMemo(() => {
    const binding = Object.values(config.apiConfig?.bindings || {})[0] as any;
    if (binding && (!binding.url || !binding.url.trim())) return "API URL is required";
    return null;
  }, [config.apiConfig?.bindings]);

  const [version, setVersion] = useState("1.0.0");
  const [activeListFieldIdx, setActiveListFieldIdx] = useState<number | null>(null);

  // Dynamic Settings Handlers
  const addSetting = () => {
    const settings = config.settings || [];
    setConfig((prev: any) => ({
      ...prev,
      settings: [...settings, { key: `setting_${settings.length + 1}`, label: "New Setting", type: "text", defaultValue: "", options: [] }]
    }));
  };

  const updateSetting = (idx: number, field: string, val: any) => {
    const settings = [...(config.settings || [])];
    (settings[idx] as any)[field] = val;
    setConfig((prev: any) => ({ ...prev, settings }));
  };

  const removeSetting = (idx: number) => {
    setConfig((prev: any) => ({ ...prev, settings: (prev.settings || []).filter((_: any, i: number) => i !== idx) }));
  };

  // Dynamic Content Field Handlers
  const addContentField = () => {
    setContentStructure((prev: any) => [...prev, { key: `content_${prev.length + 1}`, label: "New Field", type: "text", defaultValue: "", options: [] }]);
  };

  const updateContentField = (idx: number, field: string, val: any) => {
    setContentStructure((prev: any) => {
      const next = [...prev];
      (next[idx] as any)[field] = val;
      if (field === "type" && val !== "list") (next[idx] as any).itemSchema = undefined;
      if (field === "type" && val === "list" && !(next[idx] as any).itemSchema) {
        (next[idx] as any).itemSchema = [{ key: "title", label: "Item Title", type: "text", defaultValue: "Item" }];
      }
      return next;
    });
  };

  const removeContentField = (idx: number) => {
    setContentStructure((prev: any) => prev.filter((_: any, i: number) => i !== idx));
  };

  // List Schema Handlers
  const updateListSchema = (fieldIdx: number, schemaIdx: number, field: string, val: string) => {
    setContentStructure((prev: any) => {
      const next = [...prev];
      const schema = [...((next[fieldIdx] as any).itemSchema || [])];
      (schema[schemaIdx] as any)[field] = val;
      (next[fieldIdx] as any).itemSchema = schema;
      return next;
    });
  };

  const addListSchemaField = (fieldIdx: number) => {
    setContentStructure((prev: any) => {
      const next = [...prev];
      const schema = [...((next[fieldIdx] as any).itemSchema || [])];
      schema.push({ key: `subfield_${schema.length}`, label: "New Sub Field", type: "text", defaultValue: "" });
      (next[fieldIdx] as any).itemSchema = schema;
      return next;
    });
  };

  const removeListSchemaField = (fieldIdx: number, schemaIdx: number) => {
    setContentStructure((prev: any) => {
      const next = [...prev];
      (next[fieldIdx] as any).itemSchema = ((next[fieldIdx] as any).itemSchema || []).filter((_: any, i: number) => i !== schemaIdx);
      return next;
    });
  };

  const payload: any = useMemo(() => ({
    HtmlComponentId: initialData?.HtmlComponentId || 0,
    Name: name,
    DisplayName: displayName,
    ShortDescription: shortDescription,
    Icon: icon,
    PreviewImage: "",
    IsActive: isActive,
    HtmlTemplate: htmlTemplate,
    Config: JSON.stringify({
      settings: config.settings,
      apiConfig: config.apiConfig
    }),
    ContentStructure: JSON.stringify(contentStructure),
    StateSchema: JSON.stringify(config.state || {}),
    ApiBindings: JSON.stringify(config.apiConfig?.bindings || {}),
    EventBindings: JSON.stringify(config.events || {}),
    RuntimeOptions: JSON.stringify(config.runtimeOptions || {}),
    Version: version
  }), [name, displayName, shortDescription, icon, isActive, htmlTemplate, config, contentStructure, version, initialData]);

  function updateApiBinding(key: string, patch: any) {
    setConfig((prev: any) => ({ ...prev, apiConfig: { ...(prev.apiConfig || {}), bindings: { ...(prev.apiConfig?.bindings || {}), [key]: { ...(prev.apiConfig?.bindings?.[key] || {}), ...patch } } } }));
  }

  function addApiBinding() {
    setConfig((prev: any) => {
      const bindings = { ...(prev.apiConfig?.bindings || {}) };
      let index = Object.keys(bindings).length + 1;
      let key = `apiCall${index}`;
      while (bindings[key]) { index += 1; key = `apiCall${index}`; }
      bindings[key] = { url: "https://jsonplaceholder.typicode.com/users", method: "GET", trigger: "manual", autoFetch: false, query: {}, body: null, responseMap: {}, beforeActions: [], successActions: [], errorActions: [] };
      setSelectedApi(key);
      return { ...prev, apiConfig: { ...(prev.apiConfig || {}), bindings } };
    });
  }

  function removeApiBinding(key: string) {
    setConfig((prev: any) => {
      const bindings = { ...(prev.apiConfig?.bindings || {}) };
      delete bindings[key];
      const nextKey = Object.keys(bindings)[0] || "";
      setSelectedApi(nextKey);
      return { ...prev, apiConfig: { ...(prev.apiConfig || {}), bindings } };
    });
  }

  function renameApiBinding(oldKey: string, newKey: string) {
    if (!newKey || oldKey === newKey) return;
    setConfig((prev: any) => {
      const bindings = { ...(prev.apiConfig?.bindings || {}) };
      if (!bindings[oldKey] || bindings[newKey]) return prev;
      bindings[newKey] = bindings[oldKey];
      delete bindings[oldKey];
      setSelectedApi(newKey);
      return { ...prev, apiConfig: { ...(prev.apiConfig || {}), bindings } };
    });
  }

  function updateEventActions(section: string, key: string | null, actions: any[]) {
    setConfig((prev: any) => {
      const events = deepClone(prev.events || {});
      if (key) events[section] = { ...(events[section] || {}), [key]: actions };
      else events[section] = actions;
      return { ...prev, events };
    });
  }

  function addElementEvent(eventType: string = "onClick") {
    setConfig((prev: any) => {
      const events = deepClone(prev.events || {});
      const group = { ...(events[eventType] || {}) };
      let index = Object.keys(group).length + 1;
      let key = `event${index}`;
      while (group[key]) { index += 1; key = `event${index}`; }
      group[key] = [];
      events[eventType] = group;
      return { ...prev, events };
    });
  }

  function moveElementEvent(oldType: string, eventKey: string, newType: string) {
    if (!oldType || !newType || oldType === newType) return;
    setConfig((prev: any) => {
      const events = deepClone(prev.events || {});
      const oldGroup = { ...(events[oldType] || {}) };
      const newGroup = { ...(events[newType] || {}) };
      if (!Object.prototype.hasOwnProperty.call(oldGroup, eventKey)) return prev;
      let finalKey = eventKey;
      let idx = 1;
      while (Object.prototype.hasOwnProperty.call(newGroup, finalKey)) {
        finalKey = `${eventKey}${idx}`;
        idx += 1;
      }
      newGroup[finalKey] = oldGroup[eventKey];
      delete oldGroup[eventKey];
      events[oldType] = oldGroup;
      events[newType] = newGroup;
      return { ...prev, events };
    });
  }

  function renameElementEvent(eventType: string, oldKey: string, newKey: string) {
    if (!newKey || oldKey === newKey) return;
    setConfig((prev: any) => {
      const events = deepClone(prev.events || {});
      const group = { ...(events[eventType] || {}) };
      if (!Object.prototype.hasOwnProperty.call(group, oldKey) || Object.prototype.hasOwnProperty.call(group, newKey)) return prev;
      group[newKey] = group[oldKey];
      delete group[oldKey];
      events[eventType] = group;
      return { ...prev, events };
    });
  }

  function removeElementEvent(eventType: string, key: string) {
    setConfig((prev: any) => {
      const events = deepClone(prev.events || {});
      const group = { ...(events[eventType] || {}) };
      delete group[key];
      events[eventType] = group;
      return { ...prev, events };
    });
  }

  function runApiNow(bindingKey: string) {
    const binding = config.apiConfig?.bindings?.[bindingKey];
    const currentRuntime = runtimeSnapshot || buildDefaults(contentStructure, config);
    setApiResult({ binding: bindingKey, url: binding ? buildUrl(binding, currentRuntime) : "", method: binding?.method || "GET", status: "pending", source: "request-started", fetchedAt: new Date().toISOString(), rawResponse: null });
    setManualRunRequest({ binding: bindingKey, nonce: Date.now() });
  }

  function updateSettingDefault(key: string, value: string) {
    setConfig((prev: any) => ({ ...prev, settings: (prev.settings || []).map((item: any) => item.key === key ? { ...item, defaultValue: value } : item) }));
  }

  async function handleSave() {
    // Validate using local state (not RHF trigger, which breaks when Controllers
    // are mounted with values that haven't flowed through field.onChange yet)
    if (!name || !name.trim()) {
      toaster.error(t("ComponentBuilder.NameDisplayNameRequired"));
      return;
    }
    if (!displayName || !displayName.trim()) {
      toaster.error(t("ComponentBuilder.NameDisplayNameRequired"));
      return;
    }
    if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
      toaster.error("Name must be PascalCase (e.g. UserCards)");
      return;
    }

    // Validate dynamic fields
    if (settingsErrors.some((e: any) => e.key || e.label)) {
      toaster.error("Fix style settings errors before saving");
      return;
    }
    if (contentErrors.some((e: any) => e.key || e.label)) {
      toaster.error("Fix content field errors before saving");
      return;
    }
    const bindings = config.apiConfig?.bindings || {};
    const hasApiWithEmptyUrl = Object.values(bindings).some((b: any) => b.trigger !== "manual" && (!b.url || !b.url.trim()));
    if (hasApiWithEmptyUrl) {
      toaster.error("API bindings with non-manual triggers require a URL");
      return;
    }

    try {
      const htmlComponentId = initialData?.HtmlComponentId || 0;
      const oldName = htmlComponentId === 0 ? '' : originalName;

      const uniqueCheckResult = await checkNameUnique({
        name,
        oldName,
        htmlComponentId
      }).unwrap();

      if (uniqueCheckResult?.Data !== true) {
        toaster.error(t("ComponentBuilder.NameExists"));
        return;
      }
    } catch {
      toaster.error(t("ComponentBuilder.NameValidateFailed"));
      return;
    }

    try {
      const response = await saveHtmlComponent(payload).unwrap();
      if (response.Code === 200) {
        toaster.success(t("ComponentBuilder.Saved"));
        onBack();
      } else {
        toaster.error(response.Message || t("ComponentBuilder.SaveFailed"));
      }
    } catch (error: any) {
      toaster.error(error?.data?.Message || t("ComponentBuilder.SaveError"));
    }
  }

  function loadSample(type: string) {
    if (type === 'basic') {
      setName("SimpleHero");
      setOriginalName("");
      setDisplayName("Simple Hero");
      setShortDescription("A basic hero section component with customizable heading and description.");
      setIcon("LayoutTemplate");
      setIsActive(true);
      setHtmlTemplate(SIMPLE_BASIC_TEMPLATE);
      setConfig(deepClone(SIMPLE_BASIC_CONFIG));
      setContentStructure(deepClone(SIMPLE_BASIC_CONTENT_STRUCTURE));
      setSelectedApi("");
      setRuntimeSnapshot(null);
      setApiResult(null);
      setSavedPayload(null);
      setManualRunRequest(null);
      setVersion("1.0.0");
      setActiveStep("setup");
      return;
    }
    if (type === 'api') {
      setName("UserCards");
      setOriginalName("");
      setDisplayName("User Cards");
      setShortDescription("API-bound user cards with onLoad, click detail and pagination events.");
      setIcon("Users");
      setIsActive(true);
      setHtmlTemplate(USER_CARDS_HTML_TEMPLATE);
      setConfig(deepClone(USER_CARDS_CONFIG));
      setContentStructure(deepClone(USER_CARDS_CONTENT_STRUCTURE));
      setSelectedApi("loadUsers");
      setRuntimeSnapshot(null);
      setApiResult(null);
      setSavedPayload(null);
      setManualRunRequest(null);
      setVersion("1.0.0");
      setActiveStep("setup");
    }
  }

  function resetAll() {
    if (initialData) {
      setName(initialData.Name || "");
      setOriginalName(initialData.Name || "");
      setDisplayName(initialData.DisplayName || "");
      setShortDescription(initialData.ShortDescription || "");
      setIcon(initialData.Icon || "LayoutTemplate");
      setIsActive(initialData.IsActive);
      setHtmlTemplate(initialData.HtmlTemplate || SIMPLE_BASIC_TEMPLATE);
      setConfig(deepClone(SIMPLE_BASIC_CONFIG));
      setContentStructure(deepClone(SIMPLE_BASIC_CONTENT_STRUCTURE));
      setSelectedApi("");
      setRuntimeSnapshot(null);
      setApiResult(null);
      setSavedPayload(null);
      setVersion("1.0.0");
      return;
    }
    setName("");
    setDisplayName("");
    setShortDescription("");
    setIcon("LayoutTemplate");
    setIsActive(true);
    setHtmlTemplate("");
    setConfig({ settings: [], state: {}, apiConfig: { bindings: {} }, events: {}, runtimeOptions: { sanitizeHtml: true, allowScript: false, useRealApi: true, fallbackToMock: false, renderMode: "client" } });
    setContentStructure([]);
    setSelectedApi("");
    setRuntimeSnapshot(null);
    setApiResult(null);
    setSavedPayload(null);
    setManualRunRequest(null);
    setVersion("1.0.0");
  }

  function clearAll() {
    setName("");
    setDisplayName("");
    setShortDescription("");
    setIcon("");
    setIsActive(true);
    setHtmlTemplate("");
    setConfig({ settings: [], state: {}, apiConfig: { bindings: {} }, events: {}, runtimeOptions: { sanitizeHtml: true, allowScript: false, useRealApi: true, fallbackToMock: false, renderMode: "client" } });
    setContentStructure([]);
    setSelectedApi("");
    setRuntimeSnapshot(null);
    setApiResult(null);
    setSavedPayload(null);
    setManualRunRequest(null);
    setVersion("1.0.0");
    setShowClearConfirm(false);
  }

  function dismissHelp(key: string) {
    setDismissedHelps((prev) => ({ ...prev, [key]: true }));
  }

  function renderHelpBanner(tabKey: string) {
    if (dismissedHelps[tabKey]) return null;
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-blue-100 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/30 p-4">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
        <p className="flex-1 text-sm text-blue-700 dark:text-blue-300">{TAB_HELP[tabKey] || ""}</p>
        <button onClick={() => dismissHelp(tabKey)} className="shrink-0 p-1 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-all">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  function renderEditor() {
    if (activeStep === "setup") {
      return <div className="space-y-5">
        {renderHelpBanner("setup")}
        <SectionTitle title={t("ComponentBuilder.BasicInformation")} subtitle={t("ComponentBuilder.MetadataSection")} />
        <div className="grid grid-cols-2 gap-4">
          <Field label={t("ComponentBuilder.InternalName")} error={errors.name?.message as string | undefined}>
            <Controller name="name" control={control} rules={{ required: "Internal name is required", pattern: { value: /^[A-Z][a-zA-Z0-9]*$/, message: "Must be PascalCase (e.g. UserCards)" } }} render={({ field }) => <Input value={name} onChange={(e) => { field.onChange(e.target.value); setName(e.target.value); }} />} />
          </Field>
          <Field label={t("ComponentBuilder.DisplayName")} error={errors.displayName?.message as string | undefined}>
            <Controller name="displayName" control={control} rules={{ required: "Display name is required" }} render={({ field }) => <Input value={displayName} onChange={(e) => { field.onChange(e.target.value); setDisplayName(e.target.value); }} />} />
          </Field>
        </div>
        <Field label={t("ComponentBuilder.Version")} error={errors.version?.message as string | undefined}>
          <Controller name="version" control={control} rules={{ pattern: { value: /^\d+\.\d+\.\d+$/, message: "Must be semver (e.g. 1.0.0)" } }} render={({ field }) => <Input value={version} onChange={(e) => { field.onChange(e.target.value); setVersion(e.target.value); }} />} />
        </Field>
        <Field label={t("ComponentBuilder.IconLabel")}>
          <Controller name="icon" control={control} render={({ field }) => <Input value={icon} onChange={(e) => { field.onChange(e.target.value); setIcon(e.target.value); }} />} />
        </Field>
        <Field label={t("ComponentBuilder.ShortDescription")}>
          <Controller name="shortDescription" control={control} render={({ field }) => <Textarea value={shortDescription} onChange={(e) => { field.onChange(e.target.value); setShortDescription(e.target.value); }} />} />
        </Field>
        <label className="flex items-center gap-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 text-sm font-medium shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="dark:accent-brand-500" /> {t("ComponentBuilder.IsActive")}</label>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-base font-semibold text-gray-800 dark:text-gray-200">{t("ComponentBuilder.StyleSettings")}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400">Configurable style options using &#123;&#123;settings.*&#125;&#125;</div>
            </div>
            <Button size="sm" onClick={addSetting}><Plus className="mr-1 h-4 w-4" /> {t("ComponentBuilder.AddSetting")}</Button>
          </div>
          <div className="space-y-3">
            {(config.settings || []).length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 py-8 text-center text-sm text-gray-400 italic">{t("ComponentBuilder.NoStyleSettings")}</div>
            )}
            {(config.settings || []).map((s: any, i: number) => (
              <div key={i} className={`rounded-xl border ${settingsErrors[i]?.key || settingsErrors[i]?.label ? "border-red-300 dark:border-red-800" : "border-gray-200 dark:border-gray-700"} bg-gray-50 dark:bg-gray-800 dark:bg-gray-800/50 p-4`}>
                <div className="grid grid-cols-12 gap-3 items-start">
                  <div className="col-span-3">
                      <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-400">{t("ComponentBuilder.KeyLabel")}</label>
                    <Input value={s.key} onChange={(e) => updateSetting(i, "key", e.target.value)} placeholder={t("ComponentBuilder.StyleKeyPlaceholder")} />
                    {settingsErrors[i]?.key && <p className="mt-1 text-xs text-red-500">{settingsErrors[i].key}</p>}
                  </div>
                  <div className="col-span-3">
                    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-400">{t("ComponentBuilder.LabelField")}</label>
                    <Input value={s.label} onChange={(e) => updateSetting(i, "label", e.target.value)} placeholder={t("ComponentBuilder.StyleLabelPlaceholder")} />
                    {settingsErrors[i]?.label && <p className="mt-1 text-xs text-red-500">{settingsErrors[i].label}</p>}
                  </div>
                  <div className="col-span-2">
                    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-400">{t("ComponentBuilder.TypeLabel")}</label>
                    <select value={s.type} onChange={(e) => updateSetting(i, "type", e.target.value)} className="h-10 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm dark:text-white">
                      <option value="text">{t("ComponentBuilder.OptionText")}</option>
                      <option value="select">{t("ComponentBuilder.OptionSelect")}</option>
                      <option value="color">{t("ComponentBuilder.OptionColor")}</option>
                    </select>
                  </div>
                  <div className="col-span-3">
                    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-400">{t("ComponentBuilder.DefaultLabel")}</label>
                    <Input value={s.defaultValue || ""} onChange={(e) => updateSetting(i, "defaultValue", e.target.value)} placeholder={t("ComponentBuilder.DefaultPlaceholder")} />
                  </div>
                  <div className="col-span-1 flex items-end pb-1">
                    <Button size="icon" variant="ghost" onClick={() => removeSetting(i)}><Trash2 className="h-4 w-4 text-error-500" /></Button>
                  </div>
                </div>
                {s.type === "select" && (
                  <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Options (comma-separated)</label>
                    <Input value={(s.options || []).join(", ")} onChange={(e) => updateSetting(i, "options", e.target.value.split(",").map((o: string) => o.trim()).filter(Boolean))} placeholder={t("ComponentBuilder.OptionsPlaceholder")} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>;
    }

    if (activeStep === "content") {
      return <div className="space-y-5">
          {renderHelpBanner("content")}
          <SectionTitle title={t("ComponentBuilder.ContentFields")} subtitle={t("ComponentBuilder.ContentFieldsHint")} />
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400">{t("ComponentBuilder.DefineContentFields")}</div>
            <Button size="sm" onClick={addContentField}><Plus className="mr-1 h-4 w-4" /> {t("ComponentBuilder.AddField")}</Button>
          </div>
          <div className="space-y-3">
            {contentStructure.length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 py-8 text-center text-sm text-gray-400 italic">{t("ComponentBuilder.NoContentFields")}</div>
            )}
            {contentStructure.map((c: any, i: number) => (
              <div key={i} className={`rounded-xl border ${contentErrors[i]?.key || contentErrors[i]?.label ? "border-red-300 dark:border-red-800" : "border-gray-200 dark:border-gray-700"} bg-gray-50 dark:bg-gray-800 p-4`}>
                <div className="grid grid-cols-12 gap-3 items-start">
                  <div className="col-span-3">
                    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">{t("ComponentBuilder.KeyLabel")}</label>
                    <Input value={c.key} onChange={(e) => updateContentField(i, "key", e.target.value)} placeholder="contentKey" />
                    {contentErrors[i]?.key && <p className="mt-1 text-xs text-red-500">{contentErrors[i].key}</p>}
                  </div>
                  <div className="col-span-3">
                    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">{t("ComponentBuilder.LabelField")}</label>
                    <Input value={c.label} onChange={(e) => updateContentField(i, "label", e.target.value)} placeholder="Field Label" />
                    {contentErrors[i]?.label && <p className="mt-1 text-xs text-red-500">{contentErrors[i].label}</p>}
                  </div>
                  <div className="col-span-2">
                    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">{t("ComponentBuilder.TypeLabel")}</label>
                    <select value={c.type} onChange={(e) => updateContentField(i, "type", e.target.value)} className="h-10 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm">
                      <option value="text">{t("ComponentBuilder.OptionText")}</option>
                      <option value="textarea">{t("ComponentBuilder.OptionLongText")}</option>
                      <option value="richtext">{t("ComponentBuilder.OptionRichText")}</option>
                      <option value="image">{t("ComponentBuilder.OptionImage")}</option>
                      <option value="select">{t("ComponentBuilder.OptionSelect")}</option>
                      <option value="list">List (Loop)</option>
                    </select>
                  </div>
                  <div className="col-span-3">
                    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-400">{c.type === "list" ? t("ComponentBuilder.ItemSchema") : t("ComponentBuilder.DefaultLabel")}</label>
                    {c.type === "list" ? (
                      <Button size="sm" variant="outline" onClick={() => setActiveListFieldIdx(i)} className="w-full">
                        <Settings2 className="mr-1 h-3 w-3" /> {(c.itemSchema || []).length} fields
                      </Button>
                    ) : (
                      <Input value={c.defaultValue || ""} onChange={(e) => updateContentField(i, "defaultValue", e.target.value)} placeholder={t("ComponentBuilder.DefaultPlaceholder")} />
                    )}
                  </div>
                  <div className="col-span-1 flex items-end pb-1">
                    <Button size="icon" variant="ghost" onClick={() => removeContentField(i)}><Trash2 className="h-4 w-4 text-error-500" /></Button>
                  </div>
                </div>
                {c.type === "select" && (
                  <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">{t("ComponentBuilder.OptionsPlaceholder")}</label>
                    <Input value={(c.options || []).join(", ")} onChange={(e) => updateContentField(i, "options", e.target.value.split(",").map((o: string) => o.trim()).filter(Boolean))} placeholder={t("ComponentBuilder.OptionsPlaceholder")} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>;
    }

    if (activeStep === "template") {
      const availableSettings = (config.settings || []).map((s: any) => ({ prefix: "settings", key: s.key, label: s.label }));
      const availableContent = (contentStructure || []).map((c: any) => ({
        prefix: "content",
        key: c.key,
        label: c.label,
        isList: c.type === "list",
        itemSchema: c.itemSchema
      }));
      const availableState = Object.keys(config.state || {}).map((k) => ({ prefix: "state", key: k, label: k }));

      // Extract loop aliases from template
      const aliasSources: { alias: string; source: string }[] = [];
      try {
        const root = document.createElement("div");
        root.innerHTML = htmlTemplate;
        root.querySelectorAll("[data-repeat]").forEach((el) => {
          const source = el.getAttribute("data-repeat") || "";
          const alias = el.getAttribute("data-as") || "item";
          aliasSources.push({ alias, source });
        });
      } catch {}

      return <div className="space-y-5">
        {renderHelpBanner("template")}
        <SectionTitle title={t("ComponentBuilder.TemplateSection")} subtitle={t("ComponentBuilder.TemplateHint")} />
        <div className="grid grid-cols-2 gap-3">
          <Snippet label={t("ComponentBuilder.ContentSnippet")} value="{{content.title}}" />
          <Snippet label={t("ComponentBuilder.StateSnippet")} value="{{state.page}}" />
          <Snippet label={t("ComponentBuilder.LoopSnippet")} value={'<template data-repeat="content.users" data-as="user">'} />
          <Snippet label={t("ComponentBuilder.ClickSnippet")} value={'data-event-click="viewUser"'} />
          <Snippet label={t("ComponentBuilder.EnterKeySnippet")} value={'data-event-keydown="searchEnter"'} />
        </div>
        {/* Available Variables — reactive panel */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
          <div className="border-b border-gray-100 dark:border-gray-700 px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Available Variables</div>
            <div className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">Click any variable to copy it. These update as you edit content, settings, and state.</div>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {availableSettings.length > 0 && (
              <div className="px-4 py-3">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Style Settings — {'{{settings.*}}'}</div>
                <div className="flex flex-wrap gap-1.5">
                  {availableSettings.map((s: any) => (
                    <code key={s.key} onClick={() => { navigator.clipboard.writeText(`{{${s.prefix}.${s.key}}}`); toaster.info(`Copied {{${s.prefix}.${s.key}}}`); }} className="cursor-pointer select-all rounded-md bg-purple-50 dark:bg-purple-950/30 px-2 py-1 text-xs font-mono text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-colors border border-purple-200 dark:border-purple-800">
                      {`{{${s.prefix}.${s.key}}}`}
                    </code>
                  ))}
                </div>
              </div>
            )}
            {availableContent.length > 0 && (
              <div className="px-4 py-3">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Content Fields — {'{{content.*}}'}</div>
                <div className="flex flex-wrap gap-1.5">
                  {availableContent.map((c: any) => (
                    <code key={c.key} onClick={() => { navigator.clipboard.writeText(`{{${c.prefix}.${c.key}}}`); toaster.info(`Copied {{${c.prefix}.${c.key}}}`); }} className="cursor-pointer select-all rounded-md bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 text-xs font-mono text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors border border-emerald-200 dark:border-emerald-800">
                      {`{{${c.prefix}.${c.key}}}${c.isList ? ' (loop)' : ''}`}
                    </code>
                  ))}
                </div>
                {/* List sub-fields */}
                {availableContent.filter((c: any) => c.isList && c.itemSchema).map((c: any) => (
                  <div key={`${c.key}-sub`} className="mt-2 ml-2">
                    <div className="mb-1.5 text-[10px] font-medium text-emerald-500 dark:text-emerald-500">{c.key} item fields:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {c.itemSchema.map((f: any) => (
                        <code key={f.key} onClick={() => { navigator.clipboard.writeText(`{{${aliasSources.length > 0 ? aliasSources[0].alias : 'item'}.${f.key}}}`); toaster.info(`Copied {{${aliasSources.length > 0 ? aliasSources[0].alias : 'item'}.${f.key}}}`); }} className="cursor-pointer select-all rounded-md bg-emerald-50/50 dark:bg-emerald-950/20 px-2 py-1 text-xs font-mono text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 transition-colors border border-emerald-200/50 dark:border-emerald-800/50">
                          {`{{${aliasSources.length > 0 ? aliasSources[0].alias : 'item'}.${f.key}}}`}
                        </code>
                      ))}
                    </div>
                  </div>
                ))}
                {/* Loop alias references */}
                {aliasSources.length > 0 && (
                  <div className="mt-3 ml-2 border-t border-dashed border-gray-200 dark:border-gray-700 pt-3">
                    <div className="mb-1.5 text-[10px] font-medium text-emerald-500 dark:text-emerald-500">Loop aliases in template:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {aliasSources.map((a) => (
                        <code key={a.alias} className="select-all rounded-md bg-gray-100 dark:bg-gray-800 px-2 py-1 text-xs font-mono text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600">
                          {`data-repeat="${a.source}" data-as="${a.alias}"`}
                        </code>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {availableState.length > 0 && (
              <div className="px-4 py-3">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Runtime State — {'{{state.*}}'}</div>
                <div className="flex flex-wrap gap-1.5">
                  {availableState.map((s: any) => (
                    <code key={s.key} onClick={() => { navigator.clipboard.writeText(`{{${s.prefix}.${s.key}}}`); toaster.info(`Copied {{${s.prefix}.${s.key}}}`); }} className="cursor-pointer select-all rounded-md bg-blue-50 dark:bg-blue-950/30 px-2 py-1 text-xs font-mono text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors border border-blue-200 dark:border-blue-800">
                      {`{{${s.prefix}.${s.key}}}`}
                    </code>
                  ))}
                </div>
              </div>
            )}
            {availableSettings.length === 0 && availableContent.length === 0 && availableState.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500 italic">
                No variables defined yet. Add settings, content fields, or state to see them here.
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">HTML Template Editor</span>
          <AIChatButton onClick={() => setShowAIChat(true)} />
        </div>
        <CodeEditor
          label=""
          value={htmlTemplate}
          language="html"
          height={480}
          helper="Supports {{content.*}}, {{state.*}}, {{settings.*}}, data-if, data-repeat, and data-event-* attributes."
          onChange={setHtmlTemplate}
        />
        <TemplateValidationPanel items={templateValidation} />
      </div>;
    }

    if (activeStep === "api") {
      return <div className="space-y-5">
        {renderHelpBanner("api")}
        <div className="flex items-center justify-between gap-3">
          <SectionTitle title={t("ComponentBuilder.DataAPI")} subtitle={t("ComponentBuilder.DataAPIHint")} />
          <Button size="sm" onClick={addApiBinding}><Plus className="h-4 w-4" /></Button>
        </div>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-4 space-y-3">
            {Object.entries(apiBindings).map(([key, binding]: [string, any]) => <button key={key} onClick={() => setSelectedApi(key)} className={`w-full rounded-xl border p-4 text-left transition ${selectedApi === key ? "border-brand-300 bg-brand-50 dark:bg-brand-500/10 shadow-sm" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"}`}>
              <div className="mb-2 flex items-center justify-between gap-2"><span className="font-medium text-gray-800 dark:text-gray-200">{key}</span><Badge variant="light">{binding.method}</Badge></div>
              <div className="truncate text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400">{binding.url}</div>
              <div className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-400">Trigger: {binding.trigger}</div>
            </button>)}
          </div>
          <div className="col-span-8 space-y-4">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm">
              {selectedBinding ? <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div><div className="text-base font-semibold text-gray-800 dark:text-gray-200">{selectedApi}</div><div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400">{t("ComponentBuilder.FocusedAPIEditor")}</div></div>
                  <div className="flex gap-2"><Button size="sm" onClick={() => runApiNow(selectedApi)}><PlugZap className="mr-2 h-4 w-4" /> Fetch API</Button><Button size="icon" variant="ghost" onClick={() => removeApiBinding(selectedApi)}><Trash2 className="h-4 w-4 text-error-500" /></Button></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t("ComponentBuilder.BindingKey")}><Input defaultValue={selectedApi} onBlur={(e) => renameApiBinding(selectedApi, e.target.value.trim())} /></Field>
                  <Field label={t("ComponentBuilder.Trigger")}><select className="h-10 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm dark:text-gray-300" value={selectedBinding.trigger || "manual"} onChange={(e) => updateApiBinding(selectedApi, { trigger: e.target.value })}><option value="onLoad">onLoad</option><option value="onClick">onClick</option><option value="onChange">onChange</option><option value="onSubmit">onSubmit</option><option value="manual">manual</option></select></Field>
                  <Field label={t("ComponentBuilder.Method")}><select className="h-10 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm dark:text-gray-300" value={selectedBinding.method || "GET"} onChange={(e) => updateApiBinding(selectedApi, { method: e.target.value })}><option>{t("ComponentBuilder.MethodGET")}</option><option>{t("ComponentBuilder.MethodPOST")}</option><option>{t("ComponentBuilder.MethodPUT")}</option><option>{t("ComponentBuilder.MethodPATCH")}</option><option>{t("ComponentBuilder.MethodDELETE")}</option></select></Field>
                  <Field label={t("ComponentBuilder.AutoFetch")}><select className="h-10 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm dark:text-gray-300" value={selectedBinding.autoFetch ? "true" : "false"} onChange={(e) => updateApiBinding(selectedApi, { autoFetch: e.target.value === "true" })}><option value="true">true</option><option value="false">false</option></select></Field>
                </div>
                <Field label={t("ComponentBuilder.APIUrl")} error={apiUrlError || undefined}><Input value={selectedBinding.url || ""} onChange={(e) => updateApiBinding(selectedApi, { url: e.target.value })} /></Field>
                <div className="grid grid-cols-2 gap-4"><JsonEditor label={t("ComponentBuilder.QueryJSON")} value={selectedBinding.query || {}} onChange={(v) => updateApiBinding(selectedApi, { query: v })} rows={5} /><JsonEditor label={t("ComponentBuilder.BodyJSON")} value={selectedBinding.body ?? null} onChange={(v) => updateApiBinding(selectedApi, { body: v })} rows={5} /></div>
                <JsonEditor label={t("ComponentBuilder.ResponseMap")} value={selectedBinding.responseMap || {}} onChange={(v) => updateApiBinding(selectedApi, { responseMap: v })} rows={6} />
                <div className="grid grid-cols-3 gap-4"><JsonEditor label={t("ComponentBuilder.BeforeScript")} value={selectedBinding.beforeActions || []} onChange={(v) => updateApiBinding(selectedApi, { beforeActions: v })} rows={5} /><JsonEditor label={t("ComponentBuilder.SuccessScript")} value={selectedBinding.successActions || []} onChange={(v) => updateApiBinding(selectedApi, { successActions: v })} rows={5} /><JsonEditor label={t("ComponentBuilder.ErrorScript")} value={selectedBinding.errorActions || []} onChange={(v) => updateApiBinding(selectedApi, { errorActions: v })} rows={5} /></div>
              </div> : <div className="text-sm text-gray-500 dark:text-gray-400">{t("ComponentBuilder.NoAPISelected")}</div>}
            </div>
            {/* API Response inline — moved from right sidebar */}
            {apiResult && (
              <Disclosure title="Last API Response" icon={Loader2} defaultOpen={true}>
                <div className="space-y-3">
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3 text-xs">
                    <div><strong>Binding:</strong> {apiResult.binding}</div>
                    <div className="break-all"><strong>URL:</strong> {apiResult.url}</div>
                    <div><strong>Method:</strong> {apiResult.method}</div>
                    <div><strong>Status:</strong> {apiResult.status}</div>
                    <div><strong>Source:</strong> {apiResult.source}</div>
                    <div><strong>Fetched:</strong> {apiResult.fetchedAt}</div>
                  </div>
                  <pre className="max-h-[260px] overflow-auto rounded-xl bg-gray-900 p-4 text-xs text-gray-100">{safeJsonStringify(apiResult.rawResponse)}</pre>
                </div>
              </Disclosure>
            )}
          </div>
        </div>
      </div>;
    }

    if (activeStep === "events") {
      const elementEventTypes = [
        { key: "onClick", label: "Click", attr: "data-event-click" },
        { key: "onDoubleClick", label: "Double Click", attr: "data-event-double-click" },
        { key: "onChange", label: "Change", attr: "data-event-change" },
        { key: "onInput", label: "Input", attr: "data-event-input" },
        { key: "onSubmit", label: "Submit", attr: "data-event-submit" },
        { key: "onKeyDown", label: "Key Down / Enter", attr: "data-event-keydown" },
        { key: "onMouseEnter", label: "Mouse Enter", attr: "data-event-mouse-enter" },
        { key: "onMouseLeave", label: "Mouse Leave", attr: "data-event-mouse-leave" },
        { key: "onScroll", label: "Scroll", attr: "data-event-scroll" }
      ];

      const allElementEvents = elementEventTypes.flatMap((eventType) =>
        Object.entries(config.events?.[eventType.key] || {}).map(([eventKey, actions]) => ({ ...eventType, eventKey, actions }))
      );

      const [firstEvent] = allElementEvents;
      const selectedElementEvent = eventEditorSelection && allElementEvents.some((x) => x.key === eventEditorSelection.type && x.eventKey === eventEditorSelection.key)
        ? allElementEvents.find((x) => x.key === eventEditorSelection.type && x.eventKey === eventEditorSelection.key)
        : firstEvent;

      const selectedLifecycle = (eventEditorSelection as any)?.lifecycle || "onLoad";
      const selectedActions = eventEditorSelection?.mode === "lifecycle"
        ? (config.events?.[selectedLifecycle] || [])
        : (selectedElementEvent?.actions || []);

      return <div className="space-y-5">
        {renderHelpBanner("events")}
        <div className="min-h-[720px] overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
          <div className="grid h-full grid-cols-12">
            <div className="col-span-5 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/70 p-5">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t("ComponentBuilder.Events")}</h2>
                    <Badge variant="light" className="gap-1"><HelpCircle className="h-3 w-3" /> Help</Badge>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Use bound lifecycle and DOM events to run actions.</p>
                </div>
                <select className="h-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-xs font-medium" onChange={(e) => { if (e.target.value) addElementEvent(e.target.value); e.target.value = ""; }} defaultValue="">
                  <option value="" disabled>+ Add</option>
                  {elementEventTypes.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                </select>
              </div>

              <div className="mb-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t("ComponentBuilder.Lifecycle")}</div>
                {["onInit", "onLoad", "onClose"].map((lifecycle) => {
                  const active = eventEditorSelection?.mode === "lifecycle" && (eventEditorSelection as any).lifecycle === lifecycle;
                  return <button key={lifecycle} onClick={() => setEventEditorSelection({ mode: "lifecycle", lifecycle })} className={`mb-2 flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${active ? "border-brand-300 bg-brand-50 shadow-sm" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"}`}>
                    <div><div className="text-sm font-medium text-gray-800 dark:text-gray-200">{lifecycle}</div><div className="text-xs text-gray-500 dark:text-gray-400">{(config.events?.[lifecycle] || []).length} actions</div></div>
                    <Button size="icon" variant="outline"><Edit3 className="h-4 w-4" /></Button>
                  </button>;
                })}
              </div>

              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{t("ComponentBuilder.ElementEvents")}</div>
              <div className="space-y-2">
                {allElementEvents.length === 0 ? <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 text-center text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400">{t("ComponentBuilder.NoElementEvents")}</div> : null}
                {allElementEvents.map((item: any) => {
                  const active = eventEditorSelection?.mode !== "lifecycle" && selectedElementEvent?.key === item.key && selectedElementEvent?.eventKey === item.eventKey;
                  return <button key={`${item.key}-${item.eventKey}`} onClick={() => setEventEditorSelection({ mode: "element", type: item.key, key: item.eventKey })} className={`w-full rounded-xl border p-4 text-left transition ${active ? "border-brand-300 bg-brand-50 shadow-sm" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{item.label}:</div>
                        <div className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{item.eventKey}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{(item.actions || []).length}</Badge>
                        <Button size="icon" variant="outline"><Edit3 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </button>;
                })}
              </div>
            </div>

            <div className="col-span-7 bg-white dark:bg-gray-900 p-5">
              {eventEditorSelection?.mode === "lifecycle" ? <div className="mb-4 flex items-start justify-between gap-3">
                <div><h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedLifecycle}</h3><p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t("ComponentBuilder.LifecycleActionsHint")}</p></div>
                <Badge variant="light">lifecycle</Badge>
              </div> : <div className="mb-4 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div><h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedElementEvent?.eventKey || "Select event"}</h3><p className="mt-1 text-xs text-gray-500 dark:text-gray-400">One side defines focused event JSON.</p></div>
                  {selectedElementEvent ? <Button size="icon" variant="ghost" onClick={() => removeElementEvent(selectedElementEvent.key, selectedElementEvent.eventKey)}><Trash2 className="h-4 w-4 text-error-500" /></Button> : null}
                </div>
                {selectedElementEvent ? <div className="grid grid-cols-2 gap-3 rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
                  <Field label={t("ComponentBuilder.EventType")}>
                    <select className="h-10 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm" value={selectedElementEvent.key} onChange={(e) => moveElementEvent(selectedElementEvent.key, selectedElementEvent.eventKey, e.target.value)}>
                      {elementEventTypes.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                    </select>
                  </Field>
                  <Field label={t("ComponentBuilder.EventKey")}>
                    <Input defaultValue={selectedElementEvent.eventKey} onBlur={(e) => renameElementEvent(selectedElementEvent.key, selectedElementEvent.eventKey, e.target.value.trim())} placeholder={t("ComponentBuilder.EventKeyPlaceholder")} />
                  </Field>
                  <div className="col-span-2 rounded-xl bg-white dark:bg-gray-900 p-3 text-xs text-gray-600 dark:text-gray-400 dark:text-gray-400">
                    Use in HTML: <code>{`${selectedElementEvent.attr}="${selectedElementEvent.eventKey}"`}</code>
                    {selectedElementEvent.key === "onKeyDown" ? <div className="mt-1">{t("ComponentBuilder.PayloadHint")}<code>event.keyboardKey</code>, <code>event.enter</code>, <code>event.value</code>.</div> : null}
                  </div>
                </div> : null}
              </div>}

              <CodeEditor
                label={eventEditorSelection?.mode === "lifecycle" ? `${selectedLifecycle} Actions` : `${selectedElementEvent?.eventKey || "Event"} Actions`}
                value={safeJsonStringify(selectedActions)}
                language="json"
                height={560}
                helper="Actions support api, setState, setContent, paginate, and future runtime action types."
                onChange={(text) => {
                  try {
                    const parsed = JSON.parse(text || "[]");
                    if (eventEditorSelection?.mode === "lifecycle") updateEventActions(selectedLifecycle, null, parsed);
                    else if (selectedElementEvent) updateEventActions(selectedElementEvent.key, selectedElementEvent.eventKey, parsed);
                  } catch {
                    // keep editor local until valid JSON
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>;
    }

    if (activeStep === "state") {
      return <div className="space-y-5">
        {renderHelpBanner("state")}
        <SectionTitle title={t("ComponentBuilder.RuntimeState")} subtitle="Default runtime values available as state.*" />
        <JsonEditor label={t("ComponentBuilder.StateJSON")} value={config.state || {}} onChange={(state) => setConfig((prev: any) => ({ ...prev, state }))} rows={18} />
      </div>;
    }

    return <div className="space-y-5">
      {renderHelpBanner("advanced")}
      <SectionTitle title={t("ComponentBuilder.AdvancedJSON")} subtitle="Raw config escape hatch for developers." />
      <JsonEditor label={t("ComponentBuilder.FullConfigJSON")} value={config} onChange={setConfig} rows={28} />
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-outfit">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="rounded-xl border border-gray-300 p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="rounded-xl bg-brand-500 p-3 text-white shadow-sm"><Wand2 className="h-5 w-5" /></div>
            <div><div className="text-xl font-semibold">{displayName}</div><div className="text-sm text-gray-500 dark:text-gray-400">{shortDescription}</div></div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">v{version}</Badge>
            <select
              value=""
              onChange={e => { if (e.target.value) loadSample(e.target.value); e.target.value = ""; }}
              className="appearance-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden cursor-pointer"
            >
              <option value="">Load Sample...</option>
              <option value="basic">Basic Template</option>
              <option value="api">API Based Template</option>
            </select>
            <Button variant="outline" onClick={() => setShowDebug(!showDebug)} className={showDebug ? "bg-gray-100 dark:bg-gray-700" : ""}>
              <Bug className="mr-2 h-4 w-4" /> Debug
            </Button>
            <Button variant="outline" onClick={() => setShowClearConfirm(true)}><Trash2 className="mr-2 h-4 w-4" /> Clear All</Button>
            {hasValidationErrors && <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {Object.keys(errors).length + settingsErrors.filter((e: any) => e.key || e.label).length + contentErrors.filter((e: any) => e.key || e.label).length} errors</Badge>}
            <Button onClick={handleSave} disabled={isSaving || hasValidationErrors} className="bg-brand-500 hover:bg-brand-600 text-white shadow-theme-xs">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isSaving ? t("Common.Saving") : t("ComponentBuilder.SaveComponent")}
            </Button>
          </div>
        </div>
      </div>

      {/* Main layout — sidebar + editor, no right panel */}
      <div className={`mx-auto max-w-[1800px] ${sidebarCollapsed ? "flex gap-5 px-5 py-5" : "grid grid-cols-12 gap-5 px-5 py-5"}`}>
        {/* Sidebar with Basic + Advance groups */}
        <aside className={sidebarCollapsed ? "w-14 shrink-0" : "col-span-2"}>
          <div className="sticky top-24 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 shadow-sm">
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="flex w-full items-center justify-center rounded-xl p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-400 dark:text-gray-400 transition mb-1">
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>

            {/* Basic group */}
            {!sidebarCollapsed && (
              <div className="mb-1 px-3 pb-1 pt-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Basic</div>
              </div>
            )}
            {BASIC_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeStep === item.key;
              if (sidebarCollapsed) {
                return <button key={item.key} onClick={() => setActiveStep(item.key)} className={`flex items-center justify-center w-9 h-9 mx-auto rounded-xl text-sm font-medium transition ${active ? "bg-brand-500 text-white shadow-sm" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`} title={item.label}>
                  <Icon className="h-4 w-4" />
                </button>;
              }
              return <button key={item.key} onClick={() => setActiveStep(item.key)} className={`flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-brand-500 text-white shadow-sm" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                <span className="flex items-center gap-2.5 flex-1 min-w-0"><Icon className="h-4 w-4 shrink-0" /> {item.label}</span>
                {item.key === "template" && missingTemplateRefs.length > 0 ? <Badge variant={active ? "secondary" : "destructive"} className="ml-auto shrink-0">{missingTemplateRefs.length}</Badge> : <CheckCircle2 className={`ml-auto shrink-0 h-4 w-4 ${active ? "text-white" : "text-success-500"}`} />}
              </button>;
            })}

            {/* Advance group divider */}
            {!sidebarCollapsed && (
              <>
                <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
                <button
                  onClick={() => setAdvanceExpanded(!advanceExpanded)}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition"
                >
                  {advanceExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  Advance
                  {!advanceExpanded && <Lock className="h-3 w-3 ml-auto" />}
                </button>
              </>
            )}
            {advanceExpanded && ADVANCE_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeStep === item.key;
              if (sidebarCollapsed) {
                return <button key={item.key} onClick={() => setActiveStep(item.key)} className={`flex items-center justify-center w-9 h-9 mx-auto rounded-xl text-sm font-medium transition ${active ? "bg-brand-500 text-white shadow-sm" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`} title={item.label}>
                  <Icon className="h-4 w-4" />
                </button>;
              }
              return <button key={item.key} onClick={() => {
                if (showAdvanceGate && !advanceExpanded) {
                  // gate will show, don't switch tab yet
                }
                setActiveStep(item.key);
              }} className={`flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-brand-500 text-white shadow-sm" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                <span className="flex items-center gap-2.5 flex-1 min-w-0"><Icon className="h-4 w-4 shrink-0" /> {item.label}</span>
                <CheckCircle2 className={`ml-auto shrink-0 h-4 w-4 ${active ? "text-white" : "text-gray-300 dark:text-gray-600"}`} />
              </button>;
            })}
          </div>
        </aside>

        {/* Main editor area — wider now that right panel is removed */}
        <main className={sidebarCollapsed ? "flex-1 min-w-0" : "col-span-10"}>
          {/* Welcome banner */}
          {showWelcome && (
            <div className="mb-5 flex items-start gap-4 rounded-2xl border border-brand-100 dark:border-brand-900/50 bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-950/30 dark:to-purple-950/30 p-5 shadow-sm">
              <div className="rounded-xl bg-brand-500 p-2.5 text-white shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Welcome to the Component Builder</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Build reusable components in 3 simple steps: <strong>1. Setup</strong> — name and style settings, <strong>2. Template</strong> — write HTML with placeholders, <strong>3. Content</strong> — define your data fields.
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Use the <strong>"Load Sample..."</strong> dropdown in the header to start from a pre-built template. Need APIs or events? Open the <strong>Advance</strong> section in the sidebar.
                </p>
              </div>
              <button onClick={() => setShowWelcome(false)} className="shrink-0 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800 rounded-lg transition-all">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <Card className="rounded-2xl border-gray-200 dark:border-gray-700 shadow-sm"><CardContent className="p-6">
            {renderEditor()}

            {/* Template Health Bar — always visible */}
            <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                <Code2 className="h-3.5 w-3.5" /> Variables: <span className={refSummary.vars > 0 ? "text-success-600 dark:text-success-400" : "text-gray-400"}>{refSummary.vars}</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                <Layers className="h-3.5 w-3.5" /> Loops: <span className={refSummary.loops > 0 ? "text-success-600 dark:text-success-400" : "text-gray-400"}>{refSummary.loops}</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                <MousePointerClick className="h-3.5 w-3.5" /> Events: <span className={refSummary.events > 0 ? "text-success-600 dark:text-success-400" : "text-gray-400"}>{refSummary.events}</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                {refSummary.missing > 0 ? (
                  <><AlertTriangle className="h-3.5 w-3.5 text-warning-500" /> Issues: <span className="text-warning-600 dark:text-warning-400">{refSummary.missing}</span></>
                ) : (
                  <><CheckCircle2 className="h-3.5 w-3.5 text-success-500" /> All resolved</>
                )}
              </span>
              {refSummary.missing > 0 && activeStep !== "template" && (
                <button onClick={() => setActiveStep("template")} className="ml-auto text-brand-600 dark:text-brand-400 hover:underline font-medium">
                  Review issues
                </button>
              )}
            </div>
          </CardContent></Card>

          {/* Debug panel */}
          {showDebug && (
            <Card className="mt-5 rounded-2xl border-gray-200 dark:border-gray-700 shadow-sm"><CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Bug className="h-4 w-4" /> Debug: Save Payload
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Inspect the exact JSON that will be sent to the server.</p>
                </div>
                <Badge variant="outline">{payload.HtmlComponentId === 0 ? "New Component" : "Edit Mode"}</Badge>
              </div>
              <pre className="max-h-[400px] overflow-auto rounded-xl bg-gray-900 p-4 text-xs text-gray-100">{safeJsonStringify(payload)}</pre>
            </CardContent></Card>
          )}

          {/* Runtime State inspector inline */}
          {runtimeSnapshot && (
            <Disclosure title="Runtime State" icon={FileJson} defaultOpen={false}>
              <pre className="max-h-[260px] overflow-auto rounded-xl bg-gray-900 p-4 text-xs text-gray-100">{safeJsonStringify(runtimeSnapshot)}</pre>
            </Disclosure>
          )}
        </main>
      </div>

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-error-500/10 p-3">
                <AlertTriangle className="h-6 w-6 text-error-600 dark:text-error-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Clear all fields?</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  This will remove the component name, template, style settings, content fields, API bindings, events, state, and advanced config. This cannot be undone.
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  You'll start with a completely blank component.
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <Button onClick={clearAll} className="bg-error-500 hover:bg-error-600 text-white shadow-theme-xs">
                    Yes, clear everything
                  </Button>
                  <Button variant="outline" onClick={() => setShowClearConfirm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
              <button onClick={() => setShowClearConfirm(false)} className="shrink-0 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advance Gate Modal */}
      {showAdvanceGate && ADVANCE_ITEMS.some(item => item.key === activeStep) && advanceExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-brand-500/10 p-3">
                <Lock className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Advanced Features</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  You're about to use advanced features. You can build great components using just the basic tabs (Setup, Template, Content).
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Advanced tabs include API bindings, event system, runtime state, and raw JSON editing.
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <Button onClick={() => { setShowAdvanceGate(false); }} className="bg-brand-500 hover:bg-brand-600 text-white shadow-theme-xs">
                    Continue to Advance Mode
                  </Button>
                  <Button variant="outline" onClick={() => { setAdvanceExpanded(false); setActiveStep("setup"); }}>
                    Stay in Basic
                  </Button>
                </div>
                <label className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <input type="checkbox" onChange={(e) => { if (e.target.checked) setShowAdvanceGate(false); }} className="dark:accent-brand-500" />
                  Don't show this again
                </label>
              </div>
              <button onClick={() => { setAdvanceExpanded(false); setActiveStep("setup"); }} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Preview Panel */}
      {isPreviewVisible && (
        <div
          style={{
            position: isPreviewFullscreen ? "fixed" : "fixed",
            left: isPreviewFullscreen ? "0" : `${previewPosition.x}px`,
            top: isPreviewFullscreen ? "0" : `${previewPosition.y}px`,
            zIndex: 50,
            width: isPreviewFullscreen ? "100vw" : `${previewDimensions.width}px`,
            height: isPreviewFullscreen ? "100vh" : `${previewDimensions.height}px`,
          }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-300 dark:border-gray-700 flex flex-col overflow-hidden"
        >
          {/* Draggable Header */}
          <div
            className="bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-3 cursor-move flex items-center justify-between select-none"
            onMouseDown={startDragging}
          >
            <div className="flex items-center gap-2 text-white">
              <Eye className="h-4 w-4" />
              <span className="font-medium text-sm">{t("ComponentBuilder.LivePreview")}</span>
              {viewport !== "desktop" && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/20 text-white/90">
                  {viewport === "tablet" ? "768×1024" : "390×844"}
                </span>
              )}
              {/* Viewport Buttons */}
              <div className="ml-3 flex gap-0.5 bg-white/10 rounded-lg p-0.5">
                {[
                  { key: "desktop", icon: Monitor, label: "Desktop" },
                  { key: "tablet", icon: Tablet, label: "Tablet" },
                  { key: "mobile", icon: Smartphone, label: "Mobile" },
                ].map((v) => {
                  const VIcon = v.icon;
                  return (
                    <button
                      key={v.key}
                      onClick={(e) => { e.stopPropagation(); setViewport(v.key); }}
                      title={v.label}
                      className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-all ${
                        viewport === v.key
                          ? "bg-white text-brand-600 shadow-sm"
                          : "text-white/80 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <VIcon className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{v.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); setIsPreviewFullscreen(!isPreviewFullscreen); }}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
                title={isPreviewFullscreen ? t("ComponentBuilder.ExitFullscreen") : t("ComponentBuilder.Fullscreen")}
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIsPreviewVisible(false); }}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
                title={t("Form.Close")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Preview Content */}
          <div className={`flex-1 overflow-auto bg-[#f0ebe3] p-6 ${isPreviewFullscreen || viewport !== "desktop" ? "flex items-start justify-center" : ""}`}>
            <div className={`${viewport !== "desktop" ? "shadow-2xl rounded-2xl overflow-hidden bg-white" : ""} transition-all duration-300`}>
              <div className={`${previewWidth} mx-auto transition-all duration-300`} style={viewport !== "desktop" ? { maxHeight: viewport === "mobile" ? "812px" : "1024px" } : {}}>
                <DynamicRenderer htmlTemplate={htmlTemplate} config={config} contentStructure={contentStructure} onRuntimeChange={setRuntimeSnapshot} onApiResult={setApiResult} manualRunRequest={manualRunRequest} />
              </div>
            </div>
          </div>

          {/* Footer with Refresh + Runtime State toggle */}
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{t("ComponentBuilder.RealTime")}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                <FileJson className="inline h-3 w-3 mr-1" />
                {runtimeSnapshot ? Object.keys(runtimeSnapshot.state || {}).length + " state keys" : "—"}
              </span>
              <button onClick={() => setRuntimeSnapshot((prev: any) => ({ ...prev }))} className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1">
                <RefreshCcw className="h-3 w-3" /> {t("Common.Refresh")}
              </button>
            </div>
          </div>

          {/* Resize Handle (Bottom-Right) - hidden in fullscreen */}
          {!isPreviewFullscreen && (
            <div
              className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize bg-brand-500/20 hover:bg-brand-500/40 border-t border-l border-brand-500/30"
              style={{ borderTopLeftRadius: "4px" }}
              onMouseDown={startResizingPreview}
            />
          )}
        </div>
      )}

      {/* Show Preview FAB (when hidden) */}
      {!isPreviewVisible && (
        <button
          onClick={() => setIsPreviewVisible(true)}
          className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-2xl flex items-center gap-2 font-medium transition-all hover:scale-105"
        >
          <Eye className="h-5 w-5" />
          {t("ComponentBuilder.ShowPreview")}
        </button>
      )}

      {/* List Schema Modal */}
      {activeListFieldIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-brand-50 to-indigo-50">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-brand-500" />
                  {t("ComponentBuilder.ConfigureListItems")}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{contentStructure[activeListFieldIdx]?.label}</p>
              </div>
              <button onClick={() => setActiveListFieldIdx(null)} className="p-2 hover:bg-white rounded-full transition-all"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800">
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t("ComponentBuilder.DefineListItemFields")}</p>
                <Button size="sm" onClick={() => addListSchemaField(activeListFieldIdx)}><Plus className="mr-1 h-4 w-4" /> {t("ComponentBuilder.AddItemField")}</Button>
              </div>
              <div className="space-y-4">
                {((contentStructure[activeListFieldIdx] as any)?.itemSchema || []).length === 0 && (
                  <div className="text-center py-12 text-gray-400 italic border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">{t("ComponentBuilder.NoListFields")}</div>
                )}
                {((contentStructure[activeListFieldIdx] as any)?.itemSchema || []).map((field: any, sIdx: number) => (
                  <div key={sIdx} className="flex gap-3 items-start p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex-1 space-y-3">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">{t("ComponentBuilder.KeyLabel")}</label>
                      <Input value={field.key} onChange={(e) => updateListSchema(activeListFieldIdx, sIdx, "key", e.target.value)} />
                    </div>
                    <div className="flex-1 space-y-3">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">{t("ComponentBuilder.LabelField")}</label>
                      <Input value={field.label} onChange={(e) => updateListSchema(activeListFieldIdx, sIdx, "label", e.target.value)} />
                    </div>
                    <div className="flex-1 space-y-3">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">{t("ComponentBuilder.TypeLabel")}</label>
                      <select value={field.type} onChange={(e) => updateListSchema(activeListFieldIdx, sIdx, "type", e.target.value)} className="h-10 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm">
                        <option value="text">{t("ComponentBuilder.OptionText")}</option>
                        <option value="textarea">{t("ComponentBuilder.OptionLongText")}</option>
                        <option value="richtext">{t("ComponentBuilder.OptionRichText")}</option>
                        <option value="image">{t("ComponentBuilder.OptionImage")}</option>
                      </select>
                    </div>
                    <div className="flex-1 space-y-3">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">{t("ComponentBuilder.DefaultLabel")}</label>
                      <Input value={field.defaultValue} onChange={(e) => updateListSchema(activeListFieldIdx, sIdx, "defaultValue", e.target.value)} />
                    </div>
                    <button onClick={() => removeListSchemaField(activeListFieldIdx, sIdx)} className="mt-7 text-error-500 hover:text-error-600 p-2 hover:bg-red-50 rounded-lg">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <Button onClick={() => setActiveListFieldIdx(null)} className="bg-brand-500 hover:bg-brand-600 text-white shadow-theme-xs">{t("ComponentBuilder.Done")}</Button>
            </div>
          </div>
        </div>
      )}

      <AIChatDialog
        open={showAIChat}
        onClose={() => setShowAIChat(false)}
        onInsertTemplate={(html) => { setHtmlTemplate(html); setShowAIChat(false); }}
      />
    </div>
  );
}

function TemplateValidationPanel({ items }: { items: any[] }) {
  const { t } = useTranslation();
  const grouped: Record<string, any[]> = {
    variable: items.filter((item) => item.kind === "variable" || item.kind === "alias"),
    unbound: items.filter((item) => item.kind === "unbound"),
    condition: items.filter((item) => item.kind === "condition"),
    repeat: items.filter((item) => item.kind === "repeat"),
    event: items.filter((item) => item.kind === "event")
  };
  const missingCount = items.filter((item) => !item.assigned).length;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{t("ComponentBuilder.TemplateValidation")}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{t("ComponentBuilder.TemplateValidationHint")}</div>
        </div>
        <Badge variant={missingCount ? "destructive" : "outline"}>{missingCount ? t("ComponentBuilder.IssuesCount", { count: missingCount }) : t("ComponentBuilder.AllGood")}</Badge>
      </div>

      <div className="grid grid-cols-4 gap-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-3 text-xs text-gray-600 dark:text-gray-400">
        <div><strong>Variables:</strong> {grouped.variable.length}</div>
        <div><strong>Unbound:</strong> {grouped.unbound.length}</div>
        <div><strong>Loops:</strong> {grouped.repeat.length}</div>
        <div><strong>Events:</strong> {grouped.event.length}</div>
      </div>

      <div className="max-h-[340px] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white dark:bg-gray-900 text-left text-xs uppercase text-gray-500 dark:text-gray-400 dark:text-gray-400 shadow-sm">
            <tr>
              <th className="p-3">{t("ComponentBuilder.UsedPath")}</th>
              <th className="p-3">{t("ComponentBuilder.Kind")}</th>
              <th className="p-3">{t("ComponentBuilder.Source")}</th>
              <th className="p-3">{t("ComponentBuilder.Status")}</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? <tr><td className="p-4 text-gray-500 dark:text-gray-400" colSpan={4}>{t("ComponentBuilder.NoTemplateRefs")}</td></tr> : null}
            {items.map((item: any) => (
              <tr key={`${item.kind}-${item.value}`} className="border-t border-gray-200 dark:border-gray-700">
                <td className="p-3 font-mono text-xs font-medium text-gray-800 dark:text-gray-200">{item.value}</td>
                <td className="p-3"><Badge variant="outline">{item.kind}</Badge></td>
                <td className="p-3 text-xs text-gray-500 dark:text-gray-400">{item.assignedFrom}</td>
                <td className="p-3"><Badge variant={item.assigned ? "outline" : "destructive"}>{item.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return <div><h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p></div>;
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return <div className="space-y-1"><label className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</label>{children}{error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}</div>;
}

function Snippet({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 shadow-sm"><div className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{label}</div><code className="mt-1 block truncate text-xs text-gray-800 dark:text-gray-200">{value}</code></div>;
}
