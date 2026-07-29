import React, { useRef, useState, useCallback } from 'react';
import { UploadCloud, AlertTriangle } from 'lucide-react';
import Button from './Button';
import styles from './UploadBox.module.css';

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ACCEPTED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

function validateFile(file) {
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  const typeOk = ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXTENSIONS.includes(ext);
  if (!typeOk) return 'Invalid file format. Please upload a PDF, JPG, or PNG.';
  if (file.size > MAX_SIZE_BYTES) return 'File exceeds the 10 MB limit. Please choose a smaller file.';
  return null;
}

export default function UploadBox({ onFileSelect, onError }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback((files) => {
    const file = files?.[0];
    if (!file) return;
    const err = validateFile(file);
    if (err) {
      onError(err);
      return;
    }
    onError(null);
    onFileSelect(file);
  }, [onFileSelect, onError]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e) => {
    handleFiles(e.target.files);
    // reset so same file can be reselected
    e.target.value = '';
  };

  return (
    <div
      className={`${styles.dropZone} ${dragOver ? styles.dragOver : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="region"
      aria-label="File upload drop zone"
    >
      <div className={styles.iconTile}>
        <UploadCloud size={28} strokeWidth={1.5} />
      </div>

      <p className={styles.primaryText}>Drag and drop your report here</p>

      <div className={styles.divider}>
        <span className={styles.dividerLine} />
        <span className={styles.dividerLabel}>or</span>
        <span className={styles.dividerLine} />
      </div>

      <Button
        variant="secondary"
        size="md"
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        Choose file
      </Button>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className={styles.hiddenInput}
        onChange={handleInputChange}
        tabIndex={-1}
        aria-hidden="true"
      />

      <p className={styles.supportedText}>
        Supported: PDF, JPG, PNG · Max 10 MB
      </p>
    </div>
  );
}
