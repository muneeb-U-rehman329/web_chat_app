import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './services/auth';
import authToken from './feature/authToken';
import { chatListApi } from './services/chatList';
import { profileApi } from './services/profile';
import { chatAPi } from './services/chat';
export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    auth: authToken,
    [chatListApi.reducerPath]: chatListApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [chatAPi.reducerPath]: chatAPi.reducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(chatListApi.middleware)
      .concat(profileApi.middleware)
      .concat(chatAPi.middleware),
});