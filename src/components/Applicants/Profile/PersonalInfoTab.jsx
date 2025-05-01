import { useState, useEffect } from "react";
import { FiEdit3, FiLock } from "react-icons/fi";
import { LuEraser, LuSave } from "react-icons/lu";
import { userDetails, patchUserDetails } from "../../../services/api";
import styles from "../../../styles/PersonalInfoTab.module.css";
import CropImageUploader from "../../CropImageUploader";
import defaultProfilePhoto from "../../../assets/noprofilephoto.png";
import ToastNotification from "../../ToastNotification";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../../Redux/userSlice";
import { useNavigate } from "react-router-dom";

const PersonalInfoTab = () => {
  // Get user data from Redux store
  const user = useSelector(state => state.user.user);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
  });
  const [originalData, setOriginalData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [toastQueue, setToastQueue] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate(); // Added for navigation

  const showToast = (message, type = "success") => {
    const newToast = { message, type, id: Date.now() };
    setToastQueue(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToastQueue(prev => prev.filter(t => t.id !== newToast.id));
    }, 3000);
  };

  // Initialize form data from Redux store
  useEffect(() => {
    if (user) {
      const formattedData = {
        firstName: user.user_first_name || "",
        lastName: user.user_last_name || "",
        email: user.user_email || "",
        phone: user.user_phone || "",
        street: user.user_street_no || "",
        city: user.user_city || "",
        state: user.user_state || "",
        postalCode: user.user_zip_code || "",
        profilePhoto: user.user_profile_photo || null
      };
      setFormData(formattedData);
      setOriginalData(formattedData);
      setProfilePhoto(user.user_profile_photo || null);
    } else {
      // Fallback to API if Redux doesn't have data
      const loadUserData = async () => {
        try {
          const response = await userDetails(localStorage.getItem('userEmail'));
          if (response) {
            dispatch(setUser(response));
          }
        } catch (error) {
          console.error("Failed to load user data:", error);
          showToast("Failed to load user data", "error");
        }
      };
      loadUserData();
    }
  }, [user, dispatch]);

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
      setProfilePhoto(file);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reset to original data from Redux
    if (originalData) {
      setFormData(originalData);
    }
    setProfilePhoto(originalData?.profilePhoto || null);
    setProfilePhotoFile(null);
    setIsEditing(false);
    showToast("Changes discarded", "info");
  };

  const handleChangePassword = () => {
    navigate("/change-password");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const apiFormData = new FormData();
      let hasChanges = false;
  
      if (formData.firstName !== originalData.firstName) {
        apiFormData.append('user_first_name', formData.firstName);
        hasChanges = true;
      }
      if (formData.lastName !== originalData.lastName) {
        apiFormData.append('user_last_name', formData.lastName);
        hasChanges = true;
      }
      if (formData.phone !== originalData.phone) {
        apiFormData.append('user_phone', formData.phone);
        hasChanges = true;
      }
      if (formData.street !== originalData.street) {
        apiFormData.append('user_street_no', formData.street);
        hasChanges = true;
      }
      if (formData.city !== originalData.city) {
        apiFormData.append('user_city', formData.city);
        hasChanges = true;
      }
      if (formData.state !== originalData.state) {
        apiFormData.append('user_state', formData.state);
        hasChanges = true;
      }
      if (formData.postalCode !== originalData.postalCode) {
        apiFormData.append('user_zip_code', formData.postalCode);
        hasChanges = true;
      }

      if (profilePhotoFile) {
        apiFormData.append("user_profile_photo", profilePhotoFile);
        hasChanges = true;
      } else if (profilePhoto === null) {
        apiFormData.append("user_profile_photo", "");
        hasChanges = true;
      }
  
      if (!hasChanges) {
        setIsEditing(false);
        showToast("No changes to save", "info");
        return;
      }
  
      const response = await patchUserDetails(
        user.user_id,
        apiFormData,
        true
      );
  
      if (response && !response.error) {
        const updatedUser = {
          ...response,
          applicant_resume: user.applicant_resume
        };
        dispatch(setUser(updatedUser));
        setOriginalData(formData);
        setProfilePhotoFile(null);
        setIsEditing(false);
        showToast("Profile updated successfully!", "success");
      } else {
        showToast(response?.error || "Failed to update profile", "error");
      }
    } catch (error) {
      console.error("Update failed:", error);
      showToast("An unexpected error occurred", "error");
    }
  };

  return (
    <div className={styles.container}>
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

      <div className={styles.leftSection}>
        <div className={styles.imageWrapper}>
          <CropImageUploader
            name="profilePhoto"
            onFileChange={handleProfilePhotoChange}
            defaultImage={defaultProfilePhoto}
            currentImage={profilePhoto}
            checkPage='personal-info'
            isEditing={isEditing}
          />
        </div>
      </div>

      <div className={styles.rightSection}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.grid}>
            {[
              { name: "firstName", label: "First Name" },
              { name: "lastName", label: "Last Name" },
              { name: "email", label: "Email", disabled: true },
              { name: "phone", label: "Phone" },
              { name: "street", label: "Street no" },
              { name: "city", label: "City" },
              { name: "state", label: "State" },
              { name: "postalCode", label: "Postal Code" },
            ].map((field) => (
              <div key={field.name} className={styles.inputGroup}>
                <input
                  type="text"
                  name={field.name}
                  className={styles.input}
                  style={field.disabled || !isEditing ? {backgroundColor:'var(--aqua)'}:{}}
                  value={formData[field.name]}
                  onChange={handleChange}
                  disabled={field.disabled || !isEditing}
                  placeholder=" "
                />
                <label className={styles.floatingLabel}>{field.label}</label>
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            {!isEditing ? (
              <>
              <button
                type="button"
                className={styles.editProfileButton}
                onClick={handleEdit}
              >
                <span className={styles.buttonRow}>
                  <FiEdit3 className={styles.editIcon} /> <span>Edit Profile</span> 
                </span>
                 
              </button>

              {/* Added Change Password Button */}
              <button
              type="button"
              className={styles.changePasswordButton}
              onClick={handleChangePassword}
            >
              <span className={styles.buttonRow}>
              <FiLock className={styles.editIcon} /> <span>Change Password</span> 
              </span>
            </button>
            </>
            ) : (
              <>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCancel}
                >
                  <span className={styles.buttonRow}>
                    <span>Cancel</span> <LuEraser className={styles.editIcon}/>
                  </span>
                </button>
                <button type="submit" className={styles.saveButton}>
                  <span className={styles.buttonRow}>
                    <span>Save</span> <LuSave className={styles.editIcon}/>
                  </span>
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalInfoTab;