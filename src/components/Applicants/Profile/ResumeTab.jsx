import { useDispatch, useSelector } from "react-redux";
import { useState, useCallback, useEffect, use } from "react";
import { FileUploadOutlined, DescriptionOutlined } from "@mui/icons-material";
import { patchResume, userDetails } from "../../../services/api";
import ToastNotification from "../../ToastNotification";
import styles from "../../../styles/ResumeTab.module.css";
import { setUser,setResume } from '../../../Redux/userSlice'; 

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

const ResumeTab = () => {
  const dispatch = useDispatch();
  const userData = useSelector(state=>state.user?.user);
  const [resumeUrl, setResumeUrl] = useState(userData?.applicant_resume);
  const [isLoading, setIsLoading] = useState(false);
  const [responseOk, setResponseOk] = useState(false);
  const [toastQueue, setToastQueue] = useState([]);
  const [resumeName, setResumeName] = useState(userData?.applicant_resume?.split('/').pop().split('.')[0].split('_').slice(0, -1).join('_'));
  const [initialLoading, setInitialLoading] = useState(true); 


  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToastQueue((prev) => [...prev, { message, type, id }]);
    setTimeout(() => {
      setToastQueue((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const fetchResume = async () => {
    try {
      const email = localStorage.getItem("userEmail");
      if (!email) return;

      const response = await userDetails(email);
      if (response?.applicant_resume) {
        setResumeUrl(response.applicant_resume);
        setResponseOk(true);
        const pdfName = response.applicant_resume.split('/').pop();
        const nameWithoutExt = pdfName.split('.')[0]; 
        const cleanName = nameWithoutExt.split('_').slice(0, -1).join('_'); // "My_Resume"
        setResumeName(cleanName);
        dispatch(setUser(response));
      }
      else if(response.notfound){
        showToast("Resume is missing", "error");
      }
    } catch (error) {
      showToast("Failed to fetch resume", "error");
    }
    finally {
      setInitialLoading(false); 
    }
  };

  useEffect(() => {
    fetchResume();
  }, []);  

  const validateFile = (file) => {
    if (!file) return false;

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      showToast("Invalid file type. Only PDF, DOC, DOCX allowed", "error");
      return false;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      showToast(`File too large. Max size is ${MAX_FILE_SIZE_MB}MB`, "error");
      return false;
    }

    return true;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!validateFile(file)) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("applicant_resume", file);

      const result = await patchResume(formData);
      if (result?.error) throw new Error(result.error);

      setResumeUrl(result.applicant_resume);
      const pdfName = result.applicant_resume.split('/').pop();
      const nameWithoutExt = pdfName.split('.')[0]; // "My_Resume_xXCKC6L"
      const cleanName = nameWithoutExt.split('_').slice(0, -1).join('_'); // "My_Resume"
      setResumeName(cleanName);
      setResponseOk(true);
      dispatch(setResume(result.applicant_resume))
      showToast("Resume uploaded successfully");
    } catch (error) {
      console.error("Resume upload error:", error);
      showToast("Failed to upload resume", "error");
    } finally {
      setIsLoading(false);
      e.target.value = "";
    }
  };

  return (
    <div className={styles.container}>
      {/* Upload Section */}
      <div className={styles.uploadSection}>
        <span>
          <input
            type="file"
            id="resume-upload"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            disabled={isLoading}
            className={styles.fileInput}
            aria-label="Upload resume"
          />
          <label
            htmlFor="resume-upload"
            className={styles.uploadButton}
            aria-disabled={isLoading}
          >
            <FileUploadOutlined /> 
            {isLoading ? "Processing..." : resumeUrl && responseOk ? "Replace Resume" : "Upload Resume"}
            
          </label>
        </span>
        <span className={styles.resumeName}>
        {responseOk ? resumeName:""}
          </span>
      </div>
  
      {/* Toast Notifications */}
      <div className={styles.toastContainer}>
        {toastQueue.map((toast) => (
          <ToastNotification
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() =>
              setToastQueue((prev) => prev.filter((t) => t.id !== toast.id))
            }
          />
        ))}
      </div>
  
      {/* Loading on initial fetch */}
      {initialLoading ? (
        <div className={styles.loading}>Loading your resume...</div>
      ) : isLoading ? (
        <div className={styles.loading}>Processing your resume...</div>
      ) : resumeUrl && responseOk ? (
        <div className={styles.resumeViewerContainer}>
          <iframe
            src={`${resumeUrl}#toolbar=1&navpanes=0&scrollbar=1&view=fitH`}
            title="Resume Preview"
            className={styles.resumeIframe}
            loading="lazy"
          />
        </div>
      ) : (
        <div className={styles.emptyState}>
        <div className={styles.emptyStateIcon}>
          <DescriptionOutlined fontSize="large" /> {/* Material-UI icon */}
        </div>
        <h3 className={styles.emptyStateTitle}>No Resume Uploaded Yet</h3>
        <p className={styles.emptyStateSubtitle}>
          Upload your resume to increase your job opportunities
        </p>
        <label
          htmlFor="resume-upload"
          className={styles.uploadButtonEmptyState}
          aria-disabled={isLoading}
        >
          <FileUploadOutlined sx={{ marginRight: 1 }} /> 
          {isLoading ? "Processing..." : "Upload Resume"}
        </label>
      </div>
      )}
    </div>
  );
  
};

export default ResumeTab;
