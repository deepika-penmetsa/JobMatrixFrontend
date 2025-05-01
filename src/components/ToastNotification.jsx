import { useEffect } from "react";
import styles from "../styles/ToastNotification.module.css";

const ToastNotification = ({ message, type = "success", onClose, style }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Define type configurations
  const typeConfig = {
    success: {
      icon: (
        <svg className={styles.icon} viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      ),
      className: styles.success
    },
    error: {
      icon: (
        <svg className={styles.icon} viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
      ),
      className: styles.error
    },
    warning: {
      icon: (
        <svg className={styles.icon} viewBox="0 0 24 24">
          <path d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z" />
        </svg>
      ),
      className: styles.warning
    },
    info: {
      icon: (
        <svg className={styles.icon} viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
        </svg>
      ),
      className: styles.info
    }
  };

  const { icon, className } = typeConfig[type] || typeConfig.success;

  return (
    <div 
      className={`${styles.toastContainer} ${className}`}
      style={style}
    >
      <div className={styles.toastContent}>
        {icon}
        <span>{message}</span>
        <button 
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;