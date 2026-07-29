import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Info, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';
import ParameterCard from '../components/ParameterCard';
import SummaryBanner from '../components/SummaryBanner';
import Button from '../components/Button';
import styles from './AnalysisResults.module.css';

const API_BASE_URL = 'http://localhost:5000';
const MIN_LOADING_TIME_MS = 2500;

export default function AnalysisResults() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/${id}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      // Guarantee minimum perceived loading time for UX
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_LOADING_TIME_MS - elapsedTime);
      await new Promise((resolve) => setTimeout(resolve, remainingTime));

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'We could not analyze this report. Please try uploading again.');
      }

      setData(result);
    } catch (err) {
      console.error('[AnalysisResults] Error fetching analysis:', err);
      // Guarantee minimum perceived loading time even on error
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_LOADING_TIME_MS - elapsedTime);
      await new Promise((resolve) => setTimeout(resolve, remainingTime));

      setError(err.message || 'Analysis is temporarily unavailable, please try again');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAnalysis();
    }
  }, [id]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loadingCard}>
            <div className={styles.loadingIconTile}>
              <Loader2 size={32} className={styles.spinner} />
            </div>
            <h2 className={styles.loadingTitle}>Reading your report…</h2>
            <p className={styles.loadingSubtext}>
              Extracting parameters, comparing reference ranges, and generating clear explanations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorCard}>
            <div className={styles.errorIconTile}>
              <AlertTriangle size={28} />
            </div>
            <h2 className={styles.errorTitle}>Analysis notice</h2>
            <p className={styles.errorSubtext}>{error}</p>
            <div className={styles.errorActions}>
              <Button variant="secondary" icon={RotateCcw} onClick={fetchAnalysis}>
                Try again
              </Button>
              <Button variant="primary" icon={ArrowRight} onClick={() => navigate('/upload')}>
                Upload another report
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────────
  const summary = data?.summary || 'Report analysis complete.';
  const parameters = data?.parameters || [];
  const disclaimer =
    data?.disclaimer ||
    'This is an educational summary, not a medical diagnosis. Always discuss your results with a qualified healthcare professional.';

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div className={styles.header}>
          <h1 className={styles.heading}>Your report, explained</h1>
          <p className={styles.subheading}>
            Generated from your uploaded report. Educational only — not a diagnosis.
          </p>
        </div>

        {/* ── AI Overall Summary Banner ─────────────────────────────── */}
        <SummaryBanner summary={summary} parameters={parameters} />

        {/* ── Parameter Cards List ────────────────────────────────────── */}
        <div className={styles.parameterSection}>
          <h2 className={styles.sectionTitle}>Lab Parameters</h2>
          <div className={styles.parameterList}>
            {parameters.length > 0 ? (
              parameters.map((param, idx) => (
                <ParameterCard key={param.name || idx} parameter={param} />
              ))
            ) : (
              <p className={styles.emptyText}>No blood parameters were detected in this report.</p>
            )}
          </div>
        </div>

        {/* ── Disclaimer Banner ───────────────────────────────────────── */}
        <div className={styles.disclaimerCard}>
          <Info size={20} className={styles.disclaimerIcon} />
          <p className={styles.disclaimerText}>{disclaimer}</p>
        </div>

        {/* ── Bottom Action ───────────────────────────────────────────── */}
        <div className={styles.bottomActions}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            icon={ArrowRight}
            onClick={() => navigate('/upload')}
          >
            Upload another report
          </Button>
        </div>

      </div>
    </div>
  );
}
