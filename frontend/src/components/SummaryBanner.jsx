import React from 'react';
import { Sparkles, Activity } from 'lucide-react';
import styles from './SummaryBanner.module.css';

/**
 * SummaryBanner
 * Displays the AI-generated overall report summary and computed parameter stats.
 *
 * Props:
 *  summary: string
 *  parameters: Array<{ status: 'low' | 'normal' | 'high' }>
 */
export default function SummaryBanner({ summary, parameters = [] }) {
  const totalCount = parameters.length;
  const outOfRangeCount = parameters.filter(
    (p) => p.status && (p.status.toLowerCase() === 'low' || p.status.toLowerCase() === 'high')
  ).length;

  const statText =
    outOfRangeCount === 0
      ? `${totalCount} parameter${totalCount === 1 ? '' : 's'} checked · All within typical range`
      : `${totalCount} parameter${totalCount === 1 ? '' : 's'} checked · ${outOfRangeCount} outside range`;

  return (
    <div className={styles.bannerCard}>
      <div className={styles.topRow}>
        <div className={styles.iconTile}>
          <Sparkles size={20} />
        </div>
        <div className={styles.titleBlock}>
          <span className={styles.eyebrow}>AI Summary</span>
          <p className={styles.summaryText}>{summary}</p>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.statRow}>
        <Activity size={16} className={styles.statIcon} />
        <span className={styles.statText}>{statText}</span>
      </div>
    </div>
  );
}
