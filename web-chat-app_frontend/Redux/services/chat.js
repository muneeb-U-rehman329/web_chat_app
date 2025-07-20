import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const chatAPi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api/v1',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getMessagesWithUser: builder.query({
      query: (userId) => ({
        url: `/messages/${userId}`,
        method: 'GET',
      }),
    }),
    sendMessage: builder.mutation({
      query: (messageData) => {
        // Check if messageData contains an image (FormData)
        if (messageData.image && messageData.image instanceof FormData) {
          // For image uploads, use FormData
          const formData = messageData.image;
          return {
            url: '/send-message',
            method: 'POST',
            body: formData,
            // Don't set Content-Type header for FormData, let browser set it
          };
        } else {
          // For regular text messages, use JSON
          return {
            url: '/send-message',
            method: 'POST',
            body: {
              chatId: messageData.chatId,
              text: messageData.text,
            },
            headers: {
              'Content-Type': 'application/json',
            },
          };
        }
      },
    }),
  }),
});

export const { useGetMessagesWithUserQuery, useSendMessageMutation } = chatAPi;