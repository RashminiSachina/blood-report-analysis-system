import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import UploadBox from '../components/UploadBox';
import FilePreview from '../components/FilePreview';
import UploadButton from '../components/UploadButton';
import styles from './UploadReport.module.css';

const API_BASE_URL = 'http://localhost:5000';

export default function UploadReport() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState('idle'); // 'idle' | 'fileSelected' | 'uploading' | 'success'
  const [progress, setProgress] = useState(0);
  const [uploadedReportId, setUploadedReportId] = useState(null);
  const intervalRef = useRef(null);

  // ── File selection ─────────────────────────────────────────────────────────
  const handleFileSelect = (selected) => {
    setFile(selected);
    setError(null);
    setStage('fileSelected');
  };

  const handleError = (msg) => {
    if (msg) {
      setError(msg);
      setFile(null);
      setStage('idle');
    } else {
      setError(null);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setError(null);
    setStage('idle');
    setProgress(0);
    setUploadedReportId(null);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  // ── Upload ──────────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file || stage === 'uploading') return;
    setStage('uploading');
    setProgress(0);
    setError(null);

    let current = 0;
    intervalRef.current = setInterval(() => {
      const step = Math.random() * 12 + 5;
      current = Math.min(current + step, 90);
      setProgress(Math.round(current));
    }, 120);

    try {
      const formData = new FormData();
      formData.append('report', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/reports/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await response.json();

      if (intervalRef.current) clearInterval(intervalRef.current);

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Upload failed. Please try again.');
      }

      setProgress(100);
      setUploadedReportId(data.reportId);

      setTimeout(() => {
        setStage('success');
      }, 300);
    } catch (err) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      console.error('[UploadReport] Upload error:', err);
      setError(err.message || 'Upload failed. Please check your connection and try again.');
      setStage('fileSelected');
      setProgress(0);
    }
  };

  // ── Continue ───────────────────────────────────────────────────────────────
  const handleContinue = () => {
    if (uploadedReportId) {
      navigate(`/results/${uploadedReportId}`);
    } else {
      navigate('/');
    }
  };

  const isFileStage = stage === 'fileSelected' || stage === 'uploading' || stage === 'success';

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* ── Header block ────────────────────────────────────────────── */}
        <div className={styles.header}>
          <div className={styles.eyebrow}>
            <UploadCloud size={15} strokeWidth={2} />
            <span>Step 1 of 4</span>
          </div>
          <h1 className={styles.heading}>Upload your blood report</h1>
          <p className={styles.subheading}>
            PDF or image, up to 10 MB. We only use it to extract your results — nothing is shared.
          </p>
        </div>

        {/* ── Upload card ──────────────────────────────────────────────── */}
        <div className={styles.card}>

          {/* Error banner */}
          {error && (
            <div className={styles.errorBanner} role="alert">
              <AlertTriangle size={16} className={styles.errorIcon} />
              <span className={styles.errorText}>{error}</span>
              <button
                className={styles.dismissButton}
                onClick={() => setError(null)}
                aria-label="Dismiss error"
                type="button"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Main content area: drop zone OR file preview */}
          {!isFileStage ? (
            <UploadBox onFileSelect={handleFileSelect} onError={handleError} />
          ) : (
            <div className={styles.fileArea}>
              <FilePreview
                file={file}
                onRemove={stage !== 'uploading' && stage !== 'success' ? handleRemove : undefined}
              />
            </div>
          )}

          {/* ── Success state ──────────────────────────────────────── */}
          {stage === 'success' && (
            <div className={styles.successBanner} role="status">
              <CheckCircle2 size={18} className={styles.successIcon} />
              <span className={styles.successText}>Report uploaded successfully</span>
            </div>
          )}

          {/* ── Divider before action ──────────────────────────────── */}
          {isFileStage && (
            <div className={styles.actionDivider} />
          )}

          {/* ── Primary action ─────────────────────────────────────── */}
          <UploadButton
            stage={stage === 'fileSelected' || stage === 'idle' ? 'idle' : stage}
            progress={progress}
            disabled={stage === 'idle'}
            onUpload={handleUpload}
            onContinue={handleContinue}
          />
        </div>

        {/* ── Reassurance footnote ────────────────────────────────────── */}
        <p className={styles.footnote}>
          Your report is processed securely and never stored beyond the current session without your consent.
        </p>
      </div>
    </div>
  );
}
