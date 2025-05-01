import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "../../styles/LoginPage.module.css";
import logo from "../../assets/logo.svg";
import { userAuth, userDetails } from "../../services/api";
import { useDispatch } from "react-redux";
import { setUser } from "../../Redux/userSlice";
import { motion, AnimatePresence } from "framer-motion";
import {VscEye, VscEyeClosed} from "react-icons/vsc";

const LoginPage = () => {
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [animateLogin, setAnimateLogin] = useState(false);

  /**
   * REDUX RELATED
   */
  const dispatch = useDispatch();
  /**
   * REDUX RELATED ENDED
   */

  // Initialize animation state
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateLogin(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateInputs = () => {
    if (!formData.email || !formData.password) {
      return "Email and Password are required!";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Invalid email format!";
    }
    if (formData.password.length < 8) {
      return "Password must be at least 8 characters!";
    }
    return null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = {
        user_email: formData.email,
        user_password: formData.password,
      };
      const response = await userAuth(data);
      if (response && response.token) {
        const userData = await userDetails(response.user_email);

        // Dispatch user data to Redux
        try {
          dispatch(setUser(userData));
        } catch (error) {
          console.error("Dispatch error:", error);
        }

        // Save Basic User Details to localStorage for immediate access
        localStorage.setItem('userEmail',response.user_email);
        localStorage.setItem("jwtToken", response.token);
        localStorage.setItem("userRole", response.user_role);
        localStorage.setItem("userId",response.user_id);

        // Animate out before navigation
        setAnimateLogin(false);
        setTimeout(() => {
          if(response.user_role === 'APPLICANT') navigate("/applicant/explore-jobs");
          else if(response.user_role === 'RECRUITER') navigate('/recruiter/jobs');
          else if(response.user_role === 'ADMIN') navigate('/admin/dashboard');
        }, 400);

      } if (response.error) {
        setError(response.error, response);
        return;
      }

    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <AnimatePresence>
        {animateLogin && (
            <motion.div
                className={styles.container}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
              <motion.div
                  className={styles.left}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
              >
                <motion.img
                    src={logo}
                    alt="JobMatrix Logo"
                    className={styles.logo}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                />
              </motion.div>

              <motion.div
                  className={styles.divider}
                  initial={{ height: "0%" }}
                  animate={{ height: "60%" }}
                  transition={{ duration: 0.8, delay: 0.4 }}
              ></motion.div>

              <motion.div
                  className={styles.right}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
              >
                <motion.form
                    onSubmit={handleLogin}
                    className={styles.form}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <motion.h1
                      className={styles.loginText}
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    Login
                  </motion.h1>

                  <motion.div
                      className={styles.inputGroup}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <input
                        type="email"
                        name="email"
                        className={styles.input}
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder=" "
                    />
                    <label className={styles.floatingLabel}>Email address*</label>
                  </motion.div>

                  <motion.div
                      className={styles.inputGroup}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    <input
                        type={passwordVisible ? "text" : "password"}
                        name="password"
                        className={styles.input}
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        placeholder=" "
                    />
                    <label className={styles.floatingLabel}>Password*</label>
                    <span
                        title={passwordVisible ? "Hide Password" : "Show Password"}
                        className={styles.eyeIcon}
                        onClick={togglePasswordVisibility}
                    >
                  {passwordVisible ? <VscEyeClosed /> : <VscEye />}
                </span>
                  </motion.div>

                  <motion.div
                      className={styles.forgotPassword}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    <Link to="/forgot-password">Forgot password?</Link>
                  </motion.div>

                  {error && (
                      <motion.div
                          style={{ color: "red" }}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                      >
                        {error}
                      </motion.div>
                  )}

                  <motion.button
                      type="submit"
                      className={`${styles.button} button`}
                      disabled={loading}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.9 }}
                  >
                    {loading ? (
                        <span className={styles.loadingIcon}>
                    <span>Logging in</span>
                    <div className={styles.loader}></div>
                  </span>
                    ) : "CONTINUE"}
                  </motion.button>
                </motion.form>

                <motion.p
                    className={styles.signup}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1 }}
                >
                  Don't have an account? <Link to="/signup">Sign up</Link>
                </motion.p>
              </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
  );
};

export default LoginPage;