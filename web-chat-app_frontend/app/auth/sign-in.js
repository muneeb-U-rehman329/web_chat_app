'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  VStack,
  Text,
  Input,
  Button,
  Container,
  Heading,
  FormControl,
  FormLabel,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  IconButton,
  useToast,
  Link,
  Flex,
  HStack,
  useDisclosure,
  Modal,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import ForgotPassword from '../../modules/Drawer/ForgotPassword_slider/forgotPassword';
import { useLoginMutation } from '@/Redux/services/auth';

const Login = ({ onSwitchToSignup }) => {
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const [login, { isLoading, isError, error }] = useLoginMutation();

  const onSubmit = async (data) => {
    try {
      const response = await login(data).unwrap();

      toast({
        title: 'Login Successful',
        description: 'Welcome to your account!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      reset();
      window.location.href = '/messages';
    } catch (err) {
      toast({
        title: 'Login Failed',
        description:
          err?.data?.message ||
          err?.message ||
          'An error occurred during login',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const {
    isOpen: isForgotPasswordOpen,
    onOpen: onForgotPasswordOpen,
    onClose: onForgotPasswordClose,
  } = useDisclosure();

  return (
    <>
      <Box w="full" maxW="md">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={6} align="start">
            <Box>
              <Heading
                size="2xl"
                color="gray.900"
                fontWeight="700"
                lineHeight="1.2"
                mb={3}
              >
                Welcome Back
              </Heading>
              <Text color="gray.600" fontSize="lg">
                Sign in to continue your journey with us
              </Text>
            </Box>
          </VStack>

          {/* Form */}
          <Box as="form" onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing={6}>
              {/* Email */}
              <FormControl isInvalid={errors.email}>
                <FormLabel
                  color="gray.700"
                  fontSize="sm"
                  fontWeight="600"
                  mb={2}
                >
                  Email Address
                </FormLabel>
                <Input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  placeholder="Enter your email"
                  border="1px solid rgba(0, 0, 0, 0.1)"
                  _hover={{
                    borderColor: 'purple.200',
                    bg: 'white',
                  }}
                  _focus={{
                    borderColor: 'purple.500',
                    boxShadow: 'none',
                    bg: 'white',
                  }}
                  size="lg"
                  borderRadius="lg"
                  fontSize="md"
                  h="52px"
                />
                <FormErrorMessage fontSize="sm">
                  {errors.email?.message}
                </FormErrorMessage>
              </FormControl>

              {/* Password */}
              <FormControl isInvalid={errors.password}>
                <FormLabel
                  color="gray.700"
                  fontSize="sm"
                  fontWeight="600"
                  mb={2}
                >
                  Password
                </FormLabel>
                <InputGroup>
                  <Input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    border="1px solid rgba(0, 0, 0, 0.1)"
                    _hover={{
                      borderColor: 'purple.200',
                      bg: 'white',
                    }}
                    _focus={{
                      borderColor: 'purple.500',
                      boxShadow: 'none',
                      bg: 'white',
                    }}
                    size="lg"
                    borderRadius="lg"
                    fontSize="md"
                    h="52px"
                    pr="3rem"
                  />
                  <InputRightElement h="52px" width="3rem">
                    <IconButton
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      size="sm"
                      color="gray.500"
                      _hover={{
                        color: 'purple.500',
                        bg: 'transparent',
                      }}
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage fontSize="sm">
                  {errors.password?.message}
                </FormErrorMessage>
              </FormControl>

              {/* Forgot Password Link */}
              <Flex justify="flex-end" w="100%">
                <Link
                  color="purple.600"
                  fontSize="sm"
                  fontWeight="600"
                  onClick={onForgotPasswordOpen}
                  _hover={{
                    color: 'purple.700',
                    textDecoration: 'underline',
                  }}
                >
                  Forgot password?
                </Link>
              </Flex>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                width="100%"
                bg="rgba(124, 57, 230, 0.8)"
                color="white"
                _hover={{
                  bg: 'rgba(124, 57, 230, 0.5)',
                  transform: 'translateY(-1px)',
                }}
                _active={{ transform: 'translateY(0)' }}
                isLoading={isLoading}
                loadingText="Signing In..."
                fontWeight="600"
                borderRadius="lg"
                h="52px"
                fontSize="md"
                transition="all 0.2s"
                mt={4}
              >
                Sign In
              </Button>
            </VStack>
          </Box>

          {/* Footer */}
          <VStack spacing={4} mt={6}>
            <Text fontSize="sm" color="gray.600" textAlign="center">
              Don't have an account?{' '}
              <Link
                color="purple.600"
                fontWeight="600"
                _hover={{
                  color: 'purple.700',
                  textDecoration: 'underline',
                }}
                onClick={onSwitchToSignup}
                cursor="pointer"
              >
                Create Account
              </Link>
            </Text>

            <Text
              fontSize="xs"
              color="purple.500"
              textAlign="center"
              lineHeight="1.5"
              maxW="sm"
            >
              By signing in, you agree to our{' '}
              <Link color="purple.600" _hover={{ textDecoration: 'underline' }}>
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link color="purple.600" _hover={{ textDecoration: 'underline' }}>
                Privacy Policy
              </Link>
            </Text>
          </VStack>
        </VStack>
      </Box>
      <ForgotPassword
        isOpen={isForgotPasswordOpen}
        onClose={onForgotPasswordClose}
      />
    </>
  );
};

export default Login;
