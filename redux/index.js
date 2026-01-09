import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './themeSlice';
import moodReducer from './moodSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    mood: moodReducer,
  },
});
