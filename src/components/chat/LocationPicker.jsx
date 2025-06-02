import React, { useState } from 'react';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';
import './LocationPicker.scss';

const LocationPicker = ({ show, onHide, onLocationSelect, disabled }) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState('');

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Trình duyệt của bạn không hỗ trợ định vị.');
      return;
    }

    setIsGettingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Get address from coordinates using reverse geocoding
        getAddressFromCoords(latitude, longitude);
      },
      (error) => {
        setIsGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Bạn đã từ chối chia sẻ vị trí. Vui lòng cho phép truy cập vị trí trong cài đặt trình duyệt.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Không thể xác định vị trí của bạn.');
            break;
          case error.TIMEOUT:
            setError('Quá thời gian chờ để xác định vị trí.');
            break;
          default:
            setError('Đã xảy ra lỗi khi xác định vị trí.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const getAddressFromCoords = async (lat, lng) => {
    try {
      // Using Google Geocoding API (you might want to use your own API key)
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=YOUR_GOOGLE_MAPS_API_KEY`
      );
      
      if (response.ok) {
        const data = await response.json();
        const address = data.results[0]?.formatted_address || 'Vị trí không xác định';
        
        const locationData = {
          latitude: lat,
          longitude: lng,
          address: address,
          mapUrl: `https://www.google.com/maps?q=${lat},${lng}`
        };
        
        onLocationSelect(locationData);
        onHide();
      } else {
        // Fallback without detailed address
        const locationData = {
          latitude: lat,
          longitude: lng,
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          mapUrl: `https://www.google.com/maps?q=${lat},${lng}`
        };
        
        onLocationSelect(locationData);
        onHide();
      }
    } catch (error) {
      console.error('Error getting address:', error);
      // Fallback without detailed address
      const locationData = {
        latitude: lat,
        longitude: lng,
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        mapUrl: `https://www.google.com/maps?q=${lat},${lng}`
      };
      
      onLocationSelect(locationData);
      onHide();
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleClose = () => {
    if (!isGettingLocation) {
      setError('');
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-geo-alt me-2"></i>
          Chia sẻ vị trí
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}
        
        <div className="location-options">
          <div className="text-center mb-4">
            <i className="bi bi-geo-alt location-icon"></i>
            <h6 className="mt-2">Chia sẻ vị trí hiện tại</h6>
            <p className="text-muted small">
              Vị trí của bạn sẽ được chia sẻ dưới dạng liên kết Google Maps
            </p>
          </div>
          
          <div className="d-grid">
            <Button
              variant="primary"
              size="lg"
              onClick={getCurrentLocation}
              disabled={disabled || isGettingLocation}
              className="location-btn"
            >
              {isGettingLocation ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Đang xác định vị trí...
                </>
              ) : (
                <>
                  <i className="bi bi-crosshair me-2"></i>
                  Lấy vị trí hiện tại
                </>
              )}
            </Button>
          </div>
          
          <div className="mt-3">
            <small className="text-muted">
              <i className="bi bi-info-circle me-1"></i>
              Vị trí sẽ được hiển thị dưới dạng bản đồ có thể nhấp để mở Google Maps
            </small>
          </div>
        </div>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isGettingLocation}>
          Hủy
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LocationPicker;
