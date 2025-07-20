'use client';

import { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import SideBar from '@/modules/SideBar/SideBar';
import { usePathname } from 'next/navigation';
import { Provider, useDispatch } from 'react-redux';
import { store } from '@/Redux/store';
import { setToken, clearToken } from '@/Redux/feature/authToken';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();


function TokenHandler() {
  const dispatch = useDispatch();
  const path = usePathname();
  const [tokenAvailable, setTokenAvailable] = useState(false);

  useEffect(() => {
    const tokenMatch = document.cookie.match(/(^| )token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[2] : null;

    if (token) {
      dispatch(setToken(token));
      setTokenAvailable(true);
    } else {
      dispatch(clearToken());
      setTokenAvailable(false);
    }
  }, [path]);

  if (!tokenAvailable) return null;

  const isPath = path === '/messages' || path.startsWith('/messages');

  return (
    <>
      {isPath && (
        <Box
          display={{ base: 'flex', md: 'flex' }}
          width="5rem"
          flexShrink={0}
          bg="transparent"
        >
          <SideBar />
        </Box>
      )}
    </>
  );
}

export default function ClientWrapper({ children }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>

      <TokenHandler />
      {children}
      </QueryClientProvider>
    </Provider>
  );
}
