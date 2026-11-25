import { useId, useRef, useState, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { HcIcon } from '../display/HcIcon';

/** UI-22 / UI-23b: document/photo upload control with size check and file list preview. NM-0189. */
export type HcUploadedFile = {
  name: string;
  sizeBytes: number;
};

type HcFileUploadProps = {
  label: string;
  files: HcUploadedFile[];
  onFilesAdd: (added: File[]) => void;
  onFileRemove?: (index: number) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;
  required?: boolean;
  hint?: string;
  error?: string;
  disabled?: boolean;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function HcFileUpload({
  label,
  files,
  onFilesAdd,
  onFileRemove,
  accept,
  multiple = false,
  maxSizeMb = 10,
  required,
  hint,
  error,
  disabled = false,
}: HcFileUploadProps) {
  const { t } = useTranslation();
  const id = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const acceptFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const valid = Array.from(list).filter((f) => f.size <= maxSizeMb * 1024 * 1024);
    if (valid.length > 0) onFilesAdd(valid);
  };

  const handleDrop = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDragging(false);
    if (!disabled) acceptFiles(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-col gap-hc-xs">
      <label htmlFor={id} className="text-hc-body font-semibold text-hc-text-primary">
        {label}
        {required && (
          <span className="ml-hc-xs text-hc-danger" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          acceptFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex min-h-28 cursor-pointer flex-col items-center justify-center gap-hc-xs rounded-hc-md border border-dashed p-hc-md text-center transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          dragging
            ? 'border-hc-primary bg-hc-primary-subtle'
            : error
              ? 'border-hc-danger bg-hc-danger-subtle'
              : 'border-hc-border bg-hc-surface hover:border-hc-primary hover:bg-hc-primary-subtle'
        }`}
      >
        <HcIcon name="cloud_upload" className="text-hc-primary" />
        <span className="text-hc-body font-semibold text-hc-text-primary">{t('ui.fileDropHint')}</span>
        <span className="text-hc-caption text-hc-text-secondary">
          {accept ? `${accept} · ` : ''}
          {t('ui.fileMaxSize', { size: maxSizeMb })}
        </span>
      </button>

      {files.length > 0 && (
        <ul className="flex flex-col gap-hc-xs pt-hc-xs">
          {files.map((file, idx) => (
            <li
              key={`${file.name}-${idx}`}
              className="flex min-h-hc-touch items-center justify-between gap-hc-sm rounded-hc-sm border border-hc-border bg-hc-surface px-hc-ms py-hc-xs"
            >
              <div className="flex min-w-0 items-center gap-hc-sm">
                <HcIcon name="description" dense className="text-hc-primary" />
                <span className="truncate text-hc-body text-hc-text-primary">{file.name}</span>
                <span className="hc-tabular shrink-0 text-hc-caption text-hc-text-secondary">
                  {formatFileSize(file.sizeBytes)}
                </span>
              </div>
              {onFileRemove && (
                <button
                  type="button"
                  aria-label={`${t('ui.removeFile')} ${file.name}`}
                  onClick={() => onFileRemove(idx)}
                  className="flex size-hc-touch shrink-0 cursor-pointer items-center justify-center rounded-hc-sm text-hc-text-secondary hover:bg-hc-danger-subtle hover:text-hc-danger"
                >
                  <HcIcon name="close" dense />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="text-hc-caption font-semibold text-hc-danger">
          {error}
        </p>
      )}
      {hint && !error && <p className="text-hc-caption text-hc-text-secondary">{hint}</p>}
    </div>
  );
}
