'use client';

import React, { useState, useEffect } from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  VStack,
  Text,
  Button,
  useToast,
  Box,
  Heading,
  Circle,
  HStack,
  PinInput,
  PinInputField,
  FormControl,
  FormErrorMessage,
  Spinner,
} from '@chakra-ui/react';
import { ArrowBackIcon, EmailIcon, TimeIcon } from '@chakra-ui/icons';
import ResetPassword from '../resetPassword/resetPassword';
import {
  useVerifyOtpMutation,
  useResendOtpMutation,
} from '@/Redux/services/auth';

const OtpVerification = ({
  isOpen,
  onClose,
  email,
  onOtpVerified,
  onBackToForgot,
}) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const [step, setStep] = useState('otp');
  const toast = useToast();

  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  useEffect(() => {
    if (timeLeft > 0 && isOpen && step === 'otp') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [timeLeft, isOpen, step]);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(300);
      setCanResend(false);
      setOtp('');
      setError('');
      setStep('otp');
    }
  }, [isOpen]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (value) => {
    setOtp(value);
    if (error) setError('');
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    try {
      await verifyOtp({ email, otp }).unwrap();

      toast({
        title: 'Code verified successfully!',
        description: 'You can now create a new password',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });

      setStep('reset');
    } catch (err) {
      const message = err?.data?.message || err || err?.message || 'An error occurred while verifying the code';
      setError(message);

      toast({
        title: 'Invalid code',
        description: message,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp({ email }).unwrap();

      setTimeLeft(300);
      setCanResend(false);
      setOtp('');
      setError('');

      toast({
        title: 'New code sent!',
        description: 'A new verification code has been sent to your email',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    } catch (err) {
      toast({
        title: 'Failed to resend code',
        description:
          err?.data?.message ||
           err?.message ||
          'An error occurred while resending the code',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  const handleBack = () => {
    if (step === 'reset') {
      // go back to OTP input from reset password step
      setStep('otp');
    } else if (onBackToForgot) {
      onBackToForgot();
    } else {
      onClose();
    }
  };

  const maskEmail = (email) => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    const maskedUsername =
      username.length > 2
        ? username[0] + '*'.repeat(username.length - 2) + username[username.length - 1]
        : username;
    return `${maskedUsername}@${domain}`;
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
              onClick={handleBack}
              size="sm"
              color="gray.600"
              _hover={{
                color: 'purple.600',
                bg: 'purple.50',
              }}
              pl={0}
              fontWeight="600"
            >
              Back
            </Button>
          </DrawerHeader>

          <DrawerBody px={6} py={8}>
            {step === 'otp' && (
              <VStack spacing={8} align="stretch">
                <VStack spacing={4} align="center" textAlign="center">
                  <Circle size="60px" bg="blue.100" color="blue.600">
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
                      Enter Verification Code
                    </Heading>
                    <Text color="gray.600" fontSize="md" lineHeight="1.6" mb={3}>
                      We've sent a 6-digit code to
                    </Text>
                    <Text
                      color="purple.600"
                      fontSize="md"
                      fontWeight="600"
                      bg="purple.50"
                      px={3}
                      py={1}
                      borderRadius="md"
                      display="inline-block"
                    >
                      {maskEmail(email)}
                    </Text>
                  </Box>
                </VStack>

                <VStack spacing={4} align="center">
                  <FormControl isInvalid={!!error}>
                    <HStack spacing={3} justify="center">
                      <PinInput
                        otp
                        size="lg"
                        placeholder=''
                        value={otp}
                        onChange={handleOtpChange}
                        focusBorderColor="purple.500"
                        errorBorderColor="red.500"
                      >
                        {[...Array(6)].map((_, idx) => (
                          <PinInputField
                            key={idx}
                            w="50px"
                            h="50px"
                            fontSize="xl"
                            fontWeight="600"
                            textAlign="center"
                            border="2px solid"
                            borderColor={error ? 'red.300' : 'gray.200'}
                            _hover={{
                              borderColor: error ? 'red.400' : 'purple.300',
                            }}
                            _focus={{
                              borderColor: error ? 'red.500' : 'purple.500',
                              boxShadow: 'none',
                            }}
                            borderRadius="lg"
                          />
                        ))}
                      </PinInput>
                    </HStack>
                    {error && (
                      <FormErrorMessage fontSize="sm" textAlign="center" mt={2}>
                        {error}
                      </FormErrorMessage>
                    )}
                  </FormControl>
                </VStack>

                <VStack spacing={2} align="center">
                  <HStack
                    spacing={2}
                    color={timeLeft <= 60 ? 'red.500' : 'gray.500'}
                  >
                    <TimeIcon boxSize={4} />
                    <Text fontSize="sm" fontWeight="600">
                      Code expires in {formatTime(timeLeft)}
                    </Text>
                    {isResending && <Spinner size="sm" />}
                  </HStack>
                </VStack>

                <Button
                  onClick={handleVerifyOtp}
                  size="lg"
                  width="100%"
                  bg="rgba(124, 57, 230, 0.8)"
                  color="white"
                  _hover={{
                    bg: 'rgba(124, 57, 230, 0.5)',
                    transform: 'translateY(-1px)',
                  }}
                  _active={{ transform: 'translateY(0)' }}
                  isLoading={isVerifying}
                  loadingText="Verifying..."
                  fontWeight="600"
                  borderRadius="lg"
                  h="52px"
                  fontSize="md"
                  transition="all 0.2s"
                  isDisabled={otp.length !== 6 || timeLeft === 0}
                >
                  Verify Code
                </Button>

                <VStack spacing={3}>
                  {canResend ? (
                    <Button
                      variant="outline"
                      colorScheme="purple"
                      onClick={handleResendOtp}
                      isLoading={isResending}
                      loadingText="Sending..."
                      size="md"
                      fontWeight="600"
                    >
                      Resend Code
                    </Button>
                  ) : (
                    <Text fontSize="sm" color="gray.500" textAlign="center">
                      Didn't receive the code?{' '}
                      <Text as="span" color="gray.400">
                        You can request a new one in {formatTime(timeLeft)}
                      </Text>
                    </Text>
                  )}
                </VStack>

                <Box
                  bg="blue.50"
                  p={4}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="blue.100"
                >
                  <Text fontSize="sm" color="blue.700" lineHeight="1.5">
                    <strong>Having trouble?</strong> Make sure to check your spam
                    folder. The code is valid for 5 minutes only.
                  </Text>
                </Box>
              </VStack>
            )}

            {step === 'reset' && (
              <ResetPassword
                isOpen={isOpen}
                onClose={() => {
                  setStep('otp');
                  onClose();
                }}
                email={email}
                otp={otp}
                onPasswordReset={() => {
                  setStep('otp');
                  onClose();
                }}
                onBackToOtp={() => {
                  setStep('otp');
                }}
              />
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default OtpVerification;
