import styles from './Features.module.css';

export default function FeatureCard({ icon, title, description }) {
  return (
    <div className={`${styles.card} dashboard-card`}>
      <div className={styles.iconWrapper}>
        {icon}
      </div>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardDescription}>{description}</p>
    </div>
  );
}
