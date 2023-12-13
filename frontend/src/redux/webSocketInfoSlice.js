import { createSlice, createEntityAdapter } from '@reduxjs/toolkit'


const groupsProgressAdapter = createEntityAdapter({
  selectId: (group) => group.name,
});

export const wsInfoSlice = createSlice({
  name: 'wsInfo',
  initialState: groupsProgressAdapter.getInitialState(),
  reducers: {
    addOrUpdateGroupProgress(state, action) {
      if (state.ids.includes(action.payload.name)) {
        groupsProgressAdapter.updateOne(state, {
              id: action.payload.name,
              changes: {taskComplete: action.payload.taskComplete,
                        taskSuccess: action.payload.taskSuccess,
                        taskTotal: action.payload.taskTotal,
                        taskCurrent: action.payload.taskCurrent,
                        taskPercent: action.payload.taskPercent,
        }});
      }
      else {
        groupsProgressAdapter.addOne(state, {
              name: action.payload.name,
              taskComplete: action.payload.taskComplete,
              taskSuccess: action.payload.taskSuccess,
              taskTotal: action.payload.taskTotal,
              taskCurrent: action.payload.taskCurrent,
              taskPercent: action.payload.taskPercent,
        });
      }
      return state;
    },
    removeGroupProgress: groupsProgressAdapter.removeOne,
  },
});

export const { addOrUpdateGroupProgress,
               removeGroupState,
  } = wsInfoSlice.actions;
export const wsGroupsSelectors = groupsProgressAdapter.getSelectors(state => state.wsInfo);
export default wsInfoSlice.reducer;