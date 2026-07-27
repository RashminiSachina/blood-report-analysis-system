import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Activity,
  BookOpen,
  Clock,
  UploadCloud,
  FileSearch,
  Sliders,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import Button from '../components/Button';
import FeatureCard from '../components/FeatureCard';
import styles from './Home.module.css';

export default function Home() {
  const navigate = useNavigate();

  const handleUploadClick = () => {
    const el = document.getElementById('upload-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/register');
    }
  };

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={`${styles.container} ${styles.heroSection}`} id="upload-section">
        <div className={styles.heroGrid}>
          {/* Left Hero Column */}
          <div className={styles.heroLeft}>
            <div className={styles.eyebrow}>
              <Sparkles size={16} />
              <span>AI-assisted report reading</span>
            </div>
            <h1 className={styles.heroTitle}>
              Understand your blood test results with confidence
            </h1>
            <p className={styles.heroSubtitle}>
              Upload your blood report and receive clear, easy-to-understand explanations for every parameter. Built to educate, not to diagnose — always bring your results to a healthcare professional.
            </p>
            <div className={styles.heroActions}>
              <Button variant="primary" icon={ArrowRight} onClick={() => navigate('/register')}>
                Upload report
              </Button>
              <Button variant="ghost" onClick={() => {
                const el = document.getElementById('how-it-works');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}>
                Learn more
              </Button>
            </div>
          </div>

          {/* Right Hero Column: Signature Demo Transformation Card */}
          <div className={styles.previewCard}>
            <div className={styles.previewHeader}>
              <span className={styles.previewTitle}>Live Analysis Preview</span>
              <span className={styles.previewBadge}>Sample Output</span>
            </div>

            {/* Main Highlighted Lab Value Card */}
            <div className={styles.labMainCard}>
              <div className={styles.labMainHeader}>
                <div className={styles.labValueRow}>
                  <span className={styles.labValueMono}>HGB 11.2 g/dL</span>
                  <span className={styles.labArrow}>
                    <ArrowRight size={16} />
                  </span>
                </div>
                <span className={styles.statusPillAmber}>
                  <AlertTriangle size={14} />
                  Below range
                </span>
              </div>
              <p className={styles.labExplanation}>
                Hemoglobin is slightly lower than the standard reference range (12.0–15.5 g/dL). This protein carries oxygen throughout your body and lower levels can indicate mild anemia.
              </p>
            </div>

            {/* Secondary In-Range Parameters */}
            <div className={styles.inRangeList}>
              <span className={styles.inRangeTitle}>Other Extracted Parameters</span>
              
              <div className={styles.inRangeItem}>
                <div className={styles.inRangeLeft}>
                  <span className={styles.checkIcon}>
                    <CheckCircle2 size={18} />
                  </span>
                  <span className={styles.inRangeMono}>WBC 6.4 x10^3 / µL</span>
                </div>
                <span className={styles.inRangeDesc}>Normal immune cell count</span>
              </div>

              <div className={styles.inRangeItem}>
                <div className={styles.inRangeLeft}>
                  <span className={styles.checkIcon}>
                    <CheckCircle2 size={18} />
                  </span>
                  <span className={styles.inRangeMono}>PLT 240 x10^3 / µL</span>
                </div>
                <span className={styles.inRangeDesc}>Normal platelet count</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.container}>
        <div className={styles.featuresSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Designed for clarity and peace of mind</h2>
            <p className={styles.sectionSubtitle}>
              Transform obscure medical lab tables into structured, readable insights.
            </p>
          </div>

          <div className={styles.featuresGrid}>
            <FeatureCard
              icon={ShieldCheck}
              title="Secure upload"
              description="Upload reports safely with privacy-first client processing and encrypted storage."
            />
            <FeatureCard
              icon={Activity}
              title="Parameter analysis"
              description="Instant breakdown of key blood markers, cell counts, and metabolic lab metrics."
            />
            <FeatureCard
              icon={BookOpen}
              title="Easy explanations"
              description="Translates complex medical terminology and reference ranges into plain language."
            />
            <FeatureCard
              icon={Clock}
              title="Report history"
              description="Track changes and trend lines across historical lab reports effortlessly."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.container} id="how-it-works">
        <div className={styles.howItWorksSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>How it works</h2>
            <p className={styles.sectionSubtitle}>
              Four simple steps from raw PDF lab report to plain-language explanation.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepIconTile}>
                <UploadCloud size={24} />
              </div>
              <span className={styles.stepLabel}>Step 1</span>
              <h3 className={styles.stepTitle}>Upload blood report</h3>
              <p className={styles.stepDesc}>
                Select or drop your blood test PDF or image report into the secure portal.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepIconTile}>
                <FileSearch size={24} />
              </div>
              <span className={styles.stepLabel}>Step 2</span>
              <h3 className={styles.stepTitle}>Extract parameters</h3>
              <p className={styles.stepDesc}>
                AI identifies numerical values, test names, and standard reference ranges.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepIconTile}>
                <Sliders size={24} />
              </div>
              <span className={styles.stepLabel}>Step 3</span>
              <h3 className={styles.stepTitle}>Compare reference ranges</h3>
              <p className={styles.stepDesc}>
                Evaluates parameters against standard population benchmarks.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepIconTile}>
                <CheckCircle2 size={24} />
              </div>
              <span className={styles.stepLabel}>Step 4</span>
              <h3 className={styles.stepTitle}>Get plain-language notes</h3>
              <p className={styles.stepDesc}>
                Review educational summaries prepared to bring to your physician.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA Section */}
      <section className={styles.container}>
        <div className={styles.ctaCard}>
          <h2 className={styles.ctaTitle}>Ready to understand your last report?</h2>
          <p className={styles.ctaSubtitle}>
            Take control of your lab results before your next doctor appointment.
          </p>
          <div className={styles.ctaButton}>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/register')}
            >
              Get started
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
