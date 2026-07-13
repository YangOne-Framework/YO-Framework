import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Type } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const { t } = useTranslation();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Initialize content
  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== value) {
      // Only set if significantly different to avoid cursor jumping
      // This is a naive implementation; complex RTEs use detailed state management
      if (!isFocused) {
          contentRef.current.innerHTML = value;
      }
    }
  }, [value, isFocused]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleInput(); // Trigger update
    contentRef.current?.focus();
  };

  const handleInput = () => {
    if (contentRef.current) {
      onChange(contentRef.current.innerHTML);
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-shadow">
      <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-200">
        <ToolbarButton onClick={() => execCommand('bold')} icon={<Bold size={14} />} title={t("RichTextEditor.Bold")} />
        <ToolbarButton onClick={() => execCommand('italic')} icon={<Italic size={14} />} title={t("RichTextEditor.Italic")} />
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <ToolbarButton onClick={() => execCommand('formatBlock', 'H3')} icon={<Heading1 size={14} />} title={t("RichTextEditor.LargeHeading")} />
        <ToolbarButton onClick={() => execCommand('formatBlock', 'H4')} icon={<Heading2 size={14} />} title={t("RichTextEditor.SmallHeading")} />
        <ToolbarButton onClick={() => execCommand('formatBlock', 'P')} icon={<Type size={14} />} title={t("RichTextEditor.Paragraph")} />
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <ToolbarButton onClick={() => execCommand('insertUnorderedList')} icon={<List size={14} />} title={t("RichTextEditor.BulletList")} />
        <ToolbarButton onClick={() => execCommand('insertOrderedList')} icon={<ListOrdered size={14} />} title={t("RichTextEditor.OrderedList")} />
      </div>
      <div
        ref={contentRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="p-3 min-h-[120px] max-h-[300px] overflow-y-auto text-sm outline-none prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
};

const ToolbarButton: React.FC<{ onClick: () => void; icon: React.ReactNode; title: string }> = ({ onClick, icon, title }) => (
  <button
    type="button"
    onClick={(e) => { e.preventDefault(); onClick(); }}
    className="p-1.5 text-gray-600 hover:bg-gray-200 hover:text-black rounded transition"
    title={title}
  >
    {icon}
  </button>
);

export default RichTextEditor;