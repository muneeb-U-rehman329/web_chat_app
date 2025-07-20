'use client';

import React, { useState, useEffect } from 'react';
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
  Circle,
  InputGroup,
  InputRightElement,
  IconButton,
  Progress,
} from '@chakra-ui/react';
import {
  ArrowBackIcon,
  LockIcon,
  ViewIcon,
  ViewOffIcon,
} from '@chakra-ui/icons';
import { useResetPasswordMutation } from '@/Redux/services/auth';

const ResetPassword = ({
  isOpen,
  onClose,
  email,
  otp,
  onPasswordReset,
  onBackToOtp,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const toast = useToast();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    mode: 'onChange',
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const watchedPassword = watch('newPassword');
  const watchedConfirmPassword = watch('confirmPassword');

  useEffect(() => {
    if (!watchedPassword) return setPasswordStrength(0);
    let strength = 0;
    if (watchedPassword.length >= 8) strength += 25;
    if (/[a-z]/.test(watchedPassword)) strength += 25;
    if (/[A-Z]/.test(watchedPassword)) strength += 25;
    if (/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(watchedPassword))
      strength += 25;
    setPasswordStrength(strength);
  }, [watchedPassword]);

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return 'red';
    if (passwordStrength <= 50) return 'orange';
    if (passwordStrength <= 75) return 'yellow';
    return 'green';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 25) return 'Weak';
    if (passwordStrength <= 50) return 'Fair';
    if (passwordStrength <= 75) return 'Good';
    return 'Strong';
  };

  const onSubmit = async (data) => {
    try {
      await resetPassword({ email, otp, newPassword: data.newPassword }).unwrap();
      toast({
        title: 'Password reset successfully!',
        description: 'You can now log in with your new password.',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
      reset();
      onPasswordReset?.(email);
      onClose();
    } catch (err) {
      toast({
        title: 'Reset failed',
        description:
          err?.data?.message ||
          err?.message ||
          'An error occurred while resetting your password.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  const maskEmail = (email) => {
    const [user, domain] = email.split('@');
    const maskedUser =
      user.length > 2
        ? user[0] + '*'.repeat(user.length - 2) + user[user.length - 1]
        : user;
    return `${maskedUser}@${domain}`;
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay bg="blackAlpha.300" backdropFilter="blur(2px)" />
      <DrawerContent bg="white" borderLeftRadius="2xl" boxShadow="2xl">
        <DrawerHeader borderBottomWidth="1px">
          <Button
            variant="ghost"
            leftIcon={<ArrowBackIcon />}
            onClick={() => onBackToOtp?.()}
            size="sm"
            color="gray.600"
            _hover={{ color: 'purple.600', bg: 'purple.50' }}
            pl={0}
          >
            Back
          </Button>
        </DrawerHeader>

        <DrawerBody px={6} py={8}>
          <VStack spacing={8}>
            <VStack spacing={4}>
              <Circle size="60px" bg="green.100" color="green.600">
                <LockIcon boxSize={6} />
              </Circle>
              <Box textAlign="center">
                <Heading size="xl">Create New Password</Heading>
                <Text mt={2}>You're verified for</Text>
                <Text
                  fontWeight="600"
                  color="purple.600"
                  bg="purple.50"
                  px={3}
                  py={1}
                  borderRadius="md"
                  display="inline-block"
                  mt={1}
                >
                  {maskEmail(email)}
                </Text>
              </Box>
            </VStack>

            <Box w="full" as="form" onSubmit={handleSubmit(onSubmit)}>
              <VStack spacing={6}>
                <FormControl isInvalid={errors.newPassword}>
                  <FormLabel>New Password</FormLabel>
                  <InputGroup>
                    <Input
                      _focus={{
                        borderColor: 'purple.500',
                        boxShadow: '0 0 0 1px purple.500',
                      }}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="New password"
                      {...register('newPassword', {
                        required: 'Required',
                        minLength: {
                          value: 8,
                          message: 'At least 8 characters',
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message: 'Use upper, lower & number',
                        },
                      })}
                    />
                    <InputRightElement>
                      <IconButton
                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        variant="ghost"
                      />
                    </InputRightElement>
                  </InputGroup>
                  {watchedPassword && (
                    <Box mt={2}>
                      <Progress
                        value={passwordStrength}
                        colorScheme={getStrengthColor()}
                        size="sm"
                        borderRadius="full"
                      />
                      <Text
                        fontSize="xs"
                        color={`${getStrengthColor()}.600`}
                        mt={1}
                      >
                        {getStrengthText()}
                      </Text>
                    </Box>
                  )}
                  <FormErrorMessage>
                    {errors.newPassword?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.confirmPassword}>
                  <FormLabel>Confirm Password</FormLabel>
                  <InputGroup>
                    <Input
                      _focus={{
                        borderColor: 'purple.500',
                        boxShadow: '0 0 0 1px purple.500',
                      }}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm password"
                      {...register('confirmPassword', {
                        required: 'Required',
                        validate: (val) =>
                          val === watchedPassword || 'Passwords do not match',
                      })}
                    />
                    <InputRightElement>
                      <IconButton
                        icon={
                          showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />
                        }
                        size="sm"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        variant="ghost"
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>
                    {errors.confirmPassword?.message}
                  </FormErrorMessage>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="purple"
                  w="full"
                  isLoading={isLoading}
                  loadingText="Resetting"
                >
                  Reset Password
                </Button>
              </VStack>
            </Box>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default ResetPassword;
