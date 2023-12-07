import { createSlice, createEntityAdapter } from '@reduxjs/toolkit'


const groupsProgressAdapter = createEntityAdapter({
  selectId: (group) => group.name,
});

export const wsInfoSlice = createSlice({
  name: 'wsInfo',
  initialState: groupsProgressAdapter.getInitialState(),
  reducers: {
    addOrUpdateGroupProgress(state, action) {
      console.log("reducer");
      console.log(state.entities);
      console.log(action.payload); 
      console.log(groupsProgressAdapter);
      console.log(state.entities["testststststsssssss"]);

      if (state.ids.includes(action.payload.name)) {
        console.log("reducer includes");
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
        console.log("reducer not includes");
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
      // console.log(group);
      // let groupInd = state.filter((group) => group.name === action.payload.name);
      // if (groupInd === undefined) {
      //   state.push({name: action.payload.name});
      //   groupInd = state.wsInfo.length;
      // }
      // state[groupInd].taskComplete = action.payload.complete;
      // state[groupInd].taskSuccess = action.payload.success;
      // state[groupInd].taskTotal = action.payload.total;
      // state[groupInd].taskCurrent = action.payload.current;
      // state[groupInd].taskPercent = action.payload.percent;
    },
    removeGroupProgress: groupsProgressAdapter.removeOne,
  },
});

export const { addOrUpdateGroupProgress,
               removeGroupState,
  } = wsInfoSlice.actions;
export const wsGroupsSelectors = groupsProgressAdapter.getSelectors(state => state.wsInfo);
export default wsInfoSlice.reducer;