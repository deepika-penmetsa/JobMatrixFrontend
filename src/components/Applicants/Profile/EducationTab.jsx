import React, { useEffect, useState } from "react";
import styles from "../../../styles/EducationTab.module.css";
import { getEducation, postEducation, editEducation, deleteEducation } from "../../../services/api"; 
import { IconButton, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, Checkbox } from "@mui/material";
import noResultsImage from "../../../assets/NoApplicationsYet.png";
import { MdDelete } from "react-icons/md";
import { FiExternalLink } from "react-icons/fi";
import { HiPencil } from "react-icons/hi2";
import { BsCalendar2Date } from "react-icons/bs";
import { FaGraduationCap } from "react-icons/fa6";
import { LuFileBadge, LuEraser, LuSave } from "react-icons/lu";
import ToastNotification from "../../../components/ToastNotification";

const EducationTab = () => {
  const userId = localStorage.getItem("userId");
  const [educationData, setEducationData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toastQueue, setToastQueue] = useState([]);
  
  const [formData, setFormData] = useState({
    education_school_name: "",
    education_degree_type: "",
    education_major: "",
    education_gpa: "",
    education_start_date: "",
    education_end_date: "",
    education_is_currently_enrolled: false,
  });

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToastQueue((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToastQueue((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  useEffect(() => {
    fetchEducationData();
  }, []);

  const fetchEducationData = async () => {
    try {
      setLoading(true);
      const res = await getEducation(userId);
      
      if (res?.status === "success") {
        setEducationData(res.data);
        if (res.data.length === 0) {
          setEducationData([]);
        }
      } else if (res?.error) {
        setEducationData([]);
        console.log(res.error.message, res.error.message);
      }
    } catch (error) {
      console.error("Error loading education data", error);
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
        education_start_date: formatDialogDate(item.education_start_date),
        education_end_date: item.education_end_date ? formatDialogDate(item.education_end_date) : ""
      });
    } else {
      setEditingItem(null);
      setFormData({
        education_school_name: "",
        education_degree_type: "",
        education_major: "",
        education_gpa: "",
        education_start_date: "",
        education_end_date: "",
        education_is_currently_enrolled: false,
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
        education_start_date: formData.education_start_date,
        education_end_date: formData.education_end_date ? formData.education_end_date:null
      };
      
      if (editingItem) {
        await editEducation(editingItem.education_id, payload);
        showToast("Education updated successfully");
      } else {
        await postEducation(payload);
        showToast("Education added successfully");
      }
      handleCloseDialog();
      await fetchEducationData();
    } catch (error) {
      showToast(error.message || "Failed to save education", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deleteEducation(id);
      showToast("Education deleted successfully");
      await fetchEducationData();
    } catch (error) {
      showToast("Failed to delete education", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Education History</h2>
        <button
          type="button"
          className={styles.addButton}
          onClick={() => handleOpenDialog()}
        >
          <FaGraduationCap className={styles.buttonIcon} />
          <span>Add Education</span>
        </button>
      </div>

      {loading && !educationData.length ? (
        <div className={styles.loading}>Loading education...</div>
      ) : educationData.length === 0 ? (



        <div className={styles.noResultsContainer}>
                      <img
                        src={noResultsImage}
                        alt="No applications found"
                        className={styles.noResultsImage}
                      />
                      <p>No education history added yet</p>
        </div>


      ) : (
        <div className={styles.timeline}>
          {educationData
          .slice()
          .sort((a, b) => new Date(b.education_start_date) - new Date(a.education_start_date))
          .map((edu) => (
            <div key={edu.education_id} className={styles.timelineItem}>
              <div className={styles.timelineDot} />
              <div className={styles.timelineContent}>
                <div className={styles.timelineHeader}>
                  <h3 className={styles.schoolName}>
                    {edu.education_school_name}
                    <a 
                      href={`https://www.google.com/search?q=${encodeURIComponent(edu.education_school_name)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.schoolLink}
                    >
                      <FiExternalLink size={14} />
                    </a>
                  </h3>
                  <div className={styles.timelineActions}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenDialog(edu)}
                      aria-label="Edit education"
                    >
                      <HiPencil className={styles.buttonIcons}/>
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDelete(edu.education_id)}
                      aria-label="Delete education"
                    >
                      <MdDelete className={styles.buttonIcons}/>
                    </IconButton>
                  </div>
                </div>
                
                <div className={styles.degreeInfo}>
                  <span className={styles.degreeType}>{edu.education_degree_type}</span>
                  {edu.education_major && <span className={styles.major}>{edu.education_major}</span>}
                </div>
                
                <div className={styles.details}>
                  <div className={styles.dateRange}>
                    <BsCalendar2Date className={styles.dateIcon} />
                    {formatDisplayDate(edu.education_start_date)} - {formatDisplayDate(edu.education_end_date)}
                  </div>
                </div>
                {edu.education_gpa && (
                    <div className={styles.dateRange}>
                      <LuFileBadge className={styles.dateIcon}/>
                      Grade<span style={{color:'var(--steel-blue)'}}>{edu.education_gpa}</span>
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingItem ? "Edit Education" : "Add New Education"}
        </DialogTitle>
        <DialogContent className={styles.dialogContent}>
          <TextField 
            fullWidth 
            margin="normal" 
            name="education_school_name" 
            label="School/University Name" 
            value={formData.education_school_name} 
            onChange={handleChange} 
            required
          />
          
          <div className={styles.formRow}>
            <TextField 
              fullWidth 
              margin="normal" 
              name="education_degree_type" 
              label="Degree Type" 
              value={formData.education_degree_type} 
              onChange={handleChange} 
              required
            />
            <TextField 
              fullWidth 
              margin="normal" 
              name="education_major" 
              label="Major/Field of Study" 
              value={formData.education_major} 
              onChange={handleChange} 
            />
          </div>
          
          <div className={styles.formRow}>
            <TextField 
              fullWidth 
              margin="normal" 
              name="education_gpa" 
              label="GPA" 
              value={formData.education_gpa} 
              onChange={handleChange} 
              type="number"
              slotProps={{ htmlInput: { step: "0.05", min: "0", max: "4.0"}}}
            />
          </div>
          
          <div className={styles.formRow}>
            <TextField 
              fullWidth 
              margin="normal" 
              name="education_start_date" 
              label="Start Date" 
              type="date" 
              value={formData.education_start_date} 
              onChange={handleChange} 
              InputLabelProps={{ shrink: true }}
              required
            />
            
            {!formData.education_is_currently_enrolled && (
              <TextField 
                fullWidth 
                margin="normal" 
                name="education_end_date" 
                label="End Date" 
                type="date" 
                value={formData.education_end_date} 
                onChange={handleChange} 
                InputLabelProps={{ shrink: true }}
              />
            )}
          </div>
          
          <FormControlLabel
            control={
              <Checkbox
                name="education_is_currently_enrolled"
                checked={formData.education_is_currently_enrolled}
                onChange={handleChange}
                color="primary"
              />
            }
            label="Currently enrolled"
          />
        </DialogContent>
        <DialogActions>

          <Button 
            variant="text" 
            onClick={handleCloseDialog} 
            className={styles.cancelButton}
          >
            <LuEraser className={styles.saveIcon}/>Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            className={styles.saveButton}
            disabled={loading || !formData.education_school_name || !formData.education_degree_type || !formData.education_start_date}
          >
            <LuSave className={styles.saveIcon}/> {loading ? "Saving..." : "Save"}
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

export default EducationTab;