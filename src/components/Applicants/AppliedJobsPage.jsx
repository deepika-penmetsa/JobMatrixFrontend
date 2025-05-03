import React, { useEffect, useMemo, useState, useCallback } from "react";
import CommonTopBar from "./CommonTopBar";
import styles from "../../styles/AppliedJobsPage.module.css";
import defaultCompanyImage from "../../assets/nocompanyimage2.jpg";
import noResultsImage from "../../assets/NoApplicationsYet.png";
import viewMoreButton from "../../assets/CommonJobCardIcon-Images/viewmore_expand.svg";
import viewLessButton from "../../assets/CommonJobCardIcon-Images/viewmore_collapse.svg";
import appliedIcon from "../../assets/CommonJobCardIcon-Images/AppliedApplication.svg";
import approvedIcon from "../../assets/CommonJobCardIcon-Images/ApprovedApplication.svg";
import rejectedIcon from "../../assets/CommonJobCardIcon-Images/RejectedApplication.svg";
import { LocationOn, Paid, History, ClearAll } from "@mui/icons-material";
import {BsCalendarCheckFill, BsFileEarmarkCheck, BsFileEarmarkExcel} from "react-icons/bs";
import { LuCircleArrowOutUpRight } from "react-icons/lu";
import {MdWork, MdList, MdSchool, MdStarRate, MdClose, MdCheckCircle} from 'react-icons/md';
import { MdOutlineAccessTime } from "react-icons/md";
import { NavLink } from "react-router-dom";
import { getAppliedJobs } from "../../services/api";
import { formatImageUrl } from "../../services/imageUtils";
import ToastNotification from "../ToastNotification.jsx";
import {GiCheckMark} from "react-icons/gi";
import {FaFileCircleCheck, FaFileCircleXmark} from "react-icons/fa6";

const AppliedJobsPage = () => {
  const [applications, setApplications] = useState([]);
  const [filters, setFilters] = useState({
    minSalary: 0,
    locations: [],
    jobTitles: [],
    companies: [],
    datePosted: "Any time",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersCleared, setFiltersCleared] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [toastQueue, setToastQueue] = useState([]);
  const [paginationMeta, setPaginationMeta] = useState({ 
    total_pages: 1, 
    current_page: 1, 
    total_count: 0 
  });
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [loading, setLoading] = useState(true);

  const showToast = (message, type) => {
    const newToast = { message, type, id: Date.now() };
    setToastQueue(prev => [...prev, newToast]);

    setTimeout(() => {
      setToastQueue(prev => prev.filter(t => t.id !== newToast.id));
    }, 3000);
  };
  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: currentPage
      };
      const res = await getAppliedJobs(params);
      if (!res.error) {
        setApplications(res.results);
        setPaginationMeta({
          total_pages: res.total_pages,
          current_page: res.current_page,
          total_count: res.total_count
        });
      } else {
        showToast("Failed to load applications", "error");
      }
    } catch (err) {
      showToast(err || "Unexpected error", "error");
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications, filtersCleared]);

  const handleSearch = (value) => setSearchQuery(value);
  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };
  const handleClearAllFilters = () => {
    setFilters({
      minSalary: 0,
      locations: [],
      jobTitles: [],
      companies: [],
      datePosted: "Any time"
    });
    setCurrentPage(1);
    setSearchQuery("");
    setFiltersCleared(prev => !prev);
    document.documentElement.style.removeProperty('--slider-percentage');
  };

  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return applications;
    const terms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    return applications.filter(({ job_details }) => {
      const searchFields = [
        job_details.job_title,
        job_details.company_details.company_name,
        job_details.company_details.company_industry,
        job_details.job_location
      ].map(f => f.toLowerCase());
      return terms.every(term => searchFields.some(field => field.includes(term)));
    });
  }, [searchQuery, applications]);

  const formatDatePosted = (dateString) => {
    if (!dateString || typeof dateString !== 'string') return 'Recently';
  
    let postedDate;
  
    if (dateString.includes('T')) {
      postedDate = new Date(dateString);
    } else if (dateString.includes(' ')) {
      const [datePart, timePart] = dateString.split(' ');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute, second] = timePart.split(':').map(Number);
      postedDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    } else {
      return 'Recently';
    }
  
    const now = new Date();
    const timeDiff = now - postedDate;
  
    if (isNaN(postedDate.getTime())) {
      return 'Recently';
    }
  
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
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "approved": return approvedIcon;
      case "rejected": return rejectedIcon;
      default: return appliedIcon;
    }
  };

  return (
    <div className={styles.container}>
      <CommonTopBar
        page="applied"
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onFilter={handleFilter}
        currentPage={paginationMeta.current_page}
        totalPages={paginationMeta.total_pages}
        totalCount={paginationMeta.total_count}
        onPageChange={setCurrentPage}
        filtersCleared={filtersCleared}
      />

      {!loading && (
        <div className={styles.jobsList}>
          {filteredApps.length > 0 ? (
            filteredApps.map(({ application_id, application_date_applied, application_status,application_recruiter_comment, job_details }) => (
              <div key={application_id} className={styles.jobCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.leftSection}>
                    <img
                      src={formatImageUrl(job_details.company_details.company_image, defaultCompanyImage)}
                      alt={job_details.company_details.company_name}
                      className={styles.companyLogo}
                      onError={(e) => { e.target.src = defaultCompanyImage; }}
                    />
                    <div className={styles.jobInfoSection}>
                      <span className={styles.jobInfoInnerSection}>
                        <span className={styles.daysAgoCalendar}>
                          <div className={styles.daysAgo}>
                            <History className={styles.historyIcon} />
                            <span>
                              {formatDatePosted(job_details.job_date_posted)}
                            </span>
                          </div>
                          <div className={styles.daysAgo}>
                            <div className={`${styles.calendarBlock} ${styles.daysAgo}`}>
                              <BsCalendarCheckFill className={styles.calendarIcon} />
                            </div>
                            <div>
                              <span>{formatDatePosted(application_date_applied)}</span>
                            </div>
                          </div>
                        </span>
                        <h3 className={styles.jobTitle}>{job_details.job_title}</h3>
                      </span>
                      <span className={styles.companyName}>
                        <span>{job_details.company_details.company_name}</span>
                        <span style={{ color: '#B1B1B1' }}>
                          {job_details.company_details.company_industry}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className={styles.rightSection}>
                    <div className={styles.locationSalary}>
                      <div className={styles.infoBlock}>
                        <LocationOn className={styles.infoIcon} />
                        <span>{job_details.job_location}</span>
                      </div>
                      <div className={styles.infoBlock}>
                        <Paid className={styles.infoIcon} />
                        <span>${parseFloat(job_details.job_salary).toLocaleString()} / yr</span>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className={styles.divider} />

                {/*<div className={styles.jobDescription}>*/}
                {/*  <div*/}
                {/*      className={styles.descriptionContent}*/}
                {/*      style={{*/}
                {/*        maxHeight: expandedJobId === job_details.job_id ? '1000px' : '100px',*/}
                {/*        overflow: 'hidden',*/}
                {/*        transition: 'max-height 0.3s ease-in-out'*/}
                {/*      }}*/}
                {/*  >*/}
                {/*    <div className={styles.jobInfoSection}>*/}
                {/*      <strong>Job Description</strong>*/}
                {/*      {expandedJobId === job_details.job_id ? (() => {*/}
                {/*        const sections = job_details.job_description.split(/(?=\[.*?\])/g);*/}
                {/*        const mandatorySection = sections.find(section =>*/}
                {/*            section.startsWith('[About the Role]')*/}
                {/*        );*/}

                {/*        const otherSections = sections.filter(section =>*/}
                {/*            !section.startsWith('[About the Role]') &&*/}
                {/*            section.replace(/\[.*?\]/, '').trim().length > 0*/}
                {/*        );*/}

                {/*        const renderSection = (section) => {*/}
                {/*          const titleMatch = section.match(/\[(.*?)\]/);*/}
                {/*          const title = titleMatch ? titleMatch[1] : null;*/}
                {/*          const content = section.replace(/\[.*?\]/, '').trim();*/}

                {/*          let Icon;*/}
                {/*          switch (title) {*/}
                {/*            case 'About the Role':*/}
                {/*              Icon = MdWork;*/}
                {/*              break;*/}
                {/*            case 'Key Responsibilities':*/}
                {/*              Icon = MdList;*/}
                {/*              break;*/}
                {/*            case 'Required Qualifications':*/}
                {/*              Icon = MdSchool;*/}
                {/*              break;*/}
                {/*            case 'Preferred Qualifications':*/}
                {/*              Icon = MdStarRate;*/}
                {/*              break;*/}
                {/*            default:*/}
                {/*              Icon = null;*/}
                {/*          }*/}

                {/*          return (*/}
                {/*              <div key={title} className={styles.descriptionSection}>*/}
                {/*                {title && (*/}
                {/*                    <div className={styles.subSectionHeader}>*/}
                {/*                      {Icon && <Icon className={styles.sectionIcon} />}*/}
                {/*                      <span>{title}</span>*/}
                {/*                    </div>*/}
                {/*                )}*/}
                {/*                <p>{content}</p>*/}
                {/*              </div>*/}
                {/*          );*/}
                {/*        };*/}

                {/*        return (*/}
                {/*            <>*/}
                {/*              /!* Always render the mandatory "About the Role" section *!/*/}
                {/*              {mandatorySection && renderSection(mandatorySection)}*/}

                {/*              /!* Only render other sections if they have content *!/*/}
                {/*              {otherSections.map(section => renderSection(section))}*/}
                {/*            </>*/}
                {/*        );*/}
                {/*      })() : (*/}
                {/*          <p>{`${job_details.job_description.slice(0, 100)}...`}</p>*/}
                {/*      )}*/}
                {/*    </div>*/}

                {/*    {expandedJobId === job_details.job_id && (*/}
                {/*        <div className={styles.companyInfo}>*/}
                {/*          <strong>About Company</strong>*/}
                {/*          <p>{job_details.company_details.company_description}</p>*/}
                {/*        </div>*/}
                {/*    )}*/}

                {/*    /!* Keep the existing recruiter comments section if it's already there *!/*/}
                {/*    {expandedJobId === job_details.job_id && application_recruiter_comment && (*/}
                {/*        <div className={styles.recruiterComments}>*/}
                {/*          <strong>Recruiter Comments</strong>*/}
                {/*          <p>{application_recruiter_comment}</p>*/}
                {/*        </div>*/}
                {/*    )}*/}
                {/*  </div>*/}

                {/*  <div className={styles.buttonRow}>*/}
                {/*    <button*/}
                {/*      className={styles.viewMoreButton}*/}
                {/*      onClick={() =>*/}
                {/*        setExpandedJobId(prev =>*/}
                {/*          prev === job_details.job_id ? null : job_details.job_id*/}
                {/*        )*/}
                {/*      }*/}
                {/*    >*/}
                {/*      <img*/}
                {/*        src={expandedJobId === job_details.job_id ? viewLessButton : viewMoreButton}*/}
                {/*        alt={expandedJobId === job_details.job_id ? 'Collapse' : 'Expand'}*/}
                {/*      />*/}
                {/*      {expandedJobId === job_details.job_id ? 'View Less' : 'View More'}*/}
                {/*    </button>*/}

                {/*    <button*/}
                {/*      className={`${styles.applyButton} ${styles[`status-${application_status.toLowerCase()}`]}`}*/}
                {/*      disabled*/}
                {/*    >*/}
                {/*      {application_status === 'PENDING' ? (*/}
                {/*        <MdOutlineAccessTime className={styles.statusIcon} />*/}
                {/*      ) : (*/}
                {/*        <img*/}
                {/*          src={getStatusIcon(application_status)}*/}
                {/*          alt={application_status}*/}
                {/*          className={styles.statusIcon}*/}
                {/*        />*/}
                {/*      )}*/}
                {/*      {application_status.charAt(0).toUpperCase() + application_status.slice(1)}*/}
                {/*    </button>*/}
                {/*  </div>*/}
                {/*</div>*/}

                <div className={styles.jobDescription}>
                  <div
                      className={styles.descriptionContent}
                      style={{
                        maxHeight: expandedJobId === job_details.job_id ? '1000px' : '100px',
                        overflow: 'hidden',
                        transition: 'max-height 0.3s ease-in-out'
                      }}
                  >
                    <div className={styles.jobInfoSection}>
                      <strong>Job Description</strong>
                      {expandedJobId === job_details.job_id ? (() => {
                        const sections = job_details.job_description.split(/(?=\[.*?\])/g);
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
                          <p>{`${job_details.job_description.slice(0, 100)}...`}</p>
                      )}
                    </div>

                    {expandedJobId === job_details.job_id && (
                        <div className={styles.companyInfo}>
                          <strong>About Company</strong>
                          <p>{job_details.company_details.company_description}</p>
                        </div>
                    )}

                    {expandedJobId === job_details.job_id && application_recruiter_comment && (
                        <div className={styles.recruiterComments}>
                          <strong>Recruiter Comments</strong>
                          <p>{application_recruiter_comment}</p>
                        </div>
                    )}
                  </div>

                  <div className={styles.buttonRow}>
                    <button
                        className={styles.viewMoreButton}
                        onClick={() =>
                            setExpandedJobId(prev =>
                                prev === job_details.job_id ? null : job_details.job_id
                            )
                        }
                    >
                      <img
                          src={expandedJobId === job_details.job_id ? viewLessButton : viewMoreButton}
                          alt={expandedJobId === job_details.job_id ? 'Collapse' : 'Expand'}
                      />
                      {expandedJobId === job_details.job_id ? 'View Less' : 'View More'}
                    </button>

                    <div className={`${styles.statusChip} ${styles[`status-tag-${application_status.toLowerCase()}`]}`}>
                      {application_status === 'PENDING' ? ( <MdOutlineAccessTime className={styles.statusIcon} /> ) :
                       application_status === 'REJECTED'? ( <FaFileCircleXmark className={styles.statusIcon} /> ) : ( <FaFileCircleCheck className={styles.statusIcon} /> )
                      }
                      <span>{application_status.charAt(0).toUpperCase() + application_status.slice(1).toLowerCase()}</span>
                    </div>
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className={styles.noResultsContainer}>
              <img
                src={noResultsImage}
                alt="No applications found"
                className={styles.noResultsImage}
              />
              
              {filters.minSalary > 0 || 
              filters.locations.length > 0 || 
              filters.jobTitles.length > 0 || 
              filters.companies.length > 0 || 
              filters.datePosted !== "Any time" || 
              searchQuery ? (
                <>
                  <p>No applications found matching your filters</p>
                  <button
                    className={styles.clearAllButton}
                    onClick={handleClearAllFilters}
                  >
                    <ClearAll fontSize="small" /> Clear All Filters
                  </button>
                </>
              ) : (
                <>
                  <p>You haven't applied to any jobs yet</p>
                  <NavLink
                    to="/applicant/explore-jobs"
                    className={styles.exploreButton}
                  >
                    <LuCircleArrowOutUpRight /> Explore Jobs
                  </NavLink>
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

export default AppliedJobsPage;