import { createSlice, createEntityAdapter } from '@reduxjs/toolkit'

const groupProgressAdapter = createEntityAdapter({
    selectId: (groupItem) => groupItem.groupName
});

export const groupProgressSlice = createSlice({
  name: 'groupProgress',
  initialState: groupProgressAdapter.getInitialState(),
  reducers: {
    addGroupItem: groupProgressAdapter.addOne,
    removeGroupItem: groupProgressAdapter.removeOne,
    updateGroupItem: groupProgressAdapter.updateOne,
  },
});

export const { addGroupItem, removeGroupItem, updateGroupItem } = groupProgressSlice.actions;
export const groupsSelectors = groupProgressAdapter.getSelectors(state => state.groupsProgress);
export default groupProgressSlice.reducer;