// import { useState, useEffect } from 'react';
// import styles from '../../styles/EditUserModal.module.css';
// import { FiX, FiSave, FiUpload, FiUser } from 'react-icons/fi';

// const EditUserModal = ({ user, onClose, onSave }) => {
//   const [formData, setFormData] = useState({
//     user_first_name: '',
//     user_last_name: '',
//     user_email: '',
//     user_phone: '',
//     user_street_no: '',
//     user_city: '',
//     user_state: '',
//     user_zip_code: '',
//     user_profile_photo: null,
//     admin_ssn: '',
//   });
//   const [previewImage, setPreviewImage] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [formErrors, setFormErrors] = useState({});
//   const [feedbackMessage, setFeedbackMessage] = useState('');

//   useEffect(() => {
//     if (user) {
//       setFormData({
//         user_first_name: user.user_first_name || '',
//         user_last_name: user.user_last_name || '',
//         user_email: user.user_email || '',
//         user_phone: user.user_phone || '',
//         user_street_no: user.user_street_no || '',
//         user_city: user.user_city || '',
//         user_state: user.user_state || '',
//         user_zip_code: user.user_zip_code || '',
//         user_profile_photo: null,
//         admin_ssn: user.admin_ssn || '',
//       });
//       setPreviewImage(user.user_profile_photo || null);
//     }
//   }, [user]);

//   const validateField = (name, value) => {
//     switch(name) {
//       case 'user_email':
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         return emailRegex.test(value) ? '' : 'Please enter a valid email address';
//       case 'user_phone':
//         if (!value) return ''; // Phone is optional
//         const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$|^\d{3}-\d{3}-\d{4}$|^\d{10}$/;
//         return phoneRegex.test(value) ? '' : 'Please enter a valid phone number';
//       case 'user_zip_code':
//         if (!value) return ''; // ZIP is optional
//         const zipRegex = /^\d{5}(-\d{4})?$/;
//         return zipRegex.test(value) ? '' : 'Please enter a valid ZIP code';
//       case 'admin_ssn':
//         if (!value) return ''; // SSN is optional
//         const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;
//         return ssnRegex.test(value) ? '' : 'Please enter a valid SSN (XXX-XX-XXXX)';
//       default:
//         return '';
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
    
//     // Format phone number as user types
//     if (name === 'user_phone') {
//       const formatted = formatPhoneNumber(value);
//       setFormData(prev => ({ ...prev, user_phone: formatted }));
//     }
    
//     // Format SSN as user types
//     if (name === 'admin_ssn') {
//       const formatted = formatSSN(value);
//       setFormData(prev => ({ ...prev, admin_ssn: formatted }));
//     }
    
//     // Live validation
//     const error = validateField(name, value);
//     setFormErrors(prev => ({
//       ...prev,
//       [name]: error
//     }));
//   };

//   const formatPhoneNumber = (value) => {
//     // Remove all non-digits
//     const cleaned = value.replace(/\D/g, '');
    
//     // Check if the input is of correct length
//     if (cleaned.length <= 3) {
//       return cleaned;
//     } else if (cleaned.length <= 6) {
//       return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
//     } else {
//       return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
//     }
//   };

//   const formatSSN = (value) => {
//     // Remove all non-digits
//     const cleaned = value.replace(/\D/g, '');
    
//     // Check if the input is of correct length
//     if (cleaned.length <= 3) {
//       return cleaned;
//     } else if (cleaned.length <= 5) {
//       return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
//     } else {
//       return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 9)}`;
//     }
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       // Validate file size (max 5MB)
//       if (file.size > 5 * 1024 * 1024) {
//         setFeedbackMessage('Image size must be less than 5MB');
//         return;
//       }
      
//       // Validate file type
//       const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
//       if (!validTypes.includes(file.type)) {
//         setFeedbackMessage('Please select a valid image file (JPEG, PNG, GIF)');
//         return;
//       }
      
//       setFormData(prev => ({ ...prev, user_profile_photo: file }));
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setPreviewImage(reader.result);
//         setFeedbackMessage('');
//       };
//       reader.readAsDataURL(file);
//     }
//   };
  
//   const validateForm = () => {
//     const errors = {};
//     let isValid = true;
    
//     // Validate required fields
//     if (!formData.user_first_name.trim()) {
//       errors.user_first_name = 'First name is required';
//       isValid = false;
//     }
    
//     if (!formData.user_last_name.trim()) {
//       errors.user_last_name = 'Last name is required';
//       isValid = false;
//     }
    
//     if (!formData.user_email.trim()) {
//       errors.user_email = 'Email is required';
//       isValid = false;
//     } else {
//       const emailError = validateField('user_email', formData.user_email);
//       if (emailError) {
//         errors.user_email = emailError;
//         isValid = false;
//       }
//     }
    
//     // Validate optional fields if they have values
//     if (formData.user_phone) {
//       const phoneError = validateField('user_phone', formData.user_phone);
//       if (phoneError) {
//         errors.user_phone = phoneError;
//         isValid = false;
//       }
//     }
    
//     if (formData.user_zip_code) {
//       const zipError = validateField('user_zip_code', formData.user_zip_code);
//       if (zipError) {
//         errors.user_zip_code = zipError;
//         isValid = false;
//       }
//     }
    
//     if (formData.admin_ssn) {
//       const ssnError = validateField('admin_ssn', formData.admin_ssn);
//       if (ssnError) {
//         errors.admin_ssn = ssnError;
//         isValid = false;
//       }
//     }
    
//     setFormErrors(errors);
//     return isValid;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       // Scroll to the first error
//       const firstErrorElement = document.querySelector(`.${styles.fieldError}`);
//       if (firstErrorElement) {
//         firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
//       }
//       return;
//     }
    
//     setIsLoading(true);
//     setFeedbackMessage('');
    
//     try {
//       const data = new FormData();
//       for (const key in formData) {
//         if (formData[key] !== null && formData[key] !== undefined) {
//           data.append(key, formData[key]);
//         }
//       }
//       await onSave(user.user_id, data);
//       setFeedbackMessage('Profile updated successfully!');
//       setTimeout(() => {
//         onClose();
//       }, 1000);
//     } catch (error) {
//       console.error('Error updating user:', error);
//       setFeedbackMessage('Failed to update profile. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleKeyDown = (e) => {
//     // Close modal on Escape key
//     if (e.key === 'Escape') {
//       onClose();
//     }
//   };

//   useEffect(() => {
//     // Add event listener for keyboard navigation
//     document.addEventListener('keydown', handleKeyDown);
    
//     // Focus first input on mount
//     const firstInput = document.getElementById('user_first_name');
//     if (firstInput) firstInput.focus();
    
//     return () => {
//       document.removeEventListener('keydown', handleKeyDown);
//     };
//   }, []);

//   return (
//     <div className={styles.modalOverlay} onClick={onClose}>
//       <div className={styles.modalContainer} onClick={e => e.stopPropagation()} role="dialog" aria-labelledby="edit-user-title">
//         <div className={styles.modalHeader}>
//           <h2 className={styles.modalTitle} id="edit-user-title">Edit User Profile</h2>
//           <button 
//             onClick={onClose} 
//             className={styles.closeButton} 
//             aria-label="Close"
//             title="Close modal"
//           >
//             <FiX size={24} />
//           </button>
//         </div>

//         {feedbackMessage && (
//           <div className={`${styles.feedbackMessage} ${feedbackMessage.includes('Failed') ? styles.errorMessage : styles.successMessage}`}>
//             {feedbackMessage}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className={styles.form}>
//           <div className={styles.formContent}>
//           <div className={styles.imagePersonalInfo}>
//             <div className={styles.avatarSection}>
//               <div className={styles.avatarContainer}>
//                 {previewImage ? (
//                   <img
//                     src={previewImage}
//                     alt="Profile preview"
//                     className={styles.avatarImage}
//                   />
//                 ) : (
//                   <div className={styles.defaultAvatar}>
//                     <FiUser size={60} />
//                   </div>
//                 )}
                
//               </div>
              
//             </div>
//                 <div className={styles.formRowFirst}>
//                   <div className={`${styles.formGroup} ${formErrors.user_first_name ? styles.hasError : ''}`}>
//                     <label htmlFor="user_first_name" className={styles.inputLabel}>
//                       First Name <span className={styles.requiredMark}>*</span>
//                     </label>
//                     <input
//                       type="text"
//                       id="user_first_name"
//                       name="user_first_name"
//                       value={formData.user_first_name}
//                       onChange={handleChange}
//                       className={`${styles.textInput} ${formErrors.user_first_name ? styles.inputError : ''}`}
//                       required
//                       aria-required="true"
//                       aria-invalid={!!formErrors.user_first_name}
//                       aria-describedby={formErrors.user_first_name ? "first-name-error" : undefined}
//                       placeholder="Enter your first name"
//                     />
//                     {formErrors.user_first_name && (
//                       <p id="first-name-error" className={styles.fieldError}>{formErrors.user_first_name}</p>
//                     )}
//                   </div>
//                   <div className={`${styles.formGroup} ${formErrors.user_last_name ? styles.hasError : ''}`}>
//                     <label htmlFor="user_last_name" className={styles.inputLabel}>
//                       Last Name <span className={styles.requiredMark}>*</span>
//                     </label>
//                     <input
//                       type="text"
//                       id="user_last_name"
//                       name="user_last_name"
//                       value={formData.user_last_name}
//                       onChange={handleChange}
//                       className={`${styles.textInput} ${formErrors.user_last_name ? styles.inputError : ''}`}
//                       required
//                       aria-required="true"
//                       aria-invalid={!!formErrors.user_last_name}
//                       aria-describedby={formErrors.user_last_name ? "last-name-error" : undefined}
//                       placeholder="Enter your last name"
//                     />
//                     {formErrors.user_last_name && (
//                       <p id="last-name-error" className={styles.fieldError}>{formErrors.user_last_name}</p>
//                     )}
//                   </div>

//                   <div className={`${styles.formGroup} ${formErrors.user_email ? styles.hasError : ''}`}>
//                     <label htmlFor="user_email" className={styles.inputLabel}>
//                       Email <span className={styles.requiredMark}>*</span>
//                     </label>
//                     <input
//                       type="email"
//                       id="user_email"
//                       name="user_email"
//                       value={formData.user_email}
//                       onChange={handleChange}
//                       className={`${styles.textInput} ${formErrors.user_email ? styles.inputError : ''}`}
//                       required
//                       aria-required="true"
//                       aria-invalid={!!formErrors.user_email}
//                       aria-describedby={formErrors.user_email ? "email-error" : undefined}
//                       placeholder="your.email@example.com"
//                     />
//                     {formErrors.user_email && (
//                       <p id="email-error" className={styles.fieldError}>{formErrors.user_email}</p>
//                     )}
//                   </div>
//                   <div className={`${styles.formGroup} ${formErrors.user_phone ? styles.hasError : ''}`}>
//                     <label htmlFor="user_phone" className={styles.inputLabel}>Phone</label>
//                     <input
//                       type="tel"
//                       id="user_phone"
//                       name="user_phone"
//                       value={formData.user_phone}
//                       onChange={handleChange}
//                       className={`${styles.textInput} ${formErrors.user_phone ? styles.inputError : ''}`}
//                       aria-invalid={!!formErrors.user_phone}
//                       aria-describedby={formErrors.user_phone ? "phone-error" : undefined}
//                       placeholder="(123) 456-7890"
//                     />
//                     {formErrors.user_phone && (
//                       <p id="phone-error" className={styles.fieldError}>{formErrors.user_phone}</p>
//                     )}
//                 </div>
//                 </div>
                  
//               </div>

//             <div className={styles.formFields}>
              
//                 <div className={styles.formGroup}>
//                   <label htmlFor="user_street_no" className={styles.inputLabel}>Street Address</label>
//                   <input
//                     type="text"
//                     id="user_street_no"
//                     name="user_street_no"
//                     value={formData.user_street_no}
//                     onChange={handleChange}
//                     className={styles.textInput}
//                     placeholder="123 Main St"
//                   />
//                 </div>

//                 <div className={styles.formRowAddress}>
//                   <div className={styles.formGroup}>
//                     <label htmlFor="user_city" className={styles.inputLabel}>City</label>
//                     <input
//                       type="text"
//                       id="user_city"
//                       name="user_city"
//                       value={formData.user_city}
//                       onChange={handleChange}
//                       className={styles.textInput}
//                       placeholder="City"
//                     />
//                   </div>
//                   <div className={styles.formGroup}>
//                     <label htmlFor="user_state" className={styles.inputLabel}>State</label>
//                     <input
//                       type="text"
//                       id="user_state"
//                       name="user_state"
//                       value={formData.user_state}
//                       onChange={handleChange}
//                       className={styles.textInput}
//                       placeholder="State"
//                     />
//                   </div>
//                   <div className={`${styles.formGroup} ${formErrors.user_zip_code ? styles.hasError : ''}`}>
//                     <label htmlFor="user_zip_code" className={styles.inputLabel}>ZIP Code</label>
//                     <input
//                       type="text"
//                       id="user_zip_code"
//                       name="user_zip_code"
//                       value={formData.user_zip_code}
//                       onChange={handleChange}
//                       className={`${styles.textInput} ${formErrors.user_zip_code ? styles.inputError : ''}`}
//                       aria-invalid={!!formErrors.user_zip_code}
//                       aria-describedby={formErrors.user_zip_code ? "zip-error" : undefined}
//                       placeholder="12345"
//                     />
//                     {formErrors.user_zip_code && (
//                       <p id="zip-error" className={styles.fieldError}>{formErrors.user_zip_code}</p>
//                     )}
//                   </div>
//                 </div>

//               {user.user_role === 'ADMIN' && (
//                   <div className={`${styles.formGroup} ${formErrors.admin_ssn ? styles.hasError : ''}`}>
//                     <label htmlFor="admin_ssn" className={styles.inputLabel}>SSN</label>
//                     <input
//                       type="text"
//                       id="admin_ssn"
//                       name="admin_ssn"
//                       value={formData.admin_ssn}
//                       onChange={handleChange}
//                       className={`${styles.textInput} ${formErrors.admin_ssn ? styles.inputError : ''}`}
//                       placeholder="XXX-XX-XXXX"
//                       aria-invalid={!!formErrors.admin_ssn}
//                       aria-describedby={formErrors.admin_ssn ? "ssn-error" : undefined}
//                     />
//                     {formErrors.admin_ssn && (
//                       <p id="ssn-error" className={styles.fieldError}>{formErrors.admin_ssn}</p>
//                     )}
//                   </div>
//               )}
//             </div>
//           </div>

//           <div className={styles.formActions}>
//             <button
//               type="button"
//               onClick={onClose}
//               className={styles.cancelButton}
//               disabled={isLoading}
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className={styles.saveButton}
//               disabled={isLoading}
//               aria-busy={isLoading}
//             >
//               {isLoading ? (
//                 <>
//                   <span className={styles.spinnerIcon}></span>
//                   Saving...
//                 </>
//               ) : (
//                 <>
//                   <FiSave className={styles.saveIcon} />
//                   Save Changes
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EditUserModal;
import { useState, useEffect } from 'react';
import { FiX, FiSave, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { LuEraser } from 'react-icons/lu';
import styles from '../../styles/EditUserModal.module.css';
import CropImageUploader from '../CropImageUploader';
import defaultProfilePhoto from '../../assets/noprofilephoto.png';
import ToastNotification from '../ToastNotification';

const EditUserModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    ssn: '',
  });
  const [originalData, setOriginalData] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [ssnVisible, setSsnVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastQueue, setToastQueue] = useState([]);

  const showToast = (message, type = "success") => {
    const newToast = { message, type, id: Date.now() };
    setToastQueue(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToastQueue(prev => prev.filter(t => t.id !== newToast.id));
    }, 3000);
  };

  const toggleSsnVisibility = () => {
    setSsnVisible(!ssnVisible);
  };

  const formatSSN = (ssn) => {
    if (!ssn) return "";
    if (ssnVisible) return ssn;
    if (ssn.length <= 4) return "•••-••-" + ssn;
    return "•••-••-" + ssn.slice(-4);
  };

  useEffect(() => {
    if (user) {
      const formattedData = {
        firstName: user.user_first_name || '',
        lastName: user.user_last_name || '',
        email: user.user_email || '',
        phone: user.user_phone || '',
        street: user.user_street_no || '',
        city: user.user_city || '',
        state: user.user_state || '',
        postalCode: user.user_zip_code || '',
        ssn: user.admin_ssn || '',
      };
      setFormData(formattedData);
      setOriginalData(formattedData);
      setProfilePhoto(user.user_profile_photo || null);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePhotoChange = (file) => {
    if (!file) {
      setProfilePhoto(null);
      setProfilePhotoFile(null);
    } else {
      setProfilePhotoFile(file);
      setProfilePhoto(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const apiFormData = new FormData();
      
      // Only append changed fields
      if (formData.firstName !== originalData.firstName) {
        apiFormData.append('user_first_name', formData.firstName);
      }
      if (formData.lastName !== originalData.lastName) {
        apiFormData.append('user_last_name', formData.lastName);
      }
      if (formData.phone !== originalData.phone) {
        apiFormData.append('user_phone', formData.phone);
      }
      if (formData.street !== originalData.street) {
        apiFormData.append('user_street_no', formData.street);
      }
      if (formData.city !== originalData.city) {
        apiFormData.append('user_city', formData.city);
      }
      if (formData.state !== originalData.state) {
        apiFormData.append('user_state', formData.state);
      }
      if (formData.postalCode !== originalData.postalCode) {
        apiFormData.append('user_zip_code', formData.postalCode);
      }
      if (formData.ssn !== originalData.ssn) {
        apiFormData.append('admin_ssn', formData.ssn);
      }
      
      if (profilePhotoFile) {
        apiFormData.append('user_profile_photo', profilePhotoFile);
      } else if (profilePhoto === null) {
        apiFormData.append('user_profile_photo', '');
      }

      await onSave(user.user_id, apiFormData);
      showToast('Profile updated successfully!');
      setTimeout(onClose, 1000);
    } catch (error) {
      console.error('Error updating user:', error);
      showToast('Failed to update profile. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Edit User Profile</h2>
          <button 
            onClick={onClose} 
            className={styles.closeButton}
            aria-label="Close"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className={styles.toastContainer}>
          {toastQueue.map((toast) => (
            <ToastNotification
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => setToastQueue(prev => prev.filter(t => t.id !== toast.id))}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formContent}>
            <div className={styles.leftSection}>
              <div className={styles.imageWrapper}>
                <CropImageUploader
                  name="profilePhoto"
                  onFileChange={handleProfilePhotoChange}
                  defaultImage={defaultProfilePhoto}
                  currentImage={profilePhoto}
                  checkPage='edit-user'
                />
              </div>
            </div>

            <div className={styles.rightSection}>
              <div className={styles.grid}>
                {[
                  { name: "firstName", label: "First Name", required: true },
                  { name: "lastName", label: "Last Name", required: true },
                  { name: "email", label: "Email", required: true, disabled: true },
                  { name: "phone", label: "Phone" },
                  { name: "street", label: "Street Address" },
                  { name: "city", label: "City" },
                  { name: "state", label: "State" },
                  { name: "postalCode", label: "Postal Code" },
                  ...(user?.user_role === 'ADMIN' ? 
                    [{ name: "ssn", label: "Social Security Number", required:true, disabled:true }] : []),
                ].map((field) => (
                  <div key={field.name} className={styles.inputGroup}>
                    <input
                      type={field.name === "ssn" && !ssnVisible ? "password" : "text"}
                      name={field.name}
                      className={styles.input}
                      value={field.name === "ssn" ? formatSSN(formData[field.name]) : formData[field.name]}
                      onChange={handleChange}
                      disabled={field.disabled}
                      placeholder=" "
                      required={field.required}
                    />
                    <label className={styles.floatingLabel}>
                      {field.label}
                      {field.required && <span className={styles.required}>*</span>}
                    </label>
                    {field.name === "ssn" && (
                      <button
                        type="button"
                        className={styles.toggleVisibility}
                        onClick={toggleSsnVisibility}
                        aria-label={ssnVisible ? "Hide SSN" : "Show SSN"}
                      >
                        {ssnVisible ? <FiEyeOff /> : <FiEye />}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={isLoading}
            >
              <span className={styles.buttonRow}>
                <span>Cancel</span> <LuEraser className={styles.buttonIcon} />
              </span>
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isLoading}
            >
              <span className={styles.buttonRow}>
                {isLoading ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <span>Save Changes</span> <FiSave className={styles.buttonIcon} />
                  </>
                )}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;