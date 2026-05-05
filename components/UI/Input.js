import styles from './Input.module.css';

export default function Input({ label, type = 'text', value, onChange, placeholder, required, disabled }) {
  return (
    <div className={styles.inputGroup}>
      {label && <label className={styles.label}>{label} {required && '*'}</label>}
      {type === 'textarea' ? (
        <textarea
          className={styles.input}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows="4"
        />
      ) : (
        <input
          type={type}
          className={styles.input}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
        />
      )}
    </div>
  );
}
