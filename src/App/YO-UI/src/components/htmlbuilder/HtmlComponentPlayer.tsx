import { useEffect, useMemo, useRef, useState } from "react";

function deepClone(value: any) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
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
  for (let i = 0; i < parts.length - 1; i++) {
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
    } catch {
      return value;
    }
  }
  return value.replace(/\{\{\s*([\s\S]+?)\s*\}\}/g, (_match: string, expression: string) => {
    try {
      const result = Function(...Object.keys(scope), `return (${expression});`)(...Object.values(scope));
      return result == null ? "" : String(result);
    } catch {
      return "";
    }
  });
}

interface RuntimeState {
  settings: Record<string, any>;
  content: Record<string, any>;
  state: Record<string, any>;
  __lastApiData?: any;
  __lastApiMessage?: any;
}

export interface HtmlComponentConfig {
  settings?: Array<{ key: string; label: string; type: string; defaultValue: any; options?: string[] }>;
  state?: Record<string, any>;
  apiConfig?: any;
  events?: any;
  runtimeOptions?: any;
}

export interface HtmlComponentPlayerProps {
  htmlTemplate: string;
  config: HtmlComponentConfig;
  contentStructure: Array<{ key: string; label: string; type: string; defaultValue: any }>;
  className?: string;
}

function buildRuntime(contentStructure: any[], config: HtmlComponentConfig, customContent?: Record<string, any>): RuntimeState {
  const settings: Record<string, any> = {};
  const content: Record<string, any> = {};
  for (const item of config.settings || []) settings[item.key] = item.defaultValue ?? "";
  for (const item of contentStructure || []) content[item.key] = deepClone(item.defaultValue ?? null);
  if (customContent) Object.assign(content, customContent);
  return { settings, content, state: deepClone(config.state || {}) };
}

function applyResponseMap(runtime: RuntimeState, responseMap: any, apiResponse: any) {
  let next: any = { ...runtime, __lastApiData: apiResponse.data, __lastApiMessage: apiResponse.message || null };
  for (const [targetPath, sourcePath] of Object.entries(responseMap || {})) {
    next = setByPath(next, targetPath, getByPath(apiResponse, sourcePath as string));
  }
  return next as RuntimeState;
}

function paginateRuntime(runtime: RuntimeState, sourcePath: string, targetPath: string) {
  const source = getByPath(runtime, sourcePath) || [];
  const pageSize = Number(runtime.state.pageSize || 3);
  const totalRecords = Array.isArray(source) ? source.length : 0;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const page = Math.min(Math.max(Number(runtime.state.page || 1), 1), totalPages);
  const start = (page - 1) * pageSize;
  let next: any = setByPath(runtime, targetPath, Array.isArray(source) ? source.slice(start, start + pageSize) : []);
  next = setByPath(next, "state.page", page);
  next = setByPath(next, "state.totalPages", totalPages);
  next = setByPath(next, "state.totalRecords", totalRecords);
  return next as RuntimeState;
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
  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
    cache: "no-store" as RequestCache,
  };
  if (["POST", "PUT", "PATCH"].includes(method) && binding.body)
    options.body = JSON.stringify(binding.body);
  if (!runtimeOptions?.useRealApi) throw new Error("Real API is disabled in runtimeOptions.useRealApi.");
  const response = await fetch(url, options);
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) throw new Error(`API failed with status ${response.status}`);
  return { success: true, data, message: null, url, method, status: response.status, source: "real-api", fetchedAt: new Date().toISOString() };
}

function renderTemplateToHtml(templateString: string, runtime: any) {
  const root = document.createElement("div");
  root.innerHTML = templateString;

  function processNode(node: Node, scope: any) {
    if (node.nodeType === Node.TEXT_NODE) {
      const result = evaluateExpression(node.textContent || "", scope, {});
      const str = result == null ? "" : typeof result === "string" ? result : String(result);
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
          Array.from(wrapper.childNodes).forEach((child) =>
            processNode(child, { ...scope, [alias]: item, item })
          );
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
      if (attr.value.includes("{{"))
        element.setAttribute(attr.name, evaluateExpression(attr.value, scope, {}));
    });

    Array.from(element.childNodes).forEach((child) => processNode(child, scope));
  }

  Array.from(root.childNodes).forEach((child) => processNode(child, runtime));
  return root.innerHTML;
}

export default function HtmlComponentPlayer({
  htmlTemplate,
  config,
  contentStructure,
  className = "",
}: HtmlComponentPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [runtime, setRuntime] = useState<RuntimeState>(() =>
    buildRuntime(contentStructure, config),
  );
  const runtimeRef = useRef(runtime);
  const commit = (next: RuntimeState) => {
    runtimeRef.current = next;
    setRuntime(next);
  };

  useEffect(() => {
    const fresh = buildRuntime(contentStructure, config);
    runtimeRef.current = fresh;
    setRuntime(fresh);
  }, [contentStructure, config]);

  async function executeActions(actions: any[] = [], eventPayload: any = {}) {
    for (const action of actions) {
      let working = runtimeRef.current;
      if (action.type === "setState" || action.type === "setContent") {
        commit(
          setByPath(working, action.path, evaluateExpression(action.value, working, eventPayload)),
        );
      }
      if (action.type === "paginate") {
        commit(paginateRuntime(working, action.source, action.target));
      }
      if (action.type === "api") {
        const binding = config.apiConfig?.bindings?.[action.binding];
        if (!binding) continue;
        await executeActions(binding.beforeActions || [], eventPayload);
        working = runtimeRef.current;
        try {
          const response = await fetchFromBinding(
            binding,
            working,
            config.runtimeOptions || {},
          );
          commit(applyResponseMap(working, binding.responseMap, response));
          await executeActions(binding.successActions || [], eventPayload);
        } catch (error: any) {
          const message = error instanceof Error ? error.message : "Unknown API error";
          commit({ ...runtimeRef.current, __lastApiMessage: message });
          await executeActions(binding.errorActions || [], eventPayload);
        }
      }
    }
  }

  useEffect(() => {
    let disposed = false;
    const run = async () => {
      if (disposed) return;
      await executeActions(config.events?.onInit || []);
      if (disposed) return;
      await executeActions(config.events?.onLoad || []);
    };
    run();
    return () => {
      disposed = true;
    };
  }, [config]);

  const renderedHtml = useMemo(
    () => renderTemplateToHtml(htmlTemplate, runtime),
    [htmlTemplate, runtime],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const eventDefinitions = [
      { dom: "click", attr: "data-event-click", config: "onClick" },
      { dom: "dblclick", attr: "data-event-double-click", config: "onDoubleClick" },
      { dom: "change", attr: "data-event-change", config: "onChange" },
      { dom: "input", attr: "data-event-input", config: "onInput" },
      { dom: "submit", attr: "data-event-submit", config: "onSubmit" },
      { dom: "keydown", attr: "data-event-keydown", config: "onKeyDown" },
      { dom: "mouseenter", attr: "data-event-mouse-enter", config: "onMouseEnter" },
      { dom: "mouseleave", attr: "data-event-mouse-leave", config: "onMouseLeave" },
      { dom: "scroll", attr: "data-event-scroll", config: "onScroll" },
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
        const value =
          "value" in target ? (target as HTMLInputElement).value : undefined;
        const actions = config.events?.[definition.config]?.[eventKey] || [];

        executeActions(actions, {
          type: definition.dom,
          key: eventKey,
          dataset: { ...(target as HTMLElement).dataset },
          value,
          keyboardKey: keyboardEvent.key,
          enter: keyboardEvent.key === "Enter",
        });
      };

      el.addEventListener(definition.dom, handler, true);
      return () => el.removeEventListener(definition.dom, handler, true);
    });

    return () => disposers.forEach((dispose) => dispose());
  }, [config.events]);

  return (
    <div ref={containerRef} className={className} dangerouslySetInnerHTML={{ __html: renderedHtml }} />
  );
}
