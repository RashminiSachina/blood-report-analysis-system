import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, FileText, ArrowRight, Loader2, AlertTriangle, Calendar } from 'lucide-react';
import Button from '../components/Button';
import styles from './History.module.css';

const API_BASE_URL = 'http://localhost:5000';

export default function History() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/reports/history`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch history');
        }

        setReports(data.reports || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <Loader2 size={32} className={styles.spinner} style={{ margin: '0 auto', color: 'var(--color-primary)' }} />
            <h2 className={styles.emptyTitle}>Loading your history...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <AlertTriangle size={32} style={{ margin: '0 auto', color: 'var(--color-error)' }} />
            <h2 className={styles.emptyTitle}>Oops! Something went wrong.</h2>
            <p className={styles.emptySubtext}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerTitleWrap}>
            <Clock size={28} className={styles.headerIcon} />
            <h1 className={styles.heading}>Report History</h1>
          </div>
          <p className={styles.subheading}>Review your previously analyzed blood reports and track your health journey over time.</p>
        </div>

        <div className={styles.content}>
          {reports.length === 0 ? (
            <div className={styles.emptyState}>
              <FileText size={48} className={styles.emptyIcon} />
              <h2 className={styles.emptyTitle}>No reports found</h2>
              <p className={styles.emptySubtext}>You haven't uploaded any blood reports yet. Analyze your first report to start building your history.</p>
              <Button variant="primary" onClick={() => navigate('/upload')}>
                Upload a Report
              </Button>
            </div>
          ) : (
            <div className={styles.grid}>
              {reports.map((report) => {
                const date = new Date(report.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });
                
                return (
                  <div key={report._id} className={styles.card}>
                    <div className={styles.cardHeader}>
                      <div className={styles.dateBadge}>
                        <Calendar size={14} />
                        <span>{date}</span>
                      </div>
                    </div>
                    
                    <h3 className={styles.fileName}>{report.originalFileName}</h3>
                    
                    <p className={styles.summaryText}>
                      {report.summary}
                    </p>
                    
                    <div className={styles.parameterPreview}>
                      <div className={styles.statBox}>
                        <span className={styles.statNumber}>{report.parameters.length}</span>
                        <span className={styles.statLabel}>Total Params</span>
                      </div>
                      <div className={styles.statBox}>
                        <span className={styles.statNumber}>
                          {report.parameters.filter(p => ['low', 'high'].includes(p.status)).length}
                        </span>
                        <span className={styles.statLabel}>Flags</span>
                      </div>
                    </div>

                    <div className={styles.cardFooter}>
                      <Button 
                        variant="secondary" 
                        fullWidth 
                        icon={ArrowRight}
                        onClick={() => navigate(`/results/${report.systemFileName}`)}
                      >
                        View Analysis
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
