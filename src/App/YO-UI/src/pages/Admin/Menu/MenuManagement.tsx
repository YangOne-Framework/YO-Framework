import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    DragStartEvent,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    useGetMenusByGroupQuery,
    useGetMenuByIdQuery,
    useSaveMenuMutation,
    useDeleteMenuMutation,
    useSaveMenuOrderMutation,
    useGetMenuRolesQuery,
    useGetMenuGroupsQuery,
    useSaveMenuGroupMutation,
    useDeleteMenuGroupMutation,
} from "../../../redux/menu/menuAPI";
import { MenuSaveRequest, MenuRole, MenuOrderItem, MenuGroup } from "../../../types/menu";
import toaster from "../../../components/toster";
import { FaEdit, FaTrash, FaPlus, FaBars, FaLayerGroup, FaGlobe, FaServer, FaCog } from "react-icons/fa";
import { useForm, useFieldArray } from "react-hook-form";
import { Modal } from "../../../components/ui/modal";
import PageMeta from "../../../components/common/PageMeta";

// --- Types ---

interface FlatMenuItem extends MenuSaveRequest {
    id: number; // alias for menuId
    depth: number;
    index: number;
    childrenCount: number;
}

interface TreeItem extends MenuSaveRequest {
    id: number;
    children: TreeItem[];
}

// --- Constants ---
const INDENTATION_WIDTH = 40;

// --- Helper Functions ---

const buildTree = (items: MenuSaveRequest[]): TreeItem[] => {
    const map = new Map<number, TreeItem>();
    const roots: TreeItem[] = [];

    // First pass: create nodes
    items.forEach((item) => {
        if (item.menuId) {
            map.set(item.menuId, { ...item, id: item.menuId, children: [] });
        }
    });

    // Second pass: link parents and children
    items.forEach((item) => {
        if (item.menuId) {
            const node = map.get(item.menuId);
            if (node) {
                if (item.parentId && map.has(item.parentId)) {
                    map.get(item.parentId)!.children.push(node);
                    // Sort children by menuOrder
                    map.get(item.parentId)!.children.sort((a, b) => (a.menuOrder || 0) - (b.menuOrder || 0));
                } else {
                    roots.push(node);
                }
            }
        }
    });

    // Sort roots by menuOrder
    roots.sort((a, b) => (a.menuOrder || 0) - (b.menuOrder || 0));
    return roots;
};

const flattenTree = (items: TreeItem[], depth = 0): FlatMenuItem[] => {
    return items.reduce<FlatMenuItem[]>((acc, item, index) => {
        const flatItem: FlatMenuItem = {
            ...item,
            depth,
            index,
            childrenCount: item.children.length,
        };
        return [...acc, flatItem, ...flattenTree(item.children, depth + 1)];
    }, []);
};

// --- Components ---

interface SortableItemProps {
    item: FlatMenuItem;
    onEdit: (item: FlatMenuItem) => void;
    onDelete: (id: number) => void;
}

const SortableItem = ({ item, onEdit, onDelete }: SortableItemProps) => {
    const { t } = useTranslation();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        marginLeft: `${item.depth * INDENTATION_WIDTH}px`,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative flex items-center justify-between p-3 mb-2 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-theme-sm transition-all duration-200 ${isDragging ? "z-50 shadow-theme-lg ring-2 ring-brand-500/20" : ""
                }`}
        >
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                    <FaBars />
                </div>

                <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg dark:bg-gray-800 shrink-0">
                    {item.icon ? (
                        <i className={`${item.icon} text-gray-600 dark:text-gray-300 text-lg`} />
                    ) : (
                        <FaLayerGroup className="text-gray-400 dark:text-gray-500" />
                    )}
                </div>

                <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-gray-800 dark:text-white/90 truncate">
                        {item.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate font-mono">
                        {item.url}
                    </span>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                    {!item.isActive && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-100 dark:border-red-500/10">
                            {t("Common.Inactive")}
                        </span>
                    )}
                    {item.isSystem && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-100 dark:border-blue-500/10">
                            {t("RoleManagement.IsSystem")}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onEdit(item)}
                    className="p-2 text-gray-500 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors dark:text-gray-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-400"
                    title={t("Form.Edit")}
                >
                    <FaEdit />
                </button>
                <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 text-gray-500 hover:text-error-500 hover:bg-error-50 rounded-lg transition-colors dark:text-gray-400 dark:hover:bg-error-500/10 dark:hover:text-error-400"
                    title={t("Form.Delete")}
                >
                    <FaTrash />
                </button>
            </div>
        </div>
    );
};

// --- Modal Component ---

interface MenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: MenuSaveRequest) => void;
    editMenuId?: number;
    roles: MenuRole[];
    groupId: number;
    isBackend: boolean;
}

const MenuModal = ({ isOpen, onClose, onSave, editMenuId, roles, groupId, isBackend }: MenuModalProps) => {
    const { t } = useTranslation();
    // Fetch menu details if editing
    const { data: menuDetailData, isLoading: isLoadingDetails } = useGetMenuByIdQuery(editMenuId!, {
        skip: !editMenuId,
    });
    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { errors },
    } = useForm<MenuSaveRequest>({
        defaultValues: {
            menuId: 0,
            name: "",
            url: "",
            icon: "",
            isActive: true,
            isBackend: isBackend,
            menuGroupId: groupId,
            permissions: [],
            parentId: 0,
            menuOrder: 0,
            isChild: false,
        },
    });

    const { fields } = useFieldArray({
        control,
        name: "permissions",
    });

    useEffect(() => {
        if (isOpen) {
            if (editMenuId && menuDetailData?.Data) {
                // Bind the fetched menu data
                const menuData = menuDetailData.Data;
                reset({
                    menuId: menuData.MenuId,
                    name: menuData.Name,
                    url: menuData.Url,
                    icon: menuData.Icon,
                    cssClass: menuData.CssClass,
                    subTitle: menuData.SubTitle,
                    isActive: menuData.IsActive,
                    isBackend: menuData.IsBackend,
                    isSystem: menuData.IsSystem,
                    menuGroupId: menuData.MenuGroupId,
                    parentId: menuData.ParentId || 0,
                    menuOrder: menuData.MenuOrder || 0,
                    isChild: menuData.IsChild,
                    permissions: menuData.Permissions && menuData.Permissions.length > 0
                        ? menuData.Permissions.map((p: any) => ({
                            roleId: p.RoleId,
                            allowAccess: p.AllowAccess,
                            allowAccessForAll: p.AllowAccessForAll || false,
                            isActive: p.IsActive,
                        }))
                        : roles.map((role) => ({
                            roleId: role.id,
                            allowAccess: role.name === "SuperAdmin" || role.id === 1,
                            allowAccessForAll: false,
                            isActive: true,
                        })),
                });
            } else if (!editMenuId) {
                // New menu - reset to defaults
                reset({
                    menuId: 0,
                    name: "",
                    url: "",
                    icon: "",
                    cssClass: "",
                    subTitle: "",
                    isActive: true,
                    isBackend: isBackend,
                    isSystem: false,
                    menuGroupId: groupId,
                    parentId: 0,
                    menuOrder: 0,
                    isChild: false,
                    permissions: roles.map((role) => ({
                        roleId: role.id,
                        allowAccess: role.name === "SuperAdmin" || role.id === 1,
                        allowAccessForAll: false,
                        isActive: true,
                    })),
                });
            }
        }
    }, [isOpen, editMenuId, menuDetailData, roles, groupId, isBackend, reset, setValue]);

    const onSubmit = (data: MenuSaveRequest) => {
        onSave(data);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {editMenuId ? t("MenuManagement.EditMenuItem") : t("MenuManagement.AddMenuItem")}
                    </h3>
                </div>

                {isLoadingDetails && editMenuId && (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                    </div>
                )}

                {!isLoadingDetails && (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t("Common.Name")} <span className="text-error-500">*</span>
                                </label>
                                <input
                                    {...register("name", { required: t("MenuManagement.AddMenuItem") })}
                                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
                                    placeholder={t("MenuManagement.NamePlaceholder")}
                                />
                                {errors.name && <p className="text-xs text-error-500">{errors.name.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t("MenuManagement.URL")} <span className="text-error-500">*</span>
                                </label>
                                <input
                                    {...register("url", { required: t("SEOForm.URL") })}
                                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
                                    placeholder={t("MenuManagement.UrlPlaceholder")}
                                />
                                {errors.url && <p className="text-xs text-error-500">{errors.url.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("MenuManagement.Icon")}</label>
                                <input
                                    {...register("icon")}
                                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
                                    placeholder={t("MenuManagement.IconPlaceholder")}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("MenuManagement.CssClass")}</label>
                                <input
                                    {...register("cssClass")}
                                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
                                    placeholder={t("MenuManagement.CssClassPlaceholder")}
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-6 p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        {...register("isActive")}
                                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 bg-white transition-all checked:border-brand-500 checked:bg-brand-500 hover:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:checked:border-brand-500 dark:checked:bg-brand-500"
                                    />
                                    <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{t("Common.Active")}</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        {...register("isSystem")}
                                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 bg-white transition-all checked:border-brand-500 checked:bg-brand-500 hover:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:checked:border-brand-500 dark:checked:bg-brand-500"
                                    />
                                    <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{t("RoleManagement.IsSystem")}</span>
                            </label>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">{t("PermissionManagement.Title")}</h4>
                            <div className="max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900/50 p-2 custom-scrollbar">
                                {roles.map((role, index) => {
                                    const isSuperAdmin = role.name === "SuperAdmin" || role.id === 1;
                                    return (
                                        <div key={role.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-white/[0.03] rounded-lg transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${isSuperAdmin ? 'bg-brand-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{role.name}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <label className={`flex items-center gap-2 ${isSuperAdmin ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                                                    <div className="relative flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            {...register(`permissions.${index}.allowAccess`)}
                                                            disabled={isSuperAdmin}
                                                            className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 bg-white transition-all checked:border-brand-500 checked:bg-brand-500 hover:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:checked:border-brand-500 dark:checked:bg-brand-500 disabled:cursor-not-allowed"
                                                        />
                                                        <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{t("PermissionManagement.Grant")}</span>
                                                </label>
                                                <input type="hidden" {...register(`permissions.${index}.roleId`)} value={role.id} />
                                                <input type="hidden" {...register(`permissions.${index}.isActive`)} value="true" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-gray-700 transition-colors"
                            >
                                {t("Form.Cancel")}
                            </button>
                            <button
                                type="submit"
                                className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors shadow-theme-sm"
                            >
                                {t("Common.Save")}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
};

// --- Menu Group Modal Component ---

interface MenuGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: MenuGroup) => void;
    initialData?: MenuGroup;
}

const MenuGroupModal = ({ isOpen, onClose, onSave, initialData }: MenuGroupModalProps) => {
    const { t } = useTranslation();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<MenuGroup>({
        defaultValues: {
            menuGroupId: 0,
            name: "",
            description: "",
            isSystem: false,
            isActive: true,
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset(initialData);
            } else {
                reset({
                    menuGroupId: 0,
                    name: "",
                    description: "",
                    isSystem: false,
                    isActive: true,
                });
            }
        }
    }, [isOpen, initialData, reset]);

    const onSubmit = (data: MenuGroup) => {
        onSave(data);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
            <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {initialData?.menuGroupId ? t("MenuManagement.EditGroup") : t("MenuManagement.AddGroup")}
                    </h3>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t("Common.Name")} <span className="text-error-500">*</span>
                        </label>
                        <input
                            {...register("name", { required: t("MenuManagement.AddGroup") })}
                            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
                            placeholder={t("MenuManagement.GroupNamePlaceholder")}
                        />
                        {errors.name && <p className="text-xs text-error-500">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t("MenuManagement.Description")}
                        </label>
                        <textarea
                            {...register("description")}
                            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
                            placeholder={t("MenuManagement.DescriptionPlaceholder")}
                            rows={3}
                        />
                    </div>

                    <div className="flex flex-wrap gap-6 p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    {...register("isActive")}
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 bg-white transition-all checked:border-brand-500 checked:bg-brand-500 hover:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:checked:border-brand-500 dark:checked:bg-brand-500"
                                />
                                <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{t("Common.Active")}</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    {...register("isSystem")}
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 bg-white transition-all checked:border-brand-500 checked:bg-brand-500 hover:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:checked:border-brand-500 dark:checked:bg-brand-500"
                                />
                                <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{t("RoleManagement.IsSystem")}</span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-gray-700 transition-colors"
                        >
                            {t("Form.Cancel")}
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors shadow-theme-sm"
                        >
                            {t("Common.Save")}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

// --- Main Page Component ---

const MenuManagement = () => {
    const { t } = useTranslation();
    const [activeGroupId, setActiveGroupId] = useState<number>(0);
    const [items, setItems] = useState<FlatMenuItem[]>([]);
    const [activeId, setActiveId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMenuId, setEditingMenuId] = useState<number | undefined>(undefined);

    // Group Modal State
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<MenuGroup | undefined>(undefined);

    // API Hooks
    const { data: menusData, refetch: refetchMenus, isLoading: isMenusLoading } = useGetMenusByGroupQuery(activeGroupId, {
        skip: activeGroupId === 0,
    });
    const { data: rolesData } = useGetMenuRolesQuery();
    const { data: groupsData, refetch: refetchGroups } = useGetMenuGroupsQuery();

    const [saveMenu] = useSaveMenuMutation();
    const [deleteMenu] = useDeleteMenuMutation();
    const [saveMenuOrder] = useSaveMenuOrderMutation();
    const [saveMenuGroup] = useSaveMenuGroupMutation();
    const [deleteMenuGroup] = useDeleteMenuGroupMutation();

    const roles = useMemo(() => {
        if (rolesData?.Data && Array.isArray(rolesData.Data)) {
            return rolesData.Data.map((r: any) => ({
                id: r.Id,
                name: r.Name
            }));
        }
        return [];
    }, [rolesData]);

    const groups = useMemo(() => {
        if (groupsData?.Data && Array.isArray(groupsData.Data)) {
            return groupsData.Data.map((g: any) => ({
                menuGroupId: g.MenuGroupId,
                name: g.Name,
                description: g.Description,
                isSystem: g.IsSystem,
                isActive: g.IsActive
            }));
        }
        return [];
    }, [groupsData]);

    // Set initial active group
    useEffect(() => {
        if (groups.length > 0 && activeGroupId === 0) {
            setActiveGroupId(groups[0].menuGroupId);
        }
    }, [groups, activeGroupId]);

    // Load Data
    useEffect(() => {
        // Handle both response.Data and direct array response
        const dataToProcess = menusData?.Data || (Array.isArray(menusData) ? menusData : []);

        if (dataToProcess && Array.isArray(dataToProcess)) {
            const mappedData: MenuSaveRequest[] = dataToProcess.map((item: any) => ({
                menuId: item.MenuId,
                name: item.Name,
                subTitle: item.SubTitle,
                url: item.Url,
                icon: item.Icon,
                cssClass: item.CssClass,
                isChild: item.IsChild,
                parentId: item.ParentId,
                menuOrder: item.MenuOrder,
                menuGroupId: item.MenuGroupId,
                isBackend: item.IsBackend,
                isSystem: item.IsSystem,
                isActive: item.IsActive,
                permissions: item.Permissions || [],
            }));
            const tree = buildTree(mappedData);
            setItems(flattenTree(tree));
        } else {
            setItems([]);
        }
    }, [menusData]);

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // DnD Logic
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveId(active.id as number);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over, delta } = event;
        setActiveId(null);

        if (active.id !== over?.id) {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over?.id);

            let newItems = arrayMove(items, oldIndex, newIndex);

            const activeItem = items[oldIndex];
            const projectedDepth = activeItem.depth + Math.round(delta.x / INDENTATION_WIDTH);
            const clampedDepth = Math.max(0, projectedDepth);

            const itemAbove = newItems[newIndex - 1];
            const maxDepth = itemAbove ? itemAbove.depth + 1 : 0;
            const finalDepth = Math.min(clampedDepth, maxDepth);

            newItems[newIndex] = { ...newItems[newIndex], depth: finalDepth };

            const updatedItems = newItems.map((item, index) => {
                if (item.depth === 0) return { ...item, parentId: 0, isChild: false };

                for (let i = index - 1; i >= 0; i--) {
                    if (newItems[i].depth === item.depth - 1) {
                        return { ...item, parentId: newItems[i].id, isChild: true };
                    }
                }
                return item;
            });

            setItems(updatedItems);
            handleSaveOrder(updatedItems);
        }
    };

    const handleSaveOrder = async (updatedItems: FlatMenuItem[]) => {
        const orderRequest: MenuOrderItem[] = updatedItems.map((item, index) => ({
            menuId: item.id,
            menuOrder: index + 1,
            parentId: item.parentId || 0,
        }));

        try {
            await saveMenuOrder(orderRequest).unwrap();
            toaster.success(t("MenuManagement.SaveOrder"));
        } catch (error) {
            toaster.error(t("MenuManagement.SaveOrder"));
        }
    };

    const handleEdit = (item: FlatMenuItem) => {
        setEditingMenuId(item.menuId);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm(t("MenuManagement.DeleteGroup"))) {
            try {
                await deleteMenu(id).unwrap();
                toaster.success(t("MenuManagement.AddMenuItem"));
                refetchMenus();
            } catch (error) {
                toaster.error(t("MenuManagement.AddMenuItem"));
            }
        }
    };

    const handleSaveMenu = async (data: MenuSaveRequest) => {
        try {
            await saveMenu(data).unwrap();
            toaster.success(t("MenuManagement.AddMenuItem"));
            setIsModalOpen(false);
            refetchMenus();
        } catch (error) {
            toaster.error(t("MenuManagement.AddMenuItem"));
        }
    };

    // Group Handlers
    const handleSaveGroup = async (data: MenuGroup) => {
        try {
            await saveMenuGroup(data).unwrap();
            toaster.success(t("MenuManagement.AddGroup"));
            setIsGroupModalOpen(false);
            refetchGroups();
        } catch (error) {
            toaster.error(t("MenuManagement.AddGroup"));
        }
    };

    const handleDeleteGroup = async (id: number) => {
        if (window.confirm(t("MenuManagement.DeleteGroup"))) {
            try {
                await deleteMenuGroup(id).unwrap();
                toaster.success(t("MenuManagement.DeleteGroup"));
                refetchGroups();
                // If deleted group was active, switch to first available
                if (activeGroupId === id && groups.length > 0) {
                    setActiveGroupId(groups[0].menuGroupId);
                }
            } catch (error) {
                toaster.error(t("MenuManagement.DeleteGroup"));
            }
        }
    };

    return (
        <>
            <PageMeta
                title={t("MenuManagement.Title")}
                description={t("MenuManagement.Title")}
            />

            <div className="grid grid-cols-12 gap-4 md:gap-6">
                {/* Sidebar / Tree View Area */}
                <div className="col-span-12 xl:col-span-4">
                    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] h-[calc(100vh-120px)] flex flex-col sticky top-24">
                        <div className="p-5 md:p-6 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
                                    {t("MenuManagement.MenuGroups")}
                                </h3>
                                <button
                                    onClick={() => {
                                        setEditingGroup(undefined);
                                        setIsGroupModalOpen(true);
                                    }}
                                    className="p-2 text-brand-500 hover:bg-brand-50 rounded-lg transition-colors dark:hover:bg-brand-500/10"
                                    title={t("MenuManagement.AddGroup")}
                                >
                                    <FaPlus />
                                </button>
                            </div>

                            {/* Dynamic Group Switcher */}
                            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                                {groups.map((group) => (
                                    <div
                                        key={group.menuGroupId}
                                        className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 border ${activeGroupId === group.menuGroupId
                                            ? "bg-brand-50 border-brand-200 dark:bg-brand-500/10 dark:border-brand-500/20"
                                            : "bg-gray-50 border-transparent hover:bg-gray-100 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]"
                                            }`}
                                        onClick={() => setActiveGroupId(group.menuGroupId)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${activeGroupId === group.menuGroupId
                                                ? "bg-brand-500 text-white"
                                                : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                                                }`}>
                                                {group.name.toLowerCase().includes('backend') ? <FaServer size={12} /> : <FaGlobe size={12} />}
                                            </div>
                                            <span className={`text-sm font-medium ${activeGroupId === group.menuGroupId
                                                ? "text-brand-700 dark:text-brand-400"
                                                : "text-gray-700 dark:text-gray-300"
                                                }`}>
                                                {group.name}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingGroup(group);
                                                    setIsGroupModalOpen(true);
                                                }}
                                                className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-white rounded-md transition-colors dark:hover:bg-gray-800"
                                                title={t("MenuManagement.EditGroup")}
                                            >
                                                <FaEdit size={12} />
                                            </button>
                                            {!group.isSystem && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteGroup(group.menuGroupId);
                                                    }}
                                                    className="p-1.5 text-gray-500 hover:text-error-500 hover:bg-white rounded-md transition-colors dark:hover:bg-gray-800"
                                                    title={t("MenuManagement.DeleteGroup")}
                                                >
                                                    <FaTrash size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {groups.length === 0 && (
                                    <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {t("DataGrid.NoData")}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tree List */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {isMenusLoading ? (
                                <div className="flex items-center justify-center h-40">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                                </div>
                            ) : (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                                        <div className="space-y-1">
                                            {items.map((item) => (
                                                <SortableItem
                                                    key={item.id}
                                                    item={item}
                                                    onEdit={handleEdit}
                                                    onDelete={handleDelete}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                    <DragOverlay>
                                        {activeId ? (
                                            <div className="p-3 bg-white border border-brand-500 rounded-xl shadow-theme-lg opacity-90 dark:bg-gray-800 dark:border-brand-400">
                                                <span className="font-medium text-gray-900 dark:text-white">{t("MenuManagement.AddMenuItem")}</span>
                                            </div>
                                        ) : null}
                                    </DragOverlay>
                                </DndContext>
                            )}

                            {!isMenusLoading && items.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-gray-500">
                                    <FaLayerGroup className="text-4xl mb-3 opacity-20" />
                                    <p className="text-sm">{t("DataGrid.NoData")}</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                            <button
                                onClick={() => {
                                    setEditingMenuId(undefined);
                                    setIsModalOpen(true);
                                }}
                                className="w-full py-3 px-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium transition-colors shadow-theme-sm flex items-center justify-center gap-2"
                            >
                                <FaPlus /> {t("MenuManagement.AddMenuItem")}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side / Details Area */}
                <div className="col-span-12 xl:col-span-8 hidden xl:block">
                    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] h-[calc(100vh-120px)] flex items-center justify-center text-center p-10">
                        <div className="max-w-md">
                            <div className="w-20 h-20 bg-brand-50 dark:bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaLayerGroup className="text-4xl text-brand-500 dark:text-brand-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                {t("MenuManagement.Title")}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-8">
                                {t("MenuManagement.MenuItems")}
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-left">
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800">
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{t("MenuManagement.MenuGroups")}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{t("MenuManagement.MenuGroups")}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800">
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{t("PermissionManagement.Title")}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{t("PermissionManagement.Title")}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Modal */}
            <MenuModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveMenu}
                editMenuId={editingMenuId}
                roles={roles}
                groupId={activeGroupId}
                isBackend={activeGroupId === 2} // Fallback logic, ideally should be based on group type
            />

            {/* Menu Group Modal */}
            <MenuGroupModal
                isOpen={isGroupModalOpen}
                onClose={() => setIsGroupModalOpen(false)}
                onSave={handleSaveGroup}
                initialData={editingGroup}
            />
        </>
    );
};

export default MenuManagement;
