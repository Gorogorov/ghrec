import { configureStore } from '@reduxjs/toolkit'
import groupsReducer from './groupsSlice'
import notificationsReducer from './notificationsSlice'
import createGroupReducer from './createGroupSlice'

export default configureStore({
  reducer: {
    groups: groupsReducer,
    notifications: notificationsReducer,
    createGroup: createGroupReducer,
  },
})