import { createSlice } from '@reduxjs/toolkit';

const moodSlice = createSlice({
    name: 'mood',
    initialState: {
        currentMood: null, // Current selected mood
        savedMood: null,   // Last saved mood from Settings
    },
    reducers: {
        setCurrentMood(state, action) {
            state.currentMood = action.payload;
        },

        saveMood(state, action) {
            state.savedMood = action.payload.mood;
            state.currentMood = action.payload.mood;
        },

        clearMood(state) {
            state.currentMood = null;
            state.savedMood = null;
        },

    },
});

export const { setCurrentMood, saveMood, clearMood } = moodSlice.actions;
export default moodSlice.reducer;
