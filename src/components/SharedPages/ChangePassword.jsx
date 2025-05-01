import React, { useState, useEffect, useRef } from 'react';
import { changePassword } from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { FiLock, FiArrowLeft } from "react-icons/fi";
import { MdPassword } from "react-icons/md";
import { VscEye, VscEyeClosed } from "react-icons/vsc";
import { IoCheckmarkCircle } from "react-icons/io5";
import styles from '../../styles/ChangePassword.module.css';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(15);
  const [isFocused, setIsFocused] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  
  const redirectTimerRef = useRef(null);
  const navigate = useNavigate();

  // Handle redirect countdown timer
  useEffect(() => {
    if (success && redirectCountdown > 0) {
      redirectTimerRef.current = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);
    }
    if (redirectCountdown === 0 && success) {
      navigate('/login');
    }
    return () => clearTimeout(redirectTimerRef.current);
  }, [redirectCountdown, success, navigate]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      if (response.error) throw new Error(response.message || 'Failed to change password');

      setSuccess(true);
      setRedirectCountdown(15);
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <button 
          onClick={() => navigate(-1)} 
          className={styles.backButton}
        >
          <FiArrowLeft className={styles.backIcon} />
          Back to Profile
        </button>

        <h2 className={styles.title}>Change Password</h2>
        <p className={styles.subtitle}>Secure your account with a new password</p>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        {!success ? (
          <form onSubmit={handleChangePassword} className={styles.form}>
            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  onFocus={() => setIsFocused({...isFocused, currentPassword: true})}
                  onBlur={() => setIsFocused({...isFocused, currentPassword: !!currentPassword})}
                  required
                  className={styles.input}
                />
                <label 
                  htmlFor="currentPassword" 
                  className={`${styles.floatingLabel} ${
                    isFocused.currentPassword || currentPassword ? styles.focused : ''
                  }`}
                >
                  Current Password
                </label>
                <FiLock className={styles.inputIcon} />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className={styles.passwordToggle}
                  aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                >
                  {showCurrentPassword ? 
                    <VscEyeClosed className={styles.eyeIcon} /> : 
                    <VscEye className={styles.eyeIcon} />
                  }
                </button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onFocus={() => setIsFocused({...isFocused, newPassword: true})}
                  onBlur={() => setIsFocused({...isFocused, newPassword: !!newPassword})}
                  required
                  minLength="8"
                  className={styles.input}
                />
                <label 
                  htmlFor="newPassword" 
                  className={`${styles.floatingLabel} ${
                    isFocused.newPassword || newPassword ? styles.focused : ''
                  }`}
                >
                  New Password
                </label>
                <MdPassword className={styles.inputIcon} />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className={styles.passwordToggle}
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? 
                    <VscEyeClosed className={styles.eyeIcon} /> : 
                    <VscEye className={styles.eyeIcon} />
                  }
                </button>
              </div>
              <p className={styles.hintText}>
                Password must be at least 8 characters long
              </p>
            </div>

            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setIsFocused({...isFocused, confirmPassword: true})}
                  onBlur={() => setIsFocused({...isFocused, confirmPassword: !!confirmPassword})}
                  required
                  className={styles.input}
                />
                <label 
                  htmlFor="confirmPassword" 
                  className={`${styles.floatingLabel} ${
                    isFocused.confirmPassword || confirmPassword ? styles.focused : ''
                  }`}
                >
                  Confirm New Password
                </label>
                <MdPassword className={styles.inputIcon} />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={styles.passwordToggle}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? 
                    <VscEyeClosed className={styles.eyeIcon} /> : 
                    <VscEye className={styles.eyeIcon} />
                  }
                </button>
              </div>
            </div>

            <div className={styles.forgotPassword}>
              <Link to="/forgot-password">Forgot your password?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.primaryButton}
            >
              {loading ? (
                <span className={styles.buttonContent}>
                  <span className={styles.spinner}></span>
                  Changing Password...
                </span>
              ) : 'Change Password'}
            </button>
          </form>
        ) : (
          <div className={styles.successContainer}>
            <IoCheckmarkCircle className={styles.successIcon} />
            <h3 className={styles.successTitle}>Password Changed Successfully!</h3>
            <p className={styles.successText}>
              Your password has been updated successfully. You'll be redirected in {redirectCountdown} seconds.
            </p>
            <button
              onClick={() => navigate('/login')}
              className={styles.returnButton}
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangePassword;