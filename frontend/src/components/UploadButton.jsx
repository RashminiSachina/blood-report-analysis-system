import React from 'react';
import { UploadCloud, ArrowRight } from 'lucide-react';
import Button from './Button';
import styles from './UploadButton.module.css';

/**
 * UploadButton
 * Thin wrapper around Button that overlays a progress bar while uploading.
 * When the action is done it shifts to show a "Continue" button (passed as onContinue).
 *
 * Props:
 *  stage       — 'idle' | 'uploading' | 'success'
 *  progress    — 0-100 (used when stage === 'uploading')
 *  disabled    — whether the button is disabled (no file selected)
 *  onUpload    — called when the primary button is clicked
 *  onContinue  — called when the Continue button (success state) is clicked
 */
export default function UploadButton({
  stage = 'idle',
  progress = 0,
  disabled = false,
  onUpload,
  onContinue,
}) {
  if (stage === 'uploading') {
    return (
      <div className={styles.uploadingWrapper}>
        <div className={styles.uploadingTop}>
          <span className={styles.uploadingLabel}>Uploading…</span>
          <span className={styles.uploadingPct}>{progress}%</span>
        </div>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="primary"
      size="lg"
      fullWidth
      disabled={disabled}
      onClick={stage === 'success' ? onContinue : onUpload}
      icon={stage === 'success' ? ArrowRight : UploadCloud}
      iconPosition="right"
    >
      {stage === 'success' ? 'Continue' : 'Upload report'}
    </Button>
  );
}
