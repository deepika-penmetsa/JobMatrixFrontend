import { useState, useCallback, useRef, useEffect } from "react";
import Cropper from "react-easy-crop";
import styles from "../styles/CropImageUploader.module.css";
import { getCroppedImg } from "../services/cropImageUtils";
import UploadIcon from "@mui/icons-material/AddAPhoto";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Slider from "@mui/material/Slider";

const CropImageUploader = ({onFileChange, defaultImage, currentImage, checkPage = "signup" , isEditing }) => {
  const [originalImage, setOriginalImage] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentImage || defaultImage || null);
  const [showModal, setShowModal] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const inputRef = useRef();
  useEffect(() => {
    if (currentImage) {
      if (typeof currentImage === 'string') {
        setPreviewUrl(currentImage);
      } else if (currentImage instanceof File) {
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(currentImage);
      }
    } else if (defaultImage) {
      setPreviewUrl(defaultImage);
    }
  }, [currentImage, defaultImage]);

  const handleCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const triggerFileInput = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setOriginalImage(reader.result);
        setImageSrc(reader.result);
        setShowModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const file = new File([blob], "profile-photo.jpg", { type: blob.type });
      const previewUrl = URL.createObjectURL(blob);
      setPreviewUrl(previewUrl);
      setShowModal(false);
      onFileChange(file);
    } catch (error) {
      console.error("Error cropping image:", error);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    if (previewUrl) {
      setImageSrc(originalImage);
    }
  };

  const handleDelete = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(defaultImage || null);
    setOriginalImage(null);
    onFileChange(null);
  };

  const handleEdit = () => {
    if (originalImage) {
      setImageSrc(originalImage);
      setShowModal(true);
    } else if (previewUrl && previewUrl !== defaultImage) {
      setImageSrc(previewUrl);
      setShowModal(true);
    }
  };

  return (
    <div className={styles.wrapper} style={{ pointerEvents: checkPage === 'signup' ? 'auto' : isEditing ? 'auto': 'none' }}>
      <div className={styles.squareWrapper}>
        <img
          src={previewUrl || defaultImage}
          alt="Preview"
          className={styles.profileImage}
        />
        {(!previewUrl || previewUrl === defaultImage) && (checkPage === "signup" || isEditing) ? (
          
          <div className={`${styles.uploadOverlay} ${checkPage !== 'signup' && isEditing ? styles.centerDelete : ''}`} onClick={triggerFileInput}>
            <UploadIcon fontSize="large"/>
          </div>
        ) : (
          <div className={`${styles.actionIcons} ${checkPage !== 'signup' && isEditing ? styles.centerDelete : ''}`}>
            {checkPage === 'signup' && (<EditIcon fontSize="small" onClick={handleEdit} className={styles.editIcon} />)}
            <DeleteIcon fontSize="small" onClick={handleDelete} className={styles.deleteIcon} />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          onChange={handleFileChange}
          hidden
        />
      </div>

      {showModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.cropperContainer}>
            <div className={styles.cropContainer}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="rect"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            </div>
            <div className={styles.zoomSlider}>
              <Slider
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(_, value) => setZoom(value)}
                aria-labelledby="Zoom"
              />
            </div>
            <div className={styles.modalButtons}>
              <button onClick={handleCancel} className={styles.cancelBtn} type="button">
                Cancel
              </button>
              <button onClick={handleSave} className={styles.saveBtn} type="button">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropImageUploader;