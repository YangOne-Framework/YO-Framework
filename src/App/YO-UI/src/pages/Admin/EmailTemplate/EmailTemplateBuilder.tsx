import { useState, useCallback, useRef, useEffect, useReducer, memo } from "react";
import { MdDragHandle, MdDelete, MdAdd, MdArrowUpward, MdArrowDownward, MdContentCopy } from "react-icons/md";
import { useTranslation } from "react-i18next";

type BuilderComponentType =
  | "heading" | "text" | "button" | "image"
  | "divider" | "spacer" | "columns"
  | "table" | "pricing" | "callout" | "rawhtml"
  | "social" | "menu";

interface BuilderComponent {
  id: string;
  type: BuilderComponentType;
  name: string;
  props: Record<string, any>;
}

interface ComponentDef {
  label: string;
  icon: string;
  defaultProps: Record<string, any>;
  category: string;
}

const EF = `font-family:'PT Sans', Arial, Helvetica, sans-serif`;

const FONT_OPTIONS = [
  { label: "PT Sans", value: "font-family:'PT Sans', Arial, Helvetica, sans-serif" },
  { label: "Arial", value: "font-family:Arial, Helvetica, sans-serif" },
  { label: "Helvetica Neue", value: "font-family:'Helvetica Neue', Helvetica, Arial, sans-serif" },
  { label: "Segoe UI", value: "font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
  { label: "Verdana", value: "font-family:Verdana, Geneva, sans-serif" },
  { label: "Tahoma", value: "font-family:Tahoma, Geneva, Verdana, sans-serif" },
  { label: "Times New Roman", value: "font-family:'Times New Roman', Georgia, serif" },
  { label: "Georgia", value: "font-family:Georgia, 'Times New Roman', serif" },
  { label: "Courier New", value: "font-family:'Courier New', monospace" },
  { label: "Trebuchet MS", value: "font-family:'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', sans-serif" },
] as const;

const getComponentDefs = (t: (key: string, options?: Record<string, unknown>) => string): Record<BuilderComponentType, ComponentDef> => ({
  heading: { label: "Heading", icon: "H", category: t("EmailTemplateBuilder.CategoryBasic"), defaultProps: { level: "h2", text: t("EmailTemplateBuilder.DefaultHeading"), align: "left", color: "#1e293b", fontFamily: EF } },
  text: { label: "Text", icon: "T", category: t("EmailTemplateBuilder.CategoryBasic"), defaultProps: { content: t("EmailTemplateBuilder.DefaultText"), align: "left", color: "#475569", fontSize: "14px", fontFamily: EF } },
  button: { label: "Button", icon: "▶", category: t("EmailTemplateBuilder.CategoryBasic"), defaultProps: { text: t("EmailTemplateBuilder.DefaultButton"), url: "#", align: "center", bgColor: "#6366f1", textColor: "#ffffff", borderRadius: "6px", padding: "14px 36px", fontFamily: EF } },
  image: { label: "Image", icon: "🖼", category: t("EmailTemplateBuilder.CategoryBasic"), defaultProps: { src: "", alt: t("EmailTemplateBuilder.DefaultImageAlt"), width: "100%", align: "center" } },
  divider: { label: "Divider", icon: "—", category: t("EmailTemplateBuilder.CategoryBasic"), defaultProps: { color: "#e2e8f0", width: "100%", margin: "16px 0", style: "solid" } },
  spacer: { label: "Spacer", icon: "↕", category: t("EmailTemplateBuilder.CategoryBasic"), defaultProps: { height: "24px" } },
  columns: { label: "Columns", icon: "↔", category: t("EmailTemplateBuilder.CategoryLayout"), defaultProps: { columns: 2, gap: "16px", content: [t("EmailTemplateBuilder.DefaultLeftColumn"), t("EmailTemplateBuilder.DefaultRightColumn")], fontFamily: EF } },
  table: { label: "Table", icon: "⊞", category: t("EmailTemplateBuilder.CategoryAdvanced"), defaultProps: { headers: [t("EmailTemplateBuilder.DefaultHeader1"), t("EmailTemplateBuilder.DefaultHeader2"), t("EmailTemplateBuilder.DefaultHeader3")], rows: [[t("EmailTemplateBuilder.DefaultRowCell", { row: 1, col: 1 }), t("EmailTemplateBuilder.DefaultRowCell", { row: 1, col: 2 }), t("EmailTemplateBuilder.DefaultRowCell", { row: 1, col: 3 })], [t("EmailTemplateBuilder.DefaultRowCell", { row: 2, col: 1 }), t("EmailTemplateBuilder.DefaultRowCell", { row: 2, col: 2 }), t("EmailTemplateBuilder.DefaultRowCell", { row: 2, col: 3 })]], borderColor: "#e2e8f0", headerBg: "#f8fafc", fontSize: "13px", fontFamily: EF } },
  pricing: { label: "Pricing", icon: "$", category: t("EmailTemplateBuilder.CategoryAdvanced"), defaultProps: { planName: t("EmailTemplateBuilder.DefaultPlanName"), price: t("EmailTemplateBuilder.DefaultPrice"), currency: t("EmailTemplateBuilder.DefaultCurrency"), period: t("EmailTemplateBuilder.DefaultPeriod"), features: [t("EmailTemplateBuilder.DefaultFeature", { number: 1 }), t("EmailTemplateBuilder.DefaultFeature", { number: 2 }), t("EmailTemplateBuilder.DefaultFeature", { number: 3 }), t("EmailTemplateBuilder.DefaultFeature", { number: 4 })], buttonText: t("EmailTemplateBuilder.DefaultButtonText"), buttonUrl: "#", highlighted: false, accentColor: "#6366f1", bgColor: "#ffffff", borderColor: "#e2e8f0", fontFamily: EF } },
  callout: { label: "Callout Box", icon: "💬", category: t("EmailTemplateBuilder.CategoryAdvanced"), defaultProps: { content: t("EmailTemplateBuilder.DefaultCallout"), borderColor: "#6366f1", bgColor: "#eef2ff", icon: "ℹ️", fontFamily: EF } },
  rawhtml: { label: "Raw HTML", icon: "</>", category: t("EmailTemplateBuilder.CategoryAdvanced"), defaultProps: { content: `<div style="padding:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;">${t("EmailTemplateBuilder.DefaultRawHtml")}</div>` } },
  social: { label: t("EmailTemplateBuilder.Social"), icon: "📱", category: t("EmailTemplateBuilder.CategoryBasic"), defaultProps: { align: "center", facebook: "https://facebook.com", twitter: "https://twitter.com", instagram: "https://instagram.com", linkedin: "https://linkedin.com", bgColor: "#475569", textColor: "#ffffff" } },
  menu: { label: t("EmailTemplateBuilder.Menu"), icon: "☰", category: t("EmailTemplateBuilder.CategoryBasic"), defaultProps: { align: "center", color: "#6366f1", links: [{ text: t("EmailTemplateBuilder.DefaultMenuHome"), url: "#" }, { text: t("EmailTemplateBuilder.DefaultMenuAbout"), url: "#" }, { text: t("EmailTemplateBuilder.DefaultMenuServices"), url: "#" }, { text: t("EmailTemplateBuilder.DefaultMenuContact"), url: "#" }], fontFamily: EF } },
});

const YO_ATTR = "data-yo-c";
const YO_ID_ATTR = "data-yo-id";
const YO_TYPE_ATTR = "data-yo-type";
const YO_NAME_ATTR = "data-yo-name";
const YO_CONFIG_ATTR = "data-yo-config";

function yoWrap(inner: string, comp: BuilderComponent): string {
  const config = JSON.stringify(comp.props).replace(/"/g, "&quot;");
  return `<div ${YO_ATTR}="true" ${YO_ID_ATTR}="${comp.id}" ${YO_TYPE_ATTR}="${comp.type}" ${YO_NAME_ATTR}="${comp.name}" ${YO_CONFIG_ATTR}="${config}">${inner}</div>`;
}

function td(inner: string, extra = ""): string {
  return `<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td${extra ? ` ${extra}` : ""}>${inner}</td></tr></table>`;
}

function renderComponent(comp: BuilderComponent, t?: (key: string) => string): string {
  const p = comp.props;
  const ef = p.fontFamily || EF;
  let inner = "";
  switch (comp.type) {
    case "heading": {
      const tag = p.level || "h2";
      const fs: Record<string, string> = { h1: "26px", h2: "22px", h3: "18px", h4: "16px" };
      inner = td(
        `<${tag} style="margin:0; font-size:${fs[tag] || "22px"}; font-weight:600; color:${p.color || "#1e293b"}; ${ef}; text-align:${p.align || "left"};">${p.text || ""}</${tag}>`,
        `style="padding:0 0 12px 0;"`,
      );
      break;
    }
    case "text":
      inner = td(
        `<p style="margin:0; font-size:${p.fontSize || "14px"}; line-height:1.6; color:${p.color || "#475569"}; ${ef}; text-align:${p.align || "left"};">${p.content || ""}</p>`,
        `style="padding:0 0 12px 0;"`,
      );
      break;
    case "button": {
      const bg = p.bgColor || "#6366f1";
      const tc = p.textColor || "#ffffff";
      const br = p.borderRadius || "6px";
      const pd = p.padding || "14px 36px";
      const al = p.align || "center";
      inner = td(
        `<table border="0" cellspacing="0" cellpadding="0" align="${al}"><tr><td align="center" style="background:${bg}; border-radius:${br}; padding:${pd};" bgcolor="${bg}"><a href="${p.url || "#"}" target="_blank" style="display:inline-block; font-size:14px; font-weight:500; color:${tc}; ${ef}; text-decoration:none; line-height:1.2;">${p.text || (t ? t("EmailTemplateBuilder.DefaultButton") : "Click Here")}</a></td></tr></table>`,
        `style="padding:8px 0;"`,
      );
      break;
    }
    case "image":
      inner = td(
        `<img src="${p.src || ""}" alt="${p.alt || (t ? t("EmailTemplateBuilder.DefaultImageAlt") : "Image")}" border="0" style="display:block; max-width:100%; width:${p.width || "100%"}; height:auto;" />`,
        `align="${p.align || "center"}" style="padding:8px 0; font-size:0pt; line-height:0pt;"`,
      );
      break;
    case "divider":
      inner = td(
        `<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td style="border-bottom:${p.style === "dashed" ? "2px dashed" : p.style === "dotted" ? "2px dotted" : "1px solid"} ${p.color || "#e2e8f0"}; font-size:1px; line-height:1px;">&nbsp;</td></tr></table>`,
        `style="padding:${p.margin || "16px 0"};"`,
      );
      break;
    case "spacer":
      inner = `<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td height="${p.height || "24"}" style="height:${p.height || "24px"}; font-size:1px; line-height:1px;">&nbsp;</td></tr></table>`;
      break;
    case "columns": {
      const count = p.columns || 2;
      const gap = parseInt(p.gap) || 16;
      const halfGap = Math.floor(gap / 2);
      const colW = Math.floor(100 / count);
      const contents: string[] = p.content || [];
      inner = `<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr>`;
      for (let i = 0; i < count; i++) {
        const pad = i === 0 ? `0 ${halfGap}px 0 0` : i === count - 1 ? `0 0 0 ${halfGap}px` : `0 ${halfGap}px`;
        inner += `<td width="${colW}%" valign="top" style="vertical-align:top; padding:${pad}; font-size:14px; color:#475569; ${ef}; line-height:1.5;">${contents[i] || ""}</td>`;
      }
      inner += `</tr></table>`;
      break;
    }
    case "table": {
      const bColor = p.borderColor || "#e2e8f0";
      const hBg = p.headerBg || "#f8fafc";
      const fSize = p.fontSize || "13px";
      const headers: string[] = p.headers || [];
      const rows: string[][] = p.rows || [];
      inner = td(
        `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">` +
        (headers.length > 0
          ? `<tr>${headers.map((h) => `<td style="padding:10px 12px; background:${hBg}; border:1px solid ${bColor}; font-weight:600; font-size:${fSize}; ${ef}; color:#1e293b;">${h}</td>`).join("")}</tr>`
          : ``) +
        rows.map((row) => `<tr>${row.map((cell) => `<td style="padding:10px 12px; border:1px solid ${bColor}; font-size:${fSize}; ${ef}; color:#475569;">${cell}</td>`).join("")}</tr>`).join("") +
        `</table>`,
        `style="padding:0;"`,
      );
      break;
    }
    case "pricing": {
      const accent = p.accentColor || "#6366f1";
      const bg = p.bgColor || "#ffffff";
      const border = p.borderColor || "#e2e8f0";
      const bw = p.highlighted ? "2px" : "1px";
      const bc = p.highlighted ? accent : border;
      const features: string[] = p.features || [];
      const planName = p.planName || (t ? t("EmailTemplateBuilder.DefaultPlanName") : "Plan");
      const price = p.price || "0";
      const currency = p.currency || "$";
      const period = p.period || "";
      const btnText = p.buttonText || (t ? t("EmailTemplateBuilder.DefaultButtonText") : "Choose Plan");
      const btnUrl = p.buttonUrl || "#";
      inner = td(
        `<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:28px 24px; background:${bg}; border:${bw} solid ${bc}; border-radius:12px;">` +
        `<p style="margin:0 0 4px; font-size:18px; font-weight:600; color:#1e293b; ${ef}; text-align:center;">${planName}</p>` +
        `<p style="margin:0 0 4px; font-size:36px; font-weight:700; color:${accent}; ${ef}; text-align:center; line-height:1.2;">${currency}${price}<span style="font-size:14px; font-weight:400; color:#64748b;">${period}</span></p>` +
        (features.length > 0
          ? `<table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:16px 0;">${features.map((f) => `<tr><td style="padding:7px 8px; font-size:13px; color:#475569; ${ef}; border-bottom:1px solid #f1f5f9; text-align:center;">${f}</td></tr>`).join("")}</table>`
          : ``) +
        `<table border="0" cellspacing="0" cellpadding="0" align="center"><tr><td align="center" style="background:${accent}; border-radius:6px; padding:12px 32px;" bgcolor="${accent}"><a href="${btnUrl}" target="_blank" style="display:inline-block; font-size:14px; font-weight:500; color:#ffffff; ${ef}; text-decoration:none;">${btnText}</a></td></tr></table>` +
        `</td></tr></table>`,
        `style="padding:0;"`,
      );
      break;
    }
    case "callout": {
      const bColor = p.borderColor || "#6366f1";
      const bg = p.bgColor || "#eef2ff";
      inner = td(
        `<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td style="padding:16px 20px; background:${bg}; border-left:4px solid ${bColor}; border-radius:8px;">` +
        `<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr>` +
        `<td width="32" valign="top" style="width:32px; font-size:20px; padding:0 12px 0 0; vertical-align:top;">${p.icon || "ℹ️"}</td>` +
        `<td style="font-size:14px; color:#475569; ${ef}; line-height:1.6;">${p.content || ""}</td>` +
        `</tr></table></td></tr></table>`,
        `style="padding:0;"`,
      );
      break;
    }
    case "rawhtml":
      inner = p.content || "";
      break;
    case "social": {
      const al = p.align || "center";
      const bg = p.bgColor || "#475569";
      const tc = p.textColor || "#ffffff";
      const socialNames: Record<string, string> = {
        facebook: t ? t("EmailTemplateBuilder.SocialFacebook") : "Facebook",
        twitter: t ? t("EmailTemplateBuilder.SocialTwitter") : "Twitter",
        instagram: t ? t("EmailTemplateBuilder.SocialInstagram") : "Instagram",
        linkedin: t ? t("EmailTemplateBuilder.SocialLinkedIn") : "LinkedIn",
      };
      const items = [
        { name: socialNames.facebook, url: p.facebook },
        { name: socialNames.twitter, url: p.twitter },
        { name: socialNames.instagram, url: p.instagram },
        { name: socialNames.linkedin, url: p.linkedin }
      ].filter(i => i.url);
      inner = td(
        `<table border="0" cellspacing="0" cellpadding="0" align="${al}"><tr>` +
        items.map(item => 
          `<td style="padding:0 8px;"><a href="${item.url}" target="_blank" style="display:inline-block; font-size:12px; font-weight:500; color:${tc}; background:${bg}; padding:6px 12px; border-radius:4px; text-decoration:none; ${ef}">${item.name}</a></td>`
        ).join("") +
        `</tr></table>`,
        `style="padding:10px 0;"`
      );
      break;
    }
    case "menu": {
      const al = p.align || "center";
      const color = p.color || "#6366f1";
      const links: { text: string; url: string }[] = p.links || [];
      inner = td(
        `<table border="0" cellspacing="0" cellpadding="0" align="${al}"><tr>` +
        links.map((link, idx) => 
          `<td style="padding:0 12px; font-size:13px; font-weight:500; ${ef};">` +
          `<a href="${link.url}" target="_blank" style="color:${color}; text-decoration:none;">${link.text}</a>` +
          `</td>` +
          (idx < links.length - 1 ? `<td style="color:#cbd5e1; font-size:13px;">|</td>` : "")
        ).join("") +
        `</tr></table>`,
        `style="padding:12px 0; border-top:1px solid #f1f5f9; border-bottom:1px solid #f1f5f9;"`
      );
      break;
    }
  }
  return yoWrap(inner, comp);
}

function generateHtml(components: BuilderComponent[], t?: (key: string) => string): string {
  return components.map((c) => renderComponent(c, t)).join("\n");
}

function stripYoWrappers(html: string): string {
  if (!html || !html.includes(YO_ATTR)) return html;
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  const yoElements = wrapper.querySelectorAll(`[${YO_ATTR}="true"]`);
  yoElements.forEach((el) => {
    if (el instanceof HTMLElement) {
      el.replaceWith(...Array.from(el.childNodes));
    }
  });
  return wrapper.innerHTML;
}

function combineTemplate(header: string, body: string, footer: string, t?: (key: string) => string): string {
  const h = header || "";
  const b = body || "";
  const f = footer || "";
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#eef4fb;font-family:'PT Sans',Arial,Helvetica,sans-serif;">
<center><table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#eef4fb" style="margin:0;padding:0;width:100%;height:100%;"><tr><td align="center" valign="top">
<table width="600" border="0" cellspacing="0" cellpadding="0" style="width:600px;"><tr><td style="font-size:0pt;line-height:0pt;padding:0;margin:0;">
<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td style="padding:0 10px;">
<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td style="font-size:12px;line-height:16px;font-family:'PT Sans',Arial,sans-serif;color:#6f7b8a;text-align:right;padding-top:20px;padding-bottom:20px;">
<a href="{{WebVersionUrl}}" target="_blank" style="text-decoration:none;color:#6f7b8a;">${t ? t("EmailTemplateBuilder.ViewInBrowser") : "View this email in your browser"}</a>
</td></tr></table>
<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td bgcolor="#008cff" style="border-radius:10px 10px 0 0;padding-top:10px;">
<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td bgcolor="#ffffff" style="border-radius:10px 10px 0 0;">
<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td style="padding:0;">${h}${b}${f}</td></tr></table>
</td></tr></table>
</td></tr></table>
</td></tr></table>
</td></tr></table>
</td></tr></table></center>
</body>
</html>`;
}

function parseComponents(html: string): BuilderComponent[] {
  if (!html || html.trim().length === 0) return [];
  const result: BuilderComponent[] = [];
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  const yoElements = wrapper.querySelectorAll(`[${YO_ATTR}="true"]`);
  if (yoElements.length > 0) {
    yoElements.forEach((el) => {
      if (!(el instanceof HTMLElement)) return;
      const id = el.getAttribute(YO_ID_ATTR) || `comp_${Date.now()}`;
      const type = el.getAttribute(YO_TYPE_ATTR) as BuilderComponentType;
      const name = el.getAttribute(YO_NAME_ATTR) || type;
      const configStr = el.getAttribute(YO_CONFIG_ATTR) || "{}";
      try {
        const props = JSON.parse(configStr.replace(/&quot;/g, '"'));
        result.push({ id, type, name, props });
      } catch {
        const fallback = heuristicParse(el, result.length);
        if (fallback) result.push(fallback);
      }
    });
    return result;
  }
  const children = Array.from(wrapper.children);
  if (children.length === 1 && children[0] instanceof HTMLElement) {
    const nested = children[0].querySelectorAll(`[${YO_ATTR}="true"]`);
    if (nested.length > 0) {
      nested.forEach((el) => {
        if (!(el instanceof HTMLElement)) return;
        const id = el.getAttribute(YO_ID_ATTR) || `comp_${Date.now()}`;
        const type = el.getAttribute(YO_TYPE_ATTR) as BuilderComponentType;
        const name = el.getAttribute(YO_NAME_ATTR) || type;
        const configStr = el.getAttribute(YO_CONFIG_ATTR) || "{}";
        try {
          const props = JSON.parse(configStr.replace(/&quot;/g, '"'));
          result.push({ id, type, name, props });
        } catch {
          const fallback = heuristicParse(el, result.length);
          if (fallback) result.push(fallback);
        }
      });
      return result;
    }
  }
  children.forEach((el, i) => {
    if (el instanceof HTMLElement && el.getAttribute(YO_ATTR) === "true") {
      return;
    }
    const fallback = heuristicParse(el, i);
    if (fallback) result.push(fallback);
  });
  return result;
}

function walkTd(el: Element): Element | null {
  if (el.children.length === 1 && el.children[0]?.tagName === "TABLE") {
    const innerTable = el.children[0] as HTMLElement;
    const firstRow = innerTable.querySelector("tr");
    if (firstRow) {
      const firstTd = firstRow.querySelector("td");
      if (firstTd && firstTd.children.length > 0) {
        return walkTd(firstTd);
      }
      if (firstTd && firstTd.innerHTML.trim().length > 0) return firstTd;
    }
  }
  return el;
}

function assignHeading(el: Element, idx: number): BuilderComponent | null {
  const h = el.querySelector("h1, h2, h3, h4");
  if (h && h instanceof HTMLElement) {
    return { id: `comp_fb_h_${idx}`, type: "heading", name: "Heading", props: { level: h.tagName.toLowerCase(), text: h.textContent || "", align: h.style.textAlign || "left", color: h.style.color || "#1e293b", fontFamily: h.style.fontFamily || EF } };
  }
  return null;
}

function assignText(el: Element, idx: number): BuilderComponent | null {
  const p = el.querySelector("p");
  if (p && p instanceof HTMLElement && !el.querySelector("h1, h2, h3, h4, img, a[href]")) {
    return { id: `comp_fb_t_${idx}`, type: "text", name: "Text", props: { content: p.innerHTML || "", align: p.style.textAlign || "left", color: p.style.color || "#475569", fontSize: p.style.fontSize || "14px", fontFamily: p.style.fontFamily || EF } };
  }
  return null;
}

function assignImg(el: Element, idx: number): BuilderComponent | null {
  const img = el.querySelector("img");
  if (img) {
    return { id: `comp_fb_i_${idx}`, type: "image", name: "Image", props: { src: img.getAttribute("src") || "", alt: img.getAttribute("alt") || "Image", width: img.style.width || "100%", align: (el.closest("td")?.getAttribute("align")) || "center" } };
  }
  return null;
}

function assignBtn(el: Element, idx: number): BuilderComponent | null {
  const a = el.querySelector("a[href]");
  if (a && a instanceof HTMLElement) {
    const outerHtml = el.innerHTML.toLowerCase();
    const bgMatch = outerHtml.match(/background:([^;]+);/);
    const colorMatch = outerHtml.match(/color:\s*([^;]+);/);
    return { id: `comp_fb_b_${idx}`, type: "button", name: "Button", props: { text: a.textContent || "Button", url: a.getAttribute("href") || "#", align: (el.closest("td")?.getAttribute("align")) || "center", bgColor: bgMatch?.[1]?.trim() || "#6366f1", textColor: colorMatch?.[1]?.trim() || "#ffffff", borderRadius: "6px", padding: "14px 36px", fontFamily: EF } };
  }
  return null;
}

function assignPricing(el: Element, idx: number): BuilderComponent | null {
  const innerHtml = el.innerHTML.toLowerCase();
  if ((innerHtml.includes("font-size:36px") && innerHtml.includes("font-weight:700")) || innerHtml.includes("choose plan")) {
    const a = el.querySelector("a");
    const allText = el.textContent || "";
    const priceMatch = allText.match(/([\d,.]+)/);
    const features = Array.from(el.querySelectorAll("tr td")).filter((td) => {
      const t = td.textContent?.trim() || "";
      return t.length > 0 && !t.startsWith("$") && !t.includes("Plan") && td !== el.querySelector("a")?.closest("td") && !td.querySelector("a");
    }).map((td) => td.textContent || "").filter(Boolean);
    const accentMatch = innerHtml.match(/background:([^;]+?);/);
    return { id: `comp_fb_p_${idx}`, type: "pricing", name: "Pricing", props: { planName: allText.split("\n")[0]?.trim() || "Plan", price: priceMatch?.[1] || "29", currency: "$", period: "/month", features, buttonText: a?.textContent || "Choose Plan", buttonUrl: a?.getAttribute("href") || "#", highlighted: innerHtml.includes("border:2px"), accentColor: accentMatch?.[1]?.trim() || "#6366f1", bgColor: "#ffffff", borderColor: "#e2e8f0" } };
  }
  return null;
}

function assignCallout(el: Element, idx: number): BuilderComponent | null {
  const innerHtml = el.innerHTML.toLowerCase();
  if (innerHtml.includes("border-left:")) {
    const tds = el.querySelectorAll("td");
    const lastTd = tds[tds.length - 1];
    const iconTd = el.querySelector("td:first-child");
    const bgMatch = innerHtml.match(/background:([^;]+);/);
    const borderMatch = innerHtml.match(/border-left:\s*\d+px\s+solid\s+([^;]+);/);
    return { id: `comp_fb_c_${idx}`, type: "callout", name: "Callout Box", props: { content: lastTd?.innerHTML || "", borderColor: borderMatch?.[1]?.trim() || "#6366f1", bgColor: bgMatch?.[1]?.trim() || "#eef2ff", icon: iconTd?.textContent?.trim() || "ℹ️" } };
  }
  return null;
}

function assignTable(el: Element, idx: number): BuilderComponent | null {
  const innerHtml = el.innerHTML.toLowerCase();
  if (innerHtml.includes("border:1px") && innerHtml.includes("font-weight:600") && !innerHtml.includes("choose plan") && !innerHtml.includes("font-size:36px")) {
    const headerTds = el.querySelectorAll("tr:first-child td");
    const headers = Array.from(headerTds).map((td) => td.textContent || "");
    const rows: string[][] = [];
    const allRows = el.querySelectorAll("tr");
    for (let ri = 1; ri < allRows.length; ri++) {
      const cells = allRows[ri].querySelectorAll("td");
      rows.push(Array.from(cells).map((td) => td.textContent || ""));
    }
    const outerHtml = el.outerHTML;
    const bColor = extractCss(outerHtml, "border-color") || "#e2e8f0";
    const hBg = extractCss(outerHtml, "background") || "#f8fafc";
    return { id: `comp_fb_tbl_${idx}`, type: "table", name: "Table", props: { headers, rows, borderColor: bColor, headerBg: hBg, fontSize: "13px" } };
  }
  return null;
}

function assignColumns(el: Element, idx: number): BuilderComponent | null {
  const tds = el.querySelectorAll("td");
  const count = tds.length;
  if (count >= 2 && count <= 4) {
    const allAreSimple = Array.from(tds).every((td) => !td.querySelector("img, table, a[href]"));
    if (allAreSimple) {
      const content = Array.from(tds).map((td) => td.innerHTML || "");
      return { id: `comp_fb_col_${idx}`, type: "columns", name: "Columns", props: { columns: count, gap: "16px", content } };
    }
  }
  return null;
}

function heuristicParse(el: Element, idx: number): BuilderComponent | null {
  const tag = el.tagName.toLowerCase();
  if (el instanceof HTMLTableElement) {
    const innerTd = walkTd(el);
    if (innerTd && innerTd !== el) {
      return heuristicParse(innerTd, idx);
    }
    const html = el.innerHTML.toLowerCase();
    if (html.includes("<hr")) {
      return { id: `comp_fb_d_${idx}`, type: "divider", name: "Divider", props: { color: extractCss(html, "border-bottom-color") || "#e2e8f0", width: "100%", margin: "16px 0", style: "solid" } };
    }
    if (html.includes("&nbsp;") && html.includes("height:")) {
      return { id: `comp_fb_s_${idx}`, type: "spacer", name: "Spacer", props: { height: (el.querySelector("td")?.getAttribute("height")) || "24" } };
    }
    const candidates = [assignPricing, assignCallout, assignTable, assignColumns, assignBtn, assignImg, assignHeading, assignText];
    for (const fn of candidates) {
      const result = fn(el, idx);
      if (result) return result;
    }
  }
  if (el instanceof HTMLHeadingElement) {
    return { id: `comp_fb_h_${idx}`, type: "heading", name: "Heading", props: { level: el.tagName.toLowerCase(), text: el.textContent || "", align: (el as HTMLElement).style.textAlign || "left", color: (el as HTMLElement).style.color || "#1e293b", fontFamily: (el as HTMLElement).style.fontFamily || EF } };
  }
  if (el instanceof HTMLParagraphElement) {
    return { id: `comp_fb_t_${idx}`, type: "text", name: "Text", props: { content: el.innerHTML || "", align: (el as HTMLElement).style.textAlign || "left", color: (el as HTMLElement).style.color || "#475569", fontSize: (el as HTMLElement).style.fontSize || "14px", fontFamily: (el as HTMLElement).style.fontFamily || EF } };
  }
  if (tag === "hr") {
    return { id: `comp_fb_d_${idx}`, type: "divider", name: "Divider", props: { color: (el as HTMLElement).style.borderColor || "#e2e8f0", width: "100%", margin: "16px 0", style: "solid" } };
  }
  return null;
}

function extractCss(html: string, prop: string): string | null {
  const match = html.match(new RegExp(`${prop.replace(/-/g, "\\-")}\\s*:\\s*([^;"]+)`));
  return match ? match[1].trim() : null;
}

const RawHtmlEditor = ({ content, onBlur }: { content: string; onBlur: (val: string) => void }) => {
  const { t } = useTranslation();
  const elRef = useRef<HTMLTextAreaElement>(null);
  const onBlurRef = useRef(onBlur);
  onBlurRef.current = onBlur;

  const handleBlur = useCallback(() => {
    if (elRef.current) {
      onBlurRef.current(elRef.current.value);
    }
  }, []);

  return (
    <textarea
      ref={elRef}
      defaultValue={content}
      onBlur={handleBlur}
      rows={6}
      className="w-full rounded border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs font-mono leading-relaxed outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 resize-y dark:bg-gray-800 dark:text-gray-300"
      placeholder={t("EmailTemplateBuilder.RawHTML")}
    />
  );
};

const TextareaCell = memo(({ defaultValue, onBlur, className, placeholder, rows, autoFocus, compId, propKey, ci }: { defaultValue: string; onBlur: (e: React.FocusEvent<HTMLTextAreaElement>) => void; className?: string; placeholder?: string; rows?: number; autoFocus?: boolean; compId: string; propKey: string; ci?: number }) => {
  return <textarea defaultValue={defaultValue} onBlur={onBlur} className={className} placeholder={placeholder} rows={rows} autoFocus={autoFocus} data-comp-id={compId} data-prop-key={propKey} data-ci={ci} />;
}, (prev, next) => prev.defaultValue === next.defaultValue && prev.className === next.className && prev.placeholder === next.placeholder && prev.rows === next.rows && prev.autoFocus === next.autoFocus);

const InputCell = memo(({ defaultValue, onBlur, className, placeholder, onKeyDown, autoFocus, compId, propKey, ci }: { defaultValue: string; onBlur: (e: React.FocusEvent<HTMLInputElement>) => void; className?: string; placeholder?: string; onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void; autoFocus?: boolean; compId: string; propKey: string; ci?: number }) => {
  return <input defaultValue={defaultValue} onBlur={onBlur} className={className} placeholder={placeholder} onKeyDown={onKeyDown} autoFocus={autoFocus} data-comp-id={compId} data-prop-key={propKey} data-ci={ci} />;
}, (prev, next) => prev.defaultValue === next.defaultValue && prev.className === next.className && prev.placeholder === next.placeholder && prev.autoFocus === next.autoFocus);

interface Props {
  value: string;
  onChange: (html: string) => void;
}

const EmailTemplateBuilder = ({ value, onChange }: Props) => {
  const { t } = useTranslation();
  const compDefs = getComponentDefs(t);
  const componentsRef = useRef<BuilderComponent[]>(parseComponents(value));
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const dragSourceIdx = useRef<number | null>(null);
  const lastValueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (value !== lastValueRef.current) {
      lastValueRef.current = value;
      const parsed = parseComponents(value);
      if (parsed.length > 0 || !value.trim()) {
        componentsRef.current = parsed;
        forceUpdate();
      }
    }
  }, [value]);

  const save = useCallback((comps: BuilderComponent[]) => {
    componentsRef.current = comps;
    lastValueRef.current = generateHtml(comps, t);
    onChangeRef.current(lastValueRef.current);
    forceUpdate();
  }, [t]);

  const addComponent = useCallback((type: BuilderComponentType) => {
    const def = compDefs[type];
    if (!def) return;
    const newComp: BuilderComponent = {
      id: `comp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      name: def.label,
      props: { ...def.defaultProps },
    };
    save([...componentsRef.current, newComp]);
  }, [save, compDefs]);

  const removeComponent = useCallback((id: string) => {
    save(componentsRef.current.filter((c) => c.id !== id));
  }, [save]);

  const moveUp = useCallback((idx: number) => {
    if (idx <= 0) return;
    const updated = [...componentsRef.current];
    [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
    save(updated);
  }, [save]);

  const moveDown = useCallback((idx: number) => {
    if (idx >= componentsRef.current.length - 1) return;
    const updated = [...componentsRef.current];
    [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
    save(updated);
  }, [save]);

  const duplicate = useCallback((comp: BuilderComponent) => {
    const copy: BuilderComponent = { ...comp, id: `comp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` };
    const idx = componentsRef.current.findIndex((c) => c.id === comp.id);
    const updated = [...componentsRef.current];
    updated.splice(idx + 1, 0, copy);
    save(updated);
  }, [save]);

  const updateProp = useCallback((id: string, key: string, val: any) => {
    save(componentsRef.current.map((c) => (c.id === id ? { ...c, props: { ...c.props, [key]: val } } : c)));
  }, [save]);

  const updateProps = useCallback((id: string, updates: Record<string, any>) => {
    save(componentsRef.current.map((c) => (c.id === id ? { ...c, props: { ...c.props, ...updates } } : c)));
  }, [save]);

  const handleAnyBlur = useCallback((e: React.FocusEvent<HTMLElement>) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const compId = target.dataset.compId;
    const key = target.dataset.propKey;
    const ci = target.dataset.ci;
    const val = target.value;

    if (!compId || !key) return;

    if (ci !== undefined) {
      const index = parseInt(ci);
      const currentComps = componentsRef.current;
      const comp = currentComps.find(c => c.id === compId);
      if (comp) {
        const currentArray = [...(comp.props[key] || [])];
        currentArray[index] = val;
        updateProp(compId, key, currentArray);
      }
    } else {
      updateProp(compId, key, val);
    }
  }, [updateProp]);

  const components = componentsRef.current;

  const handleDragStart = (idx: number) => {
    dragSourceIdx.current = idx;
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIdx(idx);
  };

  const handleDrop = (targetIdx: number) => {
    const from = dragSourceIdx.current;
    if (from !== null && from !== targetIdx) {
      const updated = [...componentsRef.current];
      const [moved] = updated.splice(from, 1);
      updated.splice(targetIdx, 0, moved);
      save(updated);
    }
    dragSourceIdx.current = null;
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    dragSourceIdx.current = null;
    setDragOverIdx(null);
  };

  const compLabel = (type: BuilderComponentType) => {
    const keyMap: Record<BuilderComponentType, string> = {
      heading: "EmailTemplateBuilder.Heading",
      text: "EmailTemplateBuilder.Text",
      button: "EmailTemplateBuilder.Button",
      image: "EmailTemplateBuilder.Image",
      divider: "EmailTemplateBuilder.Divider",
      spacer: "EmailTemplateBuilder.Spacer",
      columns: "EmailTemplateBuilder.Columns",
      table: "EmailTemplateBuilder.Table",
      pricing: "EmailTemplateBuilder.Pricing",
      callout: "EmailTemplateBuilder.Callout",
      rawhtml: "EmailTemplateBuilder.RawHTML",
      social: "EmailTemplateBuilder.Social",
      menu: "EmailTemplateBuilder.Menu",
    };
    return t(keyMap[type]);
  };
  const categories = Array.from(new Set(Object.values(compDefs).map((d) => d.category)));
  const selectedComp = components.find((c) => c.id === selectedId);

  return (
    <div className="flex gap-4 h-[calc(100vh-240px)] min-h-[580px] overflow-hidden">
      {/* 1. LEFT COLUMN: Component Palette */}
      <div className="w-56 shrink-0 flex flex-col gap-3 h-full overflow-y-auto pr-1">
        {categories.map((cat) => (
          <div key={cat} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 shadow-xs">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{t("EmailTemplateBuilder.Components")}</div>
            <div className="space-y-0.5">
              {Object.entries(compDefs)
                .filter(([, def]) => def.category === cat)
                .map(([type, def]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addComponent(type as BuilderComponentType)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-700 dark:hover:text-brand-400 transition-colors cursor-pointer"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-50 dark:bg-gray-800 text-[11px] font-bold text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700 shrink-0">
                      {def.icon}
                    </span>
                    <span className="truncate font-medium">{compLabel(type as BuilderComponentType)}</span>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* 2. CENTER COLUMN: Live WYSIWYG Canvas */}
      <div className="flex-1 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 overflow-y-auto flex justify-center">
        <div className="w-full max-w-[600px] h-fit space-y-2 pb-12">
          {components.length === 0 ? (
            <div className="flex min-h-[350px] items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
              <div className="text-center">
                <MdAdd size={36} className="mx-auto text-gray-300 dark:text-gray-500" />
                <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">{t("EmailTemplateBuilder.AddComponent")}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {components.map((comp, idx) => {
                const isSelected = selectedId === comp.id;
                return (
                  <div
                    key={comp.id}
                    onClick={() => setSelectedId(comp.id)}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={() => handleDrop(idx)}
                    onDragEnd={handleDragEnd}
                    className={`group relative rounded-xl border bg-white dark:bg-gray-900 transition-all overflow-hidden cursor-pointer ${
                      dragOverIdx === idx
                        ? "border-brand-500 shadow-lg ring-4 ring-brand-100 -translate-y-1"
                        : isSelected
                        ? "border-brand-500 shadow-md ring-2 ring-brand-50"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-xs"
                    }`}
                  >
                    {/* Hover controls / selection indicator */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 border-b text-[10px] ${isSelected ? "bg-brand-50/60 dark:bg-brand-500/10 border-brand-100 dark:border-brand-800" : "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700"}`}>
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-white dark:bg-gray-800 text-[10px] font-bold text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 cursor-grab active:cursor-grabbing">
                        <MdDragHandle size={12} />
                      </span>
                      <span className={`font-semibold uppercase tracking-wider ${isSelected ? "text-brand-700 dark:text-brand-400" : "text-gray-500 dark:text-gray-400"}`}>{compLabel(comp.type)}</span>
                      
                      <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" onClick={(e) => { e.stopPropagation(); moveUp(idx); }} disabled={idx === 0} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-20 rounded cursor-pointer" title={t("EmailTemplateBuilder.MoveUp")}>
                          <MdArrowUpward size={12} />
                        </button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); moveDown(idx); }} disabled={idx === components.length - 1} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-20 rounded cursor-pointer" title={t("EmailTemplateBuilder.MoveDown")}>
                          <MdArrowDownward size={12} />
                        </button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); duplicate(comp); }} className="p-1 text-gray-400 hover:text-blue-500 rounded cursor-pointer" title={t("EmailTemplateBuilder.Duplicate")}>
                          <MdContentCopy size={12} />
                        </button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); removeComponent(comp.id); if (isSelected) setSelectedId(null); }} className="p-1 text-gray-400 hover:text-red-500 rounded cursor-pointer" title={t("EmailTemplateBuilder.Delete")}>
                          <MdDelete size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Canvas Preview Area (No editors/controls here!) */}
                    <div className="p-4 bg-white dark:bg-gray-900">
                      {comp.type === "heading" && (
                        <div style={{ textAlign: comp.props.align }}>
                          <span style={{ 
                            fontSize: comp.props.level === "h1" ? "24px" : comp.props.level === "h2" ? "20px" : comp.props.level === "h3" ? "17px" : "15px", 
                            fontWeight: 600, 
                            color: comp.props.color, 
                            fontFamily: comp.props.fontFamily 
                          }}>
                            {comp.props.text || t("EmailTemplateBuilder.HeadingFallback")}
                          </span>
                        </div>
                      )}

                      {comp.type === "text" && (
                        <div style={{ 
                          fontSize: comp.props.fontSize || "14px", 
                          color: comp.props.color, 
                          textAlign: comp.props.align, 
                          lineHeight: 1.6, 
                          fontFamily: comp.props.fontFamily 
                        }} dangerouslySetInnerHTML={{ __html: comp.props.content || t("EmailTemplateBuilder.TextFallback") }} />
                      )}

                      {comp.type === "button" && (
                        <div className="flex" style={{ justifyContent: comp.props.align === "left" ? "flex-start" : comp.props.align === "right" ? "flex-end" : "center" }}>
                          <span className="px-5 py-2 text-xs font-semibold inline-block rounded" style={{ background: comp.props.bgColor, borderRadius: comp.props.borderRadius, color: comp.props.textColor, fontFamily: comp.props.fontFamily }}>
                            {comp.props.text || t("EmailTemplateBuilder.ButtonFallback")}
                          </span>
                        </div>
                      )}

                      {comp.type === "image" && (
                        <div className="flex" style={{ justifyContent: comp.props.align === "left" ? "flex-start" : comp.props.align === "right" ? "flex-end" : "center" }}>
                          {comp.props.src ? (
                            <img src={comp.props.src} alt={comp.props.alt} className="max-h-36 rounded object-contain border border-gray-100" style={{ width: comp.props.width || "100%" }} />
                          ) : (
                            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl p-6 w-full text-center text-xs text-gray-400 dark:text-gray-500 font-medium">
                              {t("EmailTemplateBuilder.ImageFallback")}
                            </div>
                          )}
                        </div>
                      )}

                      {comp.type === "divider" && (
                        <hr style={{ borderColor: comp.props.color, borderStyle: comp.props.style || "solid" }} />
                      )}

                      {comp.type === "spacer" && (
                        <div className="border border-dashed border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-center text-[10px] text-gray-300 dark:text-gray-500 font-mono rounded" style={{ height: comp.props.height || "24px" }}>
                          {t("EmailTemplateBuilder.SpacerLabel")} ({comp.props.height})
                        </div>
                      )}

                      {comp.type === "columns" && (
                        <div className="flex gap-4" style={{ fontFamily: comp.props.fontFamily }}>
                          {Array.from({ length: comp.props.columns || 2 }, (_, ci) => (
                            <div key={ci} className="flex-1 bg-gray-50/40 dark:bg-gray-800/40 rounded-lg p-2.5 text-xs border border-dashed border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 min-h-[45px] whitespace-pre-wrap">
                              {(comp.props.content || [])[ci] || t("EmailTemplateBuilder.ColumnFallback", { number: ci + 1 })}
                            </div>
                          ))}
                        </div>
                      )}

                      {comp.type === "table" && (
                        <table className="w-full text-xs border-collapse rounded overflow-hidden" style={{ border: `1px solid ${comp.props.borderColor || "#e2e8f0"}`, fontFamily: comp.props.fontFamily }}>
                          {(comp.props.headers || []).length > 0 && (
                            <thead>
                              <tr>
                                {(comp.props.headers || []).map((h: string, ci: number) => (
                                  <th key={ci} className="p-2 text-left font-semibold border-b" style={{ background: comp.props.headerBg || "#f8fafc", borderColor: comp.props.borderColor || "#e2e8f0" }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                          )}
                          <tbody>
                            {(comp.props.rows || []).map((row: string[], ri: number) => (
                              <tr key={ri}>
                                {row.map((cell, ci) => (
                                  <td key={ci} className="p-2 border-b" style={{ borderColor: comp.props.borderColor || "#e2e8f0" }}>{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      {comp.type === "pricing" && (
                        <div className="p-4 rounded-xl border bg-white dark:bg-gray-900 text-center shadow-xs max-w-xs mx-auto" style={{ borderColor: comp.props.highlighted ? comp.props.accentColor : comp.props.borderColor, borderWidth: comp.props.highlighted ? "2px" : "1px", fontFamily: comp.props.fontFamily }}>
                          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">{comp.props.planName}</h4>
                          <div className="my-2 text-3xl font-extrabold" style={{ color: comp.props.accentColor }}>
                            {comp.props.currency}{comp.props.price}<span className="text-xs font-normal text-gray-400">{comp.props.period}</span>
                          </div>
                          {(comp.props.features || []).length > 0 && (
                            <ul className="text-[11px] text-gray-500 dark:text-gray-400 space-y-1 mb-4">
                              {(comp.props.features || []).map((f: string, fi: number) => <li key={fi} className="border-t border-gray-50 dark:border-gray-700 pt-1">{f}</li>)}
                            </ul>
                          )}
                          <span className="px-4 py-1.5 text-xs font-semibold rounded inline-block text-white" style={{ background: comp.props.accentColor }}>{comp.props.buttonText}</span>
                        </div>
                      )}

                      {comp.type === "callout" && (
                        <div className="flex gap-2.5 p-3 rounded-xl border-l-4" style={{ background: comp.props.bgColor, borderLeftColor: comp.props.borderColor, fontFamily: comp.props.fontFamily }}>
                          <span className="text-lg leading-none">{comp.props.icon || "ℹ️"}</span>
                          <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: comp.props.content || t("EmailTemplateBuilder.CalloutFallback") }} />
                        </div>
                      )}

                      {comp.type === "rawhtml" && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-2.5 rounded-lg text-[10px] font-mono border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 overflow-hidden max-h-16" dangerouslySetInnerHTML={{ __html: comp.props.content || t("EmailTemplateBuilder.RawHtmlFallback") }} />
                      )}

                      {comp.type === "social" && (
                        <div className="flex gap-2" style={{ justifyContent: comp.props.align === "left" ? "flex-start" : comp.props.align === "right" ? "flex-end" : "center" }}>
                          {[
                            { name: t("EmailTemplateBuilder.SocialFacebook"), url: comp.props.facebook },
                            { name: t("EmailTemplateBuilder.SocialTwitter"), url: comp.props.twitter },
                            { name: t("EmailTemplateBuilder.SocialInstagram"), url: comp.props.instagram },
                            { name: t("EmailTemplateBuilder.SocialLinkedIn"), url: comp.props.linkedin }
                          ].filter(i => i.url).map((item, idx) => (
                            <span key={idx} className="px-3 py-1 text-[10px] font-bold rounded inline-block text-white" style={{ background: comp.props.bgColor || "#475569", color: comp.props.textColor || "#ffffff" }}>
                              {item.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {comp.type === "menu" && (
                        <div className="flex items-center gap-3 py-1.5 border-y border-gray-100" style={{ justifyContent: comp.props.align === "left" ? "flex-start" : comp.props.align === "right" ? "flex-end" : "center", fontFamily: comp.props.fontFamily }}>
                          {(comp.props.links || []).map((link: any, idx: number) => (
                            <span key={idx} className="text-xs font-semibold" style={{ color: comp.props.color }}>
                              {link.text}
                              {idx < (comp.props.links || []).length - 1 && <span className="ml-3 text-gray-300 font-normal">|</span>}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. RIGHT COLUMN: Component Properties Panel */}
      <div className="w-80 shrink-0 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 h-full overflow-y-auto flex flex-col shadow-xs">
        {selectedComp ? (
          <div className="space-y-4">
            <div className="border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">{compLabel(selectedComp.type)} {t("EmailTemplateBuilder.Settings")}</h3>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">{selectedComp.type}</p>
              </div>
              <button onClick={() => setSelectedId(null)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xs">{t("Form.Cancel")}</button>
            </div>

            <div className="space-y-4">
              {/* Context-aware settings panels */}
              {selectedComp.type === "heading" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.Heading")}</label>
                    <InputCell defaultValue={selectedComp.props.text} onBlur={handleAnyBlur} compId={selectedComp.id} propKey="text" className="w-full rounded border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-xs outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.Alignment")}</label>
                      <select value={selectedComp.props.align} onChange={(e) => updateProp(selectedComp.id, "align", e.target.value)} className="w-full rounded border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-xs dark:bg-gray-800 dark:text-white"><option value="left">{t("EmailTemplateBuilder.Left")}</option><option value="center">{t("EmailTemplateBuilder.Center")}</option><option value="right">{t("EmailTemplateBuilder.Right")}</option></select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.Size")}</label>
                      <select value={selectedComp.props.level} onChange={(e) => updateProp(selectedComp.id, "level", e.target.value)} className="w-full rounded border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-xs dark:bg-gray-800 dark:text-white"><option value="h1">{t("EmailTemplateBuilder.H1")}</option><option value="h2">{t("EmailTemplateBuilder.H2")}</option><option value="h3">{t("EmailTemplateBuilder.H3")}</option><option value="h4">{t("EmailTemplateBuilder.H4")}</option></select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.Color")}</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={selectedComp.props.color} onChange={(e) => updateProp(selectedComp.id, "color", e.target.value)} className="h-8 w-10 cursor-pointer rounded border border-gray-200 dark:border-gray-700 p-0.5 dark:bg-gray-800" />
                      <span className="text-xs font-mono text-gray-400 dark:text-gray-500">{selectedComp.props.color}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.FontFamily")}</label>
                    <select value={selectedComp.props.fontFamily || EF} onChange={(e) => updateProp(selectedComp.id, "fontFamily", e.target.value)} className="w-full rounded border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-xs dark:bg-gray-800 dark:text-white">
                      {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {selectedComp.type === "text" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.Content")}</label>
                    <TextareaCell defaultValue={selectedComp.props.content} onBlur={handleAnyBlur} compId={selectedComp.id} propKey="content" rows={6} className="w-full rounded border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-xs outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-y dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.Alignment")}</label>
                      <select value={selectedComp.props.align} onChange={(e) => updateProp(selectedComp.id, "align", e.target.value)} className="w-full rounded border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-xs dark:bg-gray-800 dark:text-white"><option value="left">{t("EmailTemplateBuilder.Left")}</option><option value="center">{t("EmailTemplateBuilder.Center")}</option><option value="right">{t("EmailTemplateBuilder.Right")}</option></select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.FontSize")}</label>
                      <select value={selectedComp.props.fontSize || "14px"} onChange={(e) => updateProp(selectedComp.id, "fontSize", e.target.value)} className="w-full rounded border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-xs dark:bg-gray-800 dark:text-white"><option value="12px">12px</option><option value="13px">13px</option><option value="14px">14px</option><option value="15px">15px</option><option value="16px">16px</option><option value="18px">18px</option></select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.TextColor")}</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={selectedComp.props.color} onChange={(e) => updateProp(selectedComp.id, "color", e.target.value)} className="h-8 w-10 cursor-pointer rounded border border-gray-200 dark:border-gray-700 p-0.5 dark:bg-gray-800" />
                      <span className="text-xs font-mono text-gray-400 dark:text-gray-500">{selectedComp.props.color}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.FontFamily")}</label>
                    <select value={selectedComp.props.fontFamily || EF} onChange={(e) => updateProp(selectedComp.id, "fontFamily", e.target.value)} className="w-full rounded border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-xs dark:bg-gray-800 dark:text-white">
                      {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {selectedComp.type === "button" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.Button")}</label>
                    <InputCell defaultValue={selectedComp.props.text} onBlur={handleAnyBlur} compId={selectedComp.id} propKey="text" className="w-full rounded border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-xs outline-none focus:border-brand-500 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.Button")}</label>
                    <InputCell defaultValue={selectedComp.props.url} onBlur={handleAnyBlur} compId={selectedComp.id} propKey="url" className="w-full rounded border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-xs outline-none focus:border-brand-500 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.Alignment")}</label>
                    <select value={selectedComp.props.align} onChange={(e) => updateProp(selectedComp.id, "align", e.target.value)} className="w-full rounded border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-xs dark:bg-gray-800 dark:text-white"><option value="left">{t("EmailTemplateBuilder.Left")}</option><option value="center">{t("EmailTemplateBuilder.Center")}</option><option value="right">{t("EmailTemplateBuilder.Right")}</option></select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.BgColor")}</label>
                      <input type="color" value={selectedComp.props.bgColor} onChange={(e) => updateProp(selectedComp.id, "bgColor", e.target.value)} className="h-8 w-full cursor-pointer rounded border border-gray-200 dark:border-gray-700 p-0.5 dark:bg-gray-800" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.TextColor")}</label>
                      <input type="color" value={selectedComp.props.textColor} onChange={(e) => updateProp(selectedComp.id, "textColor", e.target.value)} className="h-8 w-full cursor-pointer rounded border border-gray-200 dark:border-gray-700 p-0.5 dark:bg-gray-800" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.FontFamily")}</label>
                    <select value={selectedComp.props.fontFamily || EF} onChange={(e) => updateProp(selectedComp.id, "fontFamily", e.target.value)} className="w-full rounded border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-xs dark:bg-gray-800 dark:text-white">
                      {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {selectedComp.type === "image" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.Image")}</label>
                    <InputCell defaultValue={selectedComp.props.src} onBlur={handleAnyBlur} compId={selectedComp.id} propKey="src" className="w-full rounded border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-xs dark:bg-gray-800 dark:text-white" placeholder={t("EmailTemplateBuilder.Image")} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.Image")}</label>
                    <InputCell defaultValue={selectedComp.props.alt} onBlur={handleAnyBlur} compId={selectedComp.id} propKey="alt" className="w-full rounded border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-xs dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.Width")}</label>
                      <InputCell defaultValue={selectedComp.props.width || "100%"} onBlur={handleAnyBlur} compId={selectedComp.id} propKey="width" className="w-full rounded border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-xs dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.Alignment")}</label>
                      <select value={selectedComp.props.align} onChange={(e) => updateProp(selectedComp.id, "align", e.target.value)} className="w-full rounded border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-xs dark:bg-gray-800 dark:text-white"><option value="left">{t("EmailTemplateBuilder.Left")}</option><option value="center">{t("EmailTemplateBuilder.Center")}</option><option value="right">{t("EmailTemplateBuilder.Right")}</option></select>
                    </div>
                  </div>
                </div>
              )}

              {selectedComp.type === "divider" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.BorderStyle")}</label>
                    <select value={selectedComp.props.style || "solid"} onChange={(e) => updateProp(selectedComp.id, "style", e.target.value)} className="w-full rounded border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-xs dark:bg-gray-800 dark:text-gray-300"><option value="solid">{t("EmailTemplateBuilder.Solid")}</option><option value="dashed">{t("EmailTemplateBuilder.Dashed")}</option><option value="dotted">{t("EmailTemplateBuilder.Dotted")}</option></select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.Color")}</label>
                    <input type="color" value={selectedComp.props.color} onChange={(e) => updateProp(selectedComp.id, "color", e.target.value)} className="h-8 w-full cursor-pointer rounded border border-gray-200 dark:border-gray-700 p-0.5 dark:bg-gray-800" />
                  </div>
                </div>
              )}

              {selectedComp.type === "spacer" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.Height", { height: selectedComp.props.height })}</label>
                    <input type="range" min="8" max="80" value={parseInt(selectedComp.props.height)} onChange={(e) => updateProp(selectedComp.id, "height", `${e.target.value}px`)} className="w-full accent-brand-500 cursor-pointer" />
                  </div>
                </div>
              )}

              {selectedComp.type === "columns" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.Columns")}</label>
                      <select value={selectedComp.props.columns} onChange={(e) => { const cols = parseInt(e.target.value); const content = [...(selectedComp.props.content || [])]; while (content.length < cols) content.push(`Column ${content.length + 1}`); updateProps(selectedComp.id, { columns: cols, content: content.slice(0, cols) }); }} className="w-full rounded border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-xs dark:bg-gray-800 dark:text-gray-300"><option value="2">{t("EmailTemplateBuilder.TwoColumns")}</option><option value="3">{t("EmailTemplateBuilder.ThreeColumns")}</option><option value="4">{t("EmailTemplateBuilder.FourColumns")}</option></select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.Gap")}</label>
                      <InputCell defaultValue={selectedComp.props.gap} onBlur={handleAnyBlur} compId={selectedComp.id} propKey="gap" className="w-full rounded border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-xs dark:bg-gray-800 dark:text-white" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.ColumnContents")}</label>
                    {Array.from({ length: selectedComp.props.columns || 2 }, (_, ci) => (
                      <div key={ci} className="space-y-1">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-medium">{t("EmailTemplateBuilder.ColumnN", { n: ci + 1 })}</span>
                        <TextareaCell defaultValue={(selectedComp.props.content || [])[ci] || ""} onBlur={handleAnyBlur} compId={selectedComp.id} propKey="content" ci={ci} rows={3} className="w-full rounded border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-xs outline-none focus:border-brand-500 resize-none dark:bg-gray-800 dark:text-white" />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.FontFamily")}</label>
                    <select value={selectedComp.props.fontFamily || EF} onChange={(e) => updateProp(selectedComp.id, "fontFamily", e.target.value)} className="w-full rounded border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-xs dark:bg-gray-800 dark:text-white">
                      {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {selectedComp.type === "table" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.BorderColor")}</label>
                      <input type="color" value={selectedComp.props.borderColor || "#e2e8f0"} onChange={(e) => updateProp(selectedComp.id, "borderColor", e.target.value)} className="h-8 w-full cursor-pointer rounded border border-gray-200 dark:border-gray-700 p-0.5 dark:bg-gray-800" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.HeaderBg")}</label>
                      <input type="color" value={selectedComp.props.headerBg || "#f8fafc"} onChange={(e) => updateProp(selectedComp.id, "headerBg", e.target.value)} className="h-8 w-full cursor-pointer rounded border border-gray-200 dark:border-gray-700 p-0.5 dark:bg-gray-800" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.FontSize")}</label>
                      <select value={selectedComp.props.fontSize || "13px"} onChange={(e) => updateProp(selectedComp.id, "fontSize", e.target.value)} className="w-full rounded border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-xs dark:bg-gray-800 dark:text-gray-300"><option value="12px">12px</option><option value="13px">13px</option><option value="14px">14px</option></select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.FontFamily")}</label>
                      <select value={selectedComp.props.fontFamily || EF} onChange={(e) => updateProp(selectedComp.id, "fontFamily", e.target.value)} className="w-full rounded border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-xs dark:bg-gray-800 dark:text-gray-300">
                        {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button type="button" onClick={() => { const rows = [...(selectedComp.props.rows || [])]; const cols = (selectedComp.props.headers || []).length || 3; rows.push(Array.from({ length: cols }, (_, i) => `Row ${rows.length + 1} Cell ${i + 1}`)); updateProp(selectedComp.id, "rows", rows); }} className="flex-1 rounded border border-gray-200 dark:border-gray-700 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium">{t("EmailTemplateBuilder.AddRow")}</button>
                    <button type="button" onClick={() => { const headers = [...(selectedComp.props.headers || []), `Header ${(selectedComp.props.headers || []).length + 1}`]; const rows = (selectedComp.props.rows || []).map((r: string[]) => [...r, `Cell ${r.length + 1}`]); updateProps(selectedComp.id, { headers, rows }); }} className="flex-1 rounded border border-gray-200 dark:border-gray-700 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium">{t("EmailTemplateBuilder.AddColumn")}</button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">{t("EmailTemplateBuilder.EditTableData")}</label>
                    <div className="space-y-3">
                      {/* Headers */}
                      {selectedComp.props.headers && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] text-brand-600 uppercase font-bold tracking-wider">{t("EmailTemplateBuilder.Headers")}</span>
                          <div className="grid grid-cols-3 gap-1">
                            {selectedComp.props.headers.map((h: string, ci: number) => (
                              <InputCell key={ci} defaultValue={h} onBlur={handleAnyBlur} compId={selectedComp.id} propKey="headers" ci={ci} className="w-full rounded border border-gray-100 p-1 text-[11px]" />
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Rows */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-brand-600 uppercase font-bold tracking-wider">{t("EmailTemplateBuilder.Cells")}</span>
                        {(selectedComp.props.rows || []).map((row: string[], ri: number) => (
                          <div key={ri} className="space-y-1 border-t border-gray-50 pt-1.5">
                            <span className="text-[9px] text-gray-400 block font-medium">{t("EmailTemplateBuilder.Row", { number: ri + 1 })}</span>
                            <div className="grid grid-cols-3 gap-1">
                              {row.map((cell, ci) => (
                                <InputCell key={ci} defaultValue={cell} onBlur={(val) => { const rows = [...(selectedComp.props.rows || [])]; rows[ri] = [...rows[ri]]; rows[ri][ci] = val; updateProp(selectedComp.id, "rows", rows); }} compId={selectedComp.id} propKey={`rows_${ri}_${ci}`} className="w-full rounded border border-gray-100 p-1 text-[11px]" />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedComp.type === "pricing" && (
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.PlanName")}</label>
                      <InputCell defaultValue={selectedComp.props.planName || ""} onBlur={handleAnyBlur} compId={selectedComp.id} propKey="planName" className="w-full rounded border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-xs dark:bg-gray-800 dark:text-gray-300" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.Price")}</label>
                      <InputCell defaultValue={selectedComp.props.price || ""} onBlur={handleAnyBlur} compId={selectedComp.id} propKey="price" className="w-full rounded border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-xs dark:bg-gray-800 dark:text-gray-300" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.Currency")}</label>
                      <InputCell defaultValue={selectedComp.props.currency || "$"} onBlur={handleAnyBlur} compId={selectedComp.id} propKey="currency" className="w-full rounded border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-xs dark:bg-gray-800 dark:text-gray-300" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.Period")}</label>
                      <InputCell defaultValue={selectedComp.props.period || ""} onBlur={handleAnyBlur} compId={selectedComp.id} propKey="period" className="w-full rounded border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-xs dark:bg-gray-800 dark:text-gray-300" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.ButtonText")}</label>
                    <InputCell defaultValue={selectedComp.props.buttonText || ""} onBlur={handleAnyBlur} compId={selectedComp.id} propKey="buttonText" className="w-full rounded border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-xs dark:bg-gray-800 dark:text-gray-300" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.ButtonURL")}</label>
                    <InputCell defaultValue={selectedComp.props.buttonUrl || "#"} onBlur={handleAnyBlur} compId={selectedComp.id} propKey="buttonUrl" className="w-full rounded border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-xs dark:bg-gray-800 dark:text-gray-300" />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 cursor-pointer">
                      <input type="checkbox" checked={selectedComp.props.highlighted || false} onChange={(e) => updateProp(selectedComp.id, "highlighted", e.target.checked)} className="rounded text-brand-500 focus:ring-brand-500" />
                      {t("EmailTemplateBuilder.Highlighted")}
                    </label>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{t("EmailTemplateBuilder.Accent")}:</span>
                      <input type="color" value={selectedComp.props.accentColor || "#6366f1"} onChange={(e) => updateProp(selectedComp.id, "accentColor", e.target.value)} className="h-6 w-8 cursor-pointer rounded border border-gray-200 dark:border-gray-700 dark:bg-gray-800" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">{t("EmailTemplateBuilder.FeaturesList")}</label>
                    <div className="space-y-1.5">
                      {(selectedComp.props.features || []).map((f: string, fi: number) => (
                        <div key={fi} className="flex items-center gap-1.5">
                          <InputCell defaultValue={f} onBlur={(val) => { const features = [...(selectedComp.props.features || [])]; features[fi] = val; updateProp(selectedComp.id, "features", features); }} compId={selectedComp.id} propKey={`features_${fi}`} className="flex-1 rounded border border-gray-200 dark:border-gray-700 px-2 py-1 text-xs dark:bg-gray-800 dark:text-gray-300" />
                          <button type="button" onClick={() => { const features = (selectedComp.props.features || []).filter((_: any, i: number) => i !== fi); updateProp(selectedComp.id, "features", features); }} className="text-red-400 hover:text-red-600 text-xs shrink-0 cursor-pointer">✕</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => { const features = [...(selectedComp.props.features || []), t("EmailTemplateBuilder.DefaultFeature", { number: (selectedComp.props.features || []).length + 1 })]; updateProp(selectedComp.id, "features", features); }} className="text-[11px] text-brand-500 hover:text-brand-700 font-semibold cursor-pointer">{t("EmailTemplateBuilder.AddFeature")}</button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-family">{t("EmailTemplateBuilder.FontFamily")}</label>
                    <select value={selectedComp.props.fontFamily || EF} onChange={(e) => updateProp(selectedComp.id, "fontFamily", e.target.value)} className="w-full rounded border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-xs dark:bg-gray-800 dark:text-gray-300">
                      {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {selectedComp.type === "callout" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.CalloutContent")}</label>
                    <TextareaCell defaultValue={selectedComp.props.content} onBlur={handleAnyBlur} compId={selectedComp.id} propKey="content" rows={4} className="w-full rounded border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-xs outline-none focus:border-brand-500 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.Icon")}</label>
                      <InputCell defaultValue={selectedComp.props.icon || "ℹ️"} onBlur={handleAnyBlur} compId={selectedComp.id} propKey="icon" className="w-full rounded border border-gray-200 dark:border-gray-700 px-2.5 py-1 text-xs dark:bg-gray-800 dark:text-gray-300" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-family">{t("EmailTemplateBuilder.FontFamily")}</label>
                      <select value={selectedComp.props.fontFamily || EF} onChange={(e) => updateProp(selectedComp.id, "fontFamily", e.target.value)} className="w-full rounded border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-xs dark:bg-gray-800 dark:text-gray-300">
                        {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.BorderColor")}</label>
                      <input type="color" value={selectedComp.props.borderColor || "#6366f1"} onChange={(e) => updateProp(selectedComp.id, "borderColor", e.target.value)} className="h-8 w-full cursor-pointer rounded border border-gray-200 dark:border-gray-700 p-0.5 dark:bg-gray-800" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.BgColor")}</label>
                      <input type="color" value={selectedComp.props.bgColor || "#eef2ff"} onChange={(e) => updateProp(selectedComp.id, "bgColor", e.target.value)} className="h-8 w-full cursor-pointer rounded border border-gray-200 dark:border-gray-700 p-0.5 dark:bg-gray-800" />
                    </div>
                  </div>
                </div>
              )}

               {selectedComp.type === "rawhtml" && (
                 <div className="space-y-3">
                   <div className="space-y-1">
                     <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.RawHtmlCode")}</label>
                     <RawHtmlEditor content={selectedComp.props.content || ""} onBlur={(val) => { if (val !== selectedComp.props.content) { updateProp(selectedComp.id, "content", val); } }} />
                   </div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">{t("EmailTemplateBuilder.RawHtmlNote")}</p>
                 </div>
               )}

               {selectedComp.type === "social" && (
                 <div className="space-y-3">
                   <div className="space-y-1">
                     <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.Alignment")}</label>
                     <select value={selectedComp.props.align} onChange={(e) => updateProp(selectedComp.id, "align", e.target.value)} className="w-full rounded border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-xs dark:bg-gray-800 dark:text-gray-300"><option value="left">{t("EmailTemplateBuilder.Left")}</option><option value="center">{t("EmailTemplateBuilder.Center")}</option><option value="right">{t("EmailTemplateBuilder.Right")}</option></select>
                   </div>
                   <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                      {[
                        { key: "facebook", label: t("EmailTemplateBuilder.SocialFacebook") },
                        { key: "twitter", label: t("EmailTemplateBuilder.SocialTwitter") },
                        { key: "instagram", label: t("EmailTemplateBuilder.SocialInstagram") },
                        { key: "linkedin", label: t("EmailTemplateBuilder.SocialLinkedIn") }
                      ].map((social) => (
                        <div key={social.key} className="space-y-1">
                          <label className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase">{t("EmailTemplateBuilder.SocialUrlLabel", { label: social.label })}</label>
                         <InputCell defaultValue={selectedComp.props[social.key]} onBlur={handleAnyBlur} compId={selectedComp.id} propKey={social.key} className="w-full rounded border border-gray-200 dark:border-gray-700 px-2 py-1 text-xs dark:bg-gray-800 dark:text-gray-300" />
                       </div>
                     ))}
                   </div>
                   <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                     <div className="space-y-1">
                       <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.BgColor")}</label>
                       <div className="flex items-center gap-2">
                         <input type="color" value={selectedComp.props.bgColor} onChange={(e) => updateProp(selectedComp.id, "bgColor", e.target.value)} className="h-8 w-10 cursor-pointer rounded border border-gray-200 dark:border-gray-700 p-0.5 dark:bg-gray-800" />
                         <span className="text-xs font-mono text-gray-400 dark:text-gray-500">{selectedComp.props.bgColor}</span>
                       </div>
                     </div>
                     <div className="space-y-1">
                       <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.TextColor")}</label>
                       <div className="flex items-center gap-2">
                         <input type="color" value={selectedComp.props.textColor} onChange={(e) => updateProp(selectedComp.id, "textColor", e.target.value)} className="h-8 w-10 cursor-pointer rounded border border-gray-200 dark:border-gray-700 p-0.5 dark:bg-gray-800" />
                         <span className="text-xs font-mono text-gray-400 dark:text-gray-500">{selectedComp.props.textColor}</span>
                       </div>
                     </div>
                   </div>
                 </div>
               )}

                {selectedComp.type === "menu" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.Alignment")}</label>
                      <select value={selectedComp.props.align} onChange={(e) => updateProp(selectedComp.id, "align", e.target.value)} className="w-full rounded border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-xs dark:bg-gray-800 dark:text-gray-300"><option value="left">{t("EmailTemplateBuilder.Left")}</option><option value="center">{t("EmailTemplateBuilder.Center")}</option><option value="right">{t("EmailTemplateBuilder.Right")}</option></select>
                   </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.TextColor")}</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={selectedComp.props.color} onChange={(e) => updateProp(selectedComp.id, "color", e.target.value)} className="h-8 w-10 cursor-pointer rounded border border-gray-200 dark:border-gray-700 p-0.5 dark:bg-gray-800" />
                        <span className="text-xs font-mono text-gray-400 dark:text-gray-500">{selectedComp.props.color}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("EmailTemplateBuilder.FontFamily")}</label>
                     <select value={selectedComp.props.fontFamily || EF} onChange={(e) => updateProp(selectedComp.id, "fontFamily", e.target.value)} className="w-full rounded border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-xs dark:bg-gray-800 dark:text-gray-300">
                       {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                     </select>
                   </div>
                   <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                     <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">{t("EmailTemplateBuilder.Links")}</label>
                     <div className="space-y-3">
                       {(selectedComp.props.links || []).map((link: any, li: number) => (
                         <div key={li} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 space-y-2 relative group">
                           <button type="button" onClick={() => { const links = (selectedComp.props.links || []).filter((_: any, i: number) => i !== li); updateProp(selectedComp.id, "links", links); }} className="absolute -top-2 -right-2 h-5 w-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-red-400 rounded-full flex items-center justify-center text-[10px] hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                           <div className="space-y-1">
                             <label className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase">{t("EmailTemplateBuilder.LinkLabel")}</label>
                             <InputCell defaultValue={link.text} onBlur={(val) => { const links = [...(selectedComp.props.links || [])]; links[li] = { ...links[li], text: val }; updateProp(selectedComp.id, "links", links); }} compId={selectedComp.id} propKey={`menu_${li}_text`} className="w-full rounded border border-gray-100 dark:border-gray-700 px-2 py-1 text-xs dark:bg-gray-800 dark:text-gray-300" />
                           </div>
                           <div className="space-y-1">
                             <label className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase">{t("EmailTemplateBuilder.LinkURL")}</label>
                             <InputCell defaultValue={link.url} onBlur={(val) => { const links = [...(selectedComp.props.links || [])]; links[li] = { ...links[li], url: val }; updateProp(selectedComp.id, "links", links); }} compId={selectedComp.id} propKey={`menu_${li}_url`} className="w-full rounded border border-gray-100 dark:border-gray-700 px-2 py-1 text-xs dark:bg-gray-800 dark:text-gray-300" />
                           </div>
                         </div>
                       ))}
                        <button type="button" onClick={() => { const links = [...(selectedComp.props.links || []), { text: t("EmailTemplateBuilder.NewLink"), url: "#" }]; updateProp(selectedComp.id, "links", links); }} className="w-full py-2 border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:text-brand-500 hover:border-brand-200 rounded-lg text-xs font-medium transition-colors">{t("EmailTemplateBuilder.AddMenuLink")}</button>
                     </div>
                   </div>
                 </div>
               )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400 dark:text-gray-500">
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-300 dark:text-gray-500 mb-3">⚙️</div>
            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300">{t("EmailTemplateBuilder.Settings")}</h4>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 max-w-[180px]">{t("EmailTemplateBuilder.Content")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export { generateHtml, parseComponents, stripYoWrappers, combineTemplate };
export default EmailTemplateBuilder;
