import { useState, useRef, useEffect } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { FaCheck, FaTimes, FaUndo, FaArrowsAlt } from 'react-icons/fa';
import PropTypes from 'prop-types';
import styles from './ImageCropper.module.scss';

const ImageCropper = ({ 
  image, 
  onCropComplete, 
  onCancel, 
  aspectRatio = 1,
  circularCrop = true
}) => {
  const [crop, setCrop] = useState({
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10,
    aspect: aspectRatio
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);

  useEffect(() => {
    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size to match the completed crop
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    // Apply circular mask if needed
    if (circularCrop) {
      ctx.beginPath();
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        Math.min(canvas.width, canvas.height) / 2,
        0,
        2 * Math.PI
      );
      ctx.clip();
    }

    // Draw rotated image on canvas
    const TO_RADIANS = Math.PI / 180;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotate * TO_RADIANS);
    ctx.scale(scale, scale);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Calculate source and destination dimensions
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const sourceX = completedCrop.x * scaleX;
    const sourceY = completedCrop.y * scaleY;
    const sourceWidth = completedCrop.width * scaleX;
    const sourceHeight = completedCrop.height * scaleY;

    // Draw on canvas
    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.restore();
  }, [completedCrop, circularCrop, scale, rotate]);

  const handleCropChange = (newCrop) => {
    setCrop(newCrop);
  };

  const handleCropComplete = (c) => {
    setCompletedCrop(c);
  };

  const resetChanges = () => {
    setCrop({
      unit: '%',
      width: 80,
      height: 80,
      x: 10,
      y: 10,
      aspect: aspectRatio
    });
    setScale(1);
    setRotate(0);
  };

  const submitCroppedImage = () => {
    if (!completedCrop || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          return;
        }
        // Create file from blob
        const croppedImage = new File([blob], 'cropped-image.png', { type: 'image/png' });
        onCropComplete(croppedImage, {
          crop: completedCrop,
          scale,
          rotate,
          aspect: aspectRatio
        });
      },
      'image/png',
      1
    );
  };

  return (
    <div className={styles.imageCropper}>
      <div className={styles.cropperHeader}>
        <h3>Chỉnh sửa ảnh</h3>
        <button className={styles.closeButton} onClick={onCancel}>
          <FaTimes />
        </button>
      </div>
      
      <div className={styles.cropContainer}>
        <ReactCrop
          crop={crop}
          onChange={handleCropChange}
          onComplete={handleCropComplete}
          aspect={aspectRatio}
          circularCrop={circularCrop}
        >
          <img
            ref={imgRef}
            src={image}
            alt="Ảnh cắt"
            style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
          />
        </ReactCrop>
      </div>
      
      <div className={styles.controlsContainer}>
        <div className={styles.controlGroup}>
          <label>
            <FaArrowsAlt /> Thu phóng:
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.01"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
            />
          </label>
        </div>
        
        <div className={styles.controlGroup}>
          <label>
            <FaUndo /> Xoay:
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={rotate}
              onChange={(e) => setRotate(parseInt(e.target.value, 10))}
            />
          </label>
        </div>
      </div>
      
      <div className={styles.previewContainer}>
        <h4>Xem trước</h4>
        <div className={styles.canvasWrapper}>
          <canvas
            ref={previewCanvasRef}
            className={circularCrop ? styles.circularCanvas : ''}
          />
        </div>
      </div>
      
      <div className={styles.buttonContainer}>
        <button className={styles.resetButton} onClick={resetChanges}>
          <FaUndo /> Đặt lại
        </button>
        <button className={styles.cancelButton} onClick={onCancel}>
          <FaTimes /> Hủy
        </button>
        <button className={styles.applyButton} onClick={submitCroppedImage}>
          <FaCheck /> Áp dụng
        </button>
      </div>
    </div>
  );
};

ImageCropper.propTypes = {
  image: PropTypes.string.isRequired,
  onCropComplete: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  aspectRatio: PropTypes.number,
  circularCrop: PropTypes.bool
};

export default ImageCropper;
