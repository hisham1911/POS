import { configureStore, combineReducers } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist"
import storage from "redux-persist/lib/storage"

import { baseApi } from "../api/baseApi"
import authReducer from "./slices/authSlice"
import cartReducer from "./slices/cartSlice"
import uiReducer from "./slices/uiSlice"

const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["token", "user", "isAuthenticated"],
}

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: persistReducer(authPersistConfig, authReducer),
  cart: cartReducer,
  ui: uiReducer,
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),
  devTools: import.meta.env.DEV,
})

export const persistor = persistStore(store)

// Setup listeners for refetchOnFocus/refetchOnReconnect
setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
