import React, { useState, useMemo, useEffect, useCallback } from "react";
import CommonTopBar from "./CommonTopBar";
import styles from "../../styles/ExploreJobsPage.module.css";
import noResultsImage from '../../assets/CommonJobCardIcon-Images/No Jobs Found.svg';
import defaultCompanyImage from "../../assets/nocompanyimage2.jpg"
import bookmarkOutline from "../../assets/CommonJobCardIcon-Images/Bookmark-Outline.svg";
import viewMoreButton from "../../assets/CommonJobCardIcon-Images/viewmore_expand.svg";
import viewLessButton from "../../assets/CommonJobCardIcon-Images/viewmore_collapse.svg";
import { ClearAll, History, LocationOn, Paid } from "@mui/icons-material";
import { LuUpload, LuCheck } from "react-icons/lu";
import { MdWork, MdList, MdSchool, MdStarRate } from 'react-icons/md';
import { getAllJobs, addBookmark, applyJob } from "../../services/api";
import ToastNotification from "../ToastNotification.jsx";

const ExploreJobsPage = () => {
  const [jobsData, setJobsData] = useState({
    jobs: [],
    total_count: 0,
    current_page: 1,
    total_pages: 1
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersCleared, setFiltersCleared] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [toastQueue, setToastQueue] = useState([]);
  const [jobId, setJobId] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState({
    applying: false,
    success: false
  });
  const [filters, setFilters] = useState({
    minSalary: 0,
    locations: [],
    jobTitles: [],
    companies: [],
    datePosted: "Any time"
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobsData.jobs;

    const searchTerms = searchQuery.toLowerCase().split(/\s+/).filter(term => term.length > 0);
    
    return jobsData.jobs.filter(job => {
      const searchableFields = [
        job.job_title.toLowerCase(),
        job.company.company_name.toLowerCase(),
        job.company.company_industry.toLowerCase(),
        job.job_location.toLowerCase()
      ];
      return searchTerms.every(term => searchableFields.some(field => field.includes(term)));
    });
  }, [searchQuery, jobsData.jobs]);

  const totalPages = jobsData.total_pages;
  const totalCount = jobsData.total_count;
  const currentPageJobs = filteredJobs; 

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearAllFilters = () => {
    const clearedFilters = {
      minSalary: 0,
      locations: [],
      jobTitles: [],
      companies: [],
      datePosted: "Any time"
    };
    document.documentElement.style.removeProperty('--slider-percentage');
    setFilters(clearedFilters);
    setCurrentPage(1);
    setFiltersCleared(prev => !prev); 
  };

  const handleAddBookmark = async (e, jobId) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const response = await addBookmark({ job_id: jobId });
      if (!response.error) {
        showToast("Bookmark added successfully!", "success");
        fetchJobs(); 
      } else {
        throw new Error(response["detail"]);
      }
    } catch (error) {
      showToast(error.message || "Failed to add bookmark", "error");
    }
  };
  
  const handleApplyJob = async (e, jobId) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setApplicationStatus({ applying: true, success: false });
      
      const response = await applyJob({ job_id: jobId });
      
      if (!response.error) {
        setApplicationStatus({ applying: false, success: true });
        showToast("Application sent successfully!", "success");
        fetchJobs();
        setTimeout(() => {
          setApplicationStatus({ applying: false, success: false });
        }, 2000);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      setApplicationStatus({ applying: false, success: false });
      showToast(error.detail || "Failed to apply for the job", "error");
    }
  };

  const showToast = (message, type) => {
    const newToast = { message, type, id: Date.now() };
    setToastQueue(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToastQueue(prev => prev.filter(t => t.id !== newToast.id));
    }, 3000);
  };

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllJobs({
        ...filters,
        page: currentPage
      });
      
      setJobsData({
        jobs: response.data,
        total_count: response["total_count"],
        current_page: response["current_page"],
        total_pages: response["total_pages"]
      });
    } catch (err) {
      setError(err.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs, filtersCleared]);

  return (
    <div className={styles.container}>
      <CommonTopBar
        page="explore"
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onFilter={handleFilter}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        filtersCleared={filtersCleared}
      />
  
      {!loading && (    
        <div className={styles.jobsList}>
          {currentPageJobs.length > 0 ? (
            currentPageJobs.map((job) => (
              <div key={job.job_id} className={styles.jobCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.leftSection}>
                    <img
                      src={ `http://localhost:8000${job.company.company_image}` || defaultCompanyImage }
                      alt={job.company.company_name}
                      className={styles.companyLogo}
                    />
                    <div className={styles.jobInfoSection}>
                      <span className={styles.jobInfoInnerSection}>
                        <span className={styles.daysAgoBookmark}>
                          <div className={styles.daysAgo}>
                            <History className={styles.historyIcon} />
                            <span>
                              {(() => {
                                const now = new Date();
                                const postedDate = new Date(job.job_date_posted);
                                const timeDiff = now - postedDate;
                                const seconds = Math.floor(timeDiff / 1000);
                                const minutes = Math.floor(seconds / 60);
                                const hours = Math.floor(minutes / 60);
                                const days = Math.floor(hours / 24);
                                const weeks = Math.floor(days / 7);
                                const months = Math.floor(days / 30);
                                const years = Math.floor(days / 365);

                                if (seconds < 60) return 'Just now';
                                if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
                                if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
                                if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
                                if (weeks <= 4) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
                                if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
                                return `${years} year${years === 1 ? '' : 's'} ago`;
                              })()}
                            </span>
                          </div>
                          <div className={styles.bookmarkBlock}
                                onClick={(e) => { handleAddBookmark(e, job.job_id);}}>
                            <img src={bookmarkOutline} alt="Bookmark" className={styles.bookmarkIcon} />
                          </div>
                        </span>
                        <h3 className={styles.jobTitle}>{job.job_title}</h3>
                      </span>
                      <span className={styles.companyName}>
                        <span>{job.company.company_name}</span>
                        <span style={{color:'#B1B1B1'}}>{job.company.company_industry}</span> 
                      </span>
                    </div>
                  </div>
    
                  <div className={styles.rightSection}>
                    <div className={styles.locationSalary}>
                      <div className={styles.infoBlock}>
                        <LocationOn className={styles.infoIcon} />
                        <span>{job.job_location}</span>
                      </div>
                      <div className={styles.infoBlock}>
                        <Paid className={styles.infoIcon} />
                        <span>${parseFloat(job.job_salary).toLocaleString()} {job.job_salary < 1000 ? '/hr' : '/yr'}</span>
                      </div>
                    </div>
                  </div>
                </div>
    
                <hr className={styles.divider} />
    
                <div className={styles.jobDescription}>
                  <div 
                    className={styles.descriptionContent} 
                    style={{
                      maxHeight: expandedJobId === job.job_id ? '1000px' : '100px',
                      overflow: 'hidden',
                      transition: 'max-height 0.3s ease-in-out'
                    }}
                  >

                    <div className={styles.jobInfoSection}>
                      <strong>Job Description</strong>
                      {expandedJobId === job.job_id ? (() => {
                        const sections = job.job_description.split(/(?=\[.*?\])/g);
                        const mandatorySection = sections.find(section => 
                          section.startsWith('[About the Role]')
                        );
                        
                        const otherSections = sections.filter(section => 
                          !section.startsWith('[About the Role]') && 
                          section.replace(/\[.*?\]/, '').trim().length > 0
                        );

                        const renderSection = (section) => {
                          const titleMatch = section.match(/\[(.*?)\]/);
                          const title = titleMatch ? titleMatch[1] : null;
                          const content = section.replace(/\[.*?\]/, '').trim();

                          let Icon;
                          switch (title) {
                            case 'About the Role':
                              Icon = MdWork;
                              break;
                            case 'Key Responsibilities':
                              Icon = MdList;
                              break;
                            case 'Required Qualifications':
                              Icon = MdSchool;
                              break;
                            case 'Preferred Qualifications':
                              Icon = MdStarRate;
                              break;
                            default:
                              Icon = null;
                          }

                          return (
                            <div key={title} className={styles.descriptionSection}>
                              {title && (
                                <div className={styles.subSectionHeader}>
                                  {Icon && <Icon className={styles.sectionIcon} />}
                                  <span>{title}</span>
                                </div>
                              )}
                              <p>{content}</p>
                            </div>
                          );
                        };

                        return (
                          <>
                            {/* Always render the mandatory "About the Role" section */}
                            {mandatorySection && renderSection(mandatorySection)}
                            
                            {/* Only render other sections if they have content */}
                            {otherSections.map(section => renderSection(section))}
                          </>
                        );
                      })() : (
                        <p>{`${job.job_description.slice(0, 100)}...`}</p>
                      )}
                    </div>

                    {expandedJobId === job.job_id && (
                      <div className={styles.companyInfo}>
                        <strong>About Company</strong>
                        <p>{job.company.company_description}</p>
                      </div>
                    )}
                  </div>

                  <span className={styles.buttonRow}>
                    <button
                      className={styles.viewMoreButton}
                      onClick={() => setExpandedJobId(expandedJobId === job.job_id ? null : job.job_id)}
                    >
                      <img
                        src={expandedJobId === job.job_id ? viewLessButton : viewMoreButton}
                        alt={expandedJobId === job.job_id ? "Collapse" : "Expand"}
                      />
                      {expandedJobId === job.job_id ? "View Less" : "View More"}
                    </button>

                    <button 
                      onClick={(e) => {handleApplyJob(e, job.job_id); setJobId(job.job_id);}}
                      disabled={applicationStatus.applying}
                      className={styles.applyButton}
                    >
                      {applicationStatus.applying && job.job_id === jobId ? (
                        <div className={styles.loadingIcon}>
                          <div className={styles.spinner}></div>
                        </div>
                      ) : applicationStatus.success && job.job_id === jobId ? (
                        <LuCheck className={styles.successIcon} />
                      ) : (
                        <LuUpload className={styles.uploadIcon} />
                      )}
                      <span className={styles.buttonText}>
                        {applicationStatus.success && job.job_id === jobId ? "Applied!" : "Apply Now"}
                      </span>
                    </button>
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noResultsContainer}>
              <img
                src={noResultsImage}
                alt="No results found"
                className={styles.noResultsImage}
              />
              {filters.minSalary > 0 || 
                filters.locations.length > 0 || 
                filters.jobTitles.length > 0 || 
                filters.companies.length > 0 || 
                filters.datePosted !== "Any time" || 
                searchQuery ? (
              <>
                <p>No jobs found matching your filters</p>
                <button
                  className={styles.clearAllButton}
                  onClick={handleClearAllFilters}
                >
                  <ClearAll fontSize="small" /> Clear All Filters
                </button>
              </>
              ) : (
                <>
                  <p>Sorry! No jobs to show.</p>
                </>
              )}
            </div>
          )}
        </div>
      )}
      {loading && (
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
      )}
      {/* Toast Notifications */}
      {toastQueue.slice(0, 3).map((toast, index) => (
        <ToastNotification 
          key={toast.id}
          message={toast.message}
          type={toast.type}
          style={{ top: `${20 + (index * 70)}px` }}
          onClose={() => setToastQueue(prev => prev.filter(t => t.id !== toast.id))}
        />
      ))}
    </div>
  );
};

export default ExploreJobsPage;