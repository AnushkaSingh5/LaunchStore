import styles from './Toggle.module.css';

export default function Toggle({ label, description, checked, onChange }) {
  return (
    <div className={styles.toggleGroup}>
      <div className={styles.textContainer}>
        {label && <div className={styles.label}>{label}</div>}
        {description && <div className={styles.description}>{description}</div>}
      </div>
      <label className={styles.switch}>
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={(e) => onChange(e.target.checked)} 
        />
        <span className={styles.slider}></span>
      </label>
    </div>
  );
}
