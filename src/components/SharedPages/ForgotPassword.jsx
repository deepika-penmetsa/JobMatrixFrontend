import React, { useState, useEffect, useRef } from 'react';
import { requestPasswordReset, verifyResetCode, resetPassword } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiArrowLeft } from "react-icons/fi";
import { VscEye, VscEyeClosed } from "react-icons/vsc";
import { IoArrowBack } from "react-icons/io5";
import { AiOutlineClockCircle } from "react-icons/ai";
import { IoCheckmarkCircle } from "react-icons/io5";
import styles from '../../styles/ForgotPassword.module.css';
import { MdPassword } from 'react-icons/md';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: new password, 4: success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [redirectCountdown, setRedirectCountdown] = useState(15);
  const [isFocused, setIsFocused] = useState({
    email: false,
    code: false,
    newPassword: false,
    confirmPassword: false
  });
  
  const timerRef = useRef(null);
  const redirectTimerRef = useRef(null);
  const navigate = useNavigate();

  // Handle timer for resend option
  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [countdown]);

  // Handle redirect countdown timer
  useEffect(() => {
    if (step === 4 && redirectCountdown > 0) {
      redirectTimerRef.current = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);
    }
    if (redirectCountdown === 0) {
      navigate('/login');
    }
    return () => clearTimeout(redirectTimerRef.current);
  }, [redirectCountdown, step, navigate]);

  const handleRequestReset = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await requestPasswordReset(email);
      if (response.error) throw new Error(response.message || 'Failed to send verification code');
      setStep(2);
      setSuccess(`Verification code sent to ${email}`);
      
      // Set initial countdown to 60 seconds (1 minute)
      setCountdown(60);
    } catch (err) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await verifyResetCode(email, code);
      if (response.error) throw new Error(response.message || 'Invalid verification code');
      setStep(3);
      setSuccess('Code verified. Please set your new password.');
    } catch (err) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await resetPassword(email, code, newPassword);
      if (response.error) throw new Error(response.message || 'Failed to reset password');
      setStep(4);
      setSuccess('Password reset successfully!');
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async (e) => {
    e.preventDefault();
    const attempts = resendAttempts + 1;
    setResendAttempts(attempts);
    
    // Set countdown based on attempts
    let newCountdown;
    if (attempts === 1) newCountdown = 120; // 2 minutes
    else if (attempts === 2) newCountdown = 300; // 5 minutes
    else if (attempts === 3) newCountdown = 600; // 10 minutes
    else if (attempts === 4) newCountdown = 900; // 15 minutes
    else {
      setError('Maximum code resend limit reached. Please try again later.');
      return;
    }
    
    setCountdown(newCountdown);
    await handleRequestReset();
    setSuccess('New verification code sent!');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setError('');
    setSuccess('');
    setCode('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>
          {step === 1 && 'Reset Your Password!'}
          {step === 2 && 'Enter Verification Code'}
          {step === 3 && 'Create New Password'}
          {step === 4 && ''}
        </h2>

        {success && (
          <div className={styles.successMessage}>
            {success}
          </div>
        )}

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={
          step === 1 ? handleRequestReset : 
          step === 2 ? handleVerifyCode : 
          step === 3 ? handleResetPassword : null
        }>
          {/* Step 1: Email input */}
          {step === 1 && (
            <>
              <div className={styles.navigationButtons}>
                <button 
                  onClick={() => navigate(-1)} 
                  className={styles.loginButton}
                >
                  <FiArrowLeft className={styles.loginIcon} />
                  Go Back
                </button>
              </div>

              <div className={styles.formGroup}>
              <p>Enter your email address to request a verification code</p>
              <div className={styles.inputWrapper}>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsFocused({...isFocused, email: true})}
                  onBlur={() => setIsFocused({...isFocused, email: !!email})}
                  required
                  className={styles.input}
                />
                <label 
                  htmlFor="email" 
                  className={`${styles.floatingLabel} ${
                    isFocused.email ? styles.focused : ''
                  }`}
                >
                  Email address
                </label>
                <FiMail className={styles.inputIcon} />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className={styles.primaryButton}
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </div>
            </>
            
          )}

          {/* Step 2: Verification code */}
          {step === 2 && (
            <div className={styles.formGroup}>
              <div className={styles.emailDisplayWrapper}>
              <span className={styles.currentEmail}>Code sent to: {email}</span>
                <button 
                  type="button"
                  onClick={handleBackToStep1}
                  className={styles.changeEmailButton}
                > 
                  Change email
                </button>
              </div>

              <div className={styles.inputWrapper}>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                  onFocus={() => setIsFocused({...isFocused, code: true})}
                  onBlur={() => setIsFocused({...isFocused, code: !!code})}
                  required
                  maxLength={6}
                  pattern="\d{6}"
                  className={styles.input}
                />
                <label 
                  htmlFor="code" 
                  className={`${styles.floatingLabel} ${
                    isFocused.code ? styles.focused : ''
                  }`}
                >
                  6-digit Verification Code
                </label>
                <FiLock className={styles.inputIcon} />
              </div>
              <p className={styles.hintText}>
                Check your email for the verification code
              </p>
              
              <button
                type="submit"
                disabled={loading}
                className={styles.primaryButton}
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
              
              <div className={styles.resendContainer}>
                {countdown > 0 ? (
                  <div className={styles.countdownText}>
                    <AiOutlineClockCircle className={styles.clockIcon} />
                    Resend available in {formatTime(countdown)}
                  </div>
                ) : (
                  <button
                    type='button'
                    onClick={handleResendCode}
                    disabled={loading || resendAttempts >= 5}
                    className={styles.secondaryButton}
                  >
                    Didn't receive a code? Resend
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 3: New password */}
          {step === 3 && (
            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
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
                    isFocused.newPassword ? styles.focused : ''
                  }`}
                >
                  New Password
                </label>
                <MdPassword className={styles.inputIcon} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                >
                  {showPassword ? 
                    <VscEyeClosed className={styles.eyeIcon} /> : 
                    <VscEye className={styles.eyeIcon} />
                  }
                </button>
              </div>
              <p className={styles.hintText}>
                Password must be at least 8 characters long
              </p>
              
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
                    isFocused.confirmPassword ? styles.focused : ''
                  }`}
                >
                  Confirm New Password
                </label>
                <MdPassword className={styles.inputIcon} />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={styles.passwordToggle}
                >
                  {showConfirmPassword ? 
                    <VscEyeClosed className={styles.eyeIcon} /> : 
                    <VscEye className={styles.eyeIcon} />
                  }
                </button>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className={styles.primaryButton}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          )}

          {/* Step 4: Success message */}
          {step === 4 && (
            <div className={styles.successContainer}>
              <IoCheckmarkCircle className={styles.successIcon} />
              <p className={styles.successTitle}>
                Password reset successfully!
              </p>
              <p className={styles.successText}>
                You can now login with your new password.
              </p>
              <div className={styles.redirectText}>
                Redirecting to login page in {redirectCountdown} seconds
              </div>
              <a
                href="/login"
                className={styles.returnButton}
              >
                <IoArrowBack className={styles.returnIcon} />
                Return to Login
              </a>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;