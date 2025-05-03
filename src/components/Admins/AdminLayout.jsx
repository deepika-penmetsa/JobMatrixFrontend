import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState, forwardRef } from "react";

import styles from "../../styles/SidenavBar.module.css";
import logo from "../../assets/logo.svg";
import logoMini from "../../assets/logo-icon.svg";
import logoutIcon from "../../assets/SideNavIcon-Images/logout-inactive.svg";
import dashboardActive from "../../assets/SideNavIcon-Images/dashboard-active.svg";
import dashboardInactive from "../../assets/SideNavIcon-Images/dashboard-inactive.svg";
import usersActive from "../../assets/SideNavIcon-Images/users-active.svg";
import usersInactive from "../../assets/SideNavIcon-Images/users-inactive.svg";
import companiesActive from "../../assets/SideNavIcon-Images/companies-active.svg";
import companiesInactive from "../../assets/SideNavIcon-Images/companies-inactive.svg";
import defaultUser from "../../assets/noprofilephoto.png";
import { fetchUserData } from "../../Redux/userSlice";
import { formatImageUrl } from '../../services/imageUtils';

// Custom NavLink component that accepts refs
const NavLinkWithRef = forwardRef(({ to, className, children, ...props }, ref) => (
    <NavLink to={to} className={className} ref={ref} {...props}>
      {children}
    </NavLink>
));

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user.user);

  const getIndicatorPosition = () => {
    if (location.pathname.includes("/dashboard")) return "0rem";
    if (location.pathname.includes("/users")) return "4.3rem";
    if (location.pathname.includes("/companies")) return "8.8rem";

    // For settings, use the measurement from the ref
    if (location.pathname.includes("/settings")) {
      if (settingsRef.current) {
        const above = 13.2;
        return `${above}rem`;
      }
      return "13.2rem"; // Default fallback
    }

    return "0rem";
  };

  // Ref for the settings item specifically
  const settingsRef = useRef(null);

  useEffect(() => {
    dispatch(fetchUserData(localStorage.getItem("userEmail")));
  }, [dispatch]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Adjust indicator size and position when user data changes
  const [indicatorHeight, setIndicatorHeight] = useState("3.6rem");

  useEffect(() => {
    if (location.pathname.includes("/settings") && settingsRef.current) {
      // Measure the settings item's height
      const height = settingsRef.current.offsetHeight;
      setIndicatorHeight(`${height}px`);
    } else {
      // Default height for other menu items
      setIndicatorHeight("3.6rem");
    }
  }, [location.pathname, userData]);

  return (
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <div className={styles.topSection}>
            <img src={logo} alt="JobMatrix Logo" className={`${styles.logo} ${styles.fullLogo}`} />
            <img src={logoMini} alt="Mini Logo" className={styles.logoMini} />

            <nav className={styles.navLinks}>
              <div
                  className={styles.indicator}
                  style={{
                    top: getIndicatorPosition(),
                    height: location.pathname.includes("/settings") ? indicatorHeight : "3.6rem"
                  }}
              />

              <NavLink to="/admin/dashboard" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}>
                {({ isActive }) => (
                    <>
                      <img src={isActive ? dashboardActive : dashboardInactive} alt="Dashboard" className={styles.icon} />
                      <span className={isActive ? styles.activeText : styles.inactiveText}>Dashboard</span>
                    </>
                )}
              </NavLink>

              <NavLink to="/admin/users" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}>
                {({ isActive }) => (
                    <>
                      <img src={isActive ? usersActive : usersInactive} alt="Users" className={styles.icon} />
                      <span className={isActive ? styles.activeText : styles.inactiveText}>Users</span>
                    </>
                )}
              </NavLink>

              <NavLink to="/admin/companies" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}>
                {({ isActive }) => (
                    <>
                      <img src={isActive ? companiesActive : companiesInactive} alt="Companies" className={styles.icon} />
                      <span className={isActive ? styles.activeText : styles.inactiveText}>Companies</span>
                    </>
                )}
              </NavLink>

              <div ref={settingsRef}>
                <NavLink to="/admin/settings" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}>
                  {({ isActive }) => (
                      <>
                        <img
                            src={formatImageUrl(userData?.user_profile_photo, defaultUser)}
                            alt="Profile"
                            className={styles.profilePic}
                            onError={(e) => { e.target.src = defaultUser; }}
                        />
                        <span className={isActive ? styles.activeText : styles.inactiveText}>
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

        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
  );
};

export default AdminLayout;