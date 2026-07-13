export interface EmailServiceProvider {
  Id: number;
  Name: string;
  Description: string;
  Image: string;
  IsDefault: boolean;
  IsActive: boolean;
  IsSystem: boolean;
  IsDeleted: boolean;
  AddedOn: string;
  AddedBy: number;
  DeletedBy: number;
  UpdatedOn: string;
  DeletedOn: string;
  UpdatedBy: number;
  RowTotal: number;
  EmailServiceProviderSettings: EmailServiceProviderSetting[];
}

export interface EmailServiceProviderSetting {
  Id: number;
  EmailServiceProviderId: number;
  ProviderKey: string;
  ProviderValue: string;
  AddedOn: string;
  AddedBy: number;
  UpdatedOn: string;
  UpdatedBy: number;
  IsDeleted: boolean;
  RowTotal: number;
}

export interface SaveEmailServiceProvider {
  EmailServiceProviderId?: number;
  Name: string;
  Description: string;
  Image?: string;
  ImageFile?: File;
  IsActive: boolean;
  IsDefault: boolean;
  EmailServiceProviderSettings?: { ProviderKey: string; ProviderValue: string }[];
}
