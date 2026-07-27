import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topRow}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoIcon}>
              <Droplet size={22} fill="currentColor" />
            </span>
            <span>VitalRead</span>
          </Link>
          <ul className={styles.links}>
            <li><a href="#about" className={styles.link}>About</a></li>
            <li><a href="#privacy" className={styles.link}>Privacy policy</a></li>
            <li><a href="#contact" className={styles.link}>Contact</a></li>
            <li><a href="https://github.com" target="_blank" rel="noreferrer" className={styles.link}>GitHub</a></li>
          </ul>
        </div>

        <div className={styles.disclaimerBox}>
          <p className={styles.disclaimerText}>
            Educational Disclaimer: VitalRead is an AI-assisted analysis tool designed exclusively for educational and informational purposes. It does not provide medical diagnosis, treatment recommendations, or clinical advice. Always bring your raw blood test reports to a licensed healthcare professional for medical evaluation.
          </p>
          <span className={styles.copyright}>
            &copy; {currentYear} VitalRead. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
