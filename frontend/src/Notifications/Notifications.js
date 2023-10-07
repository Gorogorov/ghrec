import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux'
import { notificationsSelectors, addNotification, removeNotification } from './notificationsSlice'

import Notification from './Notification';
import {useNotification} from './useNotification'
import './Notifications.css'

function Notifications(props) {
    const notifications = useSelector(notificationsSelectors.selectAll);
    const {clearNotification} = useNotification();

    return (
        <>
        <div className="notifications-wrapper">
            {notifications.map((notification) => (
                <Notification key={notification.id} 
                              clearNotification={() => clearNotification(notification.id)}
                              type={notification.type}>
                    {notification.content}
                </Notification>
            ))}
        </div>
        </>
    );
};

export default Notifications;
