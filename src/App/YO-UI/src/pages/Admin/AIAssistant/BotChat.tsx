import React, { useEffect, useState } from "react";
import {
  FiSend,
  FiPaperclip,
  FiMoreHorizontal,
  FiPlay,
  FiDownload,
  FiSearch,
  FiCopy,
  FiCheck,
  FiMessageSquare,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------
export type Sender = "user" | "assistant";

export type TextBlock = { type: "text"; text: string };
export type ImageBlock = { type: "image"; src: string; alt?: string; downloadable?: boolean };
export type VideoBlock = { type: "video"; thumbnail: string; url: string; alt?: string };
export type CodeBlock = { type: "code"; code: string; language?: string; filename?: string };
export type MessageBlock = TextBlock | ImageBlock | VideoBlock | CodeBlock;

export type Message = {
  id: string;
  sender: Sender;
  blocks: MessageBlock[];
};

export type HistoryItem = { id: string; title: string };
export type ChatHistory = {
  today?: HistoryItem[];
  yesterday?: HistoryItem[];
  lastWeek?: HistoryItem[];
};

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function classNames(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch (err) {
      console.error("Copy failed", err);
    }
  }
  return { copied, copy } as const;
}

// ------------------------------------------------------------
// Sidebar: Search + Sections (Today / Yesterday / Last Week)
// ------------------------------------------------------------
interface HistorySectionProps {
  label: string;
  items?: HistoryItem[];
}
function HistorySection({ label, items = [] }: HistorySectionProps) {
  if (!items.length) return null;
  return (
    <section>
      <p className="mb-3 pl-3 text-xs uppercase text-gray-400">{label}</p>
      <ul className="space-y-1 text-sm">
        {items.map((item) => (
          <li
            key={item.id}
            className="group relative rounded-full px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-950"
          >
            <div className="flex cursor-pointer items-center justify-between">
              <a className="block truncate text-sm text-gray-700 dark:text-gray-400">
                {item.title}
              </a>
              <button className="invisible ml-2 rounded-full p-1 text-gray-700 group-hover:visible hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400">
                <FiMoreHorizontal size={18} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

interface ChatSidebarProps {
  chatHistory?: ChatHistory;
  isOpen?: boolean;
}
function ChatSidebar({ chatHistory = {}, isOpen = true }: ChatSidebarProps) {
  const { t } = useTranslation();
  return (
    <aside
      className={classNames(
        "z-50 w-[280px] flex-col border-l border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 xl:flex",
        isOpen ? "fixed right-0 top-0 h-screen bg-white dark:bg-gray-900 xl:static" : "hidden xl:flex"
      )}
    >
      <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600">
        <FiMessageSquare size={18} /> {t("BotChat.NewChat")}
      </button>

      <div className="mt-5">
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <FiSearch size={20} />
          </span>
          <input
            type="text"
            placeholder={t("BotChat.Search")}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pr-3.5 pl-[42px] text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
        </div>
      </div>

      <div className="custom-scrollbar mt-6 flex-1 space-y-6 overflow-y-auto text-sm">
        <HistorySection label={t("BotChat.Today")} items={chatHistory.today} />
        <HistorySection label={t("BotChat.Yesterday")} items={chatHistory.yesterday} />
        <div className="pl-3">
          <HistorySection label={t("BotChat.LastWeek")} items={chatHistory.lastWeek} />
        </div>
      </div>
    </aside>
  );
}

// ------------------------------------------------------------
// Message Blocks (by content type)
// ------------------------------------------------------------
function TextBlockView({ text }: { text: string }) {
  return (
    <p className="whitespace-pre-wrap text-left text-sm font-normal text-gray-800 dark:text-white/90">{text}</p>
  );
}

function ImageBlockView({ src, alt = "image", downloadable }: ImageBlock) {
  const { t } = useTranslation();
  return (
    <div>
      <div className="relative rounded-xl">
        <img src={src} alt={alt} className="w-full rounded-xl" />
      </div>
      {downloadable && (
        <div className="mt-3">
          <button className="flex h-8 items-center gap-1 rounded-full border border-gray-100 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
            <FiDownload size={16} /> {t("BotChat.Download")}
          </button>
        </div>
      )}
    </div>
  );
}

function VideoBlockView({ thumbnail, url, alt = "video" }: VideoBlock) {
  return (
    <div className="relative rounded-xl">
      <img src={thumbnail} className="w-full rounded-xl" alt={alt} />
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="video-popup absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/40 backdrop-blur-[10px]"
      >
        <FiPlay size={28} className="text-gray-700" />
      </a>
    </div>
  );
}

function CodeBlockView({ code, language = "text", filename = "" }: CodeBlock) {
  const { t } = useTranslation();
  const { copied, copy } = useCopyToClipboard();
  return (
    <div className="relative w-full overflow-hidden rounded-[20px] border border-gray-200 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
          <FiMessageSquare size={18} />
          <p className="text-sm text-gray-500 dark:text-gray-400">{filename || `${t("BotChat.Code")} (${language})`}</p>
        </div>
        <button
          onClick={() => copy(code)}
          className="flex h-8 items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-950 dark:hover:text-white/90"
        >
          {copied ? <FiCheck size={18} /> : <FiCopy size={18} />}
          <span>{copied ? t("BotChat.Copied") : t("BotChat.Copy")}</span>
        </button>
      </div>
      <div className="custom-scrollbar max-h-[350px] w-full overflow-y-auto px-5 py-4">
        <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-800 dark:text-white/90">{code}</pre>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Message Bubble
// ------------------------------------------------------------
function MessageBlockRenderer({ block }: { block: MessageBlock }) {
  switch (block.type) {
    case "text":
      return <TextBlockView text={block.text} />;
    case "image":
      return <ImageBlockView {...block} />;
    case "video":
      return <VideoBlockView {...block} />;
    case "code":
      return <CodeBlockView {...block} />;
    default:
      return null;
  }
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.sender === "user";
  return (
    <div className={classNames("flex", isUser ? "justify-end" : "justify-start")}>
      <div className={classNames("max-w-[720px]", !isUser && "w-full flex-1")}>
        {isUser ? (
          <div className="max-w-[480px] rounded-xl rounded-tr-xs bg-brand-100 px-4 py-3 shadow-theme-xs dark:bg-brand-500/20">
            {message.blocks.map((block, idx) => (
              <MessageBlockRenderer key={idx} block={block} />
            ))}
          </div>
        ) : (
          <div className="w-full">
            <div className="shadow-theme-xs relative w-full rounded-[20px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
              {message.blocks.length === 1 && message.blocks[0].type === "text" ? (
                <div className="max-w-[480px] rounded-xl rounded-tl-xs bg-gray-100 px-4 py-3 dark:bg-white/5">
                  <TextBlockView text={(message.blocks[0] as TextBlock).text} />
                </div>
              ) : (
                <div className="space-y-3 px-5 py-4">
                  {message.blocks.map((block, idx) => (
                    <MessageBlockRenderer key={idx} block={block} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Composer (input at bottom)
// ------------------------------------------------------------
interface ChatComposerProps {
  value?: string;
  onChange?: (text: string) => void;
  onSend?: (text: string) => void;
}
function ChatComposer({ value, onChange, onSend }: ChatComposerProps) {
  const { t } = useTranslation();
  const [text, setText] = useState<string>(value || "");

  useEffect(() => {
    if (typeof value === "string") setText(value);
  }, [value]);

  function handleSend() {
    const trimmed = (value ?? text).trim();
    if (!trimmed) return;
    onSend?.(trimmed);
    if (value === undefined) setText("");
  }

  return (
    <div className="fixed bottom-5 left-1/2 z-20 w-full -translate-x-1/2 transform px-4 sm:px-6 lg:bottom-10 lg:px-8">
      <div className="mx-auto w-full max-w-[720px] rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-800">
        <textarea
          placeholder={t("BotChat.TypeHere")}
          value={text}
          onChange={(e) => (onChange ? onChange(e.target.value) : setText(e.target.value))}
          className="h-20 w-full resize-none border-none bg-transparent p-0 font-normal text-gray-800 outline-none placeholder:text-gray-400 focus:ring-0 dark:text-white"
        />
        <div className="flex items-center justify-between pt-2">
          <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <FiPaperclip size={20} /> {t("BotChat.Attach")}
          </button>
          <button
            onClick={handleSend}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-white transition hover:bg-gray-800 dark:bg-white/90 dark:text-gray-800 dark:hover:bg-gray-900 dark:hover:text-white/90"
          >
            <FiSend size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Main Chat UI
// ------------------------------------------------------------
export interface ChatUIProps {
  chatHistory?: ChatHistory;
  messages?: Message[];
  onSend?: (text: string) => void;
  showSidebar?: boolean;
}
function ChatUI({ chatHistory = {}, messages = [], onSend = () => {}, showSidebar = true }: ChatUIProps) {
  const { t } = useTranslation();
  return (
    <div className="relative h-[calc(100vh-0px)] px-4 xl:flex xl:px-0">
      {/* Mobile Header */}
      <div className="my-6 flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-3 xl:hidden dark:border-gray-800 dark:bg-gray-900">
        <h4 className="pl-2 text-lg font-medium text-gray-800 dark:text-white/90">{t("BotChat.Title")}</h4>
        <button className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-400">
          <FiMoreHorizontal />
        </button>
      </div>

      {/* Center Pane (Messages) */}
      <div className="flex-1 xl:py-10">
        <div className="relative mx-auto flex max-w-[720px] flex-col">
          <div className="custom-scrollbar relative z-20 max-h-[60vh] space-y-7 overflow-y-auto pb-28 lg:pb-28">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      {showSidebar && <ChatSidebar chatHistory={chatHistory} />}

      {/* Composer */}
      <ChatComposer onSend={onSend} />
    </div>
  );
}

export default ChatUI;
