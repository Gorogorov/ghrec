import { createSlice, createEntityAdapter } from '@reduxjs/toolkit'

const notificationsAdapter = createEntityAdapter({
    selectId: (notification) => notification.id,
})

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: notificationsAdapter.getInitialState(),
  reducers: {
    addNotification: notificationsAdapter.addOne,
    removeNotification: notificationsAdapter.removeOne,
  },
})

export const { addNotification, removeNotification } = notificationsSlice.actions;
export const notificationsSelectors = notificationsAdapter.getSelectors((state) => state.notifications);
export default notificationsSlice.reducer;