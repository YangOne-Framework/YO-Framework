import { Sparkles } from 'lucide-react';

interface AIChatButtonProps {
  onClick: () => void;
}

export function AIChatButton({ onClick }: AIChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-500 to-purple-600 text-white px-3 py-1.5 text-xs font-medium shadow-theme-xs hover:from-brand-600 hover:to-purple-700 transition-all hover:shadow-theme-sm"
      title="AI Assistant - Generate HTML templates"
    >
      <Sparkles className="h-3.5 w-3.5" />
      AI Assist
    </button>
  );
}
