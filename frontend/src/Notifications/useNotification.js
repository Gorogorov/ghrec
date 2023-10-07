import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux'
import { notificationsSelectors, addNotification, removeNotification } from './notificationsSlice'

const uid = function(){
    return Date.now().toString(36) + Math.random().toString(16);
}

export const useNotification = () => {
    const dispatch = useDispatch();

    const createNotification = (content, type) => {
        dispatch(addNotification({id: uid(), content: content, type: type}));
    };

    const clearNotification = (id) => {
        dispatch(removeNotification(id));
    };

    return {createNotification, clearNotification};
};
