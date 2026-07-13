import type { ConfigField } from '../../../../types/yoPageTypes';
import Label from '../../../../components/form/Label';

const fieldControlClass = 'w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:border-gray-700 dark:text-white/90';

export function DynamicFieldRenderer({ field, value, onChange }: { field: ConfigField; value: unknown; onChange: (value: unknown) => void }) {
  const label = <Label>{field.label}{field.required ? ' *' : ''}</Label>;

  if (field.type === 'textarea' || field.type === 'richtext') {
    return (
      <div>
        {label}
        <textarea className={`${fieldControlClass} min-h-32 resize-y leading-6`}
          value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
          placeholder={field.placeholder}
          onChange={event => {
            const text = event.target.value;
            const jsonKeys = ['items', 'navItems', 'quickLinks', 'socialLinks'];
            if (jsonKeys.includes(field.key)) { try { onChange(JSON.parse(text)); } catch { onChange(text); } }
            else onChange(text);
          }} />
        {field.helpText ? <p className="mt-1.5 text-xs leading-5 text-gray-500 dark:text-gray-400">{field.helpText}</p> : null}
      </div>
    );
  }

  if (field.type === 'select') {
    return (
      <div>
        {label}
        <select className={fieldControlClass} value={String(value ?? field.defaultValue ?? '')} onChange={event => onChange(event.target.value)}>
          {(field.options ?? []).map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        {field.helpText ? <p className="mt-1.5 text-xs leading-5 text-gray-500 dark:text-gray-400">{field.helpText}</p> : null}
      </div>
    );
  }

  if (field.type === 'boolean') {
    return (
      <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        <span>{field.label}</span>
        <input className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600" type="checkbox" checked={Boolean(value)} onChange={event => onChange(event.target.checked)} />
      </label>
    );
  }

  if (field.type === 'color') {
    return (
      <div>
        {label}
        <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-1.5 focus-within:ring-3 focus-within:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900">
          <input className="h-9 w-11 cursor-pointer rounded-md border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800" type="color"
            value={String(value ?? field.defaultValue ?? '#ffffff')} onChange={event => onChange(event.target.value)} />
          <input className="min-w-0 flex-1 border-0 bg-transparent px-2 text-sm font-medium outline-none text-gray-800 dark:text-white/90"
            value={String(value ?? field.defaultValue ?? '')} onChange={event => onChange(event.target.value)} />
        </div>
      </div>
    );
  }

  return (
    <div>
      {label}
      <input className={fieldControlClass}
        type={field.type === 'number' ? 'number' : field.type === 'url' || field.type === 'image' ? 'url' : 'text'}
        value={String(value ?? field.defaultValue ?? '')} placeholder={field.placeholder}
        min={field.min} max={field.max}
        onChange={event => onChange(field.type === 'number' ? Number(event.target.value) : event.target.value)} />
      {field.helpText ? <p className="mt-1.5 text-xs leading-5 text-gray-500 dark:text-gray-400">{field.helpText}</p> : null}
    </div>
  );
}
