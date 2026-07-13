import React from 'react';
import { useTranslation } from 'react-i18next';
import { BlockInstance, ComponentTemplate, ComponentContentDef } from '../../types/builderTypes';
import { X, Trash2, Plus, ChevronDown } from 'lucide-react';
import RichTextEditor from './RichTextEditor';

interface PropertiesPanelProps {
  isOpen: boolean;
  selectedBlock: BlockInstance | null;
  template: ComponentTemplate | undefined;
  onUpdateSettings: (id: string, key: string, value: string) => void;
  onUpdateContent: (id: string, key: string, value: string) => void;
  onDeleteBlock: (id: string) => void;
  onClose: () => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  isOpen,
  selectedBlock,
  template,
  onUpdateSettings,
  onUpdateContent,
  onDeleteBlock,
  onClose,
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  if (!selectedBlock || !template) {
    return null;
  }

  // Helper to safely parse JSON content for list types
  const getListItems = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // Helper to render a single input based on type
  const renderInput = (
    field: ComponentContentDef,
    value: string,
    onChange: (val: string) => void,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isListItem = false
  ) => {
    if (field.type === 'richtext') {
      return <RichTextEditor value={value || ''} onChange={onChange} />;
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition bg-white text-gray-900"
          rows={3}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    }

    if (field.type === 'select' && field.options) {
      return (
        <div className="relative">
          <select
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white text-gray-900"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          >
            {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-3 pointer-events-none text-gray-400" size={16} />
        </div>
      );
    }

    return (
      <input
        type="text"
        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition bg-white text-gray-900"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  };

  return (
    <div className="w-[450px] border-l border-gray-200 bg-white h-full flex flex-col shadow-2xl z-50 fixed right-0 top-0 bottom-0 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
        <div>
          <h2 className="font-bold text-gray-800 text-lg">{t("HtmlBuilder.EditTemplate", { name: template.displayName })}</h2>
          <span className="text-xs text-gray-400 font-mono">ID: {selectedBlock.id.slice(0, 8)}</span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">

        {/* Content Section */}
        <div>
          <h3 className="uppercase text-xs font-bold text-gray-400 mb-4 tracking-wider flex items-center gap-2">
            <span className="w-full h-px bg-gray-200"></span> Content
          </h3>
          <div className="space-y-6">
            {template.contentStructure.map((field) => {

              // Handle List Types (Tabs, Accordion, Feature Grid)
              if (field.type === 'list' && field.itemSchema) {
                const items = getListItems(selectedBlock.content[field.key] || field.defaultValue);

                const updateList = (newItems: any[]) => {
                  onUpdateContent(selectedBlock.id, field.key, JSON.stringify(newItems));
                };

                const addItem = () => {
                  const newItem = field.itemSchema!.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.defaultValue }), {});
                  updateList([...items, newItem]);
                };

                const removeItem = (idx: number) => {
                  updateList(items.filter((_, i) => i !== idx));
                };

                const updateItemField = (itemIdx: number, itemKey: string, val: string) => {
                  const newItems = [...items];
                  newItems[itemIdx] = { ...newItems[itemIdx], [itemKey]: val };
                  updateList(newItems);
                };

                return (
                  <div key={field.key} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-bold text-gray-700">{field.label}</label>
                      <button
                        onClick={addItem}
                        className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200 transition font-medium"
                      >
                        <Plus size={12} /> Add Item
                      </button>
                    </div>

                    <div className="space-y-3">
                      {items.map((item: any, idx: number) => (
                        <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm relative group">
                          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button
                              onClick={() => removeItem(idx)}
                              className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition"
                              title={t("HtmlBuilder.RemoveItem")}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div className="space-y-3 pr-6">
                            {field.itemSchema!.map(subField => (
                              <div key={subField.key}>
                                <label className="block text-xs font-medium text-gray-500 mb-1">{subField.label}</label>
                                {renderInput(
                                  subField,
                                  item[subField.key],
                                  (val) => updateItemField(idx, subField.key, val),
                                  true
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {items.length === 0 && (
                        <div className="text-center p-4 text-gray-400 text-xs italic">No items yet. Click Add Item to start.</div>
                      )}
                    </div>
                  </div>
                );
              }

              // Handle Standard Types
              return (
                <div key={field.key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{field.label}</label>
                  {renderInput(
                    field,
                    selectedBlock.content[field.key],
                    (val) => onUpdateContent(selectedBlock.id, field.key, val)
                  )}
                  {field.type === 'image' && selectedBlock.content[field.key] && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 p-1">
                      <img
                        src={selectedBlock.content[field.key]}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Settings Section */}
        <div>
          <h3 className="uppercase text-xs font-bold text-gray-400 mb-4 tracking-wider flex items-center gap-2">
            <span className="w-full h-px bg-gray-200"></span> Styles
          </h3>
          <div className="space-y-4">
            {template.settings.map((setting) => (
              <div key={setting.key}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{setting.label}</label>

                {setting.type === 'select' && (
                  <div className="relative">
                    <select
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white text-gray-900"
                      value={selectedBlock.settings[setting.key] || ''}
                      onChange={(e) => onUpdateSettings(selectedBlock.id, setting.key, e.target.value)}
                    >
                      {setting.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                )}

                {setting.type === 'boolean' && (
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`setting-${setting.key}`}
                        checked={selectedBlock.settings[setting.key] === 'true'}
                        onChange={() => onUpdateSettings(selectedBlock.id, setting.key, 'true')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{t("Common.Yes")}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`setting-${setting.key}`}
                        checked={selectedBlock.settings[setting.key] !== 'true'}
                        onChange={() => onUpdateSettings(selectedBlock.id, setting.key, 'false')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{t("Common.No")}</span>
                    </label>
                  </div>
                )}

                {(setting.type === 'text' || setting.type === 'color') && (
                  <input
                    type="text"
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-900"
                    value={selectedBlock.settings[setting.key] || ''}
                    onChange={(e) => onUpdateSettings(selectedBlock.id, setting.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={() => { onDeleteBlock(selectedBlock.id); onClose(); }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition font-medium shadow-sm hover:shadow"
        >
          <Trash2 size={16} /> Delete Block
        </button>
      </div>
    </div>
  );
};

export default PropertiesPanel;