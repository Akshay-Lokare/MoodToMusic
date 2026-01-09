import { createSlice } from '@reduxjs/toolkit';

const moodSlice = createSlice({
    name: 'mood',
    initialState: {
        currentMood: null, // Current selected mood
        savedMood: null,   // Last saved mood from Settings
        notes: '',         // Notes about the mood
    },
    reducers: {
        setCurrentMood(state, action) {
            state.currentMood = action.payload;
        },

        saveMood(state, action) {
            state.savedMood = action.payload.mood;
            state.currentMood = action.payload.mood;
            if (action.payload.notes !== undefined) {
                state.notes = action.payload.notes;
            }
        },

        clearMood(state) {
            state.currentMood = null;
            state.savedMood = null;
            state.notes = '';
        },
        
    },
});

export const { setCurrentMood, saveMood, clearMood } = moodSlice.actions;
export default moodSlice.reducer;
