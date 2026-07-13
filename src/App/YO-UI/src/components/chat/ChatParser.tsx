import { useTranslation } from "react-i18next";
import { useState } from "react";
import { RiCheckLine, RiDownload2Line, RiFileCopyLine, RiFilePdfLine, RiFileTextLine, RiFileWordLine } from "react-icons/ri";

const CodeBlock = ({ language, code }: { language: string, code: string }) => {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const handleDownload = () => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code.${language}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    return (
        <div className="bg-zinc-800 dark:bg-zinc-900 rounded-lg overflow-hidden my-2 border border-zinc-700 dark:border-zinc-800">
            <div className="flex justify-between items-center px-4 py-2 bg-zinc-700 dark:bg-zinc-800/50">
                <span className="text-xs font-sans text-slate-300">{language}</span>
                <div className="flex gap-2">
                    <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-slate-300 hover:text-white">
                        {copied ? <RiCheckLine /> : <RiFileCopyLine />} {copied ? t("Common.Copied") : t("Common.Copy")}
                    </button>
                    <button onClick={handleDownload} className="flex items-center gap-1 text-xs text-slate-300 hover:text-white">
                        <RiDownload2Line /> {t("Common.Download")}
                    </button>
                </div>
            </div>
            <pre className="p-4 text-sm overflow-x-auto text-white">
                <code className={`language-${language}`}>
                    {code}

                </code>
            </pre>
        </div>
    );
};


const JsonResponse = ({ data }:
    { data: object }) => {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);
    const formattedJson = JSON.stringify(data, null, 2);
    const handleCopy = () => {
        navigator.clipboard.writeText(formattedJson);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="bg-slate-100 dark:bg-zinc-800 rounded-lg overflow-hidden my-2 border border-slate-200 dark:border-zinc-700">
            <div className="flex justify-between items-center px-4 py-2 bg-slate-200 dark:bg-zinc-700/50">
                <span className="text-xs font-sans text-zinc-600 dark:text-slate-300">{t("Chat.JSONResponse")}</span>
                <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-zinc-600 dark:text-slate-300 hover:text-zinc-900 dark:hover:text-white">
                    {copied ? <RiCheckLine /> : <RiFileCopyLine />} {copied ? t("Common.Copied") : t("Common.Copy")}
                </button>
            </div>
            <pre className="p-4 text-sm overflow-x-auto text-zinc-800 dark:text-slate-200">
                <code>{formattedJson}</code>
            </pre>
        </div>
    );
};

const ImageResponse = ({ src, alt, filename }:
    { src: string, alt: string, filename: string }) => {
    const { t } = useTranslation();
    return (
    <div className="my-2 p-2 border border-slate-200 dark:border-zinc-700 rounded-lg max-w-sm">
        <img src={src} alt={alt} className="rounded-md w-full" />
        <a href={src} download={filename}
            className="flex items-center gap-2 mt-2 text-sm text-red-600 hover:underline">
            <RiDownload2Line />
            {t("Chat.DownloadFile", { filename })}</a>
    </div>
);
};

const FileResponse = ({ filename, filetype, url }:
    { filename: string, filetype: 'pdf' | 'docx' | 'txt', url: string }) => {
    const Icon = { pdf: RiFilePdfLine, docx: RiFileWordLine, txt: RiFileTextLine }[filetype];
    return (
        <div className="my-2 p-3 border border-slate-200 dark:border-zinc-700 rounded-lg flex items-center justify-between bg-slate-100 dark:bg-zinc-800/50">
            <div className="flex items-center gap-3">
                <Icon size={28} className="text-red-500" />
                <span className="font-medium text-zinc-800 dark:text-slate-200">
                    {filename}
                </span>
            </div>
            <a href={url} download={filename} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
                <RiDownload2Line className="text-zinc-600 dark:text-slate-300" />
            </a>
        </div>
    );
};

const PollResponse = ({ question, options, onSelect }:
    { question: string, options: string[], onSelect: (option: string) => void }) => {
    const [selected, setSelected] = useState<string | null>(null);
    const handleSelect = (option: string) => {
        setSelected(option);
        onSelect(option);
    };
    return (
        <div className="my-2 p-4 border border-slate-200 dark:border-zinc-700 rounded-lg bg-slate-50 dark:bg-zinc-800/50">
            <p className="font-medium mb-3 text-zinc-800 dark:text-slate-200">{question}</p>
            <div className="flex flex-col gap-2">
                {options.map(option => (<button key={option} onClick={() => handleSelect(option)} disabled={!!selected} className={`w-full text-left p-3 border rounded-lg transition-all ${selected === option ? 'bg-red-600 border-red-600 text-white' : 'bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:border-red-500 disabled:opacity-60 disabled:cursor-not-allowed'}`}>
                    {option}
                </button>))}
            </div>
        </div>
    );
};

const FormResponse = ({ title, fields, onSubmit }:
    { title: string, fields: { name: string, label: string, type: 'text' | 'email' | 'textarea' }[], onSubmit: (data: any) => void }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({});
    const [isSubmitted, setSubmitted] = useState(false);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        onSubmit(formData);
    };
    return (
        <form onSubmit={handleSubmit} className="my-2 p-4 border border-slate-200 dark:border-zinc-700 rounded-lg bg-slate-50 dark:bg-zinc-800/50">
            <h3 className="font-medium text-lg mb-4 text-zinc-800 dark:text-slate-200">{title}</h3>
            <fieldset disabled={isSubmitted} className="space-y-4">
                {fields.map(field => (
                    <div key={field.name}>
                        <label htmlFor={field.name} className="block text-sm font-medium text-zinc-700 dark:text-slate-300 mb-1">
                            {field.label}
                        </label>
                        {field.type === 'textarea' ? (
                            <textarea id={field.name} name={field.name} onChange={handleChange} rows={3} className="w-full p-2 rounded-md bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 focus:ring-2 focus:ring-red-500 outline-none" />
                        ) : (
                            <input type={field.type} id={field.name} name={field.name} onChange={handleChange} className="w-full p-2 rounded-md bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 focus:ring-2 focus:ring-red-500 outline-none" />
                        )}
                    </div>
                ))}
                <button type="submit" className="w-full p-2.5 mt-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:bg-zinc-500">
                    {isSubmitted ? t("Common.Submitted") : t("Common.Submit")}
                </button>
            </fieldset>
        </form>
    );
};

export {CodeBlock,JsonResponse,FormResponse,ImageResponse,FileResponse,PollResponse}
