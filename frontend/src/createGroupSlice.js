import { createSlice, createEntityAdapter } from '@reduxjs/toolkit'

export const createGroupSlice = createSlice({
  name: 'createGroup',
  initialState: {showCreateGroupForm: false},
  reducers: {
    showCreateGroupForm: state => {
      state.showCreateGroupForm = true;
    },
    hideCreateGroupForm: state => {
      state.showCreateGroupForm = false;
    },
    reverseCreateGroupForm: state => {
      state.showCreateGroupForm = !state.showCreateGroupForm;
    }
  },
})

export const {showCreateGroupForm, hideCreateGroupForm, reverseCreateGroupForm} = createGroupSlice.actions;
export default createGroupSlice.reducer;