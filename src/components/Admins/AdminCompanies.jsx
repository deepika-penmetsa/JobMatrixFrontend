import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../../styles/AdminCompanies.module.css";
import { FaBuilding } from "react-icons/fa6";
import {
    FiSearch,
    FiX,
    FiBriefcase,
    FiUsers,
    FiUserCheck,
    FiUserX,
    FiChevronDown,
    FiTrash2,
    FiInfo,
    FiSettings,
    FiAlertTriangle
} from "react-icons/fi";
import { IoFilter } from "react-icons/io5";
import defaultImage from "../../assets/nocompanyimage2.jpg";
import { getAdminCompanies, deleteCompany } from "../../services/api";
import classNames from "classnames";
import { BiSolidBusiness } from "react-icons/bi";
import {LuSearchX} from "react-icons/lu";

const AdminCompanies = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [industryFilter, setIndustryFilter] = useState("All Industries");
    const [sortBy, setSortBy] = useState("newest");
    const [companyDetailsOpen, setCompanyDetailsOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [companyDetailsTab, setCompanyDetailsTab] = useState("overview");
    const [confirmDeleteText, setConfirmDeleteText] = useState("");
    const [recruiterTab, setRecruiterTab] = useState("active");

    // Stats
    const [stats, setStats] = useState({
        totalCompanies: 0,
        activeRecruiters: 0,
        inactiveRecruiters: 0,
        totalJobs: 0
    });

    // Get unique industries from data
    const [availableIndustries, setAvailableIndustries] = useState([]);

    // Fetch companies data
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                setLoading(true);
                const response = await getAdminCompanies();
                const data = response.data;
                setCompanies(data);

                // Extract unique industries
                const industries = [...new Set(data.map(company => company.company_industry))];
                setAvailableIndustries(industries);

                // Calculate stats
                const activeRecruiters = data.reduce((sum, company) => sum + (company.active_recruiters_count || 0), 0);
                const inactiveRecruiters = data.reduce((sum, company) => sum + (company.inactive_recruiters_count || 0), 0);
                const totalJobs = data.reduce((sum, company) => sum + (company.total_jobs || 0), 0);

                setStats({
                    totalCompanies: data.length,
                    activeRecruiters,
                    inactiveRecruiters,
                    totalJobs
                });

            } catch (err) {
                setError("Failed to fetch companies data. Please try again.");
                console.error("Error fetching companies:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCompanies();
    }, []);

    // Filter and sort companies
    const filteredCompanies = companies.filter(company => {
        const matchesSearch =
            company.company_name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesIndustry = industryFilter === "All Industries" || company.company_industry === industryFilter;

        return matchesSearch && matchesIndustry;
    });

    // Sort companies
    const sortedCompanies = [...filteredCompanies].sort((a, b) => {
        if (sortBy === "newest") {
            return b.company_id - a.company_id;
        } else if (sortBy === "alphabetical") {
            return a.company_name.localeCompare(b.company_name);
        } else if (sortBy === "jobs") {
            return (b.total_jobs || 0) - (a.total_jobs || 0);
        }
        return 0;
    });

    // Handle company view
    const handleViewCompany = (company) => {
        setSelectedCompany(company);
        setCompanyDetailsOpen(true);
        setCompanyDetailsTab("overview");
    };

    // Handle delete company
    const handleDeleteCompany = (company) => {
        setSelectedCompany(company);
        setConfirmDeleteText("");
        setDeleteModalOpen(true);
    };

    // Confirm delete company
    const confirmDelete = async () => {
        if (confirmDeleteText !== selectedCompany.company_name) {
            return;
        }

        try {
            await deleteCompany(selectedCompany.company_id);

            // Update companies list
            setCompanies(companies.filter(c => c.company_id !== selectedCompany.company_id));

            // Update stats
            setStats({
                ...stats,
                totalCompanies: stats.totalCompanies - 1,
                activeRecruiters: stats.activeRecruiters - (selectedCompany.active_recruiters_count || 0),
                inactiveRecruiters: stats.inactiveRecruiters - (selectedCompany.inactive_recruiters_count || 0),
                totalJobs: stats.totalJobs - (selectedCompany.total_jobs || 0)
            });

            setDeleteModalOpen(false);
            setSelectedCompany(null);
            setConfirmDeleteText("");

        } catch (err) {
            setError("Failed to delete company. Please try again.");
            console.error("Error deleting company:", err);
        }
    };

    // Clear search
    const clearSearch = () => {
        setSearchQuery("");
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (error) {
        return <div className={styles.errorMessage}>{error}</div>;
    }


        return (
        <div className={styles.container}>

            <div className={styles.commonTopBar}>
            {/* Top Bar */}
            <div className={styles.topBar}>
                <h1 className={styles.title}>COMPANY MANAGEMENT</h1>
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Search companies..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <FiSearch className={styles.searchIcon} />
                </div>
            </div>

            {/* Stats Overview */}
            <div className={styles.statsOverview}>
                <div className={styles.statCard}>
                    <div className={classNames(styles.statIcon, styles.totalIcon)}>
                        <FaBuilding />
                    </div>
                    <div className={styles.statContent}>
                        <h3>{stats.totalCompanies}</h3>
                        <p>Total Companies</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={classNames(styles.statIcon, styles.jobsIcon)}>
                        <FiBriefcase />
                    </div>
                    <div className={styles.statContent}>
                        <h3>{stats.totalJobs}</h3>
                        <p>Active Jobs</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={classNames(styles.statIcon, styles.activeIcon)}>
                        <FiUserCheck />
                    </div>
                    <div className={styles.statContent}>
                        <h3>{stats.activeRecruiters}</h3>
                        <p>Active Recruiters</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={classNames(styles.statIcon, styles.inactiveIcon)}>
                        <FiUserX />
                    </div>
                    <div className={styles.statContent}>
                        <h3>{stats.inactiveRecruiters}</h3>
                        <p>Inactive Recruiters</p>
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className={styles.actionsBar}>
                <div className={styles.filtersWrapper}>
                    {/* Industry Filter */}
                    <div className={styles.filterDropdown}>
                        <button className={styles.filterButton}>
                            <IoFilter />
                            <span>{industryFilter}</span>
                            <FiChevronDown className={styles.rotated} />
                        </button>
                        <div className={styles.dropdownContent}>
                            <div className={styles.dropdownSection}>
                                <h4>Select Industry</h4>
                                <div className={styles.filterOptions}>
                                    <label className={styles.filterOption}>
                                        <input
                                            type="radio"
                                            name="industry"
                                            value="All Industries"
                                            checked={industryFilter === "All Industries"}
                                            onChange={() => setIndustryFilter("All Industries")}
                                        />
                                        <span>All Industries</span>
                                    </label>

                                    {availableIndustries.map(industry => (
                                        <label key={industry} className={styles.filterOption}>
                                            <input
                                                type="radio"
                                                name="industry"
                                                value={industry}
                                                checked={industryFilter === industry}
                                                onChange={() => setIndustryFilter(industry)}
                                            />
                                            <span>{industry}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sort Options */}
                    <div className={styles.sortButtons}>
                        <button
                            className={classNames(styles.sortButton, {
                                [styles.active]: sortBy === "newest"
                            })}
                            onClick={() => setSortBy("newest")}
                        >
                            Newest
                        </button>
                        <button
                            className={classNames(styles.sortButton, {
                                [styles.active]: sortBy === "alphabetical"
                            })}
                            onClick={() => setSortBy("alphabetical")}
                        >
                            A-Z
                        </button>
                        <button
                            className={classNames(styles.sortButton, {
                                [styles.active]: sortBy === "jobs"
                            })}
                            onClick={() => setSortBy("jobs")}
                        >
                            Most Jobs
                        </button>
                    </div>
                </div>
            </div>

            </div>
            {/* Companies Grid */}
            {loading ? (
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
                    ):(
                        <div className={styles.companiesGrid}>
                            {sortedCompanies.length > 0 ? (
                                sortedCompanies.map((company) => (
                                    <div key={company.company_id} className={styles.companyCard}>
                                        <div className={styles.companyHeader}>
                                            <div className={styles.logoWrapper}>
                                                <img
                                                    src={company.company_image ? `http://localhost:8000/media/${company.company_image}` : defaultImage}
                                                    alt={company.company_name}
                                                    className={styles.companyLogo}
                                                    onError={(e) => { e.target.src = defaultImage; }}
                                                />
                                            </div>
                                            <div className={styles.companyInfo}>
                                                <h3 className={styles.companyName}>{company.company_name}</h3>
                                                <span className={styles.companyTags}>{company.company_industry}</span>
                                            </div>

                                            <div className={styles.companyStats}>
                                                <div className={styles.stat}>
                                                    <FiUsers />
                                                    <span>{company.active_recruiters_count + company.inactive_recruiters_count || 0} Recruiters</span>
                                                </div>
                                                <div className={styles.stat}>
                                                    <FiBriefcase />
                                                    <span>{company.total_jobs || 0} Jobs</span>
                                                </div>
                                                <div className={styles.stat}>
                                                    <FiUserCheck />
                                                    <span>Active: {company.active_recruiters_count}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={styles.companyDescription}>
                                            <p>{company.company_description?.length > 120
                                                ? `${company.company_description.slice(0, 120)}...`
                                                : company.company_description}</p>
                                        </div>



                                        <div className={styles.cardActions}>
                                            <button
                                                className={styles.viewButton}
                                                onClick={() => handleViewCompany(company)}
                                            >
                                                <BiSolidBusiness />
                                                <span>Company Details</span>
                                            </button>

                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.emptyState}>
                                    <FaBuilding size={64} style={{ color: "#ccc", marginBottom: "1.5rem" }} />
                                    {/*<h3>No companies found</h3>*/}
                                    <h3>
                                        {searchQuery
                                            ? `No companies found for "${searchQuery}"`
                                            : "No companies available"}
                                    </h3>
                                    <button
                                        className={styles.clearButton}
                                        onClick={() => clearSearch()}
                                    >
                                        <LuSearchX />
                                        <span>clear search</span>
                                    </button>
                                </div>
                            )}
                        </div>
                )}



            {/* Company Details Modal */}
            <AnimatePresence>
                {companyDetailsOpen && selectedCompany && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setCompanyDetailsOpen(false)}
                    >
                        <motion.div
                            className={styles.companyModal}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            transition={{ duration: 0.3 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={styles.modalHeader}>
                                <h2>{selectedCompany.company_name}</h2>
                                <button
                                    className={styles.closeButton}
                                    onClick={() => setCompanyDetailsOpen(false)}
                                >
                                    <FiX />
                                </button>
                            </div>

                            <div className={styles.modalContent}>
                                {/* Tabs */}
                                <div className={styles.sectionTabs}>
                                    <button
                                        className={classNames(styles.tabButton, {
                                            [styles.active]: companyDetailsTab === "overview"
                                        })}
                                        onClick={() => setCompanyDetailsTab("overview")}
                                    >
                                        <FiInfo /> Overview
                                    </button>
                                    <button
                                        className={classNames(styles.tabButton, {
                                            [styles.active]: companyDetailsTab === "recruiters"
                                        })}
                                        onClick={() => setCompanyDetailsTab("recruiters")}
                                    >
                                        <FiUsers /> Recruiters
                                    </button>
                                    <button
                                        className={classNames(styles.tabButton, {
                                            [styles.active]: companyDetailsTab === "settings"
                                        })}
                                        onClick={() => setCompanyDetailsTab("settings")}
                                    >
                                        <FiSettings /> Settings
                                    </button>

                                </div>

                                {/* Overview Tab */}
                                {companyDetailsTab === "overview" && (
                                    <div className={styles.overviewTab}>
                                        <div className={styles.companyProfile}>
                                            <div className={styles.profileImage}>
                                                <img
                                                    src={selectedCompany.company_image ? `http://localhost:8000/media/${selectedCompany.company_image}` : defaultImage}
                                                    alt={selectedCompany.company_name}
                                                    onError={(e) => { e.target.src = defaultImage; }}
                                                />
                                            </div>
                                            <div className={styles.profileDetails}>
                                                <div className={styles.detailItem}>
                                                    <FaBuilding />
                                                    <div>
                                                        <h4>Industry</h4>
                                                        <p>{selectedCompany.company_industry || "Not specified"}</p>
                                                    </div>
                                                </div>

                                                <div className={styles.detailItem}>
                                                    <FiUsers />
                                                    <div>
                                                        <h4>Recruiters</h4>
                                                        <p>{selectedCompany.active_recruiters_count + selectedCompany.inactive_recruiters_count}</p>
                                                    </div>
                                                </div>

                                                <div className={styles.detailItem}>
                                                    <FiBriefcase />
                                                    <div>
                                                        <h4>Jobs</h4>
                                                        <p>{selectedCompany.total_jobs || 0}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={styles.aboutCompany}>
                                            <h3>About Company</h3>
                                            <p>{selectedCompany.company_description || "No description provided."}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Recruiters Tab */}
                                {companyDetailsTab === "recruiters" && (
                                    <div className={styles.recruitersTab}>
                                        <div className={styles.recruitersTabs}>
                                            <button
                                                className={classNames(styles.recruiterTabButton, {
                                                    [styles.active]: recruiterTab === "active"
                                                })}
                                                onClick={() => setRecruiterTab("active")}
                                            >
                                                Active ({selectedCompany.active_recruiters_count || 0})
                                            </button>
                                            <button
                                                className={classNames(styles.recruiterTabButton, {
                                                    [styles.active]: recruiterTab === "inactive"
                                                })}
                                                onClick={() => setRecruiterTab("inactive")}
                                            >
                                                Inactive ({selectedCompany.inactive_recruiters_count || 0})
                                            </button>
                                        </div>

                                        <div className={styles.recruitersTabContent}>
                                            {(recruiterTab === "active" ? selectedCompany.active_recruiters : selectedCompany.inactive_recruiters)?.length > 0 ? (
                                                <table className={styles.recruitersTable}>
                                                    <thead>
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Contact</th>
                                                        <th>Joined</th>
                                                        {recruiterTab === "inactive" && <th>End Date</th>}
                                                        <th>Status</th>
                                                        <th>Jobs Posted</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {(recruiterTab === "active" ? selectedCompany.active_recruiters : selectedCompany.inactive_recruiters).map(recruiter => (
                                                        <tr key={recruiter.recruiter_id}>
                                                            <td>
                                                                <div className={styles.recruiterInfo}>
                                                                    {recruiter.profile_photo ? (
                                                                        <img
                                                                            src={`http://localhost:8000/media/${recruiter.profile_photo}`}
                                                                            alt={recruiter.name || 'Recruiter'}
                                                                            className={styles.avatarImage}
                                                                        />
                                                                    ) : (
                                                                        recruiter.name ? recruiter.name.charAt(0).toUpperCase() : 'R'
                                                                    )}
                                                                    <div className={styles.recruiterName}>
                                                                        <span>{recruiter.name || 'Unknown'}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className={styles.contactInfo}>
                                                                    <span className={styles.recruiterEmail}>{recruiter.email}</span>
                                                                    {recruiter.phone && (
                                                                        <span className={styles.recruiterPhone}>{recruiter.phone}</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td>{formatDate(recruiter.start_date)}</td>
                                                            {recruiterTab === "inactive" && <td>{formatDate(recruiter.end_date)}</td>}
                                                            <td>
                                                                    <span className={classNames(styles.statusBadge, {
                                                                        [styles.inActiveStatusBadge]: recruiterTab === "inactive"
                                                                    })}>
                                                                        {recruiterTab === "active" ? "Active" : "Inactive"}
                                                                    </span>
                                                            </td>
                                                            <td>
                                                                    <span className={classNames(styles.jobCountBadge, {
                                                                        [styles.hasJobs]: recruiter.job_count > 0
                                                                    })}>
                                                                        {recruiter.job_count || 0}
                                                                    </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <div className={styles.emptyTabContent}>
                                                    <FiUsers size={48} />
                                                    <p>No {recruiterTab} recruiters for this company</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {/* Settings Tab */}
                                {companyDetailsTab === "settings" && (
                                    <div className={styles.settingsTab}>
                                        <div className={styles.settingsSection}>
                                            <div className={styles.dangerCard}>
                                                <div className={styles.dangerCardContent}>
                                                    <h4>Delete this company</h4>
                                                    <p>
                                                        Once you delete a company, there is no going back. All the Data associated with this company will be permanently deleted.
                                                    </p>
                                                </div>
                                                <button
                                                    className={styles.deleteCompanyButton}
                                                    onClick={() => handleDeleteCompany(selectedCompany)}
                                                >
                                                    <FiTrash2 />
                                                    Delete Company
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteModalOpen && selectedCompany && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setDeleteModalOpen(false)}
                    >
                        <motion.div
                            className={styles.confirmationModal}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={styles.modalHeader}>
                                <h2>Are you absolutely sure?</h2>
                                <button
                                    onClick={() => setDeleteModalOpen(false)}
                                    className={styles.closeButton}
                                >
                                    <FiX size={24} />
                                </button>
                            </div>

                            <div className={styles.modalContent}>
                                <div className={styles.warningMessage}>
                                    <div className={styles.warningIcon}>
                                        <FiAlertTriangle size={24} color="#d73a49" />
                                    </div>
                                    <div className={styles.warningText}>
                                        <p>This action <strong>cannot</strong> be undone. This will permanently delete the <strong>{selectedCompany.company_name}</strong> company and all associated data.</p>
                                    </div>
                                </div>

                                {(selectedCompany.active_recruiters_count > 0 || selectedCompany.inactive_recruiters_count > 0 || selectedCompany.total_jobs > 0) && (
                                    <div className={styles.affectedResources}>
                                        <h4>This will also delete:</h4>
                                        <ul className={styles.resourcesList}>
                                            {selectedCompany.active_recruiters_count > 0 && (
                                                <li>
                                                    <FiUsers className={styles.resourceIcon} />
                                                    <span>{selectedCompany.active_recruiters_count} active recruiter{selectedCompany.active_recruiters_count !== 1 ? 's' : ''}</span>
                                                </li>
                                            )}
                                            {selectedCompany.inactive_recruiters_count > 0 && (
                                                <li>
                                                    <FiUserX className={styles.resourceIcon} />
                                                    <span>{selectedCompany.inactive_recruiters_count} inactive recruiter{selectedCompany.inactive_recruiters_count !== 1 ? 's' : ''}</span>
                                                </li>
                                            )}
                                            {selectedCompany.total_jobs > 0 && (
                                                <li>
                                                    <FiBriefcase className={styles.resourceIcon} />
                                                    <span>{selectedCompany.total_jobs} active job{selectedCompany.total_jobs !== 1 ? 's' : ''}</span>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                )}

                                <div className={styles.confirmationInput}>
                                    <p>Please type <strong>{selectedCompany.company_name}</strong> to confirm.</p>
                                    <input
                                        type="text"
                                        value={confirmDeleteText}
                                        onChange={(e) => setConfirmDeleteText(e.target.value)}
                                        className={styles.confirmInput}
                                        placeholder={`Type "${selectedCompany.company_name}" to confirm`}
                                    />
                                </div>

                                <div className={styles.modalActions}>
                                    <button
                                        className={styles.cancelButton}
                                        onClick={() => setDeleteModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className={classNames(styles.deleteConfirmButton, {
                                            [styles.disabled]: confirmDeleteText !== selectedCompany.company_name
                                        })}
                                        disabled={confirmDeleteText !== selectedCompany.company_name}
                                        onClick={confirmDelete}
                                    >
                                        <FiTrash2 />
                                        Delete this company
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminCompanies;