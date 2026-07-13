export interface ModuleInfo {
  ModuleId: number;
  Name: string;
  Description: string;
  Version: string;
  Author: string;
  DisplayName: string;
  ModuleKey: string;
  IsInstalled: boolean;
  IsBuiltIn: boolean;
  IsActive: boolean;
  ActiveVersion: string;
  StagedVersion: string;
  LifecycleState: string;
  RuntimeState: string;
  PackageHash: string;
  PackagePath: string;
  StagingPath: string;
  ManifestJson: string;
  LastOperation: string;
  LastError: string;
  IsRestartRequired: boolean;
  EnabledOn: string;
  DisabledOn: string;
  AddedOn: string;
  UpdatedOn: string;
  RowTotal: number;
}

export interface ModuleOperationResult {
  Succeeded: boolean;
  RequiresRestart: boolean;
  ModuleName: string;
  Version: string;
  State: string;
  RuntimeState: string;
  Message: string;
  Errors: string[];
  Warnings: string[];
}

export interface ModulePackageValidationResult {
  IsValid: boolean;
  ModuleId: string;
  Version: string;
  PackageHash: string;
  StagingPath: string;
  VersionPath: string;
  Manifest: ModuleManifest | null;
  Errors: string[];
  Warnings: string[];
}

export interface ModuleManifest {
  Id: string;
  DisplayName: string;
  Version: string;
  Publisher: string;
  Description: string;
  CmsMinimumVersion: string;
  CmsMaximumVersion: string;
  RequiredDotNetRuntime: string;
  EntryAssembly: string;
  ApiRoutePrefix: string;
  ReactEntryPoint: string;
  AdminRoute: string;
  UserRoute: string;
  RestartRequired: boolean;
  PackageHash: string;
  Dependencies: ModuleDependency[];
  Permissions: string[];
  DatabaseProviders: string[];
  Migrations: ModuleMigrationDefinition[];
  Menus: ModuleMenuDefinition[];
  Settings: ModuleSettingDefinition[];
}

export interface ModuleDependency {
  ModuleId: string;
  MinimumVersion: string;
  MaximumVersion: string;
  Required: boolean;
}

export interface ModuleMigrationDefinition {
  Name: string;
  Type: string;
  Path: string;
  FromVersion: string;
  ToVersion: string;
}

export interface ModuleMenuDefinition {
  Key: string;
  Title: string;
  Url: string;
  Icon: string;
  ParentKey: string;
  Order: number;
  MenuGroupId: number;
  IsBackend: boolean;
}

export interface ModuleSettingDefinition {
  Key: string;
  Name: string;
  DataType: string;
  DefaultValue: string;
  Required: boolean;
}

export interface ModuleOperationJournal {
  ModuleOperationJournalId: number;
  ModuleName: string;
  ModuleVersion: string;
  OperationType: string;
  OperationStatus: string;
  LifecycleState: string;
  RuntimeState: string;
  Message: string;
  PayloadJson: string;
  ErrorJson: string;
  StartedOn: string;
  CompletedOn: string;
  RequestedBy: number;
}
