import { NavLink, useNavigate, useLocation } from "react-router-dom";
import styles from "../styles/SidenavBar.module.css";
import logo from "../assets/logo.svg";
import logoMini from "../assets/logo-icon.svg";
import logoutIcon from "../assets/SideNavIcon-Images/logout-inactive.svg";
import bagActive from "../assets/SideNavIcon-Images/basil_bag-solid-active.svg";
import bagInactive from "../assets/SideNavIcon-Images/basil_bag-solid-inactive.svg";
import companiesActive from "../assets/SideNavIcon-Images/companies-active.svg";
import companiesInactive from "../assets/SideNavIcon-Images/companies-inactive.svg";
import defaultUser from "../assets/noprofilephoto.png";
import { fetchUserData } from '../Redux/userSlice';
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";

const RecruiterSidenavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user?.user);

  // Ref for the profile link
  const profileRef = useRef(null);

  // State for indicator style
  const [indicatorStyle, setIndicatorStyle] = useState({
    top: "0rem",
    height: "3.6rem"
  });

  useEffect(() => {
    dispatch(fetchUserData(localStorage.getItem('userEmail')));
  }, [dispatch]);

  // Update indicator position and height
  useEffect(() => {
    const updateIndicator = () => {
      let position = "0rem";
      let height = "3.6rem";

      if (location.pathname.includes("/jobs")) {
        position = "0rem";
      } else if (location.pathname.includes("/company-info")) {
        position = "4.2rem";
      } else if (location.pathname.includes("/profile")) {
        position = "8.4rem";

        // If we're on the profile tab and the ref exists, adjust height
        if (profileRef.current) {
          height = `${profileRef.current.offsetHeight}px`;
        }
      }

      setIndicatorStyle({
        top: position,
        height: location.pathname.includes("/profile") ? height : "3.6rem"
      });
    };

    // Small delay to ensure DOM is updated
    const timer = setTimeout(updateIndicator, 100);
    return () => clearTimeout(timer);
  }, [location.pathname, userData]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
      <div className={styles.sidebar}>
        <div className={styles.topSection}>
          <img src={logo} alt="JobMatrix Logo" className={`${styles.logo} ${styles.fullLogo}`} />
          <img src={logoMini} alt="JobMatrix Mini Logo" className={`${styles.logoMini}`} />

          <nav className={styles.navLinks}>
            <div
                className={styles.indicator}
                style={indicatorStyle}
            />

            <NavLink
                to="/recruiter/jobs"
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}
            >
              {({ isActive }) => (
                  <>
                    <img
                        src={isActive ? bagActive : bagInactive}
                        alt="Jobs"
                        className={styles.icon}
                    />
                    <span className={isActive ? styles.activeText : styles.inactiveText}>Jobs</span>
                  </>
              )}
            </NavLink>

            <NavLink
                to="/recruiter/company-info"
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}
            >
              {({ isActive }) => (
                  <>
                    <img
                        src={isActive ? companiesActive : companiesInactive}
                        alt="CompanyInfo"
                        className={styles.icon}
                    />
                    <span className={isActive ? styles.activeText : styles.inactiveText}>Company Info</span>
                  </>
              )}
            </NavLink>

            <div ref={profileRef}>
              <NavLink
                  to="/recruiter/profile/personal-info"
                  className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}
              >
                {({ isActive }) => (
                    <>
                      <img
                          src={userData?.user_profile_photo || defaultUser}
                          alt="Profile"
                          className={styles.profilePic}
                      />
                      <span className={isActive ? styles.activeText : styles.inactiveText} style={isActive?{color:'var(--blue)'}:{color:'var(--english-violet)'}}>
                    {(() => {
                      // If user data is missing, return "Profile"
                      if (!userData?.user_first_name || !userData?.user_last_name) {
                        return "Profile";
                      }

                      const firstName = userData.user_first_name;
                      const lastName = userData.user_last_name;

                      // Helper function to capitalize first letter of each word
                      const capitalize = (str) => {
                        return str.split(' ')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ');
                      };

                      // Get first word of first name
                      const firstWord = firstName.split(' ')[0];

                      // If first word fits within 12 chars (accounting for initials of last name)
                      if (firstWord.length < 10) {
                        // Try to add last name initial(s)
                        const lastNameWords = lastName.split(' ');
                        let displayName = capitalize(firstWord);

                        // Add initials from last name
                        for (const word of lastNameWords) {
                          if ((displayName + " " + word[0]).length <= 12) {
                            displayName += " " + word[0].toUpperCase();
                          } else {
                            break;
                          }
                        }

                        return displayName;
                      }

                      // If first word is too long, try first initial + last name
                      if (firstName[0].length + 1 + lastName.length <= 12) {
                        return firstName[0].toUpperCase() + " " + capitalize(lastName);
                      }

                      // If that's also too long, try first initial + first word of last name
                      const firstLastWord = lastName.split(' ')[0];
                      if (firstName[0].length + 1 + firstLastWord.length <= 12) {
                        return firstName[0].toUpperCase() + " " + capitalize(firstLastWord);
                      }

                      // If everything is too long, return capitalized initials
                      const firstInitial = firstName[0] ? firstName[0].toUpperCase() : '';
                      const lastInitial = lastName[0] ? lastName[0].toUpperCase() : '';
                      return `${firstInitial} ${lastInitial}`;
                    })()}
                  </span>
                    </>
                )}
              </NavLink>
            </div>
          </nav>
        </div>

        <span className={styles.logoutLink} onClick={handleLogout}>
        <img src={logoutIcon} alt="Logout" className={styles.icon} />
        <span>Logout</span>
      </span>
      </div>
  );
};

export default RecruiterSidenavBar;