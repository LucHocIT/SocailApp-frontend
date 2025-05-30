import React from 'react';
import { Badge } from 'react-bootstrap';
import { FaWifi, FaTimes, FaSpinner } from 'react-icons/fa';
import { useSignalR } from '../../hooks/useSignalR';
import styles from './ConnectionStatus.module.scss';

const ConnectionStatus = () => {
  const { isConnected, connectionStatus } = useSignalR();

  const getStatusInfo = () => {
    switch (connectionStatus) {
      case 'Connected':
        return {
          variant: 'success',
          icon: <FaWifi />,
          text: 'Online',
          className: ''
        };
      case 'Reconnecting':
        return {
          variant: 'warning',
          icon: <FaSpinner className={styles.pulse} />,
          text: 'Reconnecting...',
          className: styles.pulse
        };      case 'Disconnected':
        return {
          variant: 'secondary',
          icon: <FaTimes />,
          text: 'Offline',
          className: ''
        };
      case 'Failed':
        return {
          variant: 'danger',
          icon: <FaTimes />,
          text: 'Connection Failed',
          className: ''
        };      default:
        return {
          variant: 'secondary',
          icon: <FaTimes />,
          text: 'Disconnected',
          className: ''
        };
    }
  };

  const statusInfo = getStatusInfo();

  // Only show status when not connected or reconnecting
  if (isConnected && connectionStatus === 'Connected') {
    return null;
  }

  return (
    <div className={styles.connectionStatus}>
      <Badge 
        bg={statusInfo.variant} 
        className={`${styles.statusBadge} ${statusInfo.className}`}
      >
        {statusInfo.icon}
        <span className="ms-1">{statusInfo.text}</span>
      </Badge>
    </div>
  );
};

export default ConnectionStatus;
