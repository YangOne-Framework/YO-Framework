import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetActiveHtmlComponentsQuery } from '../../../redux/htmlbuilder/htmlBuilderAPI';
import { BlockInstance, ComponentTemplate, HtmlComponentDetailDto, ComponentSettingDef, ComponentContentDef } from '../../../types/builderTypes';
import PropertiesPanel from '../PropertiesPanel';
import CanvasBlock from '../CanvasBlock';
import IconPicker from '../IconPicker';
import { serializeBlocksToHtml, parseHtmlToBlocks } from '../../../utils/htmlSanitizer';
import { Plus, Monitor, Smartphone, Tablet, X, Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface ModalHtmlBuilderProps {
    isOpen: boolean;
    initialContent?: string;
    onDone: (html: string) => void;
    onClose: () => void;
}

const ModalHtmlBuilder: React.FC<ModalHtmlBuilderProps> = ({
    isOpen,
    initialContent = '',
    onDone,
    onClose,
}) => {
    const { t } = useTranslation();
    const [templates, setTemplates] = useState<ComponentTemplate[]>([]);
    const [blocks, setBlocks] = useState<BlockInstance[]>([]);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

    // Icon Picker State
    const [iconPickerState, setIconPickerState] = useState<{ isOpen: boolean; blockId: string | null; key: string | null }>({
        isOpen: false,
        blockId: null,
        key: null,
    });

    const canvasRef = useRef<HTMLDivElement>(null);

    // Fetch HTML Components from API
    const { data: apiData, isLoading } = useGetActiveHtmlComponentsQuery({ offset: 1, limit: 1000, query: '' });

    // Transform API response to ComponentTemplate format
    useEffect(() => {
        if (apiData?.Data) {
            const transformedTemplates = apiData.Data.map((item: HtmlComponentDetailDto) => {
                let settings: ComponentSettingDef[] = [];
                let contentStructure: ComponentContentDef[] = [];
                let apiConfig = undefined;

                try {
                    if (item.Config) {
                        const configObj = JSON.parse(item.Config);
                        settings = configObj.settings || [];
                        apiConfig = configObj.apiConfig;
                    }
                } catch (e) {
                    console.error(`Failed to parse Config for ${item.Name}:`, e);
                }

                try {
                    if (item.ContentStructure) {
                        contentStructure = JSON.parse(item.ContentStructure);
                    }
                } catch (e) {
                    console.error(`Failed to parse ContentStructure for ${item.Name}:`, e);
                }

                const template: ComponentTemplate = {
                    name: item.Name,
                    displayName: item.DisplayName,
                    icon: item.Icon || 'Box',
                    settings,
                    contentStructure,
                    htmlTemplate: item.HtmlTemplate,
                    apiConfig,
                };

                return template;
            });

            setTemplates(transformedTemplates);
        }
    }, [apiData]);

    // Load initial content when modal opens
    useEffect(() => {
        if (isOpen && initialContent) {
            loadContent(initialContent);
        }
    }, [isOpen, initialContent]);

    const loadContent = (html: string) => {
        if (!html || !html.trim()) {
            setBlocks([]);
            return;
        }

        // Parse the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const allBlocks: BlockInstance[] = [];
        const bodyChildren = Array.from(doc.body.childNodes);

        // Process each child node in order to preserve sequence
        let plainHtmlBuffer: string[] = [];

        const flushPlainHtmlBuffer = () => {
            if (plainHtmlBuffer.length > 0) {
                const plainHtml = plainHtmlBuffer.join('').trim();
                if (plainHtml) {
                    allBlocks.push({
                        id: crypto.randomUUID(),
                        templateName: '__PLAIN_HTML__',
                        settings: {},
                        content: { html: plainHtml },
                    });
                }
                plainHtmlBuffer = [];
            }
        };

        bodyChildren.forEach(node => {
            // Check if this is a builder component
            if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                const builderComponent = element.classList.contains('builder-component')
                    ? element
                    : element.querySelector('.builder-component');

                if (builderComponent) {
                    // Flush any accumulated plain HTML before this component
                    flushPlainHtmlBuffer();

                    // Parse this component block
                    const templateName = builderComponent.getAttribute('data-template-name');
                    const settingsRaw = builderComponent.getAttribute('data-settings');
                    const contentRaw = builderComponent.getAttribute('data-content');
                    const id = builderComponent.getAttribute('data-id');

                    if (templateName && settingsRaw && contentRaw) {
                        try {
                            allBlocks.push({
                                id: id || crypto.randomUUID(),
                                templateName: templateName,
                                settings: JSON.parse(settingsRaw),
                                content: JSON.parse(contentRaw)
                            });
                        } catch (e) {
                            console.error("Failed to parse component data", e);
                        }
                    }
                } else {
                    // Not a builder component, accumulate as plain HTML
                    const tempDiv = document.createElement('div');
                    tempDiv.appendChild(node.cloneNode(true));
                    plainHtmlBuffer.push(tempDiv.innerHTML);
                }
            } else {
                // Text node or other non-element node, accumulate as plain HTML
                const tempDiv = document.createElement('div');
                tempDiv.appendChild(node.cloneNode(true));
                const content = tempDiv.innerHTML.trim();
                if (content) {
                    plainHtmlBuffer.push(content);
                }
            }
        });

        // Flush any remaining plain HTML
        flushPlainHtmlBuffer();

        // If we have blocks, set them
        if (allBlocks.length > 0) {
            setBlocks(allBlocks);
        } else if (html.trim()) {
            // Fallback: if nothing was parsed, treat entire content as plain HTML
            setBlocks([{
                id: crypto.randomUUID(),
                templateName: '__PLAIN_HTML__',
                settings: {},
                content: { html: html.trim() },
            }]);
        }
    };

    // --- Actions ---

    const addBlock = (template: ComponentTemplate, index?: number) => {
        const newBlock: BlockInstance = {
            id: crypto.randomUUID(),
            templateName: template.name,
            settings: template.settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.defaultValue }), {}),
            content: template.contentStructure.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.defaultValue }), {}),
        };

        setBlocks((prev) => {
            const newBlocks = [...prev];
            if (index !== undefined && index >= 0) {
                newBlocks.splice(index, 0, newBlock);
            } else {
                newBlocks.push(newBlock);
            }
            return newBlocks;
        });
        setSelectedBlockId(newBlock.id);
    };

    const deleteBlock = (id: string) => {
        setBlocks((prev) => prev.filter(b => b.id !== id));
        if (selectedBlockId === id) {
            setSelectedBlockId(null);
            setIsSettingsOpen(false);
        }
    };

    const cloneBlock = (id: string) => {
        const blockToClone = blocks.find(b => b.id === id);
        if (!blockToClone) return;

        const newBlock: BlockInstance = {
            ...blockToClone,
            id: crypto.randomUUID(),
            settings: { ...blockToClone.settings },
            content: { ...blockToClone.content },
        };

        const index = blocks.findIndex(b => b.id === id);
        setBlocks(prev => {
            const newBlocks = [...prev];
            newBlocks.splice(index + 1, 0, newBlock);
            return newBlocks;
        });
    };

    const updateBlockSettings = (id: string, key: string, value: string) => {
        setBlocks(prev => prev.map(b =>
            b.id === id ? { ...b, settings: { ...b.settings, [key]: value } } : b
        ));
    };

    const updateBlockContent = (id: string, key: string, value: string) => {
        setBlocks(prev => prev.map(b =>
            b.id === id ? { ...b, content: { ...b.content, [key]: value } } : b
        ));
    };

    const openIconPicker = (blockId: string, key: string) => {
        setIconPickerState({ isOpen: true, blockId, key });
    };

    const handleIconSelect = (iconName: string) => {
        if (iconPickerState.blockId && iconPickerState.key) {
            updateBlockContent(iconPickerState.blockId, iconPickerState.key, iconName);
        }
        setIconPickerState({ isOpen: false, blockId: null, key: null });
    };

    // --- Drag and Drop Handlers ---
    const handleSidebarDragStart = (e: React.DragEvent, template: ComponentTemplate) => {
        e.dataTransfer.setData('type', 'template');
        e.dataTransfer.setData('templateName', template.name);
        e.dataTransfer.effectAllowed = 'copy';
    };

    const handleBlockDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.setData('type', 'block');
        e.dataTransfer.setData('index', index.toString());
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleCanvasDrop = (e: React.DragEvent, dropIndex?: number, position: 'top' | 'bottom' = 'top') => {
        e.preventDefault();
        const type = e.dataTransfer.getData('type');
        let targetIndex: number;

        if (dropIndex === undefined) {
            targetIndex = blocks.length;
            if (blocks.length > 0 && canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                if (e.clientY < rect.top + 150) targetIndex = 0;
            }
        } else {
            const insertionOffset = position === 'bottom' ? 1 : 0;
            targetIndex = dropIndex + insertionOffset;
        }

        if (type === 'template') {
            const templateName = e.dataTransfer.getData('templateName');
            const template = templates.find(t => t.name === templateName);
            if (template) addBlock(template, targetIndex);
        } else if (type === 'block') {
            const fromIndex = parseInt(e.dataTransfer.getData('index'), 10);
            if (isNaN(fromIndex)) return;
            if (dropIndex !== undefined && fromIndex === dropIndex) return;

            setBlocks(prev => {
                const newBlocks = [...prev];
                if (fromIndex < 0 || fromIndex >= newBlocks.length) return prev;
                const [movedBlock] = newBlocks.splice(fromIndex, 1);
                if (fromIndex < targetIndex) targetIndex -= 1;
                targetIndex = Math.max(0, Math.min(targetIndex, newBlocks.length));
                newBlocks.splice(targetIndex, 0, movedBlock);
                return newBlocks;
            });
        }
    };

    const handleDone = () => {
        if (!canvasRef.current) return;

        let finalHtml = '';

        // Check if we have any plain HTML blocks
        const hasPlainHtml = blocks.some(b => b.templateName === '__PLAIN_HTML__');

        if (hasPlainHtml) {
            // Extract HTML from all blocks - plain HTML blocks and component blocks
            const htmlParts: string[] = [];

            blocks.forEach(block => {
                if (block.templateName === '__PLAIN_HTML__') {
                    // For plain HTML blocks, just use the HTML content
                    htmlParts.push(block.content.html || '');
                } else {
                    // For component blocks, serialize from the canvas
                    const blockElement = canvasRef.current?.querySelector(`[data-id="${block.id}"]`);
                    if (blockElement) {
                        const parent = blockElement.closest('.builder-component');
                        if (parent) {
                            const tempDiv = document.createElement('div');
                            tempDiv.appendChild(parent.cloneNode(true));
                            htmlParts.push(serializeBlocksToHtml(tempDiv));
                        }
                    }
                }
            });

            finalHtml = htmlParts.join('\n');
        } else {
            // For component-based HTML only, use standard serialization
            finalHtml = serializeBlocksToHtml(canvasRef.current);
        }

        onDone(finalHtml);
    };

    const handleClose = () => {
        setBlocks([]);
        setSelectedBlockId(null);
        setIsSettingsOpen(false);
        onClose();
    };

    // --- Derived State ---
    const selectedBlock = blocks.find(b => b.id === selectedBlockId) || null;
    const selectedTemplate = selectedBlock
        ? templates.find(t => t.name === selectedBlock.templateName)
        : undefined;

    const canvasWidthClass =
        viewMode === 'mobile' ? 'max-w-[375px]' :
            viewMode === 'tablet' ? 'max-w-[768px]' :
                'w-full';

    const currentPickerIcon = iconPickerState.blockId && iconPickerState.key
        ? blocks.find(b => b.id === iconPickerState.blockId)?.content[iconPickerState.key]
        : undefined;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-[95vw] h-[95vh] flex flex-col">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">{t("HtmlBuilder.ModalTitle")}</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDone}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm font-bold shadow-sm"
                        >
                            <Check size={16} /> {t("HtmlBuilder.Done")}
                        </button>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* LEFT SIDEBAR: Tools */}
                    <div className="w-72 bg-white border-r border-gray-200 flex flex-col z-10 shadow-sm flex-shrink-0">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t("HtmlBuilder.Components")}</h3>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8 text-gray-400">
                                    {t("HtmlBuilder.Loading")}
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {templates.map((template) => {
                                        const Icon = (LucideIcons as any)[template.icon] || Plus;
                                        return (
                                            <div
                                                key={template.name}
                                                draggable
                                                onDragStart={(e) => handleSidebarDragStart(e, template)}
                                                onClick={() => addBlock(template)}
                                                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-grab active:cursor-grabbing transition bg-white shadow-sm select-none group"
                                            >
                                                <div className="p-2 bg-gray-100 rounded group-hover:bg-blue-200 group-hover:text-blue-700 transition">
                                                    <Icon size={18} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-700 group-hover:text-blue-800">{template.displayName}</div>
                                                    <div className="text-xs text-gray-400">{t("HtmlBuilder.DragOrClick")}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CENTER: Canvas */}
                    <div className="flex-1 flex flex-col relative h-full min-w-0">
                        {/* Toolbar */}
                        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-20">
                            <div className="flex items-center gap-2">
                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                    <button onClick={() => setViewMode('desktop')} className={`p-1.5 rounded ${viewMode === 'desktop' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}><Monitor size={16} /></button>
                                    <button onClick={() => setViewMode('tablet')} className={`p-1.5 rounded ${viewMode === 'tablet' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}><Tablet size={16} /></button>
                                    <button onClick={() => setViewMode('mobile')} className={`p-1.5 rounded ${viewMode === 'mobile' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}><Smartphone size={16} /></button>
                                </div>
                            </div>
                        </div>

                        <div
                            className="flex-1 overflow-auto bg-gray-50 p-6 md:p-12 flex justify-center custom-scrollbar"
                            onClick={() => { setSelectedBlockId(null); setIsSettingsOpen(false); }}
                            onDragOver={(e) => {
                                e.preventDefault();
                                (e.currentTarget as HTMLElement).classList.add('bg-blue-50/50');
                            }}
                            onDragLeave={(e) => {
                                (e.currentTarget as HTMLElement).classList.remove('bg-blue-50/50');
                            }}
                            onDrop={(e) => {
                                (e.currentTarget as HTMLElement).classList.remove('bg-blue-50/50');
                                handleCanvasDrop(e);
                            }}
                        >
                            <div ref={canvasRef} className={`${canvasWidthClass} bg-white shadow-2xl flex flex-col min-h-full ring-1 ring-black/5 rounded-lg`}>
                                {blocks.length === 0 && (
                                    <div
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            (e.currentTarget as HTMLElement).classList.add('bg-blue-50', 'border-blue-400');
                                        }}
                                        onDragLeave={(e) => {
                                            (e.currentTarget as HTMLElement).classList.remove('bg-blue-50', 'border-blue-400');
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            (e.currentTarget as HTMLElement).classList.remove('bg-blue-50', 'border-blue-400');
                                            handleCanvasDrop(e);
                                        }}
                                        className="flex-1 flex flex-col items-center justify-center text-gray-400 m-8 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 transition-all"
                                    >
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-blue-100"><Plus size={32} className="text-blue-500" /></div>
                                        <h3 className="text-lg font-medium text-gray-600 mb-1">{t("HtmlBuilder.StartBuilding")}</h3>
                                        <p className="text-sm opacity-60">{t("HtmlBuilder.StartBuildingHint")}</p>
                                    </div>
                                )}
                                {blocks.map((block, index) => {
                                    // Special handling for plain HTML blocks - render as CanvasBlock without settings
                                    if (block.templateName === '__PLAIN_HTML__') {
                                        return (
                                            <CanvasBlock
                                                key={block.id}
                                                index={index}
                                                block={block}
                                                isSelected={selectedBlockId === block.id}
                                                onSelect={() => setSelectedBlockId(block.id)}
                                                onOpenSettings={() => { }} // Disable settings for plain HTML
                                                onDelete={() => deleteBlock(block.id)}
                                                onClone={() => cloneBlock(block.id)}
                                                onDragStart={handleBlockDragStart}
                                                onDrop={handleCanvasDrop}
                                                onEditIcon={() => { }} // Disable icon editing for plain HTML
                                            />
                                        );
                                    }

                                    // Standard component blocks
                                    return (
                                        <CanvasBlock
                                            key={block.id}
                                            index={index}
                                            block={block}
                                            isSelected={selectedBlockId === block.id}
                                            onSelect={() => setSelectedBlockId(block.id)}
                                            onOpenSettings={() => { setSelectedBlockId(block.id); setIsSettingsOpen(true); }}
                                            onDelete={() => deleteBlock(block.id)}
                                            onClone={() => cloneBlock(block.id)}
                                            onDragStart={handleBlockDragStart}
                                            onDrop={handleCanvasDrop}
                                            onEditIcon={(key) => openIconPicker(block.id, key)}
                                        />
                                    );
                                })}

                                {/* Persistent Drop Area at the end */}
                                {blocks.length > 0 && (
                                    <div
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            (e.currentTarget as HTMLElement).classList.add('bg-blue-50', 'border-blue-400');
                                        }}
                                        onDragLeave={(e) => {
                                            (e.currentTarget as HTMLElement).classList.remove('bg-blue-50', 'border-blue-400');
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            (e.currentTarget as HTMLElement).classList.remove('bg-blue-50', 'border-blue-400');
                                            handleCanvasDrop(e);
                                        }}
                                        className="mx-6 mb-12 p-10 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:bg-white transition-all group mt-auto"
                                    >
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition border border-gray-100">
                                            <Plus size={24} className="text-gray-300 group-hover:text-blue-500" />
                                        </div>
                                        <p className="text-sm font-medium group-hover:text-blue-600">{t("HtmlBuilder.DropHere")}</p>
                                        <div className="text-[10px] mt-2 opacity-50 uppercase tracking-widest font-bold">{t("HtmlBuilder.EndOfPage")}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Properties Panel - hide for plain HTML blocks */}
                    {selectedBlock && selectedBlock.templateName !== '__PLAIN_HTML__' && (
                        <PropertiesPanel
                            isOpen={isSettingsOpen && selectedBlockId !== null}
                            selectedBlock={selectedBlock}
                            template={selectedTemplate}
                            onUpdateSettings={updateBlockSettings}
                            onUpdateContent={updateBlockContent}
                            onDeleteBlock={deleteBlock}
                            onClose={() => setIsSettingsOpen(false)}
                        />
                    )}
                </div>
            </div>

            <IconPicker
                isOpen={iconPickerState.isOpen}
                onClose={() => setIconPickerState({ ...iconPickerState, isOpen: false })}
                onSelect={handleIconSelect}
                currentIcon={currentPickerIcon}
            />
        </div>
    );
};

export default ModalHtmlBuilder;
