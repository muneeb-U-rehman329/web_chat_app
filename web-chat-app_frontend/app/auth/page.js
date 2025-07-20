'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Text,
  Container,
  Heading,
  Flex,
  HStack,
} from '@chakra-ui/react';
import Login from './sign-in';
import Signup from './sign-up';
import { useSearchParams, useRouter } from 'next/navigation';

const AnimatedAuthContainer = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isLoginParam = searchParams.get('mode') === 'login';

  const [isSignup, setIsSignup] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    console.log('Search params mode:', searchParams.get('mode'));
    setIsSignup(!isLoginParam); // /auth => isSignup=true, /auth?mode=login => isSignup=false
    setIsMounted(true);
  }, [isLoginParam]);

  const switchToLogin = () => {
    console.log('Switching to Login');
    setIsSignup(false);
    router.push('/auth?mode=login');
  };

  const switchToSignup = () => {
    console.log('Switching to Signup');
    setIsSignup(true);
    router.push('/auth');
  };

  if (!isMounted) return null;

  return (
    <Box minH="100vh" bg={{ base: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", lg: "white" }} overflow="hidden">
      <Container maxW="10xl" minH="100vh" p={0}>
        <Flex minH="100vh" align="center" position="relative">
          <Box
            flex="1"
            display="flex"
            alignItems="center"
            justifyContent="center"
            overflowY="scroll"
            h={{ base: "100%", lg: "100vh" }}
            px={{ base: 6, md: 0 }}
            pt={10}
            bg={{ base: "rgba(255, 255, 255, 0.95)", lg: "white" }}
            position="relative"
            zIndex={2}
            borderRadius={{ base: "2xl", lg: "0" }}
            m={{ base: 4, lg: 0 }}
            backdropFilter={{ base: "blur(10px)", lg: "none" }}
            boxShadow={{ base: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", lg: "none" }}
            transform={{ base: "none", lg: isSignup ? 'translateX(0)' : 'translateX(100%)' }}
            transition="transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
          >
            {isSignup ? (
              <Signup onSwitchToLogin={switchToLogin} />
            ) : (
              <Login onSwitchToSignup={switchToSignup} />
            )}
          </Box>

          <Box
            display={{ base: 'block', lg: 'none' }}
            position="absolute"
            inset={0}
            opacity={0.1}
            backgroundImage="radial-gradient(circle at 25% 25%, white 2px, transparent 2px)"
            backgroundSize="30px 30px"
            zIndex={1}
          />
          
          <Box
            display={{ base: 'block', lg: 'none' }}
            position="absolute"
            top="10"
            right="10"
            w="8"
            h="8"
            bg="rgba(255, 255, 255, 0.2)"
            borderRadius="xl"
            animation="pulse 2s infinite"
            zIndex={1}
          />
          
          <Box
            display={{ base: 'block', lg: 'none' }}
            position="absolute"
            bottom="20"
            left="10"
            w="12"
            h="12"
            bg="rgba(255, 255, 255, 0.15)"
            borderRadius="xl"
            animation="bounce 2s infinite"
            style={{ animationDelay: '1s' }}
            zIndex={1}
          />

          <Box
            flex="1"
            display={{ base: 'none', lg: 'flex' }}
            alignItems="center"
            h="100vh"
            justifyContent="center"
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            position="relative"
            overflow="hidden"
            transform={isSignup ? 'translateX(0)' : 'translateX(-100%)'}
            transition="transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
          >
            <Box
              position="absolute"
              inset={0}
              opacity={0.1}
              backgroundImage="radial-gradient(circle at 25% 25%, white 2px, transparent 2px)"
              backgroundSize="50px 50px"
            />

            <VStack spacing={12} color="white" textAlign="center" zIndex={2} px={12}>
              <Box
                w={32}
                h={32}
                bg="rgba(255, 255, 255, 0.15)"
                borderRadius="3xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                backdropFilter="blur(10px)"
                border="2px solid rgba(255, 255, 255, 0.2)"
                boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                transform="scale(1)"
                transition="transform 0.3s ease"
                _hover={{ transform: 'scale(1.05)' }}
              >
                <Text fontSize="6xl">{isSignup ? '💬' : '🚀'}</Text>
              </Box>

              <VStack spacing={4} maxW="md">
                <Heading size="xl" fontWeight="700" lineHeight="1.2">
                  {isSignup 
                    ? 'Connect with People Around the World'
                    : 'Welcome Back to Our Community'}
                </Heading>
                <Text fontSize="lg" opacity={0.9} lineHeight="1.6">
                  {isSignup
                    ? 'Experience seamless communication with our modern chat platform designed for meaningful conversations'
                    : 'Continue your journey with us and reconnect with your conversations and contacts'}
                </Text>
              </VStack>

              <VStack spacing={4} align="start" maxW="sm">
                <HStack spacing={4}>
                  <Box w={8} h={8} bg="rgba(255, 255, 255, 0.2)" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                    <Text fontSize="lg">✨</Text>
                  </Box>
                  <Text fontSize="md">
                    {isSignup ? 'Real-time messaging' : 'Instant access'}
                  </Text>
                </HStack>
                
                <HStack spacing={4}>
                  <Box w={8} h={8} bg="rgba(255, 255, 255, 0.2)" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                    <Text fontSize="lg">🔒</Text>
                  </Box>
                  <Text fontSize="md">
                    {isSignup ? 'End-to-end encryption' : 'Secure login'}
                  </Text>
                </HStack>
              </VStack>
            </VStack>

            <Box
              position="absolute"
              top="20"
              right="20"
              w="12"
              h="12"
              bg="rgba(255, 255, 255, 0.1)"
              borderRadius="2xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              animation="pulse 2s infinite"
              style={{
                transform: isSignup ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: 'transform 0.8s ease'
              }}
            >
              <Text fontSize="2xl">💭</Text>
            </Box>
            
            <Box
              position="absolute"
              bottom="32"
              left="16"
              w="16"
              h="16"
              bg="rgba(255, 255, 255, 0.1)"
              borderRadius="2xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              animation="bounce 2s infinite"
              style={{ animationDelay: '1s' }}
            >
              <Text fontSize="3xl">🌟</Text>
            </Box>

            <Box
              position="absolute"
              top="50%"
              right="8"
              w="8"
              h="8"
              bg="rgba(255, 255, 255, 0.2)"
              borderRadius="full"
              animation="ping 2s infinite"
              style={{ animationDelay: '2s' }}
            />
          </Box>
        </Flex>
      </Container>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(-25%);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </Box>
  );
};

export default AnimatedAuthContainer;