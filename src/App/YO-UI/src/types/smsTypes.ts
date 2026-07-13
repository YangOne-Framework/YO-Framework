export interface SMSGateway {
  SMSGatewayId: number;
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
  SMSGatewaySettings?: SMSGatewaySetting[];
}

export interface SMSGatewaySetting {
  SMSGatewaySettingId: number;
  SMSGatewayId: number;
  GatewayKey: string;
  GatewayValue: string;
  AddedOn: string;
  AddedBy: number;
  UpdatedOn: string;
  UpdatedBy: number;
  IsDeleted: boolean;
  RowTotal: number;
}

export interface SaveSMSGateway {
  SMSGatewayId?: number;
  Name: string;
  Description: string;
  Image?: string;
  ImageFile?: File;
  IsActive: boolean;
  IsDefault: boolean;
  SMSGatewaySettings?: { GatewayKey: string; GatewayValue: string }[];
}
