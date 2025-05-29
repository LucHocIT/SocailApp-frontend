import React from 'react';
import { Badge } from 'react-bootstrap';
import { FaWifi, FaExclamationTriangle } from 'react-icons/fa';
import { useSignalR } from '../../context/SignalRContext';
import styles from './styles/ConnectionStatus.module.scss';

const ConnectionStatus = () => {
  const { connectionState } = useSignalR();

  if (!connectionState || connectionState === 'Connected') {
    return null; // Don't show when connected
  }
  const getStatusIcon = () => {
    switch (connectionState) {
      case 'Connecting':
      case 'Reconnecting':
        return <FaWifi className={styles.pulse} />;
      case 'Disconnected':
        return <FaExclamationTriangle />;
      default:
        return <FaWifi />;
    }
  };

  const getStatusText = () => {
    switch (connectionState) {
      case 'Connecting':
        return 'Đang kết nối...';
      case 'Reconnecting':
        return 'Đang kết nối lại...';
      case 'Disconnected':
        return 'Mất kết nối';
      default:
        return connectionState;
    }
  };

  const getVariant = () => {
    switch (connectionState) {
      case 'Connected':
        return 'success';
      case 'Connecting':
      case 'Reconnecting':
        return 'warning';
      case 'Disconnected':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <div className={styles.connectionStatus}>
      <Badge bg={getVariant()} className={styles.statusBadge}>
        {getStatusIcon()}
        <span className="ms-1">{getStatusText()}</span>
      </Badge>
    </div>
  );
};

export default ConnectionStatus;
