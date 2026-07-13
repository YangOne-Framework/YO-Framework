
import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BlockInstance } from '../../types/builderTypes';
import { Settings, Copy, Trash2, GripVertical } from 'lucide-react';
import { GenericBlockRenderer } from './BlockRenderers';
import { fetchTemplates } from './api';

interface CanvasBlockProps {
  block: BlockInstance;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onOpenSettings: () => void;
  onDelete: () => void;
  onClone: () => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number, position: 'top' | 'bottom') => void;
  onEditIcon?: (key: string) => void;
}

const CanvasBlock: React.FC<CanvasBlockProps> = ({
  block,
  index,
  isSelected,
  onSelect,
  onOpenSettings,
  onDelete,
  onClone,
  onDragStart,
  onDrop,
  onEditIcon,
}) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [dropPosition, setDropPosition] = useState<'top' | 'bottom' | null>(null);
  const [htmlTemplate, setHtmlTemplate] = useState<string | undefined>(undefined);
  const [apiConfig, setApiConfig] = useState<any>(undefined);

  // Fetch template definition for all components (template-driven rendering only)
  useEffect(() => {
    fetchTemplates().then(templates => {
      const tmpl = templates.find(t => t.name === block.templateName);
      if (tmpl?.htmlTemplate) {
        setHtmlTemplate(tmpl.htmlTemplate);
      }
      if (tmpl?.apiConfig) {
        setApiConfig(tmpl.apiConfig);
      }
    });
  }, [block.templateName]);


  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const isTop = e.clientY < midpoint;

    // Optimization: Only update state if it changes to prevent flicker
    const newPos = isTop ? 'top' : 'bottom';
    if (dropPosition !== newPos) {
      setDropPosition(newPos);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Check if we are really leaving the main container
    if (ref.current && ref.current.contains(e.relatedTarget as Node)) {
      return;
    }
    setDropPosition(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const finalPosition = dropPosition || 'top';
    setDropPosition(null);
    onDrop(e, index, finalPosition);
  };

  return (
    <div
      ref={ref}
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`relative group transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500 z-10' : 'hover:ring-1 hover:ring-blue-300'
        }`}
    >
      {/* Visual Drop Indicators */}
      {dropPosition === 'top' && (
        <div className="absolute -top-1 left-0 right-0 h-1 bg-blue-600 z-50 pointer-events-none shadow-md" />
      )}
      {dropPosition === 'bottom' && (
        <div className="absolute -bottom-1 left-0 right-0 h-1 bg-blue-600 z-50 pointer-events-none shadow-md" />
      )}

      {/* Overlay UI */}
      <div className={`ui-overlay absolute -top-3 left-0 right-0 flex justify-between px-2 z-20 opacity-0 group-hover:opacity-100 ${isSelected ? 'opacity-100' : ''} transition-opacity duration-200 pointer-events-none`}>
        {/* Drag Handle */}
        <div className="bg-blue-500 text-white rounded p-1 cursor-grab active:cursor-grabbing pointer-events-auto shadow-sm transform hover:scale-110 transition">
          <GripVertical size={14} />
        </div>

        {/* Actions Toolbar */}
        <div className="flex gap-1 bg-white shadow-md border border-gray-200 rounded overflow-hidden pointer-events-auto">
          <button
            onClick={(e) => { e.stopPropagation(); onOpenSettings(); }}
            title={t("HtmlBuilder.Settings")}
            className="p-1.5 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition"
          >
            <Settings size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onClone(); }}
            title={t("HtmlBuilder.Clone")}
            className="p-1.5 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            title={t("HtmlBuilder.Delete")}
            className="p-1.5 hover:bg-red-50 text-gray-600 hover:text-red-600 transition border-l border-gray-100"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Actual Component Render */}
      <div className="pointer-events-none select-none">
        {block.templateName === '__PLAIN_HTML__' ? (
          <div
            className="builder-component"
            style={{ display: 'contents' }}
            data-template-name={block.templateName}
            data-id={block.id}
            data-settings={JSON.stringify(block.settings)}
            data-content={JSON.stringify(block.content)}
          >
            <div
              className="p-4"
              dangerouslySetInnerHTML={{ __html: block.content.html || '' }}
            />
          </div>
        ) : htmlTemplate ? (
          <div
            className="builder-component"
            style={{ display: 'contents' }}
            data-template-name={block.templateName}
            data-id={block.id}
            data-settings={JSON.stringify(block.settings)}
            data-content={JSON.stringify(block.content)}
          >
            <GenericBlockRenderer
              settings={block.settings}
              content={block.content}
              htmlTemplate={htmlTemplate}
              apiConfig={apiConfig}
              onEditIcon={onEditIcon}
            />
          </div>
        ) : (
          <div className="p-4 bg-gray-100 text-gray-600 border border-dashed border-gray-300 rounded">
            Loading template for {block.templateName}...
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasBlock;
