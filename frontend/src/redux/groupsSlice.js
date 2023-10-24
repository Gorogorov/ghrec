import { createSlice, createEntityAdapter, createSelector } from '@reduxjs/toolkit'

const groupsAdapter = createEntityAdapter({
    selectId: (group) => group.name,
    sortComparer: (a, b) => b.created_at.localeCompare(a.created_at),
});

export const groupsSlice = createSlice({
  name: 'groups',
  initialState: groupsAdapter.getInitialState(),
  reducers: {
    addGroup: groupsAdapter.addOne,
    addGroups: groupsAdapter.addMany,
    removeGroup: groupsAdapter.removeOne,
    updateGroup: groupsAdapter.updateOne,
  },
});

const objectFilter = (obj, predicate) => 
  Object.keys(obj)
        .filter( key => predicate(obj[key]) )
        .reduce( (res, key) => (res[key] = obj[key], res), {} );

const selectorNotStarted = createSelector(
  state => state.groups,
  (groups) => objectFilter(groups.entities, group => group.recommendations_status === "N")
);
const selectorNotStartedIds = createSelector(
  state => state.groups,
  (groups) => Object.keys(objectFilter(groups.entities, group => group.recommendations_status === "N"))
);


export const { addGroup, addGroups, removeGroup, updateGroup } = groupsSlice.actions;
export const groupsSelectors = groupsAdapter.getSelectors(state => state.groups);
export const selectNotStarted = selectorNotStarted,
             selectNotStartedIds = selectorNotStartedIds;
export default groupsSlice.reducer;