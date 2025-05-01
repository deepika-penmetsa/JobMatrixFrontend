import { Routes, Route, Navigate } from "react-router-dom";
import ExploreJobsPage from "./ExploreJobsPage";
import BookmarksPage from "./BookmarksPage";
import AppliedJobsPage from "./AppliedJobsPage";
import ProfilePage from "./Profile/ProfilePage";
import {
  PersonalInfoTab,
  SkillsTab,
  EducationTab,
  WorkExperienceTab,
  ResumeTab,
} from "./Profile";
import SidenavBar from "../SidenavBar";
import styles from "../../styles/ApplicantDashboard.module.css";

const ApplicantDashboard = () => {


  return (
    <div className={styles.container}>
      <SidenavBar />
      <div className={styles.content}>
        <Routes>
          <Route path="/" element={<Navigate to="explore-jobs" replace />} />
          <Route path="explore-jobs" element={<ExploreJobsPage />} />
          <Route path="bookmarks" element={<BookmarksPage />} />
          <Route path="applied-jobs" element={<AppliedJobsPage />} />

          <Route path="profile" element={<ProfilePage />}>
            <Route index element={<Navigate to="personal-info" replace />} />
            <Route path="personal-info" element={<PersonalInfoTab />} />
            <Route path="skills" element={<SkillsTab />} />
            <Route path="education" element={<EducationTab />} />
            <Route path="work-experience" element={<WorkExperienceTab />} />
            <Route path="resume" element={<ResumeTab />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
};

export default ApplicantDashboard;
