import { useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import ImageCropper from './ImageCropper';

const ImageCropperModal = ({ 
  image, 
  onCropComplete, 
  onCancel, 
  aspectRatio = 1, 
  circularCrop = true 
}) => {
  useEffect(() => {
    // Disable body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
  
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onCancel]);
  
  // Use Portal to render modal on top level of DOM
  return ReactDOM.createPortal(
    <div className="cropperOverlay" onClick={(e) => {
      // Close if clicking outside of cropper
      if (e.target === e.currentTarget) onCancel();
    }}>
      <ImageCropper
        image={image}
        onCropComplete={onCropComplete}
        onCancel={onCancel}
        aspectRatio={aspectRatio}
        circularCrop={circularCrop}
      />
    </div>,
    document.body
  );
};

ImageCropperModal.propTypes = {
  image: PropTypes.string.isRequired,
  onCropComplete: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  aspectRatio: PropTypes.number,
  circularCrop: PropTypes.bool
};

export default ImageCropperModal;
