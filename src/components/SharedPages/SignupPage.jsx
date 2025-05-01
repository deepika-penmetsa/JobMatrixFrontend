import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import styles from "../../styles/SignupPage.module.css";
import { FileUploadOutlined } from "@mui/icons-material";
import { VscEye, VscEyeClosed } from "react-icons/vsc";
import CropImageUploader from "../CropImageUploader";
import logo from "../../assets/logo.svg";
import { registerUser, userAuth, userDetails, getCompanies } from "../../services/api";
import defaultProfilePhoto from '../../assets/noprofilephoto.png';
import { useDispatch } from "react-redux";
import { setUser } from "../../Redux/userSlice";

const SignupPage = () => {
  const nav = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Initialize form data from location state if available
  const [formData, setFormData] = useState(location.state?.formData || {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "",
    profilePhoto: null,
    adminSecretKey: "",
    ssn: "",
    resume: null,
    recruiterStartDate: "",
    createNewCompany: false,
    companyId:"",
    companyName: "",
    companySecretKey: "",
    companyIndustry: "",
    companyDescription: "",
    companyImage: null
  });

  // Add a single error state for all form errors
  const [formError, setFormError] = useState("");

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [ssnVisible, setSsnVisible] = useState(false);
  const [companySecretVisible, setCompanySecretVisible] = useState(false);
  const [adminSecretVisible, setAdminSecretVisible] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [allCompanies, setAllCompanies] = useState([]);
  const [companySearch, setCompanySearch] = useState({
    input: "",
    filteredResults: [],
    showDropdown: false
  });

  const calculateStrength = (password) => {
    if (!password || password.length < 8) return { level: 0, label: "Weak", color: "#FF3E36" };

    const requirements = [
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[@!#$%&_-]/.test(password)
    ].filter(Boolean).length;

    if (requirements === 4) return { level: 3, label: "Strong", color: "#0BE881" };
    if (requirements >= 2) return { level: 2, label: "Good", color: "#FFDA36" };
    return { level: 1, label: "Fair", color: "#FF691F" };
  };

  const passwordStrength = calculateStrength(formData.password);

  // Validate password length and complexity
  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/[!@#$%^&*()_\-+={}[\]|:;"'<>,.?/]/.test(password)) {
      return "Password must contain at least one special character";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked :
          type === "file" ? files[0] :
              value
    }));

    // Clear error when user makes changes
    setFormError("");
  };

  const formatNumber = (input) => {
    const inputStr = String(input);

    const digitsOnly = inputStr.replace(/\D/g, '').slice(0, 9);

    // Format as XXX-XX-XXXX
    if (digitsOnly.length <= 3) {
      return digitsOnly;
    }
    if (digitsOnly.length <= 5) {
      return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
    }
    return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 5)}-${digitsOnly.slice(5)}`;
  };

  const handleSSNChange = (e) => {
    const formatted = formatNumber(e.target.value)
    const { name, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked :
          type === "file" ? files[0] :
              formatted
    }));

    // Clear error when user makes changes
    setFormError("");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    // Validate form before submission
    // Password validation
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setFormError(passwordError);
      return;
    }

    // SSN validation for Admin
    if (formData.role === "ADMIN") {
      const digitsOnly = formData.ssn.replace(/\D/g, '');
      if (digitsOnly.length !== 9) {
        setFormError("SSN must be 9 digits");
        return;
      }

      if (!formData.adminSecretKey) {
        setFormError("Admin secret key is required");
        return;
      }
    }

    // Resume validation for Applicant
    if (formData.role === "APPLICANT") {
      if (!formData.resume) {
        setFormError("Resume is required");
        return;
      }

      const fileExt = formData.resume.name.split('.').pop().toLowerCase();
      if (fileExt !== 'pdf') {
        setFormError("Resume must be in PDF format");
        return;
      }
    }

    if (formData.role === "RECRUITER" && formData.createNewCompany) {
      nav('/register-company', {
        state: { formData } // Pass all form data
      });
    } else {
      console.log('Registering user:', formData);
      try {
        const apiFormData = new FormData();

        // Map form fields to database columns
        apiFormData.append('user_first_name', formData.firstName);
        apiFormData.append('user_last_name', formData.lastName);
        apiFormData.append('user_email', formData.email);
        apiFormData.append('user_password', formData.password);
        apiFormData.append('user_role', formData.role);

        // Handle profile photo if exists
        if (formData.profilePhoto) {
          apiFormData.append('user_profile_photo', formData.profilePhoto);
        }

        // Handle role-specific fields
        if (formData.role === "ADMIN" && formData.ssn) {
          apiFormData.append('admin_ssn', formData.ssn);
          apiFormData.append('admin_secret_key', formData.adminSecretKey);
        }

        if (formData.role === "APPLICANT" && formData.resume) {
          apiFormData.append('applicant_resume', formData.resume);
        }

        if(formData.role === "RECRUITER"){
          apiFormData.append('company_id', formData.companyId);
          apiFormData.append('company_secret_key', formData.companySecretKey);
          apiFormData.append('recruiter_start_date',formData.recruiterStartDate);
        }

        // Call the registration API
        const result = await registerUser(apiFormData);

        if (result.error) {
          console.error('Registration error:', result.error);

          // Handle API error response
          const errorMessage = result.error.message || result.error;

          // Parse error message if it's in JSON format
          if (typeof errorMessage === 'string') {
            // Check for email already exists error
            if (errorMessage.includes('user with this user email already exists')) {
              setFormError("Email already exists");
              return;
            }

            // Parse JSON-like error message
            try {
              if (errorMessage.startsWith('{')) {
                const parsedMessage = errorMessage.replace(/'/g, '"');
                const errorObj = JSON.parse(parsedMessage);

                // Check for email already exists error
                if (errorObj.user_email && errorObj.user_email.some(err =>
                    err.string && err.string.includes('already exists'))) {
                  setFormError("Email already exists");
                  return;
                }

                // Check for password length error
                if (errorObj.user_password && errorObj.user_password.some(err =>
                    err.string && err.string.includes('at least 8 characters'))) {
                  setFormError("Password must be at least 8 characters long");
                  return;
                }
              }
            } catch (parseError) {
              console.error('Error parsing error message:', parseError);
              setFormError("Registration failed. Please try again.");
            }
          }

          return;
        }

        /**
         *  REDIRECT TO DASHBOARD BASED ON THE ROLE.
         */
        if (formData.role === "APPLICANT") {
          const loginData = {
            user_email: formData.email,
            user_password: formData.password
          };

          try {
            const loginRes = await userAuth(loginData);
            if (loginRes && loginRes.token) {

              // Save Basic User Details to localStorage for immediate access
              localStorage.setItem('userEmail',loginRes.user_email);
              localStorage.setItem("jwtToken", loginRes.token);
              localStorage.setItem("userRole", loginRes.user_role);
              localStorage.setItem("userId",loginRes.user_id);

              // fetch user details
              const userData = await userDetails(loginRes.user_email);
              dispatch(setUser(userData));

              nav("/applicant/explore-jobs");
            } else {
              console.error("Login failed after registration", loginRes.error);
              nav("/login"); // fallback
            }
          } catch (loginErr) {
            console.error("Login error after registration", loginErr);
            nav("/login"); // fallback
          }
        } else if (formData.role === "ADMIN") {
          console.log("Admin Registration Successful");
          const loginData = {
            user_email: formData.email,
            user_password: formData.password
          };

          try {
            const loginRes = await userAuth(loginData);
            if (loginRes && loginRes.token) {

              // Save Basic User Details to localStorage for immediate access
              localStorage.setItem('userEmail',loginRes.user_email);
              localStorage.setItem("jwtToken", loginRes.token);
              localStorage.setItem("userRole", loginRes.user_role);
              localStorage.setItem("userId",loginRes.user_id);

              // fetch user details
              const userData = await userDetails(loginRes.user_email);
              dispatch(setUser(userData));

              nav('/admin/dashboard');
            } else {
              console.error("Login failed after registration", loginRes.error);
              nav("/login"); // fallback
            }
          } catch (loginErr) {
            console.error("Login error after registration", loginErr);
            nav("/login"); // fallback
          }
        } else if (formData.role === "RECRUITER") {
          console.log("Recruiter Registration Successful");
          const loginData = {
            user_email: formData.email,
            user_password: formData.password
          };

          try {
            const loginRes = await userAuth(loginData);
            if (loginRes && loginRes.token) {

              // Save Basic User Details to localStorage for immediate access
              localStorage.setItem('userEmail',loginRes.user_email);
              localStorage.setItem("jwtToken", loginRes.token);
              localStorage.setItem("userRole", loginRes.user_role);
              localStorage.setItem("userId",loginRes.user_id);

              // fetch user details
              const userData = await userDetails(loginRes.user_email);
              dispatch(setUser(userData));

              nav('/recruiter/');
            } else {
              console.error("Login failed after registration", loginRes.error);
              nav("/login"); // fallback
            }
          } catch (loginErr) {
            console.error("Login error after registration", loginErr);
            nav("/login"); // fallback
          }
        }
        else {
          nav("/login");
        }
      } catch (error) {
        console.error('Registration failed:', error);

        // Handle API errors
        if (error.response && error.response.data) {
          try {
            const errorData = error.response.data;
            if (errorData.user_email && errorData.user_email.includes('already exists')) {
              setFormError("Email already exists");
            } else {
              setFormError("Registration failed. Please try again.");
            }
          } catch (e) {
            console.error('Error parsing API error:', e);
            setFormError("Registration failed. Please try again.");
          }
        } else {
          setFormError("Registration failed. Please try again.");
        }
      }
    }
  };

  const handleCompanySearch = (input) => {
    const filtered = allCompanies.filter(company =>
        company.company_name.toLowerCase().includes(input.toLowerCase())
    );

    setCompanySearch({
      input,
      filteredResults: filtered,
      showDropdown: input.length >= 3 && filtered.length > 0
    });
  };

  /**
   * HOOK TO FETCH COMPANIES IF THE ROLE IS RECRUITER
   */
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoadingCompanies(true);
        const response = await getCompanies();
        if (response) {
          setAllCompanies(response);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
      finally {
        setLoadingCompanies(false);
      }
    };

    if (formData.role === "RECRUITER") {
      fetchCompanies();
    }
  }, [formData.role]);



  return (
      <div className={styles.container}>
        <div className={styles.left}>
          <img src={logo} alt="JobMatrix Logo" className={styles.logo} />
        </div>

        <div className={styles.divider}></div>

        <div className={styles.right}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <h1 className={styles.signupText}>Sign Up</h1>

            <div className={styles.profileSection}>
              <div className={styles.cropImageContainer}>
                <CropImageUploader
                    name="profilePhoto"
                    onFileChange={(file) => setFormData(prev => ({ ...prev, profilePhoto: file }))}
                    defaultImage={defaultProfilePhoto}
                    currentImage={formData.profilePhoto}
                    checkPage="signup"
                />
              </div>

              <div className={styles.inputGroup}>
                <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder=" "
                />
                <label className={styles.floatingLabel}>First Name*</label>
              </div>

              <div className={styles.inputGroup}>
                <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder=" "
                />
                <label className={styles.floatingLabel}>Last Name*</label>
              </div>
            </div>

            {/* <hr className={styles.sectionDivider} /> */}

            <div className={styles.inputGroup}>
              <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder=" "
              />
              <label className={styles.floatingLabel}>Email*</label>
            </div>

            <div className={styles.inputGroup}>
              <input
                  type={passwordVisible ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder=" "
                  className={styles.passwordInput}
              />
              <label className={styles.floatingLabel}>Password*</label>
              <div className={styles.passwordIcons}>
              <span
                  className={styles.eyeIcon}
                  onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? <VscEyeClosed /> : <VscEye />}
              </span>
              </div>

            </div>
            {formData.password.length > 0 && (<div className={styles.passwordStrengthDiv}>

              <div className={styles.passwordStrengthContainer}>
                <span className={styles.strengthLabel}>Strength:</span>
                <div className={styles.passwordStrengthBar}>
                  <div style={{
                    width: `${(passwordStrength.level + 1) * 25}%`,
                    backgroundColor: passwordStrength.color
                  }}></div>
                </div>
                <span
                    className={styles.strengthText}
                    style={{ color: passwordStrength.color }}
                >
                  {passwordStrength.label}
                </span>
              </div>

            </div>)}


            <div className={styles.inputGroup}>
              <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
              >
                <option value="">Select Role*</option>
                <option value="APPLICANT">Applicant</option>
                <option value="RECRUITER">Recruiter</option>
                <option value="ADMIN">Admin</option>
              </select>
              <label className={styles.floatingLabel}>Role*</label>
            </div>

            {/* <hr className={styles.sectionDivider} /> */}

            {/* Applicant Fields */}
            {formData.role === "APPLICANT" && (
                <div className={styles.inputGroup}>
                  <input
                      type="file"
                      name="resume"
                      onChange={handleChange}
                      accept=".pdf"
                      id="resume-upload"
                      style={{ display: 'none' }}
                  />
                  <div className={styles.fileUploadContainer}>
                    <label htmlFor="resume-upload" className={styles.fileUploadLabel}>
                      <div className={styles.uploadFileText}><span className={styles.fileUploadIcon}><FileUploadOutlined/></span><span>Upload Resume</span></div>
                    </label>
                    {formData.resume && (
                        <span className={styles.fileName}>{formData.resume.name}</span>
                    )}
                  </div>
                </div>
            )}

            {/* Admin Fields */}
            {formData.role === "ADMIN" && (
                <>
                  <div className={styles.inputGroup}>
                    <input
                        type={adminSecretVisible ? "text" : "password"}
                        name="adminSecretKey"
                        value={formData.adminSecretKey}
                        onChange={handleChange}
                        required
                        placeholder=""
                        className={styles.passwordInput}
                    />
                    <label className={styles.floatingLabel}>Admin Secret Key</label>
                    <div className={styles.passwordIcons}>
                  <span
                      className={styles.eyeIcon}
                      onClick={() => setAdminSecretVisible(!adminSecretVisible)}
                  >
                    {adminSecretVisible ? <VscEyeClosed /> : <VscEye />}
                  </span>
                    </div>
                  </div>
                  <div className={styles.inputGroup}>
                    <input
                        type={ssnVisible ? "text" : "password"}
                        name="ssn"
                        value={formData.ssn}
                        onChange={handleSSNChange}
                        required
                        placeholder=""
                        pattern="\d{3}-\d{2}-\d{4}"
                        className={styles.passwordInput}
                    />
                    <label className={styles.floatingLabel}>SSN</label>
                    <div className={styles.passwordIcons}>
                  <span
                      className={styles.eyeIcon}
                      onClick={() => setSsnVisible(!ssnVisible)}
                  >
                    {ssnVisible ? <VscEyeClosed /> : <VscEye />}
                  </span>
                    </div>
                  </div>
                </>
            )}

            {/* Recruiter Fields */}
            {formData.role === "RECRUITER" && (
                <>
                  <div className={styles.checkboxGroup}>
                    <input
                        type="checkbox"
                        name="createNewCompany"
                        checked={formData.createNewCompany}
                        onChange={handleChange}
                        id="create-company"
                    />
                    <label htmlFor="create-company">Create New Company</label>
                  </div>
                  {/** RECRUITER FROM EXISITING COMPANY */}
                  {!formData.createNewCompany && (
                      <>
                        <div className={styles.inputGroup}>
                          <input
                              type="text"
                              name="companyName"
                              value={formData.companyName}
                              onChange={(e) => {
                                handleChange(e);
                                handleCompanySearch(e.target.value);
                                setHighlightedIndex(-1);
                              }}
                              onKeyDown={(e) => {
                                if (companySearch.showDropdown) {
                                  if (e.key === "ArrowDown") {
                                    e.preventDefault();
                                    setHighlightedIndex(prev =>
                                        Math.min(prev + 1, companySearch.filteredResults.length - 1)
                                    );
                                  } else if (e.key === "ArrowUp") {
                                    e.preventDefault();
                                    setHighlightedIndex(prev => Math.max(prev - 1, -1));
                                  } else if (e.key === "Enter" && highlightedIndex >= 0) {
                                    e.preventDefault();
                                    const company = companySearch.filteredResults[highlightedIndex];
                                    setFormData(prev => ({
                                      ...prev,
                                      companyName: company.company_name,
                                      companyId: company.company_id
                                    }));
                                    setCompanySearch(prev => ({
                                      ...prev,
                                      input: company.company_name,
                                      showDropdown: false
                                    }));
                                    setHighlightedIndex(-1);
                                  }
                                }
                              }}
                              onFocus={() => {
                                if (formData.companyName.length >= 1) {
                                  handleCompanySearch(formData.companyName);
                                }
                              }}
                              onBlur={() => {
                                setTimeout(() => {
                                  setCompanySearch(prev => ({ ...prev, showDropdown: false }));
                                }, 200);
                              }}
                              required
                              placeholder=" "
                              autoComplete="off"
                          />
                          <label className={styles.floatingLabel}>Company Name*</label>

                          {/* Company dropdown list */}
                          {companySearch.showDropdown && (
                              <div className={styles.dropdown}>
                                {companySearch.filteredResults.map((company, index) => (
                                    <div
                                        key={company.company_id}
                                        className={`${styles.dropdownItem} ${
                                            index === highlightedIndex ? styles.highlighted : ''
                                        }`}
                                        onClick={() => {
                                          setFormData(prev => ({
                                            ...prev,
                                            companyName: company.company_name,
                                            companyId: company.company_id
                                          }));
                                          setCompanySearch(prev => ({
                                            ...prev,
                                            input: company.company_name,
                                            showDropdown: false
                                          }));
                                        }}
                                    >
                                      {company.company_name}
                                    </div>
                                ))}
                              </div>
                          )}
                        </div>
                        <div className={styles.inputGroup}>
                          <input
                              type={companySecretVisible ? "text" : "password"}
                              name="companySecretKey"
                              value={formData.companySecretKey}
                              onChange={handleChange}
                              required
                              placeholder=" "
                              className={styles.passwordInput}
                          />
                          <label className={styles.floatingLabel}>Company Secret Key*</label>
                          <div className={styles.passwordIcons}>
                      <span
                          className={styles.eyeIcon}
                          onClick={() => setCompanySecretVisible(!companySecretVisible)}
                      >
                        {companySecretVisible ? <VscEyeClosed /> : <VscEye />}
                      </span>
                          </div>
                        </div>

                        <div className={styles.inputGroup}>
                          <input
                              type="date"
                              name="recruiterStartDate"
                              value={formData.recruiterStartDate}
                              onChange={handleChange}
                              required
                          />
                          <label className={styles.floatingLabel}>Start Date*</label>
                        </div>
                      </>
                  )}
                </>
            )}

            {/* Display error message above the submit button */}
            {formError && (
                <div className={styles.errorContainer}>
                  <p className={styles.errorMessage}>{formError}</p>
                </div>
            )}

            <button type="submit" className={styles.submitButton}>
              {formData.role === "RECRUITER" && formData.createNewCompany ? "Continue To Create Company" : "Register"}
            </button>

            <p className={styles.loginLink}>
              Already a user? <Link to="/login">Login</Link>
            </p>
          </form>
        </div>
      </div>
  );
};

export default SignupPage;