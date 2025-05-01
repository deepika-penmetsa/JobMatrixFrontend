import React, { useState, useEffect } from "react";
import { getSkills, postSkill, editSkill, deleteSkill } from "../../../services/api";
import { FiEdit2, FiSave, FiEdit3 } from "react-icons/fi";
import { MdDoneAll, MdDelete } from "react-icons/md";
import { LuEraser } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import ToastNotification from "../../../components/ToastNotification";
import styles from "../../../styles/SkillsTab.module.css";

const SkillsTab = () => {
  const applicantId = localStorage.getItem("userId");
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({ name: "", years: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await getSkills(applicantId);
      if (res?.status === "success") {
        setSkills(res.data);
      } else {
        showToast(res?.message || "Failed to load skills", "error");
      }
    } catch (error) {
      showToast("Error loading skills", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddSkill = async () => {
    if (!newSkill.name.trim() || !newSkill.years) {
      showToast("Please enter both skill name and years of experience", "error");
      return;
    }

    if (skills.some(s => s.skill_name.toLowerCase() === newSkill.name.trim().toLowerCase())) {
      showToast("This skill already exists", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await postSkill({
        applicant_id: applicantId,
        skill_name: newSkill.name,
        skill_years_of_experience: parseInt(newSkill.years)
      });
      
      if (res?.status === "success") {
        setSkills(prev => [...prev, res.data]);
        setNewSkill({ name: "", years: "" });
        showToast("Skill added successfully");
      } else {
        showToast(res?.message || "Failed to add skill", "error");
      }
    } catch (error) {
      showToast("Failed to add skill", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    try {
      setLoading(true);
      const res = await deleteSkill(skillId);
      if (res?.status === "success") {
        setSkills(prev => prev.filter(skill => skill.skill_id !== skillId));
        showToast("Skill deleted successfully");
      } else {
        showToast(res?.message || "Failed to delete skill", "error");
      }
    } catch (error) {
      showToast("Failed to delete skill", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSkill = async (skill) => {
    try {
      setLoading(true);
      const res = await editSkill(skill.skill_id, {
        skill_name: skill.skill_name,
        skill_years_of_experience: parseInt(skill.skill_years_of_experience)
      });
      
      if (res?.status === "success") {
        setSkills(prev => prev.map(s => s.skill_id === skill.skill_id ? res.data : s));
        setEditingId(null);
        showToast("Skill updated successfully");
      } else {
        showToast(res?.message || "Failed to update skill", "error");
      }
    } catch (error) {
      showToast("Failed to update skill", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Technical Competencies</h2>
        <button 
          className={`${styles.primaryButton} ${isAdding ? styles.cancelButton : ''}`}
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingId(null);
          }}
          disabled={loading}
        >
          {isAdding ? (
            <>
              <MdDoneAll size={18} /> Done
            </>
          ) : (
            <>
              <FiEdit3 size={18} /> Skills
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            className={styles.addForm}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.inputGroup}>
              <input
                type="text"
                value={newSkill.name}
                onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                placeholder="Skill name"
                className={styles.input}
              />
              <input
                type="number"
                min="0"
                value={newSkill.years}
                onChange={(e) => setNewSkill({...newSkill, years: e.target.value})}
                placeholder="Years of experience"
                className={styles.inputYoe}
              />
              <div className={styles.formActions}>
              <button 
                onClick={handleAddSkill}
                disabled={!newSkill.name.trim() || !newSkill.years || loading}
                className={styles.primaryButton}
              >
                <FiSave size={16} /> Save
              </button>
              
            </div>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>

      {loading && skills.length === 0 ? (
        <div className={styles.loadingState}>
          <div className={styles.skeletonChip} />
          <div className={styles.skeletonChip} />
          <div className={styles.skeletonChip} />
        </div>
      ) : (
        <div className={styles.skillsGrid}>
          <AnimatePresence>
            {skills
            .slice()
            .sort((a,b) => b.skill_years_of_experience - a.skill_years_of_experience)
            .map(skill => (
              <motion.div
                key={skill.skill_id}
                className={styles.skillCard}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                {editingId === skill.skill_id ? (
                  <div className={styles.editForm}>
                    <input
                      type="text"
                      value={skill.skill_name}
                      onChange={(e) => setSkills(prev => 
                        prev.map(s => 
                          s.skill_id === skill.skill_id 
                            ? {...s, skill_name: e.target.value} 
                            : s
                        )
                      )}
                      className={styles.input}
                    />
                    <input
                      type="number"
                      min="0"
                      value={skill.skill_years_of_experience}
                      onChange={(e) => setSkills(prev => 
                        prev.map(s => 
                          s.skill_id === skill.skill_id 
                            ? {...s, skill_years_of_experience: e.target.value} 
                            : s
                        )
                      )}
                      className={styles.inputYoe}
                    />
                    <div className={styles.editActions}>
                      <button 
                        onClick={() => handleUpdateSkill(skill)}
                        className={styles.primaryButton}
                      >
                        <FiSave size={14} />
                      </button>
                      <button 
                        onClick={() => setEditingId(null)}
                        className={styles.secondaryButton}
                      >
                        <LuEraser size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.skillInfo}>
                      <span><h3>{skill.skill_name}</h3></span>
                      <span>{skill.skill_years_of_experience}{skill.skill_years_of_experience === 1 ? " Year":" Years"}</span>
                    </div>
                    {isAdding && (
                      <div className={styles.actions}>
                      <button 
                        onClick={() => setEditingId(skill.skill_id)}
                        className={styles.iconButton}
                        aria-label="Edit skill"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteSkill(skill.skill_id)}
                        className={styles.iconButton}
                        aria-label="Delete skill"
                      >
                        <MdDelete size={16} />
                      </button>
                    </div>
                    )}
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default SkillsTab;