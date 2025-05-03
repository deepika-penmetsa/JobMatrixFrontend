import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FiEdit3, FiSave, FiUsers, FiBriefcase } from "react-icons/fi";
import {LuEraser, LuLock} from "react-icons/lu";
import { BsBuilding, BsGraphUp, BsCalendarDate } from "react-icons/bs";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import CropImageUploader from "../../CropImageUploader";
import ToastNotification from "../../ToastNotification";
import { setCompany } from "../../../Redux/userSlice";
import { updateCompanyDetails, getRecruiterCompanyDetails } from '../../../services/api';
import defaultCompanyImage from '../../../assets/noprofilephoto.png';
import styles from '../../../styles/CompanyInfo.module.css';
import CompanySecretModal from "./CompanySecretModal.jsx";

const COLORS = ['var(--primary)', 'var(--secondary)', 'var(--icon-tertiary)', 'var(--yellow)'];

const CompanyInfo = () => {
    const dispatch = useDispatch();
    const reduxCompanyData = useSelector((state) => state.user?.company);

    const [companyData, setCompanyData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedDetails, setEditedDetails] = useState({});
    const [toastQueue, setToastQueue] = useState([]);
    const [companyImageFile, setCompanyImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [recruiterTab, setRecruiterTab] = useState("active");
    const [activeSection, setActiveSection] = useState("details");
    const [isSecretModalOpen, setIsSecretModalOpen] = useState(false);

    useEffect(() => {
        const fetchCompanyDetails = async () => {
            setIsLoading(true);
            try {
                const response = await getRecruiterCompanyDetails();
                setCompanyData(response);
                setEditedDetails({ ...response.company });
                dispatch(setCompany(response.company));
            } catch (error) {
                console.error("Error fetching company details:", error);
                showToast("Failed to load company information", "error");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCompanyDetails();
    }, [dispatch]);

    const showToast = (message, type = "success") => {
        const newToast = { message, type, id: Date.now() };
        setToastQueue(prev => [...prev, newToast]);

        setTimeout(() => {
            setToastQueue(prev => prev.filter(t => t.id !== newToast.id));
        }, 3000);
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (!isEditing) {
            setCompanyImageFile(null);
        }
    };

    const handleCompanyImageChange = (file) => {
        setCompanyImageFile(file);
    };

    const handleSaveChanges = async () => {
        try {
            const formData = new FormData();
            
            // Add text fields to formData
            if (editedDetails.company_name) {
                formData.append('company_name', editedDetails.company_name);
            }
            
            if (editedDetails.company_description) {
                formData.append('company_description', editedDetails.company_description);
            }
            
            // Handle the company image upload carefully
            if (companyImageFile) {
                // Rename the file to avoid path issues
                const cleanFileName = companyImageFile.name.split('/').pop().split('\\').pop();
                const newFile = new File([companyImageFile], cleanFileName, { type: companyImageFile.type });
                formData.append('company_image', newFile);
            } else if (editedDetails.company_image === null) {
                formData.append('company_image', '');
            }

            const response = await updateCompanyDetails(formData);

            if (response.error) {
                console.error("Company update failed:", response.error);
                showToast(response.error || "Operation failed", "error");
            } else {
                dispatch(setCompany(response.data));
                setCompanyData(prev => ({
                    ...prev,
                    company: response.data
                }));
                showToast("Company details updated successfully");
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Error updating company:", error);
            const errorMessage =
                error?.response?.data?.error?.message ||
                error?.response?.data?.message ||
                error?.message ||
                "Failed to update company details";

            showToast(errorMessage, "error");
        }
    };

    const handleCancel = () => {
        // Reset to the original company data from Redux
        if (reduxCompanyData) {
            setEditedDetails({
                company_name: reduxCompanyData.company_name || '',
                company_industry: reduxCompanyData.company_industry || '',
                company_description: reduxCompanyData.company_description || '',
                company_image: reduxCompanyData.company_image || null
            });
        }
        setCompanyImageFile(null);
        setIsEditing(false);
        showToast("Changes discarded", "info");
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const prepareJobDistributionData = () => {
        if (!companyData?.recruiters) return [];

        return companyData.recruiters.map(recruiter => ({
            name: `${recruiter.user_first_name} ${recruiter.user_last_name}`,
            value: recruiter.jobs_posted
        }));
    };

    const renderCustomizedLabel = ({
                                       cx,
                                       cy,
                                       midAngle,
                                       innerRadius,
                                       outerRadius,
                                       value
                                   }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                {value}
            </text>
        );
    };

    const filteredRecruiters = () => {
        if (!companyData?.recruiters) return [];
        return companyData.recruiters.filter(recruiter =>
            recruiterTab === "active" ? recruiter.is_active : !recruiter.is_active
        );
    };

    const showDetailsSection = () => {
        setActiveSection("details");
    };

    const showAnalyticsSection = () => {
        setActiveSection("analytics");
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingOverlay}>
                    <iframe
                        src="https://lottie.host/embed/642b60ca-6e74-40ba-8d4e-c12fa8db1bc3/gxUxRH683G.lottie"
                        className={styles.loadingAnimation}
                        title="Loading animation"
                        allowFullScreen
                        allow="autoplay"
                        style={{
                            backgroundColor: 'transparent',
                            overflow: 'hidden'
                        }}
                    />
                </div>
            </div>
        );
    }

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

            <div className={styles.headerSection}>
                <h2 className={styles.sectionTitle}>Company Details</h2>
                <div className={styles.navLinks}>
                    <button
                        className={`${styles.navLink} ${activeSection === "details" ? styles.activeNavLink : ""}`}
                        onClick={showDetailsSection}
                    >
                        <BsBuilding /> Company Info
                    </button>
                    <button
                        className={`${styles.navLink} ${activeSection === "analytics" ? styles.activeNavLink : ""}`}
                        onClick={showAnalyticsSection}
                    >
                        <BsGraphUp /> Analytics
                    </button>
                </div>
            </div>

            {activeSection === "details" && (
                <div className={`${styles.section} ${styles.detailsSection}`}>
                    <div className={styles.profileContainer}>
                        <div className={styles.logoSection}>
                            <CropImageUploader
                                name="company_image"
                                onFileChange={handleCompanyImageChange}
                                defaultImage={defaultCompanyImage}
                                currentImage={editedDetails.company_image}
                                checkPage='company-info'
                                isEditing={isEditing}
                                onDelete={() => {
                                    setEditedDetails(prev => ({
                                        ...prev,
                                        company_image: null
                                    }));
                                    setCompanyImageFile(null);
                                }}
                            />
                        </div>
                        <div className={styles.infoSection}>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="company_name"
                                    value={editedDetails.company_name || ''}
                                    onChange={handleInputChange}
                                    className={styles.editNameInput}
                                    placeholder="Company Name"
                                />
                            ) : (
                                <h2 className={styles.companyName}>{editedDetails.company_name}</h2>
                            )}
                            <div className={styles.industry}>{editedDetails.company_industry}</div>
                        </div>
                    </div>

                    <div className={styles.descriptionSection}>
                        <h3 className={styles.subsectionTitle}>About</h3>
                        {isEditing ? (
                            <textarea
                                name="company_description"
                                value={editedDetails.company_description || ''}
                                onChange={handleInputChange}
                                className={styles.editDescription}
                                rows={6}
                                placeholder="Company description..."
                            />
                        ) : (
                            <p className={styles.description}>
                                {editedDetails.company_description || "No description provided."}
                            </p>
                        )}
                    </div>

                    <div className={styles.sectionHeader}>
                        {!isEditing ? (
                            <div className={styles.editActions}>
                                <button className={styles.editButton} onClick={handleEditToggle}>
                                    <FiEdit3 /> Edit Profile
                                </button>
                                <button
                                    className={styles.changeCompanySecretButton}
                                    onClick={() => setIsSecretModalOpen(true)}
                                >
                                    <LuLock /> Change Company Secret
                                </button>
                            </div>

                        ) : (
                            <div className={styles.editActions}>
                                <button className={styles.cancelButton} onClick={handleCancel}>
                                    <LuEraser /> Cancel
                                </button>
                                <button className={styles.saveButton} onClick={handleSaveChanges}>
                                    <FiSave /> Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeSection === "analytics" && companyData && (
                <div className={`${styles.analyticsSection}`}>
                    <div className={styles.analyticsSectionHeader}>
                        <h2 className={styles.analyticsSectionTitle}>Analytics</h2>
                    </div>

                    <div className={styles.analyticsGrid}>
                        <div className={styles.statsCards}>
                            <div className={styles.statCard}>
                                <div className={styles.statIcon}>
                                    <FiUsers size={24} />
                                </div>
                                <div className={styles.statContent}>
                                    <h3 className={styles.statTitle}>Total Recruiters</h3>
                                    <p className={styles.statValue}>{companyData.stats.total_recruiters}</p>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statIcon}>
                                    <FiUsers size={24} />
                                </div>
                                <div className={styles.statContent}>
                                    <h3 className={styles.statTitle}>Active Recruiters</h3>
                                    <p className={styles.statValue}>{companyData.stats.active_recruiters}</p>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statIcon}>
                                    <FiBriefcase size={24} />
                                </div>
                                <div className={styles.statContent}>
                                    <h3 className={styles.statTitle}>Total Jobs</h3>
                                    <p className={styles.statValue}>{companyData.stats.total_jobs}</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.chartContainer}>
                            <h3 className={styles.chartTitle}>Job Distribution</h3>
                            <div className={styles.chartWrapper}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={prepareJobDistributionData()}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            fill="#8884d8"
                                            paddingAngle={2}
                                            dataKey="value"
                                            label={renderCustomizedLabel}
                                            labelLine={false}
                                        >
                                            {prepareJobDistributionData().map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend layout="horizontal" verticalAlign="bottom" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className={styles.recruitersSection}>
                        <div className={styles.recruiterTabs}>
                            <button
                                className={`${styles.recruiterTab} ${recruiterTab === "active" ? styles.activeRecruiterTab : ''}`}
                                onClick={() => setRecruiterTab("active")}
                            >
                                Active Recruiters ({companyData.stats.active_recruiters})
                            </button>
                            <button
                                className={`${styles.recruiterTab} ${recruiterTab === "inactive" ? styles.activeRecruiterTab : ''}`}
                                onClick={() => setRecruiterTab("inactive")}
                            >
                                Inactive Recruiters ({companyData.stats.total_recruiters - companyData.stats.active_recruiters})
                            </button>
                        </div>

                        <div className={styles.recruitersTable}>
                            <div className={styles.tableHeader}>
                                <div className={styles.headerCell}>Name</div>
                                <div className={styles.headerCell}>Email</div>
                                <div className={styles.headerCell}>Status</div>
                                <div className={styles.headerCell}>
                                    {recruiterTab === "active" ? "Start Date" : "End Date"}
                                </div>
                                <div className={styles.headerCell}>Jobs Posted</div>
                            </div>
                            <div className={styles.tableBody}>
                                {filteredRecruiters().map(recruiter => (
                                    <div key={recruiter.recruiter_id} className={styles.tableRow}>
                                        <div className={styles.tableCell}>
                                            {recruiter.user_first_name} {recruiter.user_last_name}
                                            {recruiter.is_current_user && <span className={styles.currentUserTag}> (You)</span>}
                                        </div>
                                        <div className={styles.tableCell}>{recruiter.user_email}</div>
                                        <div className={styles.tableCell}>
                                            <span className={`${styles.statusBadge} ${recruiter.is_active ? styles.active : styles.inactive}`}>
                                                {recruiter.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className={styles.tableCell}>
                                            <BsCalendarDate className={styles.dateIcon} />
                                            {recruiterTab === "active" ? recruiter.start_date : recruiter.end_date}
                                        </div>
                                        <div className={styles.tableCell}>{recruiter.jobs_posted}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <CompanySecretModal
                isOpen={isSecretModalOpen}
                onClose={() => setIsSecretModalOpen(false)}
            />
        </div>
    );
};

export default CompanyInfo;