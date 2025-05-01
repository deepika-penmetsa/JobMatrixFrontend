import { Routes, Route, Navigate } from "react-router-dom";
import styles from "../../styles/ApplicantDashboard.module.css";
import RecruiterSidenavBar from "../RecruiterSidenavBar";
import JobsList from "./Jobs/JobsList"
import PersonalInfoTab from "../Applicants/Profile/PersonalInfoTab"
import RecruiterProfilePage from "./Profile/RecruiterProfilePage"
import CompanyInfo from "./Company/CompanyInfo"

const RecruiterDashboard = () => {

    return(
        <div className={styles.container}>
            <RecruiterSidenavBar/>
        <div className={styles.content}>
            <Routes>
            <Route path="/" element={<Navigate to="jobs" replace />} />
            <Route path="jobs" element={<JobsList />} />
            <Route path="company-info" element={<CompanyInfo />} />
            <Route path="profile"  element={<RecruiterProfilePage />}> 
                <Route index element={<Navigate to="personal-info" replace />} />
                <Route path="personal-info" element={<PersonalInfoTab />} />
            </Route>
            </Routes>
        </div>
    </div>
    )

}

export default RecruiterDashboard