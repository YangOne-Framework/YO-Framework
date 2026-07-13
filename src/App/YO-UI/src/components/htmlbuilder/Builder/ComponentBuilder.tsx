import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ComponentTemplate, ComponentSettingDef, ComponentContentDef, HtmlComponentDetailDto } from '../../../types/builderTypes';
//import { saveTemplate } from '../api';
import { Plus, Trash2, Save, ArrowLeft, Settings2, X, Play, RefreshCw, Eye, GripVertical, ChevronDown, ChevronUp, Code } from 'lucide-react';
import { GenericBlockRenderer } from '../BlockRenderers';
import { useSaveHtmlComponentMutation, useLazyCheckHtmlComponentNameUniqueQuery } from '../../../redux/htmlbuilder/htmlBuilderAPI';
import toaster from '../../../components/toster';
import ComponentCard from '../../common/ComponentCard';

interface ComponentBuilderProps {
    onBack: () => void;
    initialData?: HtmlComponentDetailDto;
}

const ComponentBuilder: React.FC<ComponentBuilderProps> = ({ onBack, initialData }) => {
    const { t } = useTranslation();
    const [saveHtmlComponent, { isLoading: isSaving }] = useSaveHtmlComponentMutation();
    const [checkNameUnique] = useLazyCheckHtmlComponentNameUniqueQuery();

    const [name, setName] = useState('HeroView');
    const [originalName, setOriginalName] = useState('');
    const [displayName, setDisplayName] = useState('Hero Banner');
    const [shortDescription, setShortDescription] = useState('A premium hero banner with background image and text alignment.');
    const [icon, setIcon] = useState('LayoutTemplate');
    const [isActive, setIsActive] = useState(true);
    const [htmlTemplate, setHtmlTemplate] = useState(`
      <div class="relative flex items-center {{settings.Height}} {{settings.Alignment}} bg-slate-900 text-white overflow-hidden" style="min-height: {{settings.Height}}">
        <div class="absolute inset-0 z-0">
          {{#if content.backgroundImage}}
            <img src="{{content.backgroundImage}}" class="w-full h-full object-cover opacity-40" alt="Hero" />
          {{else}}
            <div class="w-full h-full bg-gradient-to-r from-blue-900 to-slate-900 opacity-90"></div>
          {{/if}}
        </div>
        <div class="relative z-10 container mx-auto px-6">
          <h1 class="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">{{content.headline}}</h1>
          <p class="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto mb-8">{{content.subheadline}}</p>
          <button class="px-8 py-3 bg-white text-slate-900 font-bold rounded hover:bg-gray-100">Get Started</button>
        </div>
      </div>
    `);

    const [settings, setSettings] = useState<ComponentSettingDef[]>([
        { key: "Height", label: "Height", type: "select", options: ["auto", "full"], defaultValue: "auto" },
        { key: "Alignment", label: "Text Alignment", type: "select", options: ["text-left", "text-center", "text-right"], defaultValue: "text-center" },
    ]);

    const [contentFields, setContentFields] = useState<ComponentContentDef[]>([
        { key: "headline", label: "Main Headline", type: "text", defaultValue: "Welcome to Our Platform" },
        { key: "subheadline", label: "Sub Headline", type: "textarea", defaultValue: "Build amazing websites with our drag and drop builder." },
        { key: "backgroundImage", label: "Background Image URL", type: "image", defaultValue: "https://picsum.photos/1200/800" },
    ]);

    // API Configuration State
    const [apiConfig, setApiConfig] = useState<ComponentTemplate['apiConfig']>({
        url: '',
        method: 'GET',
        autoFetch: false,
        dataKey: ''
    });

    // Test API State
    const [testApiJson, setTestApiJson] = useState<string | null>(null);
    const [testApiData, setTestApiData] = useState<Record<string, any>>({});
    const [isFetching, setIsFetching] = useState(false);
    const [previewVersion, setPreviewVersion] = useState(0);

    // List Schema Modal State
    const [activeListFieldIdx, setActiveListFieldIdx] = useState<number | null>(null);

    // Floating Preview State
    const [isPreviewVisible, setIsPreviewVisible] = useState(true);
    const [previewPosition, setPreviewPosition] = useState({ x: window.innerWidth - 450, y: window.innerHeight - 550 });
    const [previewDimensions, setPreviewDimensions] = useState({ width: 420, height: 500 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizingPreview, setIsResizingPreview] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

    // Accordion State
    const [isBasicInfoExpanded, setIsBasicInfoExpanded] = useState(true);
    const [isTemplateExpanded, setIsTemplateExpanded] = useState(true);
    const [isSettingsExpanded, setIsSettingsExpanded] = useState(true);
    const [isContentExpanded, setIsContentExpanded] = useState(true);

    useEffect(() => {
        if (initialData) {
            const initialName = initialData.Name || '';
            setName(initialName);
            setOriginalName(initialName); // Store original name for uniqueness check
            setDisplayName(initialData.DisplayName || '');
            setShortDescription(initialData.ShortDescription || '');
            setIcon(initialData.Icon || 'LayoutTemplate');
            setIsActive(initialData.IsActive);
            setHtmlTemplate(initialData.HtmlTemplate || '');

            if (initialData.Config) {
                try {
                    const config = JSON.parse(initialData.Config);
                    if (config.settings) setSettings(config.settings);
                    if (config.apiConfig) setApiConfig(config.apiConfig);
                } catch (e) {
                    console.error("Error parsing component config", e);
                }
            }

            if (initialData.ContentStructure) {
                try {
                    const contentScale = JSON.parse(initialData.ContentStructure);
                    setContentFields(contentScale);
                } catch (e) {
                    console.error("Error parsing content structure", e);
                }
            }
        }
    }, [initialData]);

    // --- Floating Preview Drag Logic ---
    const startDragging = useCallback((e: React.MouseEvent) => {
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - previewPosition.x,
            y: e.clientY - previewPosition.y
        });
    }, [previewPosition]);

    const onDrag = useCallback((e: MouseEvent) => {
        if (isDragging) {
            setPreviewPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y
            });
        }
    }, [isDragging, dragOffset]);

    const stopDragging = useCallback(() => setIsDragging(false), []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', onDrag);
            window.addEventListener('mouseup', stopDragging);
            return () => {
                window.removeEventListener('mousemove', onDrag);
                window.removeEventListener('mouseup', stopDragging);
            };
        }
    }, [isDragging, onDrag, stopDragging]);

    // --- Preview Resize Logic ---
    const startResizingPreview = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsResizingPreview(true);
        setResizeStart({
            x: e.clientX,
            y: e.clientY,
            width: previewDimensions.width,
            height: previewDimensions.height
        });
    }, [previewDimensions]);

    const onResizePreview = useCallback((e: MouseEvent) => {
        if (isResizingPreview) {
            const deltaX = e.clientX - resizeStart.x;
            const deltaY = e.clientY - resizeStart.y;

            setPreviewDimensions({
                width: Math.max(320, Math.min(800, resizeStart.width + deltaX)),
                height: Math.max(300, Math.min(800, resizeStart.height + deltaY))
            });
        }
    }, [isResizingPreview, resizeStart]);

    const stopResizingPreview = useCallback(() => setIsResizingPreview(false), []);

    useEffect(() => {
        if (isResizingPreview) {
            window.addEventListener('mousemove', onResizePreview);
            window.addEventListener('mouseup', stopResizingPreview);
            return () => {
                window.removeEventListener('mousemove', onResizePreview);
                window.removeEventListener('mouseup', stopResizingPreview);
            };
        }
    }, [isResizingPreview, onResizePreview, stopResizingPreview]);


    const handleSave = async () => {
        if (!name || !displayName) {
            toaster.error(t("ComponentBuilder.NameDisplayNameRequired"));
            return;
        }

        // Check name uniqueness before saving
        try {
            const htmlComponentId = initialData?.HtmlComponentId || 0;
            const oldName = htmlComponentId === 0 ? '' : originalName;

            const uniqueCheckResult = await checkNameUnique({
                name: name,
                oldName: oldName,
                htmlComponentId: htmlComponentId
            }).unwrap();

            // If result is not true (name is not unique), prevent saving
            if (uniqueCheckResult?.Data !== true) {
                toaster.error(t("ComponentBuilder.NameExists"));
                return;
            }
        } catch (error: any) {
            toaster.error(t("ComponentBuilder.NameValidateFailed"));
            return;
        }

        const payload = {
            HtmlComponentId: initialData?.HtmlComponentId || 0,
            Name: name,
            DisplayName: displayName,
            ShortDescription: shortDescription,
            IsActive: isActive,
            HtmlTemplate: htmlTemplate,
            Config: JSON.stringify({ settings, apiConfig }),
            ContentStructure: JSON.stringify(contentFields),
            Icon: icon,
            PreviewImage: ''
        };

        try {
            const response = await saveHtmlComponent(payload).unwrap();
            if (response.Code === 200) {
                toaster.success(t("ComponentBuilder.Saved"));
                onBack();
            } else {
                toaster.error(response.Message || t("ComponentBuilder.SaveFailed"));
            }
        } catch (error: any) {
            toaster.error(error?.data?.Message || t("ComponentBuilder.SaveError"));
        }
    };

    const handleTestApi = async () => {
        if (!apiConfig?.url) {
            alert(t("HtmlBuilder.NoUrl"));
            return;
        }
        setIsFetching(true);
        setTestApiJson(null);
        try {
            const res = await fetch(apiConfig.url, { method: apiConfig.method });
            const data = await res.json();
            setTestApiJson(JSON.stringify(data, null, 2));

            // FIX: Handle root array responses
            // If the user hasn't specified a data key, but the response is an array,
            // we default to wrapping it in 'items' so {{#each content.items}} works.
            let effectiveData = data;
            if (apiConfig.dataKey) {
                effectiveData = { [apiConfig.dataKey]: data };
            } else if (Array.isArray(data)) {
                effectiveData = { items: data };
            }

            setTestApiData(effectiveData);
            setPreviewVersion(v => v + 1); // Force re-render of preview
        } catch (e: any) {
            setTestApiJson("Error: " + e.message);
            setTestApiData({});
        } finally {
            setIsFetching(false);
        }
    };

    const addSetting = () => {
        setSettings([...settings, { key: `setting_${settings.length + 1}`, label: 'New Setting', type: 'text', defaultValue: '', options: [] }]);
    };

    const updateSetting = (idx: number, field: string, val: any) => {
        const newSettings = [...settings];
        // @ts-ignore
        newSettings[idx][field] = val;
        setSettings(newSettings);
    };

    const removeSetting = (idx: number) => {
        setSettings(settings.filter((_, i) => i !== idx));
    };

    const addContent = () => {
        setContentFields([...contentFields, { key: `content_${contentFields.length + 1}`, label: 'New Field', type: 'text', defaultValue: '', options: [] }]);
    };

    const updateContent = (idx: number, field: string, val: any) => {
        const newContent = [...contentFields];
        // @ts-ignore
        newContent[idx][field] = val;

        // Reset schema if type changes away from list
        if (field === 'type' && val !== 'list') {
            newContent[idx].itemSchema = undefined;
        }
        // Initialize schema if type changes to list
        if (field === 'type' && val === 'list' && !newContent[idx].itemSchema) {
            newContent[idx].itemSchema = [{ key: 'title', label: 'Item Title', type: 'text', defaultValue: 'Item' }];
        }

        setContentFields(newContent);
    };

    const removeContent = (idx: number) => {
        setContentFields(contentFields.filter((_, i) => i !== idx));
    };

    // --- List Schema Modal Logic ---

    const updateListSchema = (fieldIdx: number, schemaIdx: number, field: string, val: string) => {
        const newContent = [...contentFields];
        const schema = newContent[fieldIdx].itemSchema || [];
        // @ts-ignore
        schema[schemaIdx][field] = val;
        newContent[fieldIdx].itemSchema = schema;
        setContentFields(newContent);
    };

    const addListSchemaField = (fieldIdx: number) => {
        const newContent = [...contentFields];
        const schema = newContent[fieldIdx].itemSchema || [];
        schema.push({ key: `subfield_${schema.length}`, label: 'New Sub Field', type: 'text', defaultValue: '' });
        newContent[fieldIdx].itemSchema = schema;
        setContentFields(newContent);
    };

    const removeListSchemaField = (fieldIdx: number, schemaIdx: number) => {
        const newContent = [...contentFields];
        const schema = newContent[fieldIdx].itemSchema || [];
        newContent[fieldIdx].itemSchema = schema.filter((_, i) => i !== schemaIdx);
        setContentFields(newContent);
    };


    // Generate preview props
    const previewSettings = settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.defaultValue }), {});

    // Default content from schema
    const defaultContent = contentFields.reduce((acc, curr) => {
        if (curr.type === 'list') {
            const dummyItem = (curr.itemSchema || []).reduce((subAcc, subCurr) => ({ ...subAcc, [subCurr.key]: subCurr.defaultValue }), {});
            return { ...acc, [curr.key]: [dummyItem, dummyItem] };
        }
        return { ...acc, [curr.key]: curr.defaultValue };
    }, {});

    // Merge default content with API test data for the live preview
    const mergedPreviewContent = { ...defaultContent, ...testApiData };

    const getBindingSnippets = (jsonStr: string | null) => {
        if (!jsonStr) return null;
        try {
            const data = JSON.parse(jsonStr);

            let effectiveKey = apiConfig?.dataKey;
            let keys: string[] = [];

            // Determine keys based on structure
            if (Array.isArray(data)) {
                // Root array -> we auto-wrap in 'items'
                effectiveKey = 'items';
                keys = Object.keys(data[0] || {});
            } else if (effectiveKey && Array.isArray(data[effectiveKey])) {
                // Key specified and exists
                keys = Object.keys(data[effectiveKey][0] || {});
            } else if (typeof data === 'object') {
                // Plain object
                keys = Object.keys(data);
            }

            if (keys.length > 0 && (Array.isArray(data) || (effectiveKey && Array.isArray(data[effectiveKey])))) {
                return (
                    <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200 text-xs">
                        <p className="font-bold text-yellow-800 mb-1">Detected Array! Loop example:</p>
                        <code className="block bg-white p-2 rounded mb-2 select-all overflow-x-auto text-gray-800 border font-mono">
                            {`{{#each content.${effectiveKey || 'items'}}}`}
                            {keys.slice(0, 3).map(k => `\n  <div>{{${k}}}</div>`).join('')}
                            {`\n{{/each}}`}
                        </code>
                    </div>
                );
            } else {
                return (
                    <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200 text-xs">
                        <p className="font-bold text-blue-800 mb-1">Available Keys:</p>
                        <div className="flex flex-wrap gap-1">
                            {Object.keys(data).map(k => (
                                <span key={k} className="bg-white px-1.5 py-0.5 rounded border text-gray-700 select-all cursor-pointer hover:border-blue-400 font-mono" title="Click to copy">
                                    {`{{content.${k}}}`}
                                </span>
                            ))}
                        </div>
                    </div>
                );
            }
        } catch (e) { return null; }
        return null;
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* Premium Header with Gradient */}
            <div className="bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-lg">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-white/10 rounded-full text-white transition-all duration-200 hover:scale-105"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-white">{t("ComponentBuilder.Title")}</h1>
                        <p className="text-sm text-white/80">{t("ComponentBuilder.Description")}</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-3 bg-white text-brand-600 font-semibold rounded-lg shadow-lg flex items-center gap-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                >
                    {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                    {initialData?.HtmlComponentId ? t("ComponentBuilder.UpdateButton") : t("ComponentBuilder.SaveButton")}
                </button>
            </div>

            {/* Main Workspace: Full Width */}
            <div className="flex-1 overflow-hidden">

                {/* Full Width: Configuration */}
                <div className="h-full overflow-y-auto p-6 custom-scrollbar bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-7xl mx-auto space-y-6 pb-20">

                        {/* 1. Basic Information Card with Accordion */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                            <div
                                className="px-6 py-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                                onClick={() => setIsBasicInfoExpanded(!isBasicInfoExpanded)}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-medium text-gray-800 dark:text-white/90 flex items-center gap-2">
                                            {t("ComponentBuilder.BasicInformation")}
                                            <span className="text-xs bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-full">
                                                {t("ComponentBuilder.MetadataSection")}
                                            </span>
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t("ComponentBuilder.MetadataSection")}</p>
                                    </div>
                                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                        {isBasicInfoExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                                    </button>
                                </div>
                            </div>
                            {isBasicInfoExpanded && (
                                <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-800">
                                    <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {t("ComponentBuilder.InternalName")} <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                                                placeholder="MyCustomCard"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {t("ComponentBuilder.DisplayName")} <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                                                placeholder="My Custom Card"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {t("ComponentBuilder.IconLabel")}
                                            </label>
                                            <input
                                                type="text"
                                                value={icon}
                                                onChange={(e) => setIcon(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                                                placeholder="LayoutTemplate"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {t("ComponentBuilder.ShortDescription")}
                                            </label>
                                            <textarea
                                                value={shortDescription}
                                                onChange={(e) => setShortDescription(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
                                                rows={3}
                                                placeholder="A brief description of this component..."
                                            />
                                        </div>
                                        <div className="flex items-center gap-3 pt-8">
                                            <input
                                                type="checkbox"
                                                id="isActive"
                                                checked={isActive}
                                                onChange={(e) => setIsActive(e.target.checked)}
                                                className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500 cursor-pointer"
                                            />
                                            <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                                {t("ComponentBuilder.IsActive")}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* HTML Template Accordion */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                            <div
                                className="px-6 py-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                                onClick={() => setIsTemplateExpanded(!isTemplateExpanded)}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-medium text-gray-800 dark:text-white/90 flex items-center gap-2">
                                            {t("ComponentBuilder.TemplateSection")}
                                            <span className="text-xs bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                                                {t("ComponentBuilder.TemplateHint")}
                                            </span>
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t("ComponentBuilder.TemplateHint")}</p>
                                    </div>
                                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                        {isTemplateExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                                    </button>
                                </div>
                            </div>
                            {isTemplateExpanded && (
                                <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-800">
                                    <div className="pt-6 space-y-3">
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="inline-block px-2 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded font-mono">
                                                {`{{settings.KEY}}`}
                                            </span>
                                            <span className="text-gray-400">for styles</span>
                                            <span className="inline-block px-2 py-1 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded font-mono">
                                                {`{{content.KEY}}`}
                                            </span>
                                            <span className="text-gray-400">for content</span>
                                        </div>
                                        <textarea
                                            className="w-full h-64 px-4 py-3 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                                            value={htmlTemplate}
                                            onChange={(e) => setHtmlTemplate(e.target.value)}
                                            spellCheck={false}
                                            placeholder="Enter your HTML template here..."
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Style Settings Accordion - Full Width */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                            <div
                                className="px-6 py-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                                onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-medium text-gray-800 dark:text-white/90 flex items-center gap-2">
                                            Style Settings
                                            <span className="text-xs bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
                                                {settings.length} {settings.length === 1 ? 'setting' : 'settings'}
                                            </span>
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Configurable style options for this component</p>
                                    </div>
                                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                        {isSettingsExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                                    </button>
                                </div>
                            </div>
                            {isSettingsExpanded && (
                                <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-800">
                                    <div className="pt-6">
                                        <div className="flex justify-end mb-4">
                                            <button
                                                onClick={addSetting}
                                                className="flex items-center gap-1.5 text-sm bg-brand-50 text-brand-600 px-3 py-1.5 rounded-lg hover:bg-brand-100 font-medium transition-all dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20"
                                            >
                                                <Plus size={14} /> Add Setting
                                            </button>
                                        </div>
                                        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                                            {settings.map((s, i) => (
                                                <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-600 transition-all">
                                                    <div className="grid grid-cols-12 gap-3 items-start">
                                                        {/* Key Field */}
                                                        <div className="col-span-3">
                                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                                Key <span className="text-red-500">*</span>
                                                                <span className="block text-[10px] text-gray-500 dark:text-gray-400 font-normal">Unique identifier</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={s.key}
                                                                onChange={(e) => updateSetting(i, 'key', e.target.value)}
                                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                                                placeholder="styleKey"
                                                            />
                                                        </div>

                                                        {/* Label Field */}
                                                        <div className="col-span-3">
                                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                                Label <span className="text-red-500">*</span>
                                                                <span className="block text-[10px] text-gray-500 dark:text-gray-400 font-normal">Display name</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={s.label}
                                                                onChange={(e) => updateSetting(i, 'label', e.target.value)}
                                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                                                placeholder="Style Label"
                                                            />
                                                        </div>

                                                        {/* Type Field */}
                                                        <div className="col-span-2">
                                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                                Type
                                                                <span className="block text-[10px] text-gray-500 dark:text-gray-400 font-normal">Input type</span>
                                                            </label>
                                                            <select
                                                                value={s.type}
                                                                onChange={(e) => updateSetting(i, 'type', e.target.value)}
                                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                                                            >
                                                                <option value="text">Text</option>
                                                                <option value="select">Select</option>
                                                                <option value="color">Color</option>
                                                            </select>
                                                        </div>

                                                        {/* Default Value Field */}
                                                        <div className="col-span-3">
                                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                                Default Value
                                                                <span className="block text-[10px] text-gray-500 dark:text-gray-400 font-normal">Initial value</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={s.defaultValue || ''}
                                                                onChange={(e) => updateSetting(i, 'defaultValue', e.target.value)}
                                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                                                placeholder="Default"
                                                            />
                                                        </div>

                                                        {/* Delete Button */}
                                                        <div className="col-span-1 flex items-end justify-end h-full pb-2">
                                                            <button
                                                                onClick={() => removeSetting(i)}
                                                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                                                title="Remove setting"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Options Field (for select type) - Full Width Below */}
                                                    {s.type === 'select' && (
                                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                                Options <span className="text-red-500">*</span>
                                                                <span className="block text-[10px] text-gray-500 dark:text-gray-400 font-normal">Comma-separated values (e.g., sm, md, lg)</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={(s.options || []).join(', ')}
                                                                onChange={(e) => updateSetting(i, 'options', e.target.value.split(',').map(o => o.trim()).filter(Boolean))}
                                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                                                                placeholder="Option 1, Option 2, Option 3"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {settings.length === 0 && (
                                                <div className="text-center py-8 text-gray-400 dark:text-gray-500 italic border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                                                    No style settings defined yet
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Content Fields Accordion - Full Width */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                            <div
                                className="px-6 py-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                                onClick={() => setIsContentExpanded(!isContentExpanded)}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-medium text-gray-800 dark:text-white/90 flex items-center gap-2">
                                            Content Fields
                                            <span className="text-xs bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                                                {contentFields.length} {contentFields.length === 1 ? 'field' : 'fields'}
                                            </span>
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Dynamic content structure for this component</p>
                                    </div>
                                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                        {isContentExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                                    </button>
                                </div>
                            </div>
                            {isContentExpanded && (
                                <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-800">
                                    <div className="pt-6">
                                        <div className="flex justify-end mb-4">
                                            <button
                                                onClick={addContent}
                                                className="flex items-center gap-1.5 text-sm bg-brand-50 text-brand-600 px-3 py-1.5 rounded-lg hover:bg-brand-100 font-medium transition-all dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20"
                                            >
                                                <Plus size={14} /> Add Field
                                            </button>
                                        </div>
                                        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                                            {contentFields.map((c, i) => (
                                                <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-600 transition-all">
                                                    <div className="grid grid-cols-12 gap-3 items-start">
                                                        {/* Key Field */}
                                                        <div className="col-span-3">
                                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                                Key <span className="text-red-500">*</span>
                                                                <span className="block text-[10px] text-gray-500 dark:text-gray-400 font-normal">Unique identifier</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={c.key}
                                                                onChange={(e) => updateContent(i, 'key', e.target.value)}
                                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                                                placeholder="contentKey"
                                                            />
                                                        </div>

                                                        {/* Label Field */}
                                                        <div className="col-span-3">
                                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                                Label <span className="text-red-500">*</span>
                                                                <span className="block text-[10px] text-gray-500 dark:text-gray-400 font-normal">Display name</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={c.label}
                                                                onChange={(e) => updateContent(i, 'label', e.target.value)}
                                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                                                placeholder="Field Label"
                                                            />
                                                        </div>

                                                        {/* Type Field */}
                                                        <div className="col-span-2">
                                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                                Type
                                                                <span className="block text-[10px] text-gray-500 dark:text-gray-400 font-normal">Field type</span>
                                                            </label>
                                                            <select
                                                                value={c.type}
                                                                onChange={(e) => updateContent(i, 'type', e.target.value)}
                                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                                                            >
                                                                <option value="text">Text</option>
                                                                <option value="textarea">Long Text</option>
                                                                <option value="richtext">Rich Text</option>
                                                                <option value="image">Image</option>
                                                                <option value="select">Select</option>
                                                                <option value="list">List (Loop)</option>
                                                            </select>
                                                        </div>

                                                        {/* Default Value / Configure Button Field */}
                                                        <div className="col-span-3">
                                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                                {c.type === 'list' ? 'Configuration' : 'Default Value'}
                                                                <span className="block text-[10px] text-gray-500 dark:text-gray-400 font-normal">
                                                                    {c.type === 'list' ? 'Setup list items' : 'Initial value'}
                                                                </span>
                                                            </label>
                                                            {c.type === 'list' ? (
                                                                <button
                                                                    onClick={() => setActiveListFieldIdx(i)}
                                                                    className="w-full px-3 py-2 text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 flex items-center justify-center gap-2 transition-all"
                                                                >
                                                                    <Settings2 size={12} /> Configure Items
                                                                </button>
                                                            ) : (
                                                                <input
                                                                    type="text"
                                                                    value={c.defaultValue || ''}
                                                                    onChange={(e) => updateContent(i, 'defaultValue', e.target.value)}
                                                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                                                    placeholder="Default"
                                                                />
                                                            )}
                                                        </div>

                                                        {/* Delete Button */}
                                                        <div className="col-span-1 flex items-end justify-end h-full pb-2">
                                                            <button
                                                                onClick={() => removeContent(i)}
                                                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                                                title="Remove field"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Options Field (for select type) - Full Width Below */}
                                                    {c.type === 'select' && (
                                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                                Options <span className="text-red-500">*</span>
                                                                <span className="block text-[10px] text-gray-500 dark:text-gray-400 font-normal">Comma-separated values (e.g., Option 1, Option 2)</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={(c.options || []).join(', ')}
                                                                onChange={(e) => updateContent(i, 'options', e.target.value.split(',').map(o => o.trim()).filter(Boolean))}
                                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                                                                placeholder="Option 1, Option 2, Option 3"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {contentFields.length === 0 && (
                                                <div className="text-center py-8 text-gray-400 dark:text-gray-500 italic border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                                                    No content fields defined yet
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div >

            {/* Floating Preview Panel */}
            {
                isPreviewVisible && (
                    <div
                        style={{
                            position: 'fixed',
                            left: `${previewPosition.x}px`,
                            top: `${previewPosition.y}px`,
                            zIndex: 50,
                            width: `${previewDimensions.width}px`,
                            height: `${previewDimensions.height}px`,
                        }}
                        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-300 dark:border-gray-700 flex flex-col overflow-hidden animate-in fade-in duration-200"
                    >
                        {/* Draggable Header */}
                        <div
                            className="bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-3 cursor-move flex items-center justify-between select-none"
                            onMouseDown={startDragging}
                        >
                            <div className="flex items-center gap-2 text-white">
                                <GripVertical size={16} />
                                <Eye size={16} />
                                <span className="font-semibold text-sm">Live Preview</span>
                                <span className="text-xs opacity-75 font-mono">
                                    {previewDimensions.width}×{previewDimensions.height}
                                </span>
                            </div>
                            <button
                                onClick={() => setIsPreviewVisible(false)}
                                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                                onMouseDown={(e) => e.stopPropagation()}
                            >
                                <X size={16} className="text-white" />
                            </button>
                        </div>

                        {/* Preview Content */}
                        <div className="flex-1 overflow-auto p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                            <div className="w-full bg-white dark:bg-gray-950 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[200px]">
                                <GenericBlockRenderer
                                    key={previewVersion}
                                    settings={previewSettings}
                                    content={mergedPreviewContent}
                                    htmlTemplate={htmlTemplate}
                                />
                            </div>
                        </div>

                        {/* Footer with Reset */}
                        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">Real-time</span>
                            <button
                                onClick={() => setPreviewVersion(v => v + 1)}
                                className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-1"
                            >
                                <RefreshCw size={12} /> Refresh
                            </button>
                        </div>

                        {/* Resize Handle (Bottom-Right Corner) */}
                        <div
                            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize bg-brand-500/20 hover:bg-brand-500/40 border-t border-l border-brand-500/30 hover:border-brand-500"
                            style={{ borderTopLeftRadius: '4px' }}
                            onMouseDown={startResizingPreview}
                        />
                    </div>
                )
            }

            {/* Toggle Preview Button (when hidden) */}
            {
                !isPreviewVisible && (
                    <button
                        onClick={() => setIsPreviewVisible(true)}
                        className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-2xl flex items-center gap-2 font-medium transition-all hover:scale-105"
                    >
                        <Eye size={18} />
                        Show Preview
                    </button>
                )
            }

            {/* List Schema Modal */}
            {
                activeListFieldIdx !== null && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200">
                            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-500/10 dark:to-indigo-500/10">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                                        <Settings2 size={20} className="text-brand-500" />
                                        Configure List Items
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {contentFields[activeListFieldIdx].label}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setActiveListFieldIdx(null)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
                                >
                                    <X size={20} className="text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
                                <div className="flex justify-between items-center mb-6">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Define the fields that each item in this list will have
                                    </p>
                                    <button
                                        onClick={() => addListSchemaField(activeListFieldIdx)}
                                        className="flex items-center gap-2 text-sm bg-brand-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-600 transition-all shadow-sm"
                                    >
                                        <Plus size={14} /> Add Item Field
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {(contentFields[activeListFieldIdx].itemSchema || []).map((field, sIdx) => (
                                        <div key={sIdx} className="flex gap-3 items-start p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex-1 space-y-3">
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Key</label>
                                                    <input
                                                        type="text"
                                                        value={field.key}
                                                        onChange={(e) => updateListSchema(activeListFieldIdx, sIdx, 'key', e.target.value)}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Label</label>
                                                    <input
                                                        type="text"
                                                        value={field.label}
                                                        onChange={(e) => updateListSchema(activeListFieldIdx, sIdx, 'label', e.target.value)}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Type</label>
                                                    <select
                                                        value={field.type}
                                                        onChange={(e) => updateListSchema(activeListFieldIdx, sIdx, 'type', e.target.value)}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                                                    >
                                                        <option value="text">Text</option>
                                                        <option value="textarea">Long Text</option>
                                                        <option value="richtext">Rich Text</option>
                                                        <option value="image">Image</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Default</label>
                                                    <input
                                                        type="text"
                                                        value={field.defaultValue}
                                                        onChange={(e) => updateListSchema(activeListFieldIdx, sIdx, 'defaultValue', e.target.value)}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeListSchemaField(activeListFieldIdx, sIdx)}
                                                className="mt-7 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                    {(contentFields[activeListFieldIdx].itemSchema || []).length === 0 && (
                                        <div className="text-center py-12 text-gray-400 dark:text-gray-500 italic border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                                            No fields defined for this list yet. Click "Add Item Field" to get started.
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex justify-end">
                                <button
                                    onClick={() => setActiveListFieldIdx(null)}
                                    className="px-6 py-3 bg-brand-500 text-white rounded-lg font-semibold shadow-sm hover:bg-brand-600 transition-all"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ComponentBuilder;