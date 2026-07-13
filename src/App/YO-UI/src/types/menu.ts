
export interface MenuPermission {
    menuPermissionId?: number; // 0 / omitted for new items
    menuId?: number;
    allowAccessForAll: boolean;
    allowAccess: boolean;
    roleId: number;
    isActive: boolean;
}

export interface MenuSaveRequest {
    menuId?: number;
    name: string;
    subTitle?: string;
    url: string;
    icon?: string;
    cssClass?: string;
    isChild: boolean;
    parentId?: number;
    menuOrder?: number;
    menuGroupId: number;
    isBackend: boolean;
    isSystem?: boolean;
    culture?: string;
    isActive: boolean;
    permissions: MenuPermission[];
}

export interface MenuOrderItem {
    menuId: number;
    menuOrder: number;
    parentId: number;
}

export type MenuOrderSaveRequest = MenuOrderItem[];

export interface MenuRole {
    id: number;
    name: string;
}

export interface MenuGroup {
    menuGroupId: number;
    name: string;
    description?: string;
    isSystem: boolean;
    isActive: boolean;
}

export interface AdminMenuItem {
    MenuId: number;
    Name: string;
    SubTitle?: string;
    Url: string;
    Icon?: string;
    CssClass?: string;
    IsChild: boolean;
    ParentId: number;
    MenuOrder: number;
    MenuGroupId: number;
    Culture?: string;
    IsBackend: boolean;
    IsSystem: boolean;
    IsActive: boolean;
}