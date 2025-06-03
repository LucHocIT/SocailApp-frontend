import React from 'react';
import './LocationMessage.scss';

const LocationMessage = ({ location, onClick }) => {
  if (!location) {
    return (
      <div className="location-message">
        <div className="location-info">
          <div className="location-address">
            <i className="bi bi-geo-alt me-2"></i>
            <span className="address-text text-muted">Dữ liệu vị trí không hợp lệ</span>
          </div>
        </div>
      </div>
    );
  }

  const { latitude, longitude, address, mapUrl } = location;
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Mở Google Maps trong tab mới
      window.open(mapUrl, '_blank', 'noopener,noreferrer');
    }
  };
    // Tạo URL cho static map image (Google Static Maps API)
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const staticMapUrl = googleMapsApiKey 
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=300x200&markers=color:red%7C${latitude},${longitude}&key=${googleMapsApiKey}`
    : `https://via.placeholder.com/300x200/f0f2f5/65676b?text=📍+Vị+trí`;
  
  // Fallback image nếu không có API key hoặc lỗi
  const fallbackMapUrl = `https://via.placeholder.com/300x200/f0f2f5/65676b?text=📍+Vị+trí`;
  
  return (
    <div className="location-message" onClick={handleClick}>
      <div className="location-map">
        <img 
          src={staticMapUrl}
          alt="Bản đồ vị trí"
          onError={(e) => {
            e.target.src = fallbackMapUrl;
          }}
          className="map-image"
        />
        <div className="map-overlay">
          <i className="bi bi-geo-alt-fill location-pin"></i>
        </div>
      </div>
      
      <div className="location-info">
        <div className="location-address">
          <i className="bi bi-geo-alt me-2"></i>
          <span className="address-text">{address}</span>
        </div>
          <div className="location-coords">
          <small className="text-muted">
            {latitude?.toFixed(6) || 'N/A'}, {longitude?.toFixed(6) || 'N/A'}
          </small>
        </div>
        
        <div className="location-action">
          <small className="text-primary">
            <i className="bi bi-box-arrow-up-right me-1"></i>
            Nhấn để mở trong Google Maps
          </small>
        </div>
      </div>
    </div>
  );
};

export default LocationMessage;
