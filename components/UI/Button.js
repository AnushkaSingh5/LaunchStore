import styles from './Button.module.css';

export default function Button({ children, variant = 'primary', size = 'md', onClick, className = '', type = 'button', disabled }) {
  const btnClass = `${styles.button} ${styles[variant]} ${styles[size]} ${className}`;
  
  return (
    <button 
      type={type} 
      className={btnClass} 
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
