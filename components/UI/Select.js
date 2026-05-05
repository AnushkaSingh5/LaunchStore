import styles from './Select.module.css';

export default function Select({ label, value, onChange, options, required, disabled }) {
  return (
    <div className={styles.selectGroup}>
      {label && <label className={styles.label}>{label} {required && '*'}</label>}
      <div className={styles.selectWrapper}>
        <select
          className={styles.select}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
        >
          {options.map((opt, i) => (
            <option key={i} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className={styles.chevron}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </div>
    </div>
  );
}
