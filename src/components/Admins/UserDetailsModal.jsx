import { useEffect, useState } from 'react';
import styles from '../../styles/UserDetailsModal.module.css';
import { FiX, FiDownload, FiExternalLink } from 'react-icons/fi';

const UserDetailsModal = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN':
        return styles.adminBadge;
      case 'RECRUITER':
        return styles.recruiterBadge;
      case 'APPLICANT':
        return styles.applicantBadge;
      default:
        return '';
    }
  };

  const handleDownloadResume = (resumeUrl, applicantName, e) => {
    e.preventDefault();
    e.stopPropagation();

    // Start file download using fetch API
    fetch(resumeUrl)
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

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <div className={styles.userHeader}>
            <img
              src={user.user_profile_photo || '/default-profile.png'}
              alt={`${user.user_first_name} ${user.user_last_name}`}
              className={styles.profileImage}
            />
            <div className={styles.userTitle}>
              <h2>{`${user.user_first_name} ${user.user_last_name}`}</h2>
              <div className={styles.userMeta}>
                <span className={`${styles.roleBadge} ${getRoleBadgeClass(user.user_role)}`}>
                  {user.user_role}
                </span>
                <span className={styles.userEmail}>{user.user_email}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <FiX size={24} />
          </button>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tabButton} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          {user.user_role === 'APPLICANT' && (
            <button
              className={`${styles.tabButton} ${activeTab === 'skills' ? styles.active : ''}`}
              onClick={() => setActiveTab('skills')}
            >
              Skills
            </button>
          )}
          {user.user_role === 'APPLICANT' && (
            <button
              className={`${styles.tabButton} ${activeTab === 'experience' ? styles.active : ''}`}
              onClick={() => setActiveTab('experience')}
            >
              Experience
            </button>
          )}
          {user.user_role === 'APPLICANT' && (
            <button
              className={`${styles.tabButton} ${activeTab === 'education' ? styles.active : ''}`}
              onClick={() => setActiveTab('education')}
            >
              Education
            </button>
          )}
          {user.user_role === 'RECRUITER' && (
            <button
              className={`${styles.tabButton} ${activeTab === 'company' ? styles.active : ''}`}
              onClick={() => setActiveTab('company')}
            >
              Company
            </button>
          )}
        </div>

        <div className={styles.modalContent}>
          {activeTab === 'overview' && (
            <div className={styles.overviewSection}>
              <div className={styles.detailCard}>
                <h3 className={styles.detailTitle}>Personal Information</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Phone</span>
                    <span className={styles.detailValue}>{user.user_phone || 'N/A'}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Joined</span>
                    <span className={styles.detailValue}>{formatDate(user.user_created_date)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Address</span>
                    <span className={styles.detailValue}>
                      {user.user_street_no || 'N/A'}
                      {user.user_city && `, ${user.user_city}`}
                      {user.user_state && `, ${user.user_state}`}
                      {user.user_zip_code && `, ${user.user_zip_code}`}
                    </span>
                  </div>
                  {user.user_role === 'ADMIN' && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>SSN</span>
                      <span className={styles.detailValue}>{user.admin_ssn || 'N/A'}</span>
                    </div>
                  )}
                </div>
              </div>

              {user.user_role === 'APPLICANT' && user.applicant_resume && (
                <div className={styles.resumeCard}>
                  <div className={styles.resumeInfo}>
                    <h3 className={styles.detailTitle}>Resume</h3>
                    <p className={styles.resumeText}>View or download the applicant's resume</p>
                  </div>
                  <div className={styles.resumeActions}>
                    <a
                      href={user.applicant_resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.resumeButton}
                    >
                      <FiExternalLink size={16} />
                      View
                    </a>
                    <button onClick={(e)=> handleDownloadResume(user.applicant_resume,user.user_first_name+user.user_last_name,e)} className={styles.resumeButton}>
                      <FiDownload size={16} />
                      Download
                    </button>
                  </div>
                </div>
              )}

              {user.user_role === 'RECRUITER' && user.recruiter && (
                <div className={styles.detailCard}>
                  <h3 className={styles.detailTitle}>Recruiter Information</h3>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Status</span>
                      <span className={styles.detailValue}>
                        {user.recruiter.recruiter_is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Start Date</span>
                      <span className={styles.detailValue}>
                        {formatDate(user.recruiter.recruiter_start_date)}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>End Date</span>
                      <span className={styles.detailValue}>
                        {user.recruiter.recruiter_end_date
                          ? formatDate(user.recruiter.recruiter_end_date)
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'skills' && user.skills && (
            <div className={styles.skillsSection}>
              {user.skills.length > 0 ? (
                <div className={styles.skillsGrid}>
                  {user.skills.map((skill) => (
                    <div key={skill.skill_id} className={styles.skillCard}>
                      <span className={styles.skillName}>{skill.skill_name}</span>
                      <div className={styles.skillExperience}>
                        <div
                          className={styles.skillBar}
                          style={{ width: `${Math.min(skill.skill_years_of_experience * 20, 100)}%` }}
                        ></div>
                        <span className={styles.skillYears}>
                          {skill.skill_years_of_experience} yr{skill.skill_years_of_experience !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p>No skills added yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'experience' && user.work_experience && (
            <div className={styles.experienceSection}>
              {user.work_experience.length > 0 ? (
                <div className={styles.timeline}>
                  {user.work_experience.map((exp) => (
                    <div key={exp.work_experience_id} className={styles.timelineItem}>
                      <div className={styles.timelineDot}></div>
                      <div className={styles.timelineContent}>
                        <h3 className={styles.jobTitle}>{exp.work_experience_job_title}</h3>
                        <p className={styles.companyName}>{exp.work_experience_company}</p>
                        <p className={styles.jobDuration}>
                          {formatDate(exp.work_experience_start_date)} -{' '}
                          {exp.work_experience_end_date
                            ? formatDate(exp.work_experience_end_date)
                            : 'Present'}
                        </p>
                        {exp.work_experience_summary && (
                          <div className={styles.jobDescription}>
                            {exp.work_experience_summary.split('\n').map((paragraph, i) => (
                              <p key={i}>{paragraph}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p>No work experience added yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'education' && user.education && (
            <div className={styles.educationSection}>
              {user.education.length > 0 ? (
                <div className={styles.educationList}>
                  {user.education.map((edu) => (
                    <div key={edu.education_id} className={styles.educationCard}>
                      <div className={styles.educationHeader}>
                        <h3 className={styles.degreeName}>
                          {edu.education_degree_type} in {edu.education_major}
                        </h3>
                        {edu.education_gpa !== null ? <span className={styles.gpaBadge}>GPA: {edu.education_gpa}</span>:''}
                      </div>
                      <p className={styles.schoolName}>{edu.education_school_name}</p>
                      <p className={styles.educationDuration}>
                        {formatDate(edu.education_start_date)} -{' '}
                        {edu.education_end_date
                          ? formatDate(edu.education_end_date)
                          : edu.education_is_currently_enrolled
                          ? 'Present'
                          : 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p>No education information added yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'company' && user.company && (
            <div className={styles.companySection}>
              <div className={styles.companyCard}>
                <div className={styles.companyHeader}>
                  {user.company.company_image && (
                    <img
                      src={user.company.company_image}
                      alt={user.company.company_name}
                      className={styles.companyLogo}
                    />
                  )}
                  <div className={styles.companyInfo}>
                    <h3 className={styles.companyName}>{user.company.company_name}</h3>
                    <p className={styles.companyIndustry}>{user.company.company_industry}</p>
                  </div>
                </div>
                <div className={styles.companyDescription}>
                  <h4 className={styles.sectionTitle}>About</h4>
                  <p>{user.company.company_description}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;