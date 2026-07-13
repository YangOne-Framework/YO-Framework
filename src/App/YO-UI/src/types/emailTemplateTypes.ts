export interface EmailTemplate {
  TemplateId: number;
  TemplateName: string;
  TemplateType: string;
  Template: string;
  HeaderTemplate: string;
  FooterTemplate: string;
  EmailSubject: string;
  IsActive: boolean;
  IsDeleted: boolean;
  AddedOn: string;
  AddedBy: number;
  DeletedBy: number;
  UpdatedOn: string;
  DeletedOn: string;
  UpdatedBy: number;
  RowTotal: number;
  FullTemplate?: string;
}

export interface SaveEmailTemplate {
  TemplateId?: number;
  TemplateName: string;
  TemplateType: string;
  Template: string;
  HeaderTemplate?: string;
  FooterTemplate?: string;
  EmailSubject: string;
  IsActive: boolean;
}

export interface EmailComponent {
  id: string;
  type: EmailComponentType;
  props: Record<string, any>;
}

export type EmailComponentType = "header" | "text" | "button" | "image" | "divider" | "spacer" | "social" | "columns";
