import React, { useEffect, useMemo, useState, useCallback } from "react";
import CommonTopBar from "./CommonTopBar";
import styles from "../../styles/BookmarksPage.module.css";
import defaultCompanyImage from "../../assets/nocompanyimage2.jpg";
import bookmarkActive from "../../assets/SideNavIcon-Images/bookmarks-active.svg";
import viewMoreButton from "../../assets/CommonJobCardIcon-Images/viewmore_expand.svg";
import viewLessButton from "../../assets/CommonJobCardIcon-Images/viewmore_collapse.svg";
import { ClearAll, LocationOn, Paid, History } from "@mui/icons-material";
import { LuUpload, LuCheck, LuCircleArrowOutUpRight } from "react-icons/lu";
import { MdWork, MdList, MdSchool, MdStarRate } from 'react-icons/md';
import { NavLink } from "react-router-dom";
import noBookmarksImage from '../../assets/NoBookmarksPage1.png';
import ToastNotification from "../../components/ToastNotification";
import { deleteBookmark, applyJob, getBookmarks } from "../../services/api";
import { formatImageUrl } from "../../services/imageUtils";

const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState([]);
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
  const [paginationMeta, setPaginationMeta] = useState({ 
    total_pages: 1,
    current_page: 1,
    total_count: 0
  });
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [toastQueue, setToastQueue] = useState([]);
  const [jobId, setJobId] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState({ 
    applying: false, 
    success: false 
  });
  const [loading, setLoading] = useState(true);

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToastQueue((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToastQueue((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const fetchBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: currentPage
      };
      const res = await getBookmarks(params);
      if (!res.error) {
        setBookmarks(res.results);
        setPaginationMeta({
          total_pages: res.total_pages,
          current_page: res.current_page,
          total_count: res.total_count
        });
      } else {
        showToast("Failed to load bookmarks", "error");
      }
    } catch (err) {
      showToast("Unexpected error", "error");
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks, filtersCleared]);

  const handleApplyJob = async (e, jobId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setApplicationStatus({ applying: true, success: false });
      const res = await applyJob({ job_id: jobId });
      if (!res.error) {
        setApplicationStatus({ applying: false, success: true });
        showToast("Application sent successfully!", "success");
        fetchBookmarks();
        setTimeout(() => {
          setApplicationStatus({ applying: false, success: false });
        }, 2000);
      } else {
        throw new Error(res.error);
      }
    } catch (err) {
      setApplicationStatus({ applying: false, success: false });
      showToast(err.detail || "Failed to apply", "error");
    }
  };

  const handleDelete = async (e, bookmarkId) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    const res = await deleteBookmark(bookmarkId);
    if (!res.error) {
      fetchBookmarks();
      showToast("Bookmark removed");
    } else {
      showToast(res.error || "Failed to remove bookmark", "error");
    }
    setLoading(false);
  };

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

  const filteredBookmarks = useMemo(() => {
    if (!searchQuery.trim()) return bookmarks;
    const terms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    return bookmarks.filter(({ job_details }) => {
      const searchFields = [
        job_details.job_title,
        job_details.company.company_name,
        job_details.company.company_industry,
        job_details.job_location
      ].map(f => f.toLowerCase());
      return terms.every(term => searchFields.some(field => field.includes(term)));
    });
  }, [searchQuery, bookmarks]);

  const formatDatePosted = (dateString) => {
    if (!dateString || typeof dateString !== 'string') return 'Recently';
  
    let postedDate;
  
    if (dateString.includes('T')) {
      // ISO 8601 with Z or timezone
      postedDate = new Date(dateString);
    } else if (dateString.includes(' ')) {
      // MySQL format: "YYYY-MM-DD HH:MM:SS"
      const [datePart, timePart] = dateString.split(' ');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute, second] = timePart.split(':').map(Number);
      // Use UTC to prevent local timezone shifts
      postedDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    } else {
      return 'Recently';
    }
  
    const now = new Date();
    const timeDiff = now - postedDate;
  
    if (isNaN(postedDate.getTime()) || timeDiff < 0) {
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
    if (months < 12) return `Posted ${months} month${months === 1 ? '' : 's'} ago`;
    return `Posted ${years} year${years === 1 ? '' : 's'} ago`;
  };
  

  return (
    <div className={styles.container}>
      <CommonTopBar
        page="bookmarks"
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
        {filteredBookmarks.length > 0 ? (
          filteredBookmarks.map(({ bookmark_id, bookmark_date_saved, job_details }) => (
            <div key={bookmark_id} className={styles.jobCard}>
              <div className={styles.cardHeader}>
                <div className={styles.leftSection}>
                  <img
                    src={formatImageUrl(job_details.company.company_image, defaultCompanyImage)}
                    alt={job_details.company.company_name}
                    className={styles.companyLogo}
                    onError={(e) => { e.target.src = defaultCompanyImage; }}
                  />
                  <div className={styles.jobInfoSection}>
                    <span className={styles.jobInfoInnerSection}>
                      <span className={styles.daysAgoBookmark}>
                        <div className={styles.daysAgo}>
                          <History className={styles.historyIcon} />
                          <span>
                            {formatDatePosted(job_details.job_date_posted)}
                          </span>
                        </div>
                        <div className={styles.daysAgo}>
                          <div 
                            className={`${styles.bookmarkBlock} ${styles.daysAgo}`}
                            onClick={(e) => handleDelete(e, bookmark_id)}
                          >
                            <img 
                              src={bookmarkActive} 
                              alt="Bookmark" 
                              className={styles.bookmarkIcon} 
                            />
                          </div>
                          <div className={styles.bookmarkedInfo}>
                            <span>{formatDatePosted(bookmark_date_saved)}</span>
                          </div>
                        </div>
                      </span>
                      <h3 className={styles.jobTitle}>{job_details.job_title}</h3>
                    </span>
                    <span className={styles.companyName}>
                      <span>{job_details.company.company_name}</span>
                      <span style={{ color: '#B1B1B1' }}>
                        {job_details.company.company_industry}
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

              <div className={styles.jobDescription}>
                {/*<div*/}
                {/*  className={styles.descriptionContent}*/}
                {/*  style={{*/}
                {/*    maxHeight: expandedJobId === job_details.job_id ? '1000px' : '100px',*/}
                {/*    overflow: 'hidden',*/}
                {/*    transition: 'max-height 0.3s ease-in-out'*/}
                {/*  }}*/}
                {/*>*/}
                {/*  <div className={styles.jobInfoSection}>*/}
                {/*    <strong>Job Description</strong>*/}
                {/*    <p>{expandedJobId === job_details.job_id ? job_details.job_description : `${job_details.job_description.slice(0, 100)}...`}</p>*/}
                {/*  </div>*/}
                {/*  {expandedJobId === job_details.job_id && (*/}
                {/*    <div className={styles.companyInfo}>*/}
                {/*      <strong>About Company</strong>*/}
                {/*      <p>{job_details.company.company_description}</p>*/}
                {/*    </div>*/}
                {/*  )}*/}
                {/*</div>*/}

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
                        <p>{job_details.company.company_description}</p>
                      </div>
                  )}
                </div>
                <div className={styles.buttonRow}>
                  <button
                    className={styles.viewMoreButton}
                    onClick={() => setExpandedJobId(prev => prev === job_details.job_id ? null : job_details.job_id)}
                  >
                    <img
                      src={expandedJobId === job_details.job_id ? viewLessButton : viewMoreButton}
                      alt={expandedJobId === job_details.job_id ? "Collapse" : "Expand"}
                    />
                    {expandedJobId === job_details.job_id ? "View Less" : "View More"}
                  </button>
                  <button
                    onClick={(e) => { 
                      handleApplyJob(e, job_details.job_id); 
                      setJobId(job_details.job_id); 
                    }}
                    disabled={applicationStatus.applying}
                    className={styles.applyButton}
                  >
                    {applicationStatus.applying && job_details.job_id === jobId ? (
                      <div className={styles.loadingIcon}>
                        <div className={styles.spinner}></div>
                      </div>
                    ) : applicationStatus.success && job_details.job_id === jobId ? (
                      <LuCheck className={styles.successIcon} />
                    ) : (
                      <LuUpload className={styles.uploadIcon} />
                    )}
                    <span className={styles.buttonText}>
                      {applicationStatus.success && job_details.job_id === jobId ? "Applied!" : "Apply Now"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noResultsContainer}>
            <img
              src={noBookmarksImage}
              alt="No bookmarks found"
              className={styles.noResultsImage}
            />
            
            {filters.minSalary > 0 || 
            filters.locations.length > 0 || 
            filters.jobTitles.length > 0 || 
            filters.companies.length > 0 || 
            filters.datePosted !== "Any time" || 
            searchQuery ? (
              <>
                <p>No bookmarks found matching your filters</p>
                <button
                  className={styles.clearAllButton}
                  onClick={handleClearAllFilters}
                >
                  <ClearAll fontSize="small" /> Clear All Filters
                </button>
              </>
            ) : (
              <>
                <p>You haven't bookmarked any jobs yet</p>
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

      {toastQueue.slice(0, 3).map((toast, index) => (
        <ToastNotification
          key={toast.id}
          message={toast.message}
          type={toast.type}
          style={{ top: `${20 + index * 70}px` }}
          onClose={() => setToastQueue(prev => prev.filter(t => t.id !== toast.id))}
        />
      ))}
    </div>
  );
};

export default BookmarksPage;