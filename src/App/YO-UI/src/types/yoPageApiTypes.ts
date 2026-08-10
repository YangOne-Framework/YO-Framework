import { ApiResponse } from "./common";

export interface YoPageDto {
  PageUniqueId: string;
  Name: string;
  Slug: string;
  Status: string;
  MasterLayoutId: string | null;
  MasterLayoutConfig: string | null;
  Content: string | null;
  ContentConfig: string | null;
  Version: number;
  PublishedAt: string | null;
  LastModified: string;
  Culture: string;
  IsActive: boolean;
  AddedOn: string;
  AddedBy: number;
  UpdatedOn: string | null;
  UpdatedBy: number;
  RowTotal: number;
  TemplateType?: string;
}

export interface YoPageListResponse {
  code: number;
  message: string;
  data: YoPageDto[];
  rowTotal?: number;
}

export interface YoPageSaveRequest {
  PageId: string;
  Title: string;
  Slug: string;
  Status: string;
  MasterLayoutId?: string | null;
  MasterLayoutConfig?: string | null;
  Version: number;
  PublishedAt?: string | null;
  Culture?: string;
  TemplateType?: string;
}

export interface YoPagePublishRequest {
  PageId: string;
}

export interface YoPageApiResponse extends ApiResponse<YoPageDto> {}

// ── Public page types (from PublicPageController) ──

export interface SeoDto {
  MetaTitle: string;
  MetaDescription: string;
  Keywords: string;
  OgImage: string;
}

export interface PageSettingsDto {
  ContainerMode: string;
  BackgroundColor: string;
  CustomCss?: string;
}

export interface SectionDto {
  Id: string;
  Name: string;
  LayoutPresetId: string;
  Settings: Record<string, unknown>;
  Columns: ColumnDto[];
}

export interface ColumnDto {
  Id: string;
  Title: string;
  Span: Record<string, unknown>;
  Components: string[];
}

export interface PublicPageResponse {
  PageId: string;
  Title: string;
  Slug: string;
  Status: string;
  MasterLayoutId: string | null;
  MasterLayoutConfig: Record<string, unknown> | null;
  MasterLayout: Record<string, unknown> | null;
  Seo: SeoDto;
  Settings: PageSettingsDto;
  Sections: SectionDto[];
  Components: Record<string, unknown>;
  Version: number;
  PublishedAt: string | null;
  UpdatedAt: string | null;
  TemplateType?: string;
  ThemeConfig?: unknown | null;
}
