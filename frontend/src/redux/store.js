import { configureStore } from '@reduxjs/toolkit'
import groupsReducer from './groupsSlice'
import notificationsReducer from './notificationsSlice'
import createGroupSlice from './createGroupSlice'

export default configureStore({
  reducer: {
    groups: groupsReducer,
    notifications: notificationsReducer,
    createGroup: createGroupSlice,
  },
})