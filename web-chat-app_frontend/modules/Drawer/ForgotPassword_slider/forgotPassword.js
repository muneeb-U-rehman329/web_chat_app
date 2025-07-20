'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  VStack,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  Box,
  Heading,
  Icon,
  Circle,
} from '@chakra-ui/react';
import { ArrowBackIcon, EmailIcon } from '@chakra-ui/icons';
import OtpVerification from '../otpVerification/otpVerification';

import { useForgotPasswordMutation } from '@/Redux/services/auth';

const ForgotPassword = ({ isOpen, onClose, onOtpSent }) => {
  const [step, setStep] = useState('email');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  const watchedEmail = watch('email');

  // ⚡ Hook into your mutation
  const [forgotPassword, { isLoading: isSending }] =
    useForgotPasswordMutation();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await forgotPassword(data).unwrap(); // call your API

      toast({
        title: 'OTP sent successfully!',
        description: 'Check your email for the verification code',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });

      setStep('otp');

      if (onOtpSent) {
        onOtpSent(data.email);
      }
    } catch (error) {
      toast({
        title: 'Failed to send OTP',
        description:
          error?.data?.message ||
          error.message ||
          'An error occurred while sending the OTP',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    setStep('email');
    reset();
    onClose();
  };

  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        size="md"
        closeOnOverlayClick={true}
        closeOnEsc={true}
      >
        <DrawerOverlay bg="blackAlpha.300" backdropFilter="blur(2px)" />
        <DrawerContent
          bg="white"
          borderLeftRadius="2xl"
          boxShadow="2xl"
          maxW="480px"
        >
          <DrawerHeader
            borderBottomWidth="1px"
            borderBottomColor="gray.100"
            pb={4}
            pt={6}
          >
            <Button
              variant="ghost"
              leftIcon={<ArrowBackIcon />}
              onClick={handleGoBack}
              size="sm"
              color="gray.600"
              _hover={{
                color: 'purple.600',
                bg: 'purple.50',
              }}
              pl={0}
              fontWeight="600"
            >
              Back to Sign In
            </Button>
          </DrawerHeader>

          <DrawerBody px={6} py={8}>
            {step === 'email' && (
              <VStack spacing={8} align="stretch">
                <VStack spacing={4} align="start">
                  <Circle size="60px" bg="purple.100" color="purple.600">
                    <EmailIcon boxSize={6} />
                  </Circle>

                  <Box>
                    <Heading
                      size="xl"
                      color="gray.900"
                      fontWeight="700"
                      lineHeight="1.2"
                      mb={2}
                    >
                      Forgot Password?
                    </Heading>
                    <Text color="gray.600" fontSize="md" lineHeight="1.6">
                      No worries! Enter your email address and we'll send you a
                      verification code to reset your password.
                    </Text>
                  </Box>
                </VStack>

                <Box as="form" onSubmit={handleSubmit(onSubmit)} w="100%">
                  <VStack spacing={6}>
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
                        placeholder="Enter your email address"
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
                      isLoading={isLoading || isSending}
                      loadingText="Sending Code..."
                      fontWeight="600"
                      borderRadius="lg"
                      h="52px"
                      fontSize="md"
                      transition="all 0.2s"
                      mt={2}
                    >
                      Send Verification Code
                    </Button>
                  </VStack>
                </Box>

                <Box
                  bg="blue.50"
                  p={4}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="blue.100"
                >
                  <Text fontSize="sm" color="blue.700" lineHeight="1.5">
                    <strong>Having trouble?</strong> Make sure to check your
                    spam folder or contact our support team for assistance.
                  </Text>
                </Box>
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {step === 'otp' && (
        <OtpVerification
          isOpen={isOpen}
          onClose={() => {
            setStep('email');
            reset();
          }}
          onOtpVerified={() => {
            setStep('email');
            reset();
            onClose();
          }}
          email={watchedEmail}
          step={step}
          setStep={setStep}
        />
      )}
    </>
  );
};

export default ForgotPassword;
