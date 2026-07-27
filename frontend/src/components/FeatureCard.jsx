import React from 'react';
import styles from './FeatureCard.module.css';

export default function FeatureCard({ icon: Icon, title, description, className = '' }) {
  return (
    <div className={`${styles.card} ${className}`}>
      {Icon && (
        <div className={styles.iconTile}>
          <Icon size={22} />
        </div>
      )}
      <div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  );
}
