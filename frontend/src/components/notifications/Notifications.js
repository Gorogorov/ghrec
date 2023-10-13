import './Notifications.css'

import React from 'react';
import { useSelector } from 'react-redux'

import { notificationsSelectors } from 'redux/notificationsSlice'
import Notification from './Notification';
import {useNotification} from 'hooks/useNotification'


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
