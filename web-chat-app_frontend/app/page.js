'use client';
import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Container,
  HStack,
  VStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Image,
  Icon,
  useColorModeValue,
  SkeletonCircle,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';
import NextImage from 'next/image';
import Link from 'next/link';
import { useGetProfileQuery } from '@/Redux/services/profile';
import { FiLogOut, FiUser } from 'react-icons/fi';
import { LuMessageSquareMore } from 'react-icons/lu';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import throttle from 'lodash.throttle';

const MotionBox = motion(Box);

const getImageUrl = (avatar) => {
  const isFull =
    avatar?.startsWith('http://') || avatar?.startsWith('https://');
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  return isFull ? avatar : `${base}/${avatar?.replace(/^\/+/, '')}`;
};

const Header = memo(
  ({ profileData, isLoading, animations, menuBg, hoverBg, borderClr }) => (
    <Box
      bg="rgba(255, 255, 255, 0.95)"
      backdropFilter="blur(20px)"
      px={6}
      py={4}
      position="sticky"
      top={0}
      zIndex={1000}
      borderBottom="1px solid rgba(189, 156, 242, 0.1)"
    >
      <Container maxW="1200px">
        <Flex justify="space-between" align="center">
          <HStack spacing={3}>
            <MotionBox
              w={10}
              h={10}
              bg="linear-gradient(135deg, #bd9cf2 0%, #a855f7 100%)"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="0 4px 20px rgba(189, 156, 242, 0.3)"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              willChange="transform"
            >
              <Text color="white" fontWeight="bold" fontSize="lg">
                C
              </Text>
            </MotionBox>
            <Text fontWeight="bold" fontSize="xl" color="gray.800">
              Chatrix
            </Text>
          </HStack>

          <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
            {['Product', 'Partner with us', 'Contact us', 'Careers'].map(
              (item) => (
                <Text
                  key={item}
                  cursor="pointer"
                  _hover={{
                    color: '#bd9cf2',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease',
                  }}
                  transition="all 0.3s ease"
                  fontWeight="500"
                >
                  {item}
                </Text>
              )
            )}
          </HStack>

          <HStack spacing={4}>
            {isLoading ? (
              <>
                <SkeletonCircle size="10" />
                <Skeleton height="16px" width="70px" borderRadius="md" />
              </>
            ) : profileData ? (
              <Menu>
                <MenuButton
                  as={Button}
                  variant="ghost"
                  borderRadius="full"
                  px={2}
                  py={1}
                  _hover={{
                    bg: hoverBg,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease',
                  }}
                  _active={{
                    bg: hoverBg,
                    transform: 'scale(0.95)',
                  }}
                  transition="all 0.3s ease"
                >
                  <HStack spacing={2}>
                    {profileData.avatar ? (
                      <Box
                        position="relative"
                        w="40px"
                        h="40px"
                        borderRadius="full"
                        overflow="hidden"
                      >
                        <NextImage
                          src={
                            getImageUrl(profileData?.avatar) ||
                            '/default-avatar.png'
                          }
                          alt={profileData?.username}
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="40px"
                          priority={true}
                        />
                      </Box>
                    ) : (
                      <Box
                        w="40px"
                        h="40px"
                        borderRadius="full"
                        bg="gray.200"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontWeight="bold"
                      >
                        {profileData.username?.[0]?.toUpperCase()}
                      </Box>
                    )}
                    <Text
                      fontWeight="600"
                      fontSize="sm"
                      color="gray.800"
                      display={{ base: 'none', md: 'inline' }}
                    >
                      {profileData.username}
                    </Text>
                  </HStack>
                </MenuButton>

                <MenuList
                  bg={menuBg}
                  backdropFilter="blur(12px) saturate(180%)"
                  border="1px solid"
                  borderColor={borderClr}
                  borderRadius="lg"
                  boxShadow="0 10px 30px rgba(0,0,0,0.15)"
                  minW="200px"
                  p={1}
                  zIndex={1001}
                  as={motion.div}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <MenuItem
                    as={Link}
                    href="/messages?drawer=profile"
                    icon={<Icon as={FiUser} boxSize={5} />}
                    fontWeight="500"
                    _hover={{
                      bg: hoverBg,
                      color: '#7c3aed',
                      transform: 'translateX(5px)',
                    }}
                    borderRadius="md"
                  >
                    Profile
                  </MenuItem>
                  <MenuItem
                    as={Link}
                    href="/messages"
                    icon={<Icon as={LuMessageSquareMore} boxSize={5} />}
                    fontWeight="500"
                    _hover={{
                      bg: hoverBg,
                      color: '#7c3aed',
                      transform: 'translateX(5px)',
                    }}
                    borderRadius="md"
                  >
                    Messages
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      Cookies.remove('token');
                      window.location.reload();
                    }}
                    icon={<Icon as={FiLogOut} boxSize={5} />}
                    fontWeight="500"
                    _hover={{
                      bg: 'rgba(255, 0, 0, 0.05)',
                      color: 'red.500',
                      transform: 'translateX(5px)',
                    }}
                    borderRadius="md"
                  >
                    Logout
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              // Optional: Show login/signup buttons if not logged in
              <>
                <Link href="/auth?mode=login">
                  <Button variant="ghost" size="md">
                    Login
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button
                    bgGradient="linear(to-r, #7c3aed, #a78bfa)"
                    color="white"
                    _hover={{
                      bgGradient: 'linear(to-r, #a78bfa, #7c3aed)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 20px rgba(124, 57, 230, 0.2)',
                    }}
                    size="md"
                    px={6}
                    borderRadius="full"
                  >
                    SIGN UP
                  </Button>
                </Link>
              </>
            )}
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
);

// Memoized Features Section
const FeaturesSection = memo(({ animations }) => (
  <Box bg="rgba(255, 255, 255, 0.8)" py={24} backdropFilter="blur(20px)">
    <Container maxW="1200px">
      <Flex
        justify="space-between"
        align="center"
        direction={{ base: 'column', lg: 'row' }}
        gap={8}
      >
        {/* Real-Time Messaging Card */}
        <MotionBox
          bg="linear-gradient(135deg, #bd9cf2 0%, #e879f9 100%)"
          p={10}
          borderRadius="30px"
          maxW="450px"
          w="full"
          position="relative"
          overflow="hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          whileHover={{
            y: -10,
            scale: 1.02,
            boxShadow: '0 30px 60px rgba(189, 156, 242, 0.3)',
          }}
          willChange="transform, opacity"
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            background="radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            as={motion.div}
          />
          <VStack align="start" spacing={6} position="relative" zIndex={2}>
            <Heading fontSize="2xl" color="white" fontWeight="700">
              Real-Time Messaging
            </Heading>
            <Text
              color="rgba(255,255,255,0.9)"
              fontSize="md"
              lineHeight="1.7"
              fontWeight="400"
            >
              Experience instant communication with lightning-fast delivery.
              Send text messages instantly, share photos and videos, and never
              miss a moment. Stay in the loop, whether you're at home or on the
              go.
            </Text>
          </VStack>
          <Box position="absolute" right="-30px" bottom="-30px" zIndex={1}>
            <MotionBox
              w="120px"
              h="120px"
              bg="rgba(255, 255, 255, 0.2)"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              backdropFilter="blur(10px)"
              animate={{ y: [0, -20, 0], rotate: [0, 2, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              willChange="transform"
            >
              <Box
                w="70px"
                h="70px"
                bg="white"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="2xl">💬</Text>
              </Box>
            </MotionBox>
          </Box>
        </MotionBox>

        {/* Group Chats Card */}
        <MotionBox
          bg="linear-gradient(135deg, #1a202c 0%, #2d3748 100%)"
          p={10}
          borderRadius="30px"
          maxW="450px"
          w="full"
          position="relative"
          overflow="hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.7, ease: 'easeOut' }}
          whileHover={{
            y: -10,
            scale: 1.02,
            boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
          }}
          willChange="transform, opacity"
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            background="radial-gradient(circle at 80% 20%, rgba(189, 156, 242, 0.1) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(189, 156, 242, 0.1) 0%, transparent 50%)"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{
              repeat: Infinity,
              duration: 4,
              ease: 'easeInOut',
              delay: 1,
            }}
            as={motion.div}
          />
          <VStack align="start" spacing={6} position="relative" zIndex={2}>
            <Heading fontSize="2xl" color="white" fontWeight="700">
              Group Chats Made Easy
            </Heading>
            <Text
              color="gray.300"
              fontSize="md"
              lineHeight="1.7"
              fontWeight="400"
            >
              Create group chats to keep everyone in the loop. Organize
              conversations by topics or events, share updates, and make plans
              together. It's never been easier to stay connected and collaborate
              with teammates!
            </Text>
          </VStack>
          <Box position="absolute" right="-30px" bottom="-30px" zIndex={1}>
            <MotionBox
              w="120px"
              h="120px"
              bg="rgba(189, 156, 242, 0.2)"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              backdropFilter="blur(10px)"
              animate={{ y: [0, -20, 0], rotate: [0, -2, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              willChange="transform"
            >
              <Box
                w="70px"
                h="70px"
                bg="linear-gradient(135deg, #bd9cf2 0%, #e879f9 100%)"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="2xl">👥</Text>
              </Box>
            </MotionBox>
          </Box>
        </MotionBox>
      </Flex>
    </Container>
  </Box>
));

const SimplrLanding = () => {
  const hasToken = !!Cookies.get('token');
  const { data, isLoading } = useGetProfileQuery(undefined, {
    skip: !hasToken,
  });
  const profileData = data?.profile;

  const [mousePosition, setMousePosition] = useState({ x: null, y: null });

  const handleMouseMove = useCallback(
    throttle((e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    }, 16), // ~60fps
    []
  );

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  const animations = useMemo(
    () => ({
      float: {
        y: [0, -20, 0],
        rotate: [0, 2, 0],
        transition: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
      },
      pulse: {
        scale: [1, 1.05, 1],
        transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
      },
      wave: {
        rotate: [0, 5, -5, 0],
        transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
      },
      fadeInUp: {
        opacity: [0, 1],
        y: [30, 0],
        transition: { duration: 1, ease: 'easeOut' },
      },
      gradientShift: {
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
      },
      sparkle: {
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
        transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
      },
    }),
    []
  );

  const menuBg = useColorModeValue(
    'rgba(255,255,255,0.7)',
    'rgba(26,32,44,0.85)'
  );
  const hoverBg = useColorModeValue(
    'rgba(189,156,242,0.15)',
    'rgba(124,57,230,0.2)'
  );
  const borderClr = useColorModeValue(
    'rgba(189,156,242,0.25)',
    'rgba(255,255,255,0.1)'
  );

  return (
    <Box
      bg="linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
      minH="100vh"
      position="relative"
      overflow="hidden"
      sx={{
        '@media (prefers-reduced-motion: reduce)': {
          '*': {
            animation: 'none !important',
            transition: 'none !important',
          },
        },
      }}
    >
      <MotionBox
        position="absolute"
        top="10%"
        left="5%"
        w="100px"
        h="100px"
        opacity={0.1}
        animate={animations.float}
        willChange="transform"
      >
        <Box
          w="full"
          h="full"
          bg="linear-gradient(45deg, #bd9cf2, #e879f9)"
          borderRadius="full"
          filter="blur(40px)"
        />
      </MotionBox>
      <MotionBox
        position="absolute"
        top="60%"
        right="10%"
        w="80px"
        h="80px"
        opacity={0.1}
        animate={{ ...animations.float, rotate: [0, -2, 0] }}
        willChange="transform"
      >
        <Box
          w="full"
          h="full"
          bg="linear-gradient(45deg, #bd9cf2, #a855f7)"
          borderRadius="full"
          filter="blur(30px)"
        />
      </MotionBox>

      <Header
        isLoading={isLoading}
        profileData={profileData}
        animations={animations}
        menuBg={menuBg}
        hoverBg={hoverBg}
        borderClr={borderClr}
      />

      {/* Hero Section */}
      <Container maxW="1200px" py={20}>
        <Flex
          align="center"
          justify="space-between"
          direction={{ base: 'column', lg: 'row' }}
        >
          <MotionBox
            as={VStack}
            align="start"
            spacing={8}
            maxW="550px"
            initial={{ opacity: 0, y: 30 }}
            animate={animations.fadeInUp}
            willChange="opacity, transform"
          >
            <Heading
              fontSize={{ base: '3xl', md: '5xl' }}
              fontWeight="800"
              lineHeight="1.1"
              color="gray.800"
              bgGradient="linear(to-r, gray.800, #bd9cf2)"
              bgClip="text"
            >
              Stay Connected,{' '}
              <Text as="span" color="#bd9cf2">
                Anytime, Anywhere
              </Text>
            </Heading>
            <Text
              fontSize="xl"
              color="gray.600"
              lineHeight="1.8"
              fontWeight="400"
            >
              Chat effortlessly with friends and family
              <br />
              <Text as="span" fontStyle="italic">
                —no matter the distance.
              </Text>
            </Text>
            <Link href="/auth">
              <MotionBox
                as={Button}
                bg="linear-gradient(135deg, #1a202c 0%, #2d3748 100%)"
                color="white"
                size="lg"
                px={10}
                py={6}
                fontSize="md"
                fontWeight="600"
                borderRadius="full"
                whileHover={{
                  y: -3,
                  scale: 1.05,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                }}
                whileTap={{
                  y: 0,
                  scale: 1,
                  boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                boxShadow="0 10px 30px rgba(0,0,0,0.1)"
                willChange="transform, box-shadow"
              >
                Get Started
              </MotionBox>
            </Link>
          </MotionBox>

          {/* Enhanced Illustration */}
          <MotionBox
            position="relative"
            w={{ base: '350px', md: '450px' }}
            h={{ base: '300px', md: '400px' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            willChange="opacity, transform"
          >
            <MotionBox
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              w="200px"
              h="200px"
              bg="radial-gradient(circle, rgba(189, 156, 242, 0.3) 0%, rgba(189, 156, 242, 0) 70%)"
              borderRadius="full"
              animate={animations.pulse}
              willChange="transform"
            />
            <MotionBox
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              w="140px"
              h="140px"
              bg="linear-gradient(135deg, #bd9cf2 0%, #e879f9 100%)"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              zIndex={3}
              boxShadow="0 20px 60px rgba(189, 156, 242, 0.4)"
              animate={animations.float}
              willChange="transform"
              _before={{
                content: '""',
                position: 'absolute',
                top: '-5px',
                left: '-5px',
                right: '-5px',
                bottom: '-5px',
                background: 'linear-gradient(45deg, #bd9cf2, #e879f9, #bd9cf2)',
                borderRadius: 'full',
                zIndex: -1,
                animation: animations.gradientShift,
                backgroundSize: '200% 200%',
              }}
            >
              <Box
                w="70px"
                h="90px"
                bg="black"
                borderRadius="30px"
                position="relative"
              >
                <MotionBox
                  position="absolute"
                  top="25px"
                  left="18px"
                  w="8px"
                  h="8px"
                  bg="white"
                  borderRadius="full"
                  animate={animations.sparkle}
                  willChange="opacity, transform"
                />
                <MotionBox
                  position="absolute"
                  top="25px"
                  right="18px"
                  w="8px"
                  h="8px"
                  bg="white"
                  borderRadius="full"
                  animate={{
                    ...animations.sparkle,
                    transition: {
                      ...animations.sparkle.transition,
                      delay: 0.5,
                    },
                  }}
                  willChange="opacity, transform"
                />
                <Box
                  position="absolute"
                  top="45px"
                  left="50%"
                  transform="translateX(-50%)"
                  w="25px"
                  h="4px"
                  bg="white"
                  borderRadius="full"
                />
              </Box>
            </MotionBox>
            <MotionBox
              position="absolute"
              top="45%"
              left="20%"
              w="100px"
              h="50px"
              bg="linear-gradient(135deg, #bd9cf2 0%, #e879f9 100%)"
              borderRadius="25px"
              transform="rotate(-25deg)"
              zIndex={2}
              boxShadow="0 10px 30px rgba(189, 156, 242, 0.3)"
              animate={animations.wave}
              willChange="transform"
            />
            <MotionBox
              position="absolute"
              top="45%"
              right="20%"
              w="100px"
              h="50px"
              bg="linear-gradient(135deg, #bd9cf2 0%, #e879f9 100%)"
              borderRadius="25px"
              transform="rotate(25deg)"
              zIndex={2}
              boxShadow="0 10px 30px rgba(189, 156, 242, 0.3)"
              animate={{ ...animations.wave, rotate: [0, -5, 5, 0] }}
              willChange="transform"
            />
            <MotionBox
              position="absolute"
              top="15%"
              left="8%"
              bg="linear-gradient(135deg, #1a202c 0%, #2d3748 100%)"
              color="white"
              px={5}
              py={3}
              borderRadius="20px"
              fontSize="sm"
              fontWeight="500"
              boxShadow="0 10px 30px rgba(0,0,0,0.2)"
              animate={animations.float}
              willChange="transform"
              _after={{
                content: '""',
                position: 'absolute',
                bottom: '-8px',
                left: '20px',
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid #2d3748',
              }}
            >
              ✨ Hey there!
            </MotionBox>
            <MotionBox
              position="absolute"
              top="15%"
              right="8%"
              bg="white"
              border="2px solid #bd9cf2"
              px={5}
              py={3}
              borderRadius="20px"
              fontSize="sm"
              fontWeight="500"
              boxShadow="0 10px 30px rgba(189, 156, 242, 0.2)"
              animate={{
                ...animations.float,
                transition: { ...animations.float.transition, delay: 1 },
              }}
              willChange="transform"
            >
              Hello! 👋
            </MotionBox>
            {[...Array(8)].map((_, i) => (
              <MotionBox
                key={i}
                position="absolute"
                w="6px"
                h="6px"
                bg="#bd9cf2"
                borderRadius="full"
                top={`${20 + i * 10}%`}
                left={`${10 + i * 12}%`}
                animate={{
                  ...animations.sparkle,
                  transition: {
                    ...animations.sparkle.transition,
                    delay: i * 0.3,
                    duration: 2 + i * 0.5,
                  },
                }}
                opacity={0.7}
                willChange="opacity, transform"
              />
            ))}
          </MotionBox>
        </Flex>
      </Container>

      <FeaturesSection animations={animations} />

      {/* Floating cursor follower */}
      <MotionBox
        position="fixed"
        w="20px"
        h="20px"
        bg="rgba(189, 156, 242, 0.3)"
        borderRadius="full"
        pointerEvents="none"
        zIndex={9999}
        animate={{
          x: mousePosition.x != null ? mousePosition.x - 10 : 0,
          y: mousePosition.y != null ? mousePosition.y - 10 : 0,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        filter="blur(5px)"
        willChange="transform"
      />
    </Box>
  );
};

export default SimplrLanding;
