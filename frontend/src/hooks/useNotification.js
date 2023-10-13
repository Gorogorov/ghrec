import { useDispatch } from 'react-redux'

import { addNotification, removeNotification } from 'redux/notificationsSlice'

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
