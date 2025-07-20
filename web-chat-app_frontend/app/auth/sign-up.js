'use client';

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  VStack,
  Text,
  Input,
  Button,
  Heading,
  FormControl,
  FormLabel,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  IconButton,
  useToast,
  Link,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import ReCAPTCHA from 'react-google-recaptcha';
import { useSignUpMutation } from '@/Redux/services/auth';
import { useRouter } from 'next/navigation';

const Signup = ({ onSwitchToLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);
  const router = useRouter();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const watchPassword = watch('password');

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const [signUp, { isLoading }] = useSignUpMutation();

  const onSubmit = async (data) => {
    console.log('Form submitted with data:', data);
    window.dispatchEvent(new CustomEvent('startLoading')); // Trigger PageLoader

    if (!recaptchaToken) {
      toast({
        title: 'reCAPTCHA Required',
        description: 'Please complete the reCAPTCHA to proceed.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      console.log('Attempting signup with:', {
        fullName: data.fullName,
        username: data.username,
        email: data.email,
        password: data.password,
        recaptchaToken,
      });
      const response = await signUp({
        fullName: data.fullName,
        username: data.username,
        email: data.email,
        password: data.password,
        recaptchaToken,
      }).unwrap();

      console.log('Signup successful, response:', response);
      toast({
        title: 'Account Created',
        description: 'Your account has been created successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setRecaptchaToken(null);
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      reset();
      console.log('Navigating to /auth?mode=login');
      router.push('/auth?mode=login');
    } catch (err) {
      console.error('Signup error:', err);
      toast({
        title: 'Error',
        description: err?.data?.message || 'An error occurred during signup.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setRecaptchaToken(null);
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
    }
  };

  return (
    <Box w="full" maxW="md" overflowX={'hidden'} h="100vh" overflowY="hidden">
      <VStack spacing={6} align="stretch" p={4}>
        <VStack spacing={4} align="start">
          <Box>
            <Heading
              size="2xl"
              color="gray.900"
              fontWeight="700"
              lineHeight="1.2"
              mb={2}
              pt={4}
            >
              Create Account
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Join us today and start your journey
            </Text>
          </Box>
        </VStack>

        <Box as="form" onSubmit={handleSubmit(onSubmit)}>
          <VStack spacing={5}>
            <FormControl isInvalid={errors.fullName}>
              <FormLabel color="gray.700" fontSize="sm" fontWeight="600" mb={1}>
                Full Name
              </FormLabel>
              <Input
                {...register('fullName', {
                  required: 'Full name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                })}
                _focus={{
                  borderColor: 'purple.500',
                  boxShadow: '0 0 0 1px rgba(124, 57, 230, 0.6)',
                }}
                placeholder="Enter your full name"
                size="lg"
                borderRadius="lg"
                fontSize="md"
                h="48px"
              />
              <FormErrorMessage fontSize="xs">
                {errors.fullName?.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.username}>
              <FormLabel color="gray.700" fontSize="sm" fontWeight="600" mb={1}>
                User Name
              </FormLabel>
              <Input
                {...register('username', {
                  required: 'User name is required',
                  minLength: {
                    value: 2,
                    message: 'Username must be at least 2 characters',
                  },
                  validate: (value) =>
                    /^[a-zA-Z0-9._]+$/.test(value) ||
                    'Username can only contain letters, numbers, dots, and underscores',
                })}
                _focus={{
                  borderColor: 'purple.500',
                  boxShadow: '0 0 0 1px rgba(124, 57, 230, 0.6)',
                }}
                placeholder="Enter your user name"
                size="lg"
                borderRadius="lg"
                fontSize="md"
                h="48px"
              />
              <FormErrorMessage fontSize="xs">
                {errors.username?.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.email}>
              <FormLabel color="gray.700" fontSize="sm" fontWeight="600" mb={1}>
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
                _focus={{
                  borderColor: 'purple.500',
                  boxShadow: '0 0 0 1px rgba(124, 57, 230, 0.6)',
                }}
                type="email"
                placeholder="Enter your email"
                size="lg"
                borderRadius="lg"
                fontSize="md"
                h="48px"
              />
              <FormErrorMessage fontSize="xs">
                {errors.email?.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.password}>
              <FormLabel color="gray.700" fontSize="sm" fontWeight="600" mb={1}>
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
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/,
                      message:
                        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
                    },
                  })}
                  _focus={{
                    borderColor: 'purple.500',
                    boxShadow: '0 0 0 1px rgba(124, 57, 230, 0.6)',
                  }}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  size="lg"
                  borderRadius="lg"
                  fontSize="md"
                  h="48px"
                  pr="3rem"
                />
                <InputRightElement h="48px" width="3rem">
                  <IconButton
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    size="sm"
                  />
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage fontSize="xs">
                {errors.password?.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.confirmPassword}>
              <FormLabel color="gray.700" fontSize="sm" fontWeight="600" mb={1}>
                Confirm Password
              </FormLabel>
              <InputGroup>
                <Input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === watchPassword || 'Passwords do not match',
                  })}
                  _focus={{
                    borderColor: 'purple.500',
                    boxShadow: '0 0 0 1px rgba(124, 57, 230, 0.6)',
                  }}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  size="md"
                  borderRadius="lg"
                  fontSize="sm"
                  h="40px"
                  pr="2.5rem"
                />
                <InputRightElement h="40px" width="2.5rem">
                  <IconButton
                    variant="ghost"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                    size="xs"
                  />
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage fontSize="xs">
                {errors.confirmPassword?.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl>
              <Box transform="scale(0.9)" transformOrigin="left">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                  onChange={handleRecaptchaChange}
                  theme="light"
                />
              </Box>
            </FormControl>

            <Button
              type="submit"
              size="md"
              width="100%"
              bg="rgba(124, 57, 230, 0.8)"
              color="white"
              _hover={{
                bg: 'rgba(124, 57, 230, 0.5)',
                transform: 'translateY(-1px)',
              }}
              _active={{ transform: 'translateY(0)' }}
              isLoading={isLoading}
              loadingText="Creating Account..."
              fontWeight="600"
              borderRadius="lg"
              h="44px"
              isDisabled={isLoading || !recaptchaToken}
              fontSize="sm"
              transition="all 0.2s"
              mt={2}
            >
              Create Account
            </Button>
          </VStack>
        </Box>

        <VStack spacing={2} mt={3}>
          <Text fontSize="xs" color="gray.600" textAlign="center">
            Already have an account?{' '}
            <Link
              color="purple.600"
              fontWeight="600"
              _hover={{ color: 'purple.700', textDecoration: 'underline' }}
              onClick={onSwitchToLogin}
              cursor="pointer"
            >
              Login
            </Link>
          </Text>
          <Text
            fontSize="xs"
            color="purple.500"
            textAlign="center"
            lineHeight="1.4"
            maxW="sm"
          >
            By creating an account, you agree to our{' '}
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
  );
};

export default Signup;