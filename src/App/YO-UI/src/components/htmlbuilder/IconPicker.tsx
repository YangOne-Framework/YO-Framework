import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as LucideIcons from 'lucide-react';
import { X, Search } from 'lucide-react';

interface IconPickerProps {
  isOpen: boolean;
  onSelect: (iconName: string) => void;
  onClose: () => void;
  currentIcon?: string;
}

const IconPicker: React.FC<IconPickerProps> = ({ isOpen, onSelect, onClose, currentIcon }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  // Extract valid icon names from the library
  // We filter out non-component exports if any (usually 'createLucideIcon', 'default', etc.)
  const iconList = useMemo(() => {
    return Object.keys(LucideIcons).filter(key => {
        // Simple heuristic: Icons start with uppercase and are not the library internals
        return /^[A-Z]/.test(key) && key !== 'Icon' && key !== 'LucideIcon';
    });
  }, []);

  const filteredIcons = useMemo(() => {
    if (!searchTerm) return iconList;
    const lower = searchTerm.toLowerCase();
    return iconList.filter(name => name.toLowerCase().includes(lower));
  }, [searchTerm, iconList]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-gray-200 m-4">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            Select Icon
            <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {filteredIcons.length} icons
            </span>
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder={t("HtmlBuilder.SearchIcons")} 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white text-gray-900"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/30">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {filteredIcons.slice(0, 200).map((iconName) => {
              // @ts-ignore - Dynamic access
              const IconComponent = LucideIcons[iconName];
              const isActive = currentIcon === iconName;
              
              if (!IconComponent) return null;

              return (
                <button
                  key={iconName}
                  onClick={() => onSelect(iconName)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border transition duration-200 group ${
                    isActive 
                      ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm' 
                      : 'bg-white border-gray-100 text-gray-600 hover:border-blue-300 hover:shadow-md'
                  }`}
                  title={iconName}
                >
                  <IconComponent size={24} className="mb-2" />
                  <span className="text-[10px] text-center w-full truncate opacity-70 group-hover:opacity-100">
                    {iconName}
                  </span>
                </button>
              );
            })}
            
            {filteredIcons.length > 200 && (
                <div className="col-span-full py-4 text-center text-gray-400 text-sm">
                    Enter search term to see more...
                </div>
            )}
            
            {filteredIcons.length === 0 && (
                <div className="col-span-full py-10 text-center text-gray-400">
                    No icons found matching "{searchTerm}"
                </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 text-right">
            <button 
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition"
            >
                Cancel
            </button>
        </div>
      </div>
    </div>
  );
};

export default IconPicker;