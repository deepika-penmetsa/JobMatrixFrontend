import React, { useEffect, useState } from "react";
import styles from "../../../styles/WorkExperienceTab.module.css";
import { 
  getWorkExperience, 
  postWorkExperience, 
  editWorkExperience, 
  deleteWorkExperience 
} from "../../../services/api";
import { 
  IconButton, 
  TextField, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  FormControlLabel, 
  Checkbox 
} from "@mui/material";
import { MdDelete, MdWork, MdWorkspacePremium } from "react-icons/md";
import { BsCalendar2Date } from "react-icons/bs";
import { FiExternalLink } from "react-icons/fi";
import { HiPencil } from "react-icons/hi2";
import noResultsImage from "../../../assets/NoApplicationsYet.png";
import ToastNotification from "../../../components/ToastNotification";
import { LuEraser, LuSave } from "react-icons/lu";

const WorkExperienceTab = () => {
  const userId = localStorage.getItem("userId");
  const [workData, setWorkData] = useState([]);
  const [resOk, setResOk] = useState(false);
  const [totalExperience, setTotalExperience] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toastQueue, setToastQueue] = useState([]);
  
  const [formData, setFormData] = useState({
    work_experience_job_title: "",
    work_experience_company: "",
    work_experience_summary: "",
    work_experience_start_date: "",
    work_experience_end_date: "",
    work_experience_is_currently_working: false,
  });

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToastQueue((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToastQueue((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  useEffect(() => {
    fetchWorkData();
  }, []);

  const fetchWorkData = async () => {
    try {
      setLoading(true);
      const res = await getWorkExperience(userId);
      if (res?.status === "success") {
        setWorkData(res.data);
        setResOk(true);
        setTotalExperience(res.total_experience);
      } else {
        showToast("Failed to load work experience", "error");
      }
    } catch (error) {
      showToast("Error loading work experience", "error");
    } finally {
      setLoading(false);
    }
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "Present";
    
    const date = new Date(dateString);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  };

  const formatDialogDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        ...item,
        work_experience_start_date: formatDialogDate(item.work_experience_start_date),
        work_experience_end_date: item.work_experience_end_date ? formatDialogDate(item.work_experience_end_date) : "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        work_experience_job_title: "",
        work_experience_company: "",
        work_experience_summary: "",
        work_experience_start_date: "",
        work_experience_end_date: "",
        work_experience_is_currently_working: false,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const payload = { 
        ...formData,
        applicant_id: userId,
        work_experience_start_date: formData.work_experience_start_date,
        work_experience_end_date: formData.work_experience_is_currently_working 
          ? null 
          : formData.work_experience_end_date
      };
      
      if (editingItem) {
        await editWorkExperience(editingItem.work_experience_id, payload);
        showToast("Work experience updated successfully");
      } else {
        await postWorkExperience(payload);
        showToast("Work experience added successfully");
      }
      handleCloseDialog();
      await fetchWorkData();
    } catch (error) {
      showToast(error.message || "Failed to save work experience", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deleteWorkExperience(id);
      showToast("Work experience deleted successfully");
      await fetchWorkData();
    } catch (error) {
      showToast("Failed to delete work experience", "error");
    } finally {
      setLoading(false);
    }
  };

  function formatDuration(durationString) {
    // Extract years, months, days (all optional)
    const matches = durationString.match(
      /(?:(\d+)\s*years?)?(?:\s*,\s*(\d+)\s*months?)?(?:\s*,\s*(\d+)\s*days?)?/i
    );
  
    // Get captured groups (index 1=year, 2=month, 3=day)
    const years = matches[1] ? parseInt(matches[1]) : 0;
    const months = matches[2] ? parseInt(matches[2]) : 0;
  
    // Build parts array
    const parts = [];
    
    if (years > 0) {
      parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
    }
    
    if (months > 0) {
      parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
    }
  
    // Return joined parts (or "0 days" if empty)
    return parts.length > 0 ? parts.join(' ') : '0 days';
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Professional Experience</h2><span className={styles.totalExperience}>
          <MdWorkspacePremium className={styles.buttonIcon}/>
          <span>{resOk ? formatDuration(totalExperience):""}</span>
        </span>
        <button
          type="button"
          className={styles.addButton}
          onClick={() => handleOpenDialog()}
        >
          <MdWork className={styles.buttonIcon} />
          <span>Add Experience</span>
        </button>
      </div>

      {loading && !workData.length ? (
        <div className={styles.loading}>Loading work experience...</div>
      ) : workData.length === 0 ? (
        <div className={styles.noResultsContainer}>
          <img
            src={noResultsImage}
            alt="No work experience found"
            className={styles.noResultsImage}
          />
          <p>No work experience added yet</p>
        </div>
      ) : (
        <div className={styles.timeline}>
          {workData
            .slice()
            .sort((a, b) => new Date(b.work_experience_start_date) - new Date(a.work_experience_start_date))
            .map((work) => (
              <div key={work.work_experience_id} className={styles.timelineItem}>
                <div className={styles.timelineDot} />
                <div className={styles.timelineContent}>
                  <div className={styles.timelineHeader}>
                    <h3 className={styles.companyName}>
                      {work.work_experience_company}
                      <a 
                        href={`https://www.google.com/search?q=${encodeURIComponent(work.work_experience_company)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.companyLink}
                      >
                        <FiExternalLink size={14} />
                      </a>
                    </h3>
                    <div className={styles.timelineActions}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenDialog(work)}
                        aria-label="Edit work experience"
                      >
                        <HiPencil className={styles.buttonIcons}/>
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDelete(work.work_experience_id)}
                        aria-label="Delete work experience"
                      >
                        <MdDelete className={styles.buttonIcons}/>
                      </IconButton>
                    </div>
                  </div>
                  
                  <div className={styles.jobTitle}>{work.work_experience_job_title}</div>
                  
                  <div className={styles.details}>
                    <div className={styles.dateRange}>
                      <BsCalendar2Date className={styles.dateIcon} />
                      {formatDisplayDate(work.work_experience_start_date)} - {formatDisplayDate(work.work_experience_end_date)}
                    </div>
                  </div>
                  
                  {work.work_experience_summary && (
                    <p className={styles.summary}>{work.work_experience_summary}</p>
                  )}
                  
                  {work.work_experience_bullet_points && work.work_experience_bullet_points.length > 0 && (
                    <ul className={styles.bulletPoints}>
                      {work.work_experience_bullet_points.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>
          {editingItem ? "Edit Work Experience" : "Add New Work Experience"}
        </DialogTitle>
        <DialogContent className={styles.dialogContent}>
          <TextField 
            fullWidth 
            margin="normal" 
            name="work_experience_company" 
            label="Company Name" 
            value={formData.work_experience_company} 
            onChange={handleChange} 
            required
          />
          
          <TextField 
            fullWidth 
            margin="normal" 
            name="work_experience_job_title" 
            label="Job Title" 
            value={formData.work_experience_job_title} 
            onChange={handleChange} 
            required
          />
          
          <div className={styles.formRow}>
            <TextField 
              fullWidth 
              margin="normal" 
              name="work_experience_start_date" 
              label="Start Date" 
              type="date" 
              value={formData.work_experience_start_date} 
              onChange={handleChange} 
              InputLabelProps={{ shrink: true }}
              required
            />
            
            {!formData.work_experience_is_currently_working && (
              <TextField 
                fullWidth 
                margin="normal" 
                name="work_experience_end_date" 
                label="End Date" 
                type="date" 
                value={formData.work_experience_end_date} 
                onChange={handleChange} 
                InputLabelProps={{ shrink: true }}
              />
            )}
          </div>
          
          <FormControlLabel
            control={
              <Checkbox
                name="work_experience_is_currently_working"
                checked={formData.work_experience_is_currently_working}
                onChange={handleChange}
                color="primary"
              />
            }
            label="Currently working here"
          />
          
          <TextField 
            fullWidth 
            margin="normal" 
            name="work_experience_summary" 
            label="Summary" 
            value={formData.work_experience_summary} 
            onChange={handleChange} 
            multiline
            rows={3}
          />
          

        </DialogContent>
        <DialogActions>
        <Button 
          onClick={handleCloseDialog} 
          className={styles.cancelButton}
          variant="text"
        >
          <LuEraser className={styles.saveIcon}/>Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          className={styles.saveButton}
          variant="contained"
          disabled={loading || 
            !formData.work_experience_company || 
            !formData.work_experience_job_title || 
            !formData.work_experience_start_date}
        >
          <LuSave className={styles.saveIcon}/>{loading ? "Saving..." : "Save"}
        </Button>
        </DialogActions>
      </Dialog>

      <div className={styles.toastWrapper}>
        {toastQueue.slice(0, 3).map((toast) => (
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

export default WorkExperienceTab;