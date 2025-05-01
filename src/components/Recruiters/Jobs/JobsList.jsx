
import React, { useState, useMemo, useEffect, useCallback } from "react";
import RecruiterCommonTopBar from '../RecruiterCommonTopBar';
import styles from "../../../styles/JobsList.module.css";
import {
  getJobsListByACompany,
  getApplicantsForJob,
  updateApplicationStatus,
  updateJobPosting,
  deleteJobPosting
} from "../../../services/api";
import ApplicantsPanel from '../JobApplicants/ApplicantsPanel';
import { motion, AnimatePresence } from "framer-motion";
import PostJobPopup from './PostJobPopup'
import { useSelector } from 'react-redux';
import ToastNotification from "../../ToastNotification";
import { FaUserCheck, FaUserClock, FaUsers, FaCalendarCheck } from "react-icons/fa";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { GoPeople } from "react-icons/go";
import {HiLocationMarker} from "react-icons/hi";
import {RiMoneyDollarCircleFill} from "react-icons/ri";

const JobsList = () => {
  const userData = useSelector((state)=> state.user.user)
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [allJobs, setAllJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState(null);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);
  const [totalPages, setTotalPages] = useState(0)
  const [applicantsListCurrentPage, setApplicantsListCurrentPage] = useState(1);
  const [applicantsListTotalPages, setApplicantsListTotalPages] = useState(1)
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showPostJobPopup, setShowPostJobPopup] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastQueue, setToastQueue] = useState([]);
  const [clearSearch, setClearSearch] = useState(true)
  const [filters, setFilters] = useState({
    locations: [],
    jobTitles: [],
    datePosted: "Any time"
  });



  const fetchData = async (controller) => {
    setIsLoading(true);
    try {
      const response = await getJobsListByACompany({
        page: currentPage,
        ...filters
      }, { signal: controller.signal });

      if (response?.results) {
        setAllJobs(response.results);
        setTotalPages(response.total_pages);
      } else {
        setAllJobs([]);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(`Error in fetching Job List: ${err}`);
        setError(err.message || "Failed to fetch jobs");
        setAllJobs([]);
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  };


  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller);
    return () => controller.abort();
  }, [currentPage, filters, panelOpen]);



  const refreshJobs = useCallback(() => {
    setCurrentPage(1);
  }, []);


  const handleEditJob = async (updatedJobData) => {
    try {
      await updateJobPosting(editingJob.job_id, updatedJobData);
      refreshJobs();
      setEditingJob(null);
      const controller = new AbortController();
      fetchData(controller);
    } catch (error) {
      console.error("Error updating job:", error);
    }
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      setIsDeleting(true);
      await deleteJobPosting(jobToDelete.job_id);
      setJobToDelete(null);
      refreshJobs();
      const controller = new AbortController();
      fetchData(controller);
      showToast('Job deleted successfully', 'success');
    } catch (error) {
      console.error("Error deleting job:", error);
      showToast('Failed to delete job', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (selectedJob != null && !isLoadingApplicants) {
      const fetchApplicants = async () => {
        if (applications && applicantsListCurrentPage !== applications.current_page) {
          const data = {
            job_Id: selectedJob.job_id,
            page: applicantsListCurrentPage
          };

          setIsLoadingApplicants(true);
          try {
            const statusParam = selectedStatus === 'All' ? '' : selectedStatus;
            const apps = await getApplicantsForJob(data, statusParam);
            setApplications(apps);
            setApplicantsListTotalPages(apps.total_pages);
          } catch (error) {
            console.error("Error refreshing applicants:", error);
          } finally {
            setIsLoadingApplicants(false);
          }
        }
      };

      fetchApplicants();
    }
  }, [applicantsListCurrentPage, selectedJob, selectedStatus]);


  const handleViewApplicants = useCallback(async (job, status = '', isStatusChanged = false, explicitPageNum = null) => {
    setIsLoadingApplicants(true);

    const statusToUse = status || 'All';
    setSelectedStatus(statusToUse);

    const pageToUse = explicitPageNum !== null
        ? explicitPageNum
        : (isStatusChanged ? 1 : applicantsListCurrentPage);

    if (isStatusChanged || explicitPageNum !== null) {
      setApplicantsListCurrentPage(pageToUse);
    }

    const data = {
      job_Id: job.job_id,
      page: pageToUse
    };

    try {
      // Pass the status parameter correctly based on the UI selection
      const statusParam = statusToUse === 'All' ? '' : statusToUse;
      const apps = await getApplicantsForJob(data, statusParam);

      setApplications(apps);
      setApplicantsListTotalPages(apps.total_pages);
      setSelectedJob(job);
      setPanelOpen(true);
    } catch (error) {
      console.error("Error fetching applicants:", error);
      setError("Failed to load applicants");
    } finally {
      setIsLoadingApplicants(false);
    }
  }, []);

  const handleClosePanel = () => {
    setPanelOpen(false);
    setTimeout(() => {
      setSelectedJob(null);
      setApplications(null);
    }, 300);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleStatusChange = async (applicationId, newStatus, comment = null) => {

    try {
      const response = await updateApplicationStatus(applicationId, {
        "application_status": newStatus,
        "application_recruiter_comment": comment
      });
      if (response && !response.error) {
        setApplications(prev => {
          if (!prev || !prev.results) return prev;

          return {
            ...prev,
            results: prev.results.map(app =>
                app.application_id === applicationId
                    ? {
                      ...app,
                      application_status: newStatus,
                      application_recruiter_comment: comment || app.application_recruiter_comment
                    }
                    : app
            )
          };
        });
      } else {
        console.error("API response indicates failure:", response);
        throw new Error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating application:", error);

    }
  };


  const handleFilter = useCallback((newFilters) => {
    setCurrentPage(1);
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  const filteredJobs = useMemo(() => {
    if (!searchQuery) return allJobs;
    return allJobs.filter(job =>
        job.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.job_description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allJobs]);

  const showToast = (message, type = "success") => {
    const newToast = { message, type, id: Date.now() };
    setToastQueue(prev => [...prev, newToast]);

    setTimeout(() => {
      setToastQueue(prev => prev.filter(t => t.id !== newToast.id));
    }, 3000);
  };

  const currentJobs = filteredJobs
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { y: -5, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }
  };

  useEffect(()=> {
    const controller = new AbortController();
    fetchData(controller);
    return () => controller.abort();
  },[showPostJobPopup])

  if (error) {
    return (
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3>Error Loading Jobs</h3>
          <p>{error}</p>
          <button
              className={styles.retryButton}
              onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
    );
  }

  return (
      <div className={styles.container}>
        <RecruiterCommonTopBar
            onSearch={handleSearch}
            clearSearch = {!clearSearch}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onFilter={handleFilter}
            filters={filters}
            onPostJob={() => setShowPostJobPopup(true)}
            title="Posted Jobs"
        />
        {!isLoading ?
              (<div className={styles.jobsList}>
                    {currentJobs.length > 0 ? (
                        <AnimatePresence initial={false}>
                          {currentJobs.map((job) => (
                              <motion.div
                                  key={job.job_id}
                                  className={styles.jobCard}
                                  variants={cardVariants}
                                  initial="hidden"
                                  animate="visible"
                                  whileHover="hover"
                                  transition={{ duration: 0.3 }}
                              >
                                <div className={styles.jobCardSections}>

                                        <div>
                                            <div className={styles.jobHeader}>
                                            <div className={styles.companyLogoPlaceholder}>
                                              {job.job_title?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className={styles.jobInfo}>
                                              <h3 className={styles.jobTitle}>{job.job_title}</h3>
                                              <div className={styles.jobMeta}>
                                                  <span className={styles.metaItem}>
                                                    <HiLocationMarker className={styles.metaIcon} />
                                                    <span>{job.job_location}</span>
                                                  </span>
                                                                                <span className={styles.metaItem}>
                                                    <FaCalendarCheck className={styles.metaIcon} />
                                                    <span>{new Date(job.date_posted).toLocaleDateString()}</span>
                                                  </span>
                                                                                <span className={styles.metaItem}>
                                                    <RiMoneyDollarCircleFill className={styles.metaIcon} />
                                                    <span>${parseFloat(job.job_salary || 0).toLocaleString()}/yr</span>
                                                  </span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        <div className={styles.jobBottomSection}>
                                            <div className={styles.applicationsStats}>
                                          <div className={styles.statItem}>
                                            <FaUsers className={styles.statIcon} />
                                            <span className={styles.statValue}>{job.total_applications || 0}</span>
                                            <span className={styles.statLabelTotal}>Total</span>
                                          </div>
                                          <div className={styles.statItem}>
                                            <FaUserCheck className={styles.statIcon} />
                                            <span className={styles.statValue}>{job.approved_applications || 0}</span>
                                            <span className={styles.statLabelApproved}>Approved</span>
                                          </div>
                                          <div className={styles.statItem}>
                                            <FaUserClock className={styles.statIcon}/>
                                            <span className={styles.statValue}>{job.pending_applications || 0}</span>
                                            <span className={styles.statLabelPending}>Pending</span>
                                          </div>
                                        </div>

                                            <div className={styles.jobActions}>
                                              <button
                                                  className={styles.deleteButton}
                                                  onClick={() => setJobToDelete(job)}
                                              >
                                                <FiTrash2 /> Delete
                                              </button>
                                              <button
                                                  className={styles.editButton}
                                                  onClick={() => setEditingJob(job)}
                                              >
                                                <FiEdit /> Edit Job
                                              </button>

                                              <button
                                                  className={styles.viewButton}
                                                  onClick={() => handleViewApplicants(job)}
                                              >
                                                {isLoadingApplicants && selectedJob?.job_id === job.job_id ? (
                                                    <>
                                                      <span className={styles.spinner}></span> Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                      <GoPeople /> View Applicants
                                                    </>
                                                )}
                                              </button>

                                        </div>
                                        </div>

                                </div>
                              </motion.div>
                          ))}
                        </AnimatePresence>
                    ) : (
                        <div className={styles.noResults}>
                          <div className={styles.noResultsIllustration}>
                            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                          </div>
                          <h3>No jobs found</h3>

                          <p>{searchQuery ? "No jobs match your search criteria" : "You haven't posted any jobs yet"}</p>

                          {
                              searchQuery &&
                              <button
                                  className={styles.clearSearchButton}
                                  onClick={() => {setSearchQuery(""); setClearSearch(!clearSearch)}}
                              >
                                Clear search
                              </button>
                          }

                          {
                              (!searchQuery && (filters.locations.length > 0 || filters.jobTitles.length > 0 || filters.datePosted !== "Any time")) &&
                              <button
                                  className={styles.clearSearchButton}
                                  onClick={() => {
                                    setFilters({
                                      locations: [],
                                      jobTitles: [],
                                      datePosted: "Any time"
                                    });
                                    setSearchQuery("");

                                  }}
                              >
                                Clear Filters
                              </button>
                          }

                        </div>
                    )}
                  </div>
              )
              :
              (
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
              )

        }

        {panelOpen && selectedJob && (
            <>
              <div
                  className={`${styles.overlay} ${styles.active}`}
                  onClick={handleClosePanel}
              />
              <div className={`${styles.applicantsPanelWrapper} ${styles.active}`}>
                <ApplicantsPanel
                    job={selectedJob}
                    onClose={handleClosePanel}
                    applications={applications}
                    onStatusChange={handleStatusChange}
                    applicantsListCurrentPage={applicantsListCurrentPage}
                    setApplicantsListCurrentPage={setApplicantsListCurrentPage}
                    applicantsListTotalPages={applicantsListTotalPages}
                    handleViewApplicants={handleViewApplicants}
                    selectedStatus={selectedStatus}
                />
              </div>
            </>
        )}

        {showPostJobPopup && (
            <PostJobPopup
                onClose={() => setShowPostJobPopup(false)}
                recruiterId={userData.user_id}
                refreshJobs={refreshJobs}
            />
        )}

        {/* Edit Job Popup */}
        {editingJob && (
            <PostJobPopup
                onClose={() => setEditingJob(null)}
                recruiterId={userData.user_id}
                refreshJobs={refreshJobs}
                jobData={editingJob}
                onSave={handleEditJob}
            />
        )}

        {jobToDelete && (
            <div className={styles.modalOverlay} onClick={() => setJobToDelete(null)}>
              <motion.div
                  className={styles.confirmationModal}
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 400 }}
                  onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <div className={styles.warningIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z"
                            stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className={styles.modalTitle}>Delete Job Posting</h3>
                </div>

                <div className={styles.modalContent}>
                  <p className={styles.confirmationText}>
                    Are you sure you want to delete <strong>"{jobToDelete.job_title}"</strong>?
                  </p>
                  <p className={styles.warningText}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z"
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    This action cannot be undone. All associated applications will be removed.
                  </p>
                </div>

                <div className={styles.modalFooter}>
                  <button
                      className={styles.secondaryButton}
                      onClick={() => setJobToDelete(null)}
                      disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                      className={styles.dangerButton}
                      onClick={handleDeleteJob}
                      disabled={isDeleting}
                  >
                    {isDeleting ? (
                        <>
                          <span className={styles.spinner}></span>
                          Deleting...
                        </>
                    ) : (
                        'Delete Permanently'
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
        )}
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
      </div>
  );
};

export default JobsList;