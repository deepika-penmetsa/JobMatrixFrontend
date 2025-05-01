import { NavLink, Outlet } from "react-router-dom";
import styles from "../../../styles/ProfilePage.module.css";

const tabs = [
  { path: "personal-info", label: "Personal Info" }
];

const RecruiterProfilePage = () => {
  return (
    
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.tabNav}>
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                isActive ? styles.activeTab : styles.inactiveTab
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>

        <div className={styles.tabContent}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default RecruiterProfilePage;
