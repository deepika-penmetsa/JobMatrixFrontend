import React, { useState, useRef, useEffect } from 'react';
import { FiLock, FiX } from "react-icons/fi";
import { VscEye, VscEyeClosed, VscGistSecret } from "react-icons/vsc";
import {IoCheckmarkCircle, IoKeySharp} from "react-icons/io5";
import { MdPassword } from "react-icons/md";
import { updateCompanyDetails } from '../../../services/api';
import styles from '../../../styles/CompanySecretModal.module.css';
import {LuEraser} from "react-icons/lu";

const CompanySecretModal = ({ isOpen, onClose, showToast }) => {
    const [currentSecret, setCurrentSecret] = useState('');
    const [newSecret, setNewSecret] = useState('');
    const [confirmSecret, setConfirmSecret] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showCurrentSecret, setShowCurrentSecret] = useState(false);
    const [showNewSecret, setShowNewSecret] = useState(false);
    const [showConfirmSecret, setShowConfirmSecret] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [isFocused, setIsFocused] = useState({
        currentSecret: false,
        newSecret: false,
        confirmSecret: false
    });
    const resetModalState = () => {
        setCurrentSecret('');
        setNewSecret('');
        setConfirmSecret('');
        setLoading(false);
        setError('');
        setSuccess(false);
        setShowCurrentSecret(false);
        setShowNewSecret(false);
        setShowConfirmSecret(false);
        setShowTooltip(false);
        setIsFocused({
            currentSecret: false,
            newSecret: false,
            confirmSecret: false
        });
    };

    useEffect(() => {
        if (!isOpen) {
            resetModalState();
        }
    }, [isOpen]);
    const modalRef = useRef(null);
    const tooltipTimeoutRef = useRef(null);

    const handleClickOutside = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            resetModalState();
            onClose();
        }
    };

    const handleChangeSecret = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        if (newSecret !== confirmSecret) {
            setError('New secret and confirm secret do not match');
            setLoading(false);
            return;
        }

        try {
            // Using the existing updateCompanyDetails function with the correct payload
            const formData = new FormData();
            formData.append('current_company_secret_key', currentSecret);
            formData.append('new_company_secret_key', newSecret);

            const response = await updateCompanyDetails(formData);

            if (response.error) {
                throw new Error(response.error.message || 'Failed to change company secret');
            }

            setSuccess(true);
            if (showToast) {
                showToast("Company secret updated successfully");
            }
            setTimeout(() => {
                onClose();
            }, 3000);
        } catch (error) {
            console.error("Error updating company secret:", error);
            const errorMessage =
                error?.response?.data?.error?.message ||
                error?.response?.data?.message ||
                error?.message ||
                "Failed to update company secret";

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotSecretHover = () => {
        setShowTooltip(true);
        tooltipTimeoutRef.current = setTimeout(() => {
            setShowTooltip(false);
        }, 3000);
    };

    if (!isOpen) return null;






    return (
        <div className={styles.modalOverlay} onClick={handleClickOutside}>
            <div className={styles.modal} ref={modalRef}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>
                        <VscGistSecret className={styles.modalIcon} />
                        Change Company Secret
                    </h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                <div className={styles.modalContent}>
                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    {!success ? (
                        <form onSubmit={handleChangeSecret} className={styles.form}>
                            <div className={styles.formGroup}>
                                <div className={styles.inputWrapper}>
                                    <input
                                        id="currentSecret"
                                        type={showCurrentSecret ? "text" : "password"}
                                        value={currentSecret}
                                        onChange={(e) => setCurrentSecret(e.target.value)}
                                        onFocus={() => setIsFocused({...isFocused, currentSecret: true})}
                                        onBlur={() => setIsFocused({...isFocused, currentSecret: !!currentSecret})}
                                        required
                                        className={styles.input}
                                    />
                                    <label
                                        htmlFor="currentSecret"
                                        className={`${styles.floatingLabel} ${
                                            isFocused.currentSecret || currentSecret ? styles.focused : ''
                                        }`}
                                    >
                                        Current Company Secret
                                    </label>
                                    <FiLock className={styles.inputIcon} />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentSecret(!showCurrentSecret)}
                                        className={styles.passwordToggle}
                                        aria-label={showCurrentSecret ? "Hide secret" : "Show secret"}
                                    >
                                        {showCurrentSecret ?
                                            <VscEyeClosed className={styles.eyeIcon} /> :
                                            <VscEye className={styles.eyeIcon} />
                                        }
                                    </button>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <div className={styles.inputWrapper}>
                                    <input
                                        id="newSecret"
                                        type={showNewSecret ? "text" : "password"}
                                        value={newSecret}
                                        onChange={(e) => setNewSecret(e.target.value)}
                                        onFocus={() => setIsFocused({...isFocused, newSecret: true})}
                                        onBlur={() => setIsFocused({...isFocused, newSecret: !!newSecret})}
                                        required
                                        minLength="8"
                                        className={styles.input}
                                    />
                                    <label
                                        htmlFor="newSecret"
                                        className={`${styles.floatingLabel} ${
                                            isFocused.newSecret || newSecret ? styles.focused : ''
                                        }`}
                                    >
                                        New Company Secret
                                    </label>
                                    <MdPassword className={styles.inputIcon} />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewSecret(!showNewSecret)}
                                        className={styles.passwordToggle}
                                        aria-label={showNewSecret ? "Hide secret" : "Show secret"}
                                    >
                                        {showNewSecret ?
                                            <VscEyeClosed className={styles.eyeIcon} /> :
                                            <VscEye className={styles.eyeIcon} />
                                        }
                                    </button>
                                </div>
                                <p className={styles.hintText}>
                                    Secret must be at least 8 characters long
                                </p>
                            </div>

                            <div className={styles.formGroup}>
                                <div className={styles.inputWrapper}>
                                    <input
                                        id="confirmSecret"
                                        type={showConfirmSecret ? "text" : "password"}
                                        value={confirmSecret}
                                        onChange={(e) => setConfirmSecret(e.target.value)}
                                        onFocus={() => setIsFocused({...isFocused, confirmSecret: true})}
                                        onBlur={() => setIsFocused({...isFocused, confirmSecret: !!confirmSecret})}
                                        required
                                        className={styles.input}
                                    />
                                    <label
                                        htmlFor="confirmSecret"
                                        className={`${styles.floatingLabel} ${
                                            isFocused.confirmSecret || confirmSecret ? styles.focused : ''
                                        }`}
                                    >
                                        Confirm New Secret
                                    </label>
                                    <MdPassword className={styles.inputIcon} />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmSecret(!showConfirmSecret)}
                                        className={styles.passwordToggle}
                                        aria-label={showConfirmSecret ? "Hide secret" : "Show secret"}
                                    >
                                        {showConfirmSecret ?
                                            <VscEyeClosed className={styles.eyeIcon} /> :
                                            <VscEye className={styles.eyeIcon} />
                                        }
                                    </button>
                                </div>
                            </div>

                            <div className={styles.forgotSecret}>
                <span
                    className={styles.forgotSecretLink}
                    onClick={handleForgotSecretHover}
                >
                  Forgot company secret?
                    {showTooltip && (
                        <div className={styles.tooltip}>
                            Please contact your administrator to reset the company secret
                        </div>
                    )}
                </span>
                            </div>

                            <div className={styles.buttonGroup}>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className={styles.secondaryButton}
                                    disabled={loading}
                                >
                                    <LuEraser className={styles.buttonIcon} />
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={styles.primaryButton}
                                >
                                    {loading ? (
                                        <span className={styles.buttonContent}>
        <span className={styles.spinner}></span>
        Updating Secret...
      </span>
                                    ) : (
                                        <>
                                            <IoKeySharp className={styles.buttonIcon} />
                                            Update Secret
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className={styles.successContainer}>
                            <IoCheckmarkCircle className={styles.successIcon} />
                            <h3 className={styles.successTitle}>Secret Changed Successfully!</h3>
                            <p className={styles.successText}>
                                Your company secret has been updated successfully.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompanySecretModal;