import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetActiveHtmlComponentsQuery } from '../../../redux/htmlbuilder/htmlBuilderAPI';
import { BlockInstance, ComponentTemplate, HtmlComponentDetailDto, ComponentSettingDef, ComponentContentDef } from '../../../types/builderTypes';
import PropertiesPanel from '../PropertiesPanel';
import CanvasBlock from '../CanvasBlock';
import IconPicker from '../IconPicker';
import { serializeBlocksToHtml, parseHtmlToBlocks } from '../../../utils/htmlSanitizer';
import { SAMPLE_HTML } from '../constants';
import { Plus, Monitor, Smartphone, Tablet, Download, Code, Loader2, Save, Upload, FileCode, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const HtmlBuilder: React.FC = () => {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<ComponentTemplate[]>([]);
  const [blocks, setBlocks] = useState<BlockInstance[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importHtmlValue, setImportHtmlValue] = useState('');

  // Icon Picker State
  const [iconPickerState, setIconPickerState] = useState<{ isOpen: boolean; blockId: string | null; key: string | null }>({
    isOpen: false,
    blockId: null,
    key: null,
  });

  const canvasRef = useRef<HTMLDivElement>(null);

  // Fetch HTML Components from API
  const { data: apiData, isLoading, isError } = useGetActiveHtmlComponentsQuery({ offset: 1, limit: 1000, query: '' });

  // Transform API response to ComponentTemplate format
  useEffect(() => {
    if (apiData?.Data) {
      const transformedTemplates = apiData.Data.map((item: HtmlComponentDetailDto) => {
        // Parse Config (contains settings and apiConfig) and ContentStructure from JSON strings
        let settings: ComponentSettingDef[] = [];
        let contentStructure: ComponentContentDef[] = [];
        let apiConfig = undefined;

        try {
          if (item.Config) {
            const configObj = JSON.parse(item.Config);
            // Config contains { settings: [...], apiConfig: {...} }
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
      id: crypto.randomUUID(), // New ID
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

  const exportConfig = () => {
    const json = JSON.stringify(blocks, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "page-config.json";
    a.click();
  };

  const copyHtml = () => {
    if (!canvasRef.current) return;
    const html = serializeBlocksToHtml(canvasRef.current);
    navigator.clipboard.writeText(html).then(() => {
      alert(t("HtmlBuilder.HtmlCopied"));
    });
  };

  // --- Persistence Logic ---
  const saveToLocalStorage = () => {
    if (!canvasRef.current) return;
    const html = serializeBlocksToHtml(canvasRef.current);
    localStorage.setItem('builder_saved_html', html);
    alert(t("HtmlBuilder.LayoutSaved"));
  };

  const loadFromLocalStorageOrSample = () => {
    let html = localStorage.getItem('builder_saved_html');
    if (!html) {
      if (window.confirm(t("HtmlBuilder.LoadSampleConfirm"))) {
        html = SAMPLE_HTML;
      } else {
        return;
      }
    }
    loadHtmlString(html);
  };

  const loadHtmlString = (html: string) => {
    const restoredBlocks = parseHtmlToBlocks(html);
    if (restoredBlocks.length === 0) {
      alert(t("HtmlBuilder.NoValidComponents"));
      return;
    }
    setBlocks([]);
    setSelectedBlockId(null);
    setIsSettingsOpen(false);
    setTimeout(() => {
      setBlocks(restoredBlocks);
    }, 100);
  };

  const handleImportSubmit = () => {
    if (!importHtmlValue.trim()) return;
    loadHtmlString(importHtmlValue);
    setIsImportModalOpen(false);
    setImportHtmlValue('');
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

  return (
    <div className="flex h-[calc(100vh-160px)] w-full overflow-hidden bg-white dark:bg-boxdark font-sans border border-gray-200 dark:border-strokedark rounded-xl shadow-lg">
      {/* LEFT SIDEBAR: Tools */}
      <div className="w-72 bg-white dark:bg-boxdark border-r border-gray-200 dark:border-strokedark flex flex-col z-10 shadow-sm flex-shrink-0">
        <div className="p-4 border-b border-gray-100 dark:border-strokedark">
          <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">{t("HtmlBuilder.Components")}</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <Loader2 className="animate-spin mr-2" /> {t("HtmlBuilder.Loading")}
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
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-strokedark hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition cursor-grab active:cursor-grabbing bg-white dark:bg-boxdark shadow-sm select-none group"
                    >
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded group-hover:bg-blue-200 group-hover:text-blue-700 transition">
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-800">{template.displayName}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">{t("HtmlBuilder.DragOrClick")}</div>
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
         <div className="h-14 bg-white dark:bg-boxdark border-b border-gray-200 dark:border-strokedark flex items-center justify-between px-6 shadow-sm z-20">
           <div className="flex items-center gap-2">
             <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
               <button onClick={() => setViewMode('desktop')} className={`p-1.5 rounded ${viewMode === 'desktop' ? 'bg-white dark:bg-boxdark shadow text-blue-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}><Monitor size={16} /></button>
               <button onClick={() => setViewMode('tablet')} className={`p-1.5 rounded ${viewMode === 'tablet' ? 'bg-white dark:bg-boxdark shadow text-blue-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}><Tablet size={16} /></button>
               <button onClick={() => setViewMode('mobile')} className={`p-1.5 rounded ${viewMode === 'mobile' ? 'bg-white dark:bg-boxdark shadow text-blue-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}><Smartphone size={16} /></button>
             </div>
           </div>
           <div className="flex gap-2">
              <button onClick={saveToLocalStorage} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-boxdark border border-green-200 dark:border-green-900 text-green-700 dark:text-green-400 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 transition text-xs font-bold shadow-sm"><Save size={14} /> {t("HtmlBuilder.Save")}</button>
              <button onClick={loadFromLocalStorageOrSample} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-boxdark border border-orange-200 dark:border-orange-900 text-orange-700 dark:text-orange-400 rounded-md hover:bg-orange-50 dark:hover:bg-orange-900/20 transition text-xs font-bold shadow-sm"><Upload size={14} /> {t("HtmlBuilder.Load")}</button>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-2"></div>
              <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition text-sm font-bold shadow-sm"><FileCode size={16} /> {t("HtmlBuilder.ImportHTML")}</button>
              <button onClick={copyHtml} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-900 transition text-sm font-bold shadow-sm active:scale-95 transform"><Code size={16} /> {t("HtmlBuilder.CopyHTML")}</button>
           </div>
         </div>

         <div
           className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 p-6 md:p-12 flex justify-center custom-scrollbar"
           onClick={() => { setSelectedBlockId(null); setIsSettingsOpen(false); }}
           onDragOver={(e) => {
             e.preventDefault();
             (e.currentTarget as HTMLElement).classList.add('bg-blue-50/50', 'dark:bg-blue-900/10');
           }}
           onDragLeave={(e) => {
             (e.currentTarget as HTMLElement).classList.remove('bg-blue-50/50', 'dark:bg-blue-900/10');
           }}
           onDrop={(e) => {
             (e.currentTarget as HTMLElement).classList.remove('bg-blue-50/50', 'dark:bg-blue-900/10');
             handleCanvasDrop(e);
           }}
         >
           <div ref={canvasRef} className={`${canvasWidthClass} bg-white dark:bg-boxdark shadow-2xl flex flex-col min-h-full ring-1 ring-black/5 dark:ring-white/10 rounded-lg`}>
             {blocks.length === 0 && (
               <div
                 onDragOver={(e) => {
                   e.preventDefault();
                   e.stopPropagation();
                   (e.currentTarget as HTMLElement).classList.add('bg-blue-50', 'border-blue-400', 'dark:bg-blue-900/20', 'dark:border-blue-800');
                 }}
                 onDragLeave={(e) => {
                   (e.currentTarget as HTMLElement).classList.remove('bg-blue-50', 'border-blue-400', 'dark:bg-blue-900/20', 'dark:border-blue-800');
                 }}
                 onDrop={(e) => {
                   e.preventDefault();
                   e.stopPropagation();
                   (e.currentTarget as HTMLElement).classList.remove('bg-blue-50', 'border-blue-400', 'dark:bg-blue-900/20', 'dark:border-blue-800');
                   handleCanvasDrop(e);
                 }}
                 className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 m-8 rounded-xl border-2 border-dashed border-gray-200 dark:border-strokedark bg-gray-50/50 dark:bg-gray-800/50 transition-all"
               >
                 <div className="w-16 h-16 bg-white dark:bg-boxdark rounded-full flex items-center justify-center shadow-sm mb-4 text-blue-100"><Plus size={32} className="text-blue-500" /></div>
                  <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-1">{t("HtmlBuilder.StartBuilding")}</h3>
                  <p className="text-sm opacity-60">{t("HtmlBuilder.StartBuildingHint")}</p>
               </div>
             )}
             {blocks.map((block, index) => (
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
             ))}
 
             {/* Persistent Drop Area at the end */}
             {blocks.length > 0 && (
               <div
                 onDragOver={(e) => {
                   e.preventDefault();
                   e.stopPropagation();
                   (e.currentTarget as HTMLElement).classList.add('bg-blue-50', 'border-blue-400', 'dark:bg-blue-900/20', 'dark:border-blue-800');
                 }}
                 onDragLeave={(e) => {
                   (e.currentTarget as HTMLElement).classList.remove('bg-blue-50', 'border-blue-400', 'dark:bg-blue-900/20', 'dark:border-blue-800');
                 }}
                 onDrop={(e) => {
                   e.preventDefault();
                   e.stopPropagation();
                   (e.currentTarget as HTMLElement).classList.remove('bg-blue-50', 'border-blue-400', 'dark:bg-blue-900/20', 'dark:border-blue-800');
                   handleCanvasDrop(e);
                 }}
                 className="mx-6 mb-12 p-10 border-2 border-dashed border-gray-200 dark:border-strokedark rounded-xl flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 hover:border-blue-400 hover:bg-white dark:hover:bg-boxdark transition-all group mt-auto"
               >
                 <div className="w-12 h-12 bg-white dark:bg-boxdark rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition border border-gray-100 dark:border-strokedark">
                   <Plus size={24} className="text-gray-300 dark:text-gray-600 group-hover:text-blue-500" />
                 </div>
                  <p className="text-sm font-medium group-hover:text-blue-600">{t("HtmlBuilder.DropHere")}</p>
                  <div className="text-[10px] mt-2 opacity-50 uppercase tracking-widest font-bold">{t("HtmlBuilder.EndOfPage")}</div>
               </div>
             )}
           </div>
         </div>
      </div>

      <PropertiesPanel
        isOpen={isSettingsOpen && selectedBlockId !== null}
        selectedBlock={selectedBlock}
        template={selectedTemplate}
        onUpdateSettings={updateBlockSettings}
        onUpdateContent={updateBlockContent}
        onDeleteBlock={deleteBlock}
        onClose={() => setIsSettingsOpen(false)}
      />

      <IconPicker
        isOpen={iconPickerState.isOpen}
        onClose={() => setIconPickerState({ ...iconPickerState, isOpen: false })}
        onSelect={handleIconSelect}
        currentIcon={currentPickerIcon}
      />

       {isImportModalOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white dark:bg-boxdark rounded-xl shadow-2xl w-full max-w-4xl flex flex-col h-[80vh]">
             <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-strokedark">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2"><FileCode size={20} className="text-blue-600" />{t("HtmlBuilder.ImportHTML")}</h2>
               <button onClick={() => setIsImportModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400"><X size={20} /></button>
             </div>
             <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-900 flex flex-col gap-2">
               <textarea className="flex-1 w-full p-4 border border-gray-300 dark:border-strokedark rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={importHtmlValue} onChange={(e) => setImportHtmlValue(e.target.value)} />
             </div>
             <div className="p-4 border-t border-gray-200 dark:border-strokedark flex justify-end gap-3 bg-white dark:bg-boxdark rounded-b-xl">
                <button onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">{t("Form.Cancel")}</button>
                <button onClick={handleImportSubmit} disabled={!importHtmlValue.trim()} className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50">{t("HtmlBuilder.ImportAndRender")}</button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

export default HtmlBuilder;