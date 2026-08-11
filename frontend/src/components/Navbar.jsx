import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Droplet, ArrowRight, Menu, X, LogOut, User } from 'lucide-react';
import Button from './Button';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Re-read auth state whenever the route changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('user');
    if (token && stored) {
      try { setUser(JSON.parse(stored)); } catch { setUser({}); }
    } else {
      setUser(null);
    }
  }, [location]);

  const toggleMobile = () => setMobileOpen(prev => !prev);
  const closeMobile = () => setMobileOpen(false);

  const handleUploadClick = () => {
    closeMobile();
    navigate(user ? '/upload' : '/login');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    closeMobile();
    navigate('/');
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
            {!user && (
              <>
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
              </>
            )}
            {user && (
              <li>
                <span className={styles.navLink} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'default', opacity: 0.8 }}>
                  <User size={15} />
                  {user.name || user.email || 'Account'}
                </span>
              </li>
            )}
          </ul>
        </nav>

        <div className={styles.navActions}>
          <div className={styles.desktopOnly} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {user ? (
              <>
                <Button variant="primary" icon={ArrowRight} onClick={handleUploadClick}>
                  Upload report
                </Button>
                <Button variant="ghost" icon={LogOut} onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Button variant="primary" icon={ArrowRight} onClick={handleUploadClick}>
                Upload report
              </Button>
            )}
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
            {!user && (
              <>
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
              </>
            )}
          </ul>
          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Button variant="primary" icon={ArrowRight} fullWidth onClick={handleUploadClick}>
                Upload report
              </Button>
              <Button variant="ghost" icon={LogOut} fullWidth onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <Button variant="primary" icon={ArrowRight} fullWidth onClick={handleUploadClick}>
              Upload report
            </Button>
          )}
        </div>
      )}
    </header>
  );
}
