
// Defines the structure of a setting field in the JSON configuration
export interface ComponentSettingDef {
    key: string;
    label: string;
    type: 'text' | 'select' | 'boolean' | 'color';
    options?: string[]; // For select inputs
    defaultValue: string;
}

// Defines the structure of content fields (text, images, lists)
export interface ComponentContentDef {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'image' | 'link' | 'list' | 'richtext' | 'select';
    defaultValue: string;
    options?: string[]; // For select inputs in content (e.g. alignment)
    itemSchema?: ComponentContentDef[]; // For list items, defines the fields in each item
}

// The "Class" or "Prototype" of a component (The Template)
export interface ComponentTemplate {
    name: string; // Internal unique name (e.g., '2ColBoxView')
    displayName: string;
    icon: string;
    settings: ComponentSettingDef[]; // Configurable style settings
    contentStructure: ComponentContentDef[]; // Configurable data/text fields
    htmlTemplate?: string; // Optional: For custom components created in the UI
    apiConfig?: {
        url: string;
        method: 'GET' | 'POST';
        autoFetch: boolean;
        dataKey?: string; // Optional: key in response to use as content source
    };
}

// An actual instance of a component on the canvas
export interface BlockInstance {
    id: string; // UUID
    templateName: string; // Reference to ComponentTemplate.name
    settings: Record<string, string>; // key: value pairs
    content: Record<string, string>; // key: value pairs
}

export type BlockRendererProps = {
    settings: Record<string, string>;
    content: Record<string, string>;
    isSelected?: boolean;
    onEditIcon?: (key: string) => void;
    htmlTemplate?: string;
    apiConfig?: ComponentTemplate['apiConfig'];
};



// List item (paged lists)
export interface HtmlComponentItemDto {
    HtmlComponentId: number;
    Name: string;
    DisplayName: string;
    ShortDescription?: string;
    Icon?: string;
    PreviewImage?: string;
    IsActive: boolean;
}

// Detail DTO (view/edit)
export interface HtmlComponentDetailDto extends HtmlComponentItemDto {
    Config?: string;
    ContentStructure?: string;
    HtmlTemplate?: string;
    StateSchema?: string;
    ApiBindings?: string;
    EventBindings?: string;
    RuntimeOptions?: string;
    Version?: string;
}

// Save / Update request
export interface HtmlComponentSaveRequest {
    HtmlComponentId?: number; // 0 / undefined = create
    Name: string;
    DisplayName: string;
    ShortDescription?: string;
    Icon?: string;
    PreviewImage?: string;
    Config?: string;
    ContentStructure?: string;
    HtmlTemplate?: string;
    StateSchema?: string;
    ApiBindings?: string;
    EventBindings?: string;
    RuntimeOptions?: string;
    Version?: string;
    IsActive: boolean;
}

// Check name uniqueness
export interface HtmlComponentCheckUniqueParams {
    name: string;
    oldName?: string;
    htmlComponentId?: number;
}
