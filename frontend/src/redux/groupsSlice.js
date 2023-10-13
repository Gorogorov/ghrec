import { createSlice, createEntityAdapter } from '@reduxjs/toolkit'

const groupsAdapter = createEntityAdapter({
    selectId: (group) => group.name,
    sortComparer: (a, b) => b.created_at.localeCompare(a.created_at),
})

export const groupsSlice = createSlice({
  name: 'groups',
  initialState: groupsAdapter.getInitialState(),
  reducers: {
    addGroup: groupsAdapter.addOne,
    addGroups: groupsAdapter.addMany,
    removeGroup: groupsAdapter.removeOne,
    updateGroup: groupsAdapter.updateOne,
  },
})

export const { addGroup, addGroups, removeGroup, updateGroup } = groupsSlice.actions;
export const groupsSelectors = groupsAdapter.getSelectors((state) => state.groups);
export default groupsSlice.reducer;