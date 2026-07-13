import type React from 'react';
import type { YoComponentStyle, YoSection } from '../types/yoPageTypes';

const paddingMap = { none: '', sm: 'p-2', md: 'p-4', lg: 'p-6', xl: 'p-8' };
const marginMap = { none: '', sm: 'm-2', md: 'm-4', lg: 'm-6', xl: 'm-8' };
const radiusMap = { none: '', sm: 'rounded-sm', md: 'rounded-md', lg: 'rounded-lg', xl: 'rounded-xl', full: 'rounded-full' };
const shadowMap = { none: '', sm: 'shadow-theme-xs', md: 'shadow-theme-sm', lg: 'shadow-theme-md', xl: 'shadow-theme-lg' };
const alignMap = { left: 'text-left', center: 'text-center', right: 'text-right' };
const sectionPaddingMap = { none: 'py-0', sm: 'py-4', md: 'py-8', lg: 'py-12', xl: 'py-20' };

export function componentStyleClasses(style: YoComponentStyle): string {
  return [paddingMap[style.padding ?? 'none'], marginMap[style.margin ?? 'none'], radiusMap[style.borderRadius ?? 'none'], shadowMap[style.shadow ?? 'none'], alignMap[style.align ?? 'left'], style.border ? 'border border-gray-200' : '', style.className ?? ''].filter(Boolean).join(' ');
}

export function componentInlineStyle(style: YoComponentStyle): React.CSSProperties {
  return { backgroundColor: style.backgroundColor || undefined, color: style.textColor || undefined };
}

export function sectionClasses(section: YoSection): string {
  return [sectionPaddingMap[section.settings.paddingY], section.settings.className ?? ''].filter(Boolean).join(' ');
}

export function columnClass(span: number): string {
  const map: Record<number, string> = { 1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4', 5: 'col-span-5', 6: 'col-span-6', 7: 'col-span-7', 8: 'col-span-8', 9: 'col-span-9', 10: 'col-span-10', 11: 'col-span-11', 12: 'col-span-12' };
  return map[span] ?? 'col-span-12';
}

export function mdColumnClass(span: number): string {
  const map: Record<number, string> = { 1: 'md:col-span-1', 2: 'md:col-span-2', 3: 'md:col-span-3', 4: 'md:col-span-4', 5: 'md:col-span-5', 6: 'md:col-span-6', 7: 'md:col-span-7', 8: 'md:col-span-8', 9: 'md:col-span-9', 10: 'md:col-span-10', 11: 'md:col-span-11', 12: 'md:col-span-12' };
  return map[span] ?? 'md:col-span-12';
}

export function lgColumnClass(span: number): string {
  const map: Record<number, string> = { 1: 'lg:col-span-1', 2: 'lg:col-span-2', 3: 'lg:col-span-3', 4: 'lg:col-span-4', 5: 'lg:col-span-5', 6: 'lg:col-span-6', 7: 'lg:col-span-7', 8: 'lg:col-span-8', 9: 'lg:col-span-9', 10: 'lg:col-span-10', 11: 'lg:col-span-11', 12: 'lg:col-span-12' };
  return map[span] ?? 'lg:col-span-12';
}

export function responsiveColumnClasses(desktop: number, tablet: number, mobile: number): string {
  return `${columnClass(mobile)} ${mdColumnClass(tablet)} ${lgColumnClass(desktop)}`;
}
