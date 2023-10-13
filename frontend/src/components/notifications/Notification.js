import './Notification.css'

import React from 'react';

import { useTimeout } from 'hooks/useTimeout';

function Notification(props) {
  useTimeout(props.clearNotification, 5000);
  const notificationTypeClass = (props.type === "success" ? "notification-success" : "notification-error");

  return (
    <div className={`notification ${notificationTypeClass}`}>
      <div className="notification-text">
        {props.children}
      </div>
      <div>
        <button type="button"
                className="notification-close-btn btn btn-close shadow-none"
                aria-label="Close"
                onClick={props.clearNotification}>        
        </button>
      </div>
    </div>
  );
};

export default Notification;
