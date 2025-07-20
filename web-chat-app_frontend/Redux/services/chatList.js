import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const chatListApi = createApi({
  reducerPath: 'chatListApi',
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
    chatList: builder.query({
      query: () => ({
        url: '/get-chats',
        method: 'GET',
      }),
    }),
    addChart: builder.mutation({
      query: (body) => ({
        url: '/add-chat',
        method: 'POST',
        body: {
          toEmail: body,
        }
      }),
    }),
  }),
});


export const { useChatListQuery, useAddChartMutation } = chatListApi;