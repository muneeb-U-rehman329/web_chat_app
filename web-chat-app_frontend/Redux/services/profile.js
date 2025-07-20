import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const profileApi = createApi({
  reducerPath: 'profileApi',
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
    getProfile: builder.query({
      query: () => ({
        url: '/profile',
        method: 'GET',
      }),
    }),
    getRecieverProfile: builder.query({
      query: (chatId) => ({
        url: `/profile/receiver/${chatId}`,
        method: 'GET',
      }),
    }),

    putProfile: builder.mutation({
      query: (profileData) => ({
        url: '/profile',
        method: 'PUT',
        body: profileData,
        formData: true
      }),
    }),
  }),
});

export const { useGetProfileQuery, usePutProfileMutation, useGetRecieverProfileQuery} = profileApi;
