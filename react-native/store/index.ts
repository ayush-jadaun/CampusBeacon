import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import slices
import authReducer from './slices/authSlice';
import lostFoundReducer from './slices/lostFoundSlice';
import marketplaceReducer from './slices/marketplaceSlice';
import attendanceReducer from './slices/attendanceSlice';
import hostelReducer from './slices/hostelSlice';
import ridesReducer from './slices/ridesSlice';
import eventsReducer from './slices/eventsSlice';
import eateriesReducer from './slices/eateriesSlice';
import resourcesReducer from './slices/resourcesSlice';

// Persist config
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // Only persist auth state
};

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  lostFound: lostFoundReducer,
  marketplace: marketplaceReducer,
  attendance: attendanceReducer,
  hostel: hostelReducer,
  rides: ridesReducer,
  events: eventsReducer,
  eateries: eateriesReducer,
  resources: resourcesReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
