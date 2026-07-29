import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Droplet, ArrowRight, Menu, X } from 'lucide-react';
import Button from './Button';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMobile = () => setMobileOpen(prev => !prev);
  const closeMobile = () => setMobileOpen(false);

  const handleUploadClick = () => {
    closeMobile();
    navigate('/upload');
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo} onClick={closeMobile}>
          <span className={styles.logoIcon}>
            <Droplet size={26} fill="currentColor" />
          </span>
          <span>VitalRead</span>
        </Link>

        <nav>
          <ul className={styles.navLinks}>
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}
                end
              >
                Home
              </NavLink>
            </li>
            <li>
              <a href="#about" className={styles.navLink}>
                About
              </a>
            </li>
            <li>
              <NavLink
                to="/login"
                className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}
              >
                Login
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/register"
                className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink}
              >
                Register
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className={styles.navActions}>
          <div className={styles.desktopOnly}>
            <Button variant="primary" icon={ArrowRight} onClick={handleUploadClick}>
              Upload report
            </Button>
          </div>
          <button
            className={styles.menuButton}
            onClick={toggleMobile}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className={`${styles.mobileDrawer} ${styles.mobileDrawerOpen}`}>
          <ul className={styles.mobileNavLinks}>
            <li>
              <Link to="/" className={styles.mobileNavLink} onClick={closeMobile}>
                Home
              </Link>
            </li>
            <li>
              <a href="#about" className={styles.mobileNavLink} onClick={closeMobile}>
                About
              </a>
            </li>
            <li>
              <Link to="/login" className={styles.mobileNavLink} onClick={closeMobile}>
                Login
              </Link>
            </li>
            <li>
              <Link to="/register" className={styles.mobileNavLink} onClick={closeMobile}>
                Register
              </Link>
            </li>
          </ul>
          <Button variant="primary" icon={ArrowRight} fullWidth onClick={handleUploadClick}>
            Upload report
          </Button>
        </div>
      )}
    </header>
  );
}
