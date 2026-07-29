import React from 'react';
import styles from './ParameterCard.module.css';

/**
 * ParameterCard
 * Renders an individual blood test parameter result.
 *
 * Props:
 *  parameter: {
 *    name: string,
 *    abbreviation?: string,
 *    value: number | string,
 *    unit: string,
 *    referenceRange?: string,
 *    status: 'low' | 'normal' | 'high',
 *    explanation: string
 *  }
 */
export default function ParameterCard({ parameter }) {
  if (!parameter) return null;

  const {
    name,
    abbreviation,
    value,
    unit,
    referenceRange,
    status = 'normal',
    explanation,
  } = parameter;

  const normalizedStatus = (status || 'normal').toLowerCase();
  const isOutOfRange = normalizedStatus === 'low' || normalizedStatus === 'high';

  // Capitalize status for pill label
  const statusLabel =
    normalizedStatus === 'low'
      ? 'Low'
      : normalizedStatus === 'high'
      ? 'High'
      : normalizedStatus === 'unknown'
      ? 'Unknown'
      : 'Normal';

  const pillClass =
    isOutOfRange
      ? styles.pillAmber
      : normalizedStatus === 'unknown'
      ? styles.pillMuted
      : styles.pillGreen;

  return (
    <div
      className={`${styles.card} ${isOutOfRange ? styles.outOfRangeCard : ''}`}
      style={{
        borderLeftColor: isOutOfRange
          ? 'var(--color-danger)'
          : 'transparent',
      }}
    >
      {/* Top Header Row */}
      <div className={styles.headerRow}>
        <div className={styles.nameBlock}>
          <h3 className={styles.parameterName}>
            {name}
            {abbreviation && (
              <span className={styles.abbreviation}> ({abbreviation})</span>
            )}
          </h3>
        </div>

        {/* Status Pill */}
        <span className={`${styles.statusPill} ${pillClass}`}>
          {statusLabel}
        </span>
      </div>

      {/* Value & Reference Range Row */}
      <div className={styles.valueRow}>
        <span className={styles.valueMono}>
          {value} {unit}
        </span>
        {referenceRange && (
          <span className={styles.referenceRange}>
            Typical range: {referenceRange} {unit}
            {parameter.referenceSource === 'standard' && ' (standard range)'}
          </span>
        )}
      </div>

      {/* Educational Explanation */}
      {explanation && <p className={styles.explanation}>{explanation}</p>}
    </div>
  );
}
