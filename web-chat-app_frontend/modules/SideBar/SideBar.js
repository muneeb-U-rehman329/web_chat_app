'use client';

import React, { useState, useEffect } from 'react';
import { Box, Flex, Text, VStack } from '@chakra-ui/react';
import { TbMessage, TbLogout, TbUser, TbSettings } from 'react-icons/tb';
import { RiHome5Line } from 'react-icons/ri';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TbSettings2 } from 'react-icons/tb';
import { useGetProfileQuery } from '@/Redux/services/profile';
import Cookies from 'js-cookie';
// import { BsWindowSidebar } from 'react-icons/bs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const sideBarIcons = [
  {
    title: 'home',
    icon: RiHome5Line,
    statusLink: '/',
  },
  {
    title: 'messages',
    icon: TbMessage,
    statusLink: '/messages',
  },
];

function SideBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const { data, isLoading, isError } = useGetProfileQuery();
  const profile = data?.profile;
  // console.log(data);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isClicked && !event.target.closest('.profile-popup-container')) {
        setIsClicked(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isClicked]);

  const isPopupVisible = isHovered || isClicked;

  const handleLogout = () => {
    Cookies.remove('token');
    window.location.href = '/auth?mode=login';
  };

  return (
    <Flex
      flexDir="column"
      alignItems="center"
      justifyContent={'space-between'}
      height="100svh"
      boxShadow="0 0 30px rgba(0, 0, 0, 0.1)"
      width="5rem"
      pb={2}
      position="relative"
    >
      <Flex alignItems={'center'} flexDir={'column'}>
        <Box my={4}>
          <Image
            src="/Images/logo.png"
            alt="logo"
            width={96} // 24px * 4 (assuming w-24 is 96px in tailwind)
            height={96}
            className="w-24"
          />
        </Box>

        <Flex flexDir="column" gap="1rem" mt="1rem">
          {sideBarIcons.map(({ icon: Icon, statusLink, title }, index) => {
            const isActive =
              pathname === statusLink || pathname.startsWith(`${statusLink}/`);

            return (
              <Link key={index} href={statusLink}>
                <Box
                  color={isActive ? 'white' : 'black'}
                  bg={isActive ? 'rgba(124, 57, 230, 0.5)' : 'transparent'}
                  rounded="1rem"
                  p="8px"
                  fontSize="30px"
                  transition="all 0.2s ease"
                  w={'fit-content'}
                  _active={{
                    transform: 'scale(0.9)',
                  }}
                >
                  <Icon />
                </Box>
              </Link>
            );
          })}
        </Flex>
      </Flex>

      <Box position="relative">
        <Link href="/settings">
          <Box
            _hover={{
              transition: 'all 1s ease-in-out',
              transform: 'rotate(360deg)',
            }}
            color={pathname === '/settings' ? '#545454' : 'black'}
            bg={
              pathname === '/settings'
                ? 'rgba(124, 57, 230, 0.5)'
                : 'transparent'
            }
            rounded="1rem"
            p="8px"
            fontSize="30px"
            transition="all 0.2s ease"
            w={'fit-content'}
          >
            <TbSettings2 />
          </Box>
        </Link>

        <Box
          mt={4}
          rounded={'10rem'}
          overflow={'visible'}
          w={'3rem'}
          h={'3rem'}
          mb={4}
          position="relative"
          className="profile-popup-container rounded-xl"
        >
          <Image
            src={profile?.avatar || '/default-avatar.png'}
            alt="profile"
            width={48} // 3rem = 48px
            height={48}

            style={{
              borderRadius: '20rem',
              cursor: 'pointer',
              width:"4rem",
              height:"3rem",
              objectFit: 'cover',
            }}
            objectFit="cover"
            className="rounded-2xl"
            cursor={'pointer'}
            rounded={'10rem'}
            transition="all 0.3s ease"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => setIsClicked(!isClicked)}
            _hover={{
              transform: 'scale(1.05)',
              boxShadow: '0 0 20px rgba(124, 57, 230, 0.3)',
            }}
          />

          {/* Popup */}
          <Box
            position="absolute"
            left="calc(100% + 12px)"
            bottom="0"
            bg="white"
            boxShadow="0 8px 32px rgba(0, 0, 0, 0.12)"
            borderRadius="12px"
            p={5}
            minW="250px"
            w="280px"
            opacity={isPopupVisible ? 1 : 0}
            transform={
              isPopupVisible
                ? 'translateX(0) scale(1)'
                : 'translateX(-10px) scale(0.95)'
            }
            transformOrigin="left bottom"
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            pointerEvents={isPopupVisible ? 'auto' : 'none'}
            zIndex={1000}
            border="1px solid"
            borderColor="gray.100"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            _before={{
              content: '""',
              position: 'absolute',
              left: '-6px',
              bottom: '12px',
              width: 0,
              height: 0,
              borderTop: '6px solid transparent',
              borderBottom: '6px solid transparent',
              borderRight: '6px solid white',
            }}
          >
            <VStack spacing={4} align="stretch">
              {/* User Info */}
              <Flex align="center" gap={3}>
                <Box
                  w="45px"
                  h="45px"
                  rounded="full"
                  overflow="hidden"
                  border="2px solid"
                  borderColor="purple.100"
                >
                  <Image
                    src={profile?.avatar || '/default-avatar.png'}
                    alt={profile?.name || 'Profile'}
                    width={45}
                    height={45}
                    objectFit="cover"
                    className="rounded-2xl w-24 h-24"
                  />
                </Box>
                <Box>
                  <Text fontSize="md" fontWeight="600" color="gray.800">
                    {profile?.name || 'Loading...'}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {profile?.email || 'no-email@example.com'}
                  </Text>
                </Box>
              </Flex>

              {/* Divider */}
              <Box h="1px" bg="gray.100" />

              {/* Menu Items */}
              <VStack spacing={2} align="stretch">
                <Flex
                  onClick={() =>
                    router.push('/messages?drawer=profile', { scroll: false })
                  }
                  align="center"
                  gap={3}
                  p={3}
                  rounded="md"
                  cursor="pointer"
                  _hover={{ bg: 'gray.50' }}
                  transition="all 0.2s"
                >
                  <TbUser size={18} color="#6B7280" />
                  <Text fontSize="md" color="gray.700">
                    Profile
                  </Text>
                </Flex>

                <Flex
                  align="center"
                  gap={3}
                  p={3}
                  rounded="md"
                  cursor="pointer"
                  _hover={{ bg: 'gray.50' }}
                  transition="all 0.2s"
                >
                  <TbSettings size={18} color="#6B7280" />
                  <Text fontSize="md" color="gray.700">
                    Settings
                  </Text>
                </Flex>

                <Flex
                  align="center"
                  gap={3}
                  p={3}
                  rounded="md"
                  cursor="pointer"
                  onClick={handleLogout}
                  _hover={{ bg: 'red.50' }}
                  transition="all 0.2s"
                >
                  <TbLogout size={18} color="#EF4444" />
                  <Text fontSize="md" color="red.500">
                    Logout
                  </Text>
                </Flex>
              </VStack>
            </VStack>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}

export default SideBar;
