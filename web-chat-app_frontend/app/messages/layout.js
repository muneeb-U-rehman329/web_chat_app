'use client';

import { Grid, GridItem } from '@chakra-ui/react';
import ChatList from '@/modules/SideBar/msgsSideBar/msgsSideBar';
import ProtectedRoute from '@/utills/protectedRoute';
import ProfileDrawer from '@/modules/AboutSlider/myProfile';
import { useSearchParams, useRouter } from 'next/navigation';

export default function MessagesLayout({ children  }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const isDrawerOpen = searchParams.get('drawer') === 'profile';

  const handleCloseDrawer = () => {
    router.push('/messages', { scroll: false });
  };

  return (
    <ProtectedRoute>
      <Grid
        templateColumns={{
          base: '1fr',
          sm: '1fr',
          md: '380px 1fr',
          lg: '450px 1fr',
          xl: '480px 1fr',
          '2xl': '485px 1fr',
        }}
        overflow="hidden"
        gap={0}
      >
        {/* Sidebar */}
        <GridItem
          display={{ base: 'flex', md: 'flex' }}
          flexDirection="column"
          overflowY="auto"
          minWidth={0}
          position="relative"
        >
          <ChatList />
        </GridItem>

        {/* Chat Window */}
        <GridItem
          overflowY="auto"
          minWidth={0}
          position="relative"
          ml="-5px"
        >
          {children}
        </GridItem>
      </Grid>

      {/* Profile Drawer */}
      <ProfileDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        finalFocusRef={null}
      />
    </ProtectedRoute>
  );
}