import React, { useEffect, useState } from 'react';
import { FileText, X } from 'lucide-react';
import styles from './FilePreview.module.css';

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FilePreview({ file, onRemove }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const isImage = file?.type?.startsWith('image/');

  useEffect(() => {
    if (!file || !isImage) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, isImage]);

  if (!file) return null;

  return (
    <div className={styles.previewCard}>
      {/* Left: thumbnail or icon */}
      <div className={styles.previewLeft}>
        {isImage && previewUrl ? (
          <img
            src={previewUrl}
            alt="Report preview"
            className={styles.thumbnail}
          />
        ) : (
          <div className={styles.pdfIconTile}>
            <FileText size={24} strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Middle: filename + size */}
      <div className={styles.previewMeta}>
        <span className={styles.fileName}>{file.name}</span>
        <span className={styles.fileSize}>{formatBytes(file.size)}</span>
      </div>

      {/* Right: remove button — hidden while uploading or after success */}
      {onRemove && (
        <button
          className={styles.removeButton}
          onClick={onRemove}
          aria-label="Remove selected file"
          type="button"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
