import React, { useState, useEffect } from 'react';
import styles from '../../../styles/ApplicantsPanel.module.css';
import {
  Close, Email, Person,
  ArrowBack, ChevronLeft,
  ChevronRight, Work,
  School, Code, LocationOn, Event, ExpandMore, ExpandLess,
  Search
} from '@mui/icons-material';
import { formatImageUrl } from '../../../services/imageUtils';
import { userDetails, jobApplicantsStatus } from '../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { SlBadge } from 'react-icons/sl';
import {
  FiCheckCircle as ApprovalRayIcon,
  FiXCircle as RejectPulseIcon,
  FiRotateCcw as TimeReverseIcon,
  FiZap as SparklesIcon
} from 'react-icons/fi';
import { FaCalendarCheck } from 'react-icons/fa';
import { MdOutlineFileDownload } from 'react-icons/md';
import { VscEye } from "react-icons/vsc";

const ApplicantsPanel = ({ job, onClose, applications, onStatusChange,
                           applicantsListCurrentPage, setApplicantsListCurrentPage, handleViewApplicants, selectedStatus }) => {
  const [expandedApplicant, setExpandedApplicant] = useState(null);
  const [applicantDetails, setApplicantDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [comments, setComments] = useState({});
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [applicantsStats, setApplicantsStats] = useState({
    "total_applications": 0,
    "approved_applications": 0,
    "rejected_applications": 0,
    "pending_applications": 0
  })


  const filteredApplicants = applications?.results?.filter(applicant =>
      applicant.applicant_details.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      applicant.applicant_details.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleViewResume = (resumeUrl, e) => {
    e.stopPropagation();
    window.open(formatImageUrl(resumeUrl), '_blank');
  };

  const handleDownloadResume = (resumeUrl, applicantName, e) => {
    e.preventDefault();
    e.stopPropagation();

    // Format the URL properly for S3 or other sources
    const formattedUrl = formatImageUrl(resumeUrl);
    
    // Start file download using fetch API
    fetch(formattedUrl)
        .then(response => response.blob())
        .then(blob => {
          // Create a blob URL for the file
          const blobUrl = window.URL.createObjectURL(blob);

          // Create a temporary link element
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `${applicantName.replace(/\s+/g, '_')}_Resume.pdf`;
          link.style.display = 'none';

          // Add to DOM, trigger click, then clean up
          document.body.appendChild(link);
          link.click();

          // Clean up
          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
          }, 200);
        })
        .catch(error => {
          console.error('Error downloading resume:', error);
          // Fallback: If fetch fails, try direct download
          window.open(resumeUrl, '_blank');
        });
  };
  // Handle comment input
  const handleInputComment = (e, applicationId) => {
    setComments(prev => ({
      ...prev,
      [applicationId]: e.target.value
    }));
  };

  // Handle pagination
  const paginate = (pageNumber) => {
    // First update the page number state
    setApplicantsListCurrentPage(pageNumber);

    // Then make the API call with the correct status
    handleViewApplicants(
        job,
        selectedStatus === 'All' ? '' : selectedStatus,
        false,
        pageNumber
    );
  };

  // Get initials for avatar
  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '';
  };

  // Toggle applicant details expansion
  const toggleApplicantDetails = async (application) => {
    const applicationId = application.application_id;
    if (expandedApplicant === applicationId) {
      setExpandedApplicant(null);
      setActiveTab(null);
      return;
    }

    setLoadingDetails(true);
    setExpandedApplicant(applicationId);
    setActiveTab(null);

    try {
      const response = await userDetails(application.applicant_details.email);
      setApplicantDetails(prev => ({
        ...prev,
        [applicationId]: response
      }));
    } catch (error) {
      console.error('Error fetching applicant details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchApplicationStatuses = async() => {
    try {
      const response = await jobApplicantsStatus(job.job_id)
      if(response.error === false){
        setApplicantsStats(response.data)
      }

    }
    catch(err) {
      console.error("error fetching applicants stats",err);
    }

  }

  useEffect(() => {
    fetchApplicationStatuses()
  },[])

  // Reset all expanded applicants when panel is closed
  useEffect(() => {
    return () => {
      setExpandedApplicant(null);
      setActiveTab(null);
    };
  }, [onClose]);

  // Initialize comments from application data
  useEffect(() => {
    if (applications?.results) {
      const initialComments = {};
      applications.results.forEach(app => {
        initialComments[app.application_id] = app.application_recruiter_comment || '';
      });
      setComments(initialComments);
    }
    fetchApplicationStatuses()
  }, [applications?.results]);


  // Parse job description into sections
  const parseJobDescription = (description) => {
    if (!description) return null;

    const sections = description.split('\n\n').filter(section => section.trim());
    const result = [];

    sections.forEach(section => {
      if (section.startsWith('[') && section.includes(']')) {
        const titleEnd = section.indexOf(']');
        const title = section.substring(1, titleEnd);
        const content = section.substring(titleEnd + 1).trim();

        if (content) {
          result.push({ title, content });
        }
      } else if (result.length > 0) {
        result[result.length - 1].content += `\n\n${section}`;
      } else {
        result.push({ title: 'Description', content: section });
      }
    });

    return result.length > 0 ? result : null;
  };

  const suggestionBank = [
    "After reviewing your application, I believe you have potential, but your current skill set does not fully align with the core requirements for this position. You would benefit from gaining more experience in our primary technologies and working on projects of greater scale and complexity. I recommend considering future opportunities with us as your experience grows.",

    "While you demonstrate a solid foundation and some relevant experience, your background does not closely match the specific needs of this role. You may want to further develop your expertise in key technical areas and consider applying again for positions that better fit your strengths. We encourage you to stay in touch for future openings.",

    "Your application shows promise, but at this time, we are seeking candidates with deeper experience in the domains and methodologies central to our work. You might consider expanding your exposure to collaborative development practices and specialized tools before reapplying. We appreciate your interest and hope you’ll consider us again in the future.",

    "Although you have some relevant skills, your experience level is below what we require for this opening, particularly in specialized areas. We recommend you continue building your technical background and seek roles that align more closely with your current expertise. Please feel free to reapply as your skills develop.",

    "You have a good educational background and show potential for growth, but for this role, we are prioritizing applicants with more hands-on experience in our core technologies. We encourage you to continue developing your skills and consider applying for future positions that better match your profile.",

    "Your qualifications are impressive in certain respects, but the fit with our immediate needs is not strong enough to move forward at this time. We suggest focusing on gaining more direct experience in our industry and keeping an eye on future roles that may be a better match for you.",

    "You are a strong fit for this position, demonstrating both the technical skills and adaptability we value. Your background suggests you can quickly contribute to our team, and I recommend moving you forward in our hiring process.",

    "Your application stands out for its combination of relevant experience and problem-solving abilities. I believe you would thrive in our environment and suggest advancing you to the next stage of interviews.",

    "You bring a compelling mix of expertise and initiative that aligns well with our team’s needs. Your achievements indicate you can add value from the start, so I recommend proceeding with your application.",

    "Your skills and experience are closely aligned with our requirements, and your approach to challenges fits our team culture. I look forward to exploring your potential further in the interview process.",

    "You demonstrate a solid foundation in our core technologies and show the drive we seek in new team members. I recommend moving you forward so we can learn more about your fit for this role.",

    "Your background and accomplishments are impressive, and I believe you would be an asset to our organization. I suggest advancing your application to the next round as soon as possible."
  ];

  const generateAINote = (applicationId) => {
    const randomNote = suggestionBank[Math.floor(Math.random() * suggestionBank.length)];
    setComments(prev => ({
      ...prev,
      [applicationId]: randomNote
    }));
  };

  const handleStatusChange = (applicationId, newStatus, comment) => {
    onStatusChange(applicationId, newStatus, comment);
    setExpandedApplicant(applicationId);
  };

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

  const renderTabContent = (details) => {
    if (!details) return null;

    return (
        <AnimatePresence mode="wait">
          <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className={styles.tabContent}
          >
            {activeTab === 'skills' && (
                <div className={styles.skillsGrid}>
                  {details.skills?.length > 0 && (
                      details.skills.slice().sort((a,b) => b.skill_years_of_experience - a.skill_years_of_experience).map(skill => (
                          <motion.div
                              key={skill.skill_id}
                              className={styles.skillCard}
                              whileHover={{ scale: 1.03 }}
                          >
                            <div className={styles.skillHeader}>
                              <span className={styles.skillName}>{skill.skill_name}</span>
                              <span className={styles.skillDuration}>{skill.skill_years_of_experience} yrs</span>
                            </div>
                            <div className={styles.skillProgress}>
                              <motion.div
                                  className={styles.progressBar}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(skill.skill_years_of_experience * 20, 100)}%` }}
                                  transition={{ duration: 0.8, delay: 0.2 }}
                              />
                            </div>
                          </motion.div>
                      ))
                  )}
                </div>
            )}

            {activeTab === 'skills' && details.skills?.length < 1 && (
                <div className={styles.emptyState}>
                  <Person sx={{ fontSize: 40 }} />
                  <p>No skills listed</p>
                </div>
            )}



            {activeTab === 'experience' && (
                <div className={styles.experienceContainer}>
                  {details.work_experience?.length > 0 ? (
                      <div className={styles.experienceScroller}>
                        {details.work_experience.map(exp => (
                            <motion.div
                                key={exp.work_experience_id}
                                className={styles.experienceCard}
                                whileHover={{ y: -2 }}
                            >
                              <div className={styles.experienceHeader}>
                                <h5>{exp.work_experience_job_title}</h5>
                                {exp.work_experience_is_currently_working ? (
                                    <span className={styles.statusCurrent}>Current</span>
                                ) : (
                                    <span className={styles.statusPast}>Past</span>
                                )}
                              </div>
                              <p className={styles.companyInfo}>{exp.work_experience_company}</p>
                              <div className={styles.dateRange}>
                                {new Date(exp.work_experience_start_date).toLocaleDateString()} -{' '}
                                {exp.work_experience_is_currently_working
                                    ? 'Present'
                                    : new Date(exp.work_experience_end_date).toLocaleDateString()}
                              </div>
                              <p className={styles.experienceDescription}>{exp.work_experience_description}</p>
                            </motion.div>
                        ))}
                      </div>
                  ) : (
                      <div className={styles.emptyState}>
                        <Work sx={{ fontSize: 40 }} />
                        <p>No work experience listed</p>
                      </div>
                  )}
                </div>
            )}

            {activeTab === 'education' && (
                <div className={styles.educationContainer}>
                  {details.education?.length > 0 ? (
                      <div className={styles.educationScroller}>
                        {details.education.map(edu => (
                            <motion.div
                                key={edu.education_id}
                                className={styles.educationCard}
                                whileHover={{ y: -2 }}
                            >
                              <div className={styles.educationHeader}>
                                <h5>{edu.education_school_name}</h5>
                                {edu.education_is_currently_enrolled ? (
                                    <span className={styles.statusOngoing}>In Progress</span>
                                ) : (
                                    <span className={styles.statusCompleted}>
                            <SlBadge/> {edu.education_gpa ? `${edu.education_gpa} GPA` : 'Completed'}
                          </span>
                                )}
                              </div>
                              <p className={styles.degreeInfo}>
                                {edu.education_degree_type} in {edu.education_major}
                              </p>
                              <div className={styles.dateRange}>
                                {new Date(edu.education_start_date).toLocaleDateString()} -{' '}
                                {edu.education_is_currently_enrolled
                                    ? 'Present'
                                    : new Date(edu.education_end_date).toLocaleDateString()}
                              </div>
                            </motion.div>
                        ))}
                      </div>
                  ) : (
                      <div className={styles.emptyState}>
                        <School sx={{ fontSize: 40 }} />
                        <p>No education listed</p>
                      </div>
                  )}
                </div>
            )}
          </motion.div>
        </AnimatePresence>
    );
  };

  return (
      <motion.div
          className={styles.panelContainer}
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Sidebar with new glass morphism effect */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <button onClick={onClose} className={styles.backButton}>
              <ArrowBack />
              <span>Back to Jobs</span>
            </button>
            <h2 className={styles.jobTitle}>{job.job_title}</h2>
            <div className={styles.jobQuickInfo}>
              <span><LocationOn fontSize="small" /> {job.job_location}</span>
              <span><Event fontSize="small" /> {new Date(job.date_posted).toLocaleDateString()}</span>
            </div>
          </div>

          <div className={styles.sidebarMenu}>
            <div className={styles.menuSection}>
              <h3 className={styles.menuTitle}>APPLICANTS</h3>
              <div
                  className={`${styles.menuItem} ${selectedStatus === 'All' ? styles.selectedMenuItem : ''}`}
                  onClick={() => handleViewApplicants(job, '', false)}
              >
                <div className={styles.menuItemContent}>
                  <span>All Applicants</span>
                </div>
              </div>
            </div>

            <div className={styles.menuSection}>
              <h3 className={styles.menuTitle}>STATUS</h3>
              <div
                  className={`${styles.menuItem} ${selectedStatus === 'Pending' ? styles.selectedMenuItem : ''}`}
                  onClick={(e) => {
                    e.preventDefault(); // Prevent any default behavior
                    e.stopPropagation(); // Stop event bubbling
                    handleViewApplicants(job, 'Pending', true);
                  }}
              >
                <div className={styles.menuItemContent}>
                  <span>Pending</span>
                </div>
              </div>
              <div
                  className={`${styles.menuItem} ${selectedStatus === 'Approved' ? styles.selectedMenuItem : ''}`}
                  onClick={(e) => {
                    e.preventDefault(); // Prevent any default behavior
                    e.stopPropagation(); // Stop event bubbling
                    handleViewApplicants(job, 'Approved', true);
                  }}
              >
                <div className={styles.menuItemContent}>
                  <span>Approved</span>
                </div>
              </div>
              <div
                  className={`${styles.menuItem} ${selectedStatus === 'Rejected' ? styles.selectedMenuItem : ''}`}
                  onClick={(e) => {
                    e.preventDefault(); // Prevent any default behavior
                    e.stopPropagation(); // Stop event bubbling
                    handleViewApplicants(job, 'Rejected', true);
                  }}
              >
                <div className={styles.menuItemContent}>
                  <span>Rejected</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.contentArea}>
          <div className={styles.contentHeader}>
            <div className={styles.headerLeft}>
              <h3>Applicant Management</h3>
              <div className={styles.headerStats}>
                <div className={styles.statPill}>
                  <span>Total</span>
                  <strong>
                    {(applicantsStats?.total_applications)}
                  </strong>
                </div>
                <div className={styles.statPill}>
                  <span>Pending</span>
                  <strong>{applicantsStats?.pending_applications}</strong>
                </div>
                <div className={styles.statPill}>
                  <span>Approved</span>
                  <strong>{applicantsStats?.approved_applications}</strong>
                </div>
                <div className={styles.statPill}>
                  <span>Rejected</span>
                  <strong>{applicantsStats?.rejected_applications}</strong>
                </div>
              </div>
            </div>

            <div className={styles.headerRight}>
              <div className={styles.searchContainer}>
                <Search className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder="Search applicants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                />
              </div>
              <button onClick={onClose} className={styles.closeButton}>
                <Close />
              </button>
            </div>
          </div>

          {/* Job Details Card with Floating Effect */}
          {showJobDetails && (
              <motion.div
                  className={styles.jobDetailsCard}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
              >
                <div className={styles.jobDetailsHeader}>
                  <div>
                    <h3>{job.job_title}</h3>
                    <div className={styles.jobMeta}>
                  <span className={styles.jobMetaItem}>
                    <LocationOn fontSize="small" />
                    {job.job_location}
                  </span>
                      <span className={styles.jobMetaItem}>
                    <Event fontSize="small" />
                    Posted: {new Date(job.date_posted).toLocaleDateString()}
                  </span>
                      {job.job_salary && (
                          <span className={styles.jobMetaItem}>
                      ${parseFloat(job.job_salary).toLocaleString()}/yr
                    </span>
                      )}
                    </div>
                  </div>
                  <button
                      onClick={() => setShowJobDetails(!showJobDetails)}
                      className={styles.hideDetailsButton}
                  >
                    <ExpandLess />
                  </button>
                </div>
                <div className={styles.jobDescription}>
                  {(() => {
                    const parsedDescription = parseJobDescription(job.job_description);

                    if (!parsedDescription) {
                      return <p>No description available</p>;
                    }

                    return (
                        <div className={styles.descriptionSections}>
                          {parsedDescription.map((section, index) => (
                              <div key={index} className={styles.descriptionSection}>
                                <h4 className={styles.sectionTitle}>{section.title}</h4>
                                <div className={styles.sectionContent}>
                                  {section.content.split('\n').map((paragraph, i) => (
                                      <p key={i}>{paragraph}</p>
                                  ))}
                                </div>
                              </div>
                          ))}
                        </div>
                    );
                  })()}
                </div>
              </motion.div>
          )}

          {!showJobDetails && (
              <button
                  onClick={() => setShowJobDetails(!showJobDetails)}
                  className={styles.showDetailsButton}
              >
                <ExpandMore /> Show Job Details
              </button>
          )}

          {/* Applicants List with Card Redesign */}
          <div className={styles.applicantsList}>
            {filteredApplicants.length > 0 ? (
                filteredApplicants.map(application => (
                    <motion.div
                        key={application.application_id}
                        className={styles.applicantCard}
                        whileHover={{ y: -2 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                      {/* Redesigned Card Header */}
                      <div className={styles.cardHeader} onClick={() => toggleApplicantDetails(application)}>
                        <div className={styles.applicantPreview}>
                          <div className={styles.avatarContainer}>
                            <div className={styles.avatarImage}>
                              {application.applicant_details.profile_photo ? (
                                  <img
                                      src={formatImageUrl(application.applicant_details.profile_photo)}
                                      alt={application.applicant_details.full_name}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentNode.innerHTML = `<span class="${styles.avatarInitials}">${getInitials(application.applicant_details.full_name)}</span>`;
                                      }}
                                  />
                              ) : (
                                  <span className={styles.avatarInitials}>
                            {getInitials(application.applicant_details.full_name)}
                          </span>
                              )}
                            </div>
                            <div className={styles.statusIndicator} data-status={application.application_status.toLowerCase()} />
                          </div>

                          <div className={styles.applicantSummary}>
                            <div className={styles.nameAndMeta}>
                              <h4>{application.applicant_details.full_name}</h4>
                              <div className={styles.metaInfo}>
                                <span className={styles.appliedDate}>
                            <FaCalendarCheck className={styles.calendarIcon} /> {formatDatePosted(application.application_date_applied)}
                          </span>
                                <span className={styles.statusBadge} data-status={application.application_status.toLowerCase()}>
                            {application.application_status}
                          </span>

                              </div>
                            </div>
                            <div className={styles.contactInfo}>
                              <div className={styles.contactItem}>
                                <Email fontSize="small" />
                                <span>{application.applicant_details.email}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className={styles.quickActions}>
                          {/* Resume actions in header */}
                          {application.applicant_details.resume && (
                              <div className={styles.headerResumeActions}>
                                <button
                                    className={styles.iconButton}
                                    onClick={(e) => handleViewResume(application.applicant_details.resume, e)}
                                    title="View Resume"
                                >
                                  <VscEye className={styles.actionIcon} /> <span className={styles.ResumeViewText}>Resume</span>
                                </button>
                                <button
                                    className={styles.downloadButton}
                                    onClick={(e) => handleDownloadResume(application.applicant_details.resume, application.applicant_details.full_name, e)}
                                    title="Download Resume"
                                >
                                  <MdOutlineFileDownload className={styles.actionIcon} />
                                </button>
                              </div>
                          )}

                          <div className={styles.chevronContainer}>
                            {expandedApplicant === application.application_id ? (
                                <ChevronLeft className={styles.chevronIcon} />
                            ) : (
                                <ChevronRight className={styles.chevronIcon} />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content - Only 2 sections now */}
                      {expandedApplicant === application.application_id && (
                          <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className={styles.expandedContent}
                          >
                            {/* Section 1: Experience, Education, Skills - Expandable */}
                            <div className={styles.detailsAccordion}>
                              <div
                                  className={styles.accordionHeader}
                                  onClick={() => setActiveTab(activeTab ? null : 'skills')}
                              >
                                <h4>Qualifications & Experience</h4>
                                {activeTab ? <ExpandLess /> : <ExpandMore />}
                              </div>

                              {activeTab && (
                                  <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      transition={{ duration: 0.3 }}
                                      className={styles.accordionContent}
                                  >
                                    {/* Tabs Navigation */}
                                    <div className={styles.tabsContainer}>
                                      <button
                                          className={`${styles.tabButton} ${activeTab === 'skills' ? styles.activeTab : ''}`}
                                          onClick={() => setActiveTab('skills')}
                                      >
                                        <Code fontSize="small" /> Skills
                                      </button>
                                      <button
                                          className={`${styles.tabButton} ${activeTab === 'experience' ? styles.activeTab : ''}`}
                                          onClick={() => setActiveTab('experience')}
                                      >
                                        <Work fontSize="small" /> Experience
                                      </button>
                                      <button
                                          className={`${styles.tabButton} ${activeTab === 'education' ? styles.activeTab : ''}`}
                                          onClick={() => setActiveTab('education')}
                                      >
                                        <School fontSize="small" /> Education
                                      </button>
                                    </div>

                                    {/* Tab Content */}
                                    <div className={styles.tabContentWrapper}>
                                      {loadingDetails ? (
                                          <div className={styles.loadingSpinner}>
                                            <div className={styles.spinner}></div>
                                            <p>Loading applicant details...</p>
                                          </div>
                                      ) : (
                                          renderTabContent(applicantDetails[application.application_id])
                                      )}
                                    </div>
                                  </motion.div>
                              )}
                            </div>

                            {/* Section 2: Comments & Action Buttons - Always visible on expand */}
                            <div className={styles.actionSection}>
                              <div className={styles.commentSection}>
                                <div className={styles.commentHeader}>
                                  <h4>Recruiter Notes</h4>
                                  <button
                                      disabled={application.application_status !== 'PENDING'}
                                      className={application.application_status === 'PENDING' ? styles.aiSuggestButton: styles.disableButton}
                                      onClick={() => generateAINote(application.application_id)}
                                  >
                                    <SparklesIcon className={styles.suggestIcon} /> Suggest
                                  </button>
                                </div>

                                <textarea
                                    className={styles.commentField}
                                    value={comments[application.application_id] || ''}
                                    onChange={(e) => handleInputComment(e, application.application_id)}
                                    placeholder="Add your notes about this candidate..."
                                />
                              </div>

                              <div className={styles.decisionActions}>
                                {application.application_status === 'PENDING' ? (
                                    <>
                                      <button
                                          className={`${styles.decisionButton} ${styles.approveButton}`}
                                          onClick={() => handleStatusChange(application.application_id, "APPROVED", comments[application.application_id])}
                                      >
                                        <ApprovalRayIcon className={styles.decisionIcon} />
                                        <span>Approve</span>
                                      </button>

                                      <button
                                          className={`${styles.decisionButton} ${styles.rejectButton}`}
                                          onClick={() => handleStatusChange(application.application_id, "REJECTED", comments[application.application_id])}
                                      >
                                        <RejectPulseIcon className={styles.decisionIcon} />
                                        <span>Reject</span>
                                      </button>
                                    </>
                                ) : (
                                    <button
                                        className={`${styles.decisionButton} ${styles.undoButton}`}
                                        onClick={() => handleStatusChange(application.application_id, "PENDING", comments[application.application_id])}
                                    >
                                      <TimeReverseIcon className={styles.decisionIcon} />
                                      <span>Undo Decision</span>
                                    </button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                      )}
                    </motion.div>
                ))
            ) : (
                <motion.div
                    className={styles.emptyApplicants}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                  <div className={styles.emptyIllustration}>
                    <Person sx={{ fontSize: 80, opacity: 0.3 }} />
                  </div>
                  <h3>No applicants found</h3>
                  <p>There are no applicants matching your current filters</p>
                  {searchQuery && (
                      <button
                          className={styles.clearSearchButton}
                          onClick={() => setSearchQuery('')}
                      >
                        Clear search
                      </button>
                  )}
                </motion.div>
            )}
          </div>

          {/* Always show pagination regardless of page count */}
          <div className={styles.pagination}>
            <button
                onClick={() => paginate(applicantsListCurrentPage - 1)}
                disabled={applicantsListCurrentPage === 1}
                className={styles.paginationButton}
            >
              <ChevronLeft />
            </button>

            {Array.from({ length: Math.min(5, applications.total_pages || 1) }, (_, i) => {
              let pageNumber;

              if (!applications.total_pages || applications.total_pages <= 5) {
                pageNumber = i + 1;
              } else if (applicantsListCurrentPage <= 3) {
                pageNumber = i + 1;
              } else if (applicantsListCurrentPage >= applications.total_pages - 2) {
                pageNumber = applications.total_pages - 4 + i;
              } else {
                pageNumber = applicantsListCurrentPage - 2 + i;
              }

              if (pageNumber > applications.total_pages) return null;

              return (
                  <button
                      key={pageNumber}
                      onClick={() => paginate(pageNumber)}
                      className={`${styles.paginationButton} ${applicantsListCurrentPage === pageNumber ? styles.activePage : ''}`}
                  >
                    {pageNumber}
                  </button>
              );
            })}

            {applications.total_pages > 5 && applicantsListCurrentPage < applications.total_pages - 2 && (
                <span className={styles.paginationEllipsis}>...</span>
            )}

            <button
                onClick={() => paginate(applicantsListCurrentPage + 1)}
                disabled={!applications.total_pages || applicantsListCurrentPage === applications.total_pages}
                className={styles.paginationButton}
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </motion.div>
  );
};

export default ApplicantsPanel;