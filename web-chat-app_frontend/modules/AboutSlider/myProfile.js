'use client';
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  Avatar,
  VStack,
  HStack,
  Input,
  Textarea,
  IconButton,
  Box,
  Button,
  useToast,
  Text,
  Flex,
  Badge,
  Skeleton,
  SkeletonCircle,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FiEdit,
  FiSave,
  FiX,
  FiUser,
  FiMail,
  FiMapPin,
  FiCamera,
  FiStar,
  FiHeart,
  FiCalendar,
  FiCheck,
  FiXCircle,
} from 'react-icons/fi';
import {
  usePutProfileMutation,
  useGetProfileQuery,
} from '@/Redux/services/profile';
import Image from 'next/image';

export default function ProfileDrawer({ isOpen, onClose, finalFocusRef }) {
  const toast = useToast();
  const {
    data: profileData,
    isLoading,
    isError,
    refetch,
  } = useGetProfileQuery();
  const [putProfile, { isLoading: isUpdating }] = usePutProfileMutation();
  const [editField, setEditField] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    bio: '',
    username: '',
    avatar: null,
  });
  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const profile = profileData?.profile;

  const particles = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 3 + 2,
      opacity: Math.random() * 0.3 + 0.1,
      color: [
        'rgba(99, 102, 241, 0.1)',
        'rgba(168, 85, 247, 0.1)',
        'rgba(236, 72, 153, 0.1)',
      ][i % 3],
    }));
  }, []);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        email: profile.email || '',
        bio: profile.bio || '',
        username: profile.username || '',
        avatar: profile.avatar || null,
      });
    }
  }, [profile]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (editField === 'name' && !form.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    if (editField === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    if (editField === 'bio' && form.bio?.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, editField]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before saving.',
        status: 'error',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('bio', form.bio);
      if (file) formData.append('avatar', file);

      await putProfile(formData).unwrap();
      await refetch();
      setEditField(null);
      setErrors({});
      setFile(null);

      toast({
        title: '✨ Success!',
        description: 'Profile updated successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error?.data?.message || 'Failed to update profile',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }
  }, [validateForm, form, file, putProfile, refetch, toast]);

  const handleCancel = useCallback(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        email: profile.email || '',
        bio: profile.bio || '',
        username: profile.username || '',
        avatar: profile.avatar || null,
      });
    }
    setEditField(null);
    setErrors({});
    setFile(null);
  }, [profile]);

  const handleImageUpload = useCallback(
    (e) => {
      const uploadedFile = e.target.files[0];
      if (!uploadedFile) return;

      if (!uploadedFile.type.startsWith('image/')) {
        toast({
          title: 'Invalid File',
          description: 'Please select an image file',
          status: 'error',
          duration: 2000,
          isClosable: true,
        });
        return;
      }

      if (uploadedFile.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Image must be smaller than 5MB',
          status: 'error',
          duration: 2000,
          isClosable: true,
        });
        return;
      }

      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setForm((prev) => ({ ...prev, avatar: event.target.result }));
      };
      reader.readAsDataURL(uploadedFile);
      setIsModalOpen(true); // Open modal on successful upload
    },
    [toast]
  );

  const handleConfirmImage = useCallback(async () => {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      await putProfile(formData).unwrap();

      await refetch();

      setIsModalOpen(false);
      setFile(null);

      toast({
        title: '✨ Image Uploaded!',
        description: 'Your profile picture has been updated.',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      });
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error?.data?.message || 'Failed to upload image',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }
  }, [file, putProfile, refetch, toast]);

  const handleCancelImage = useCallback(() => {
    setIsModalOpen(false);
    setFile(null);
    setForm((prev) => ({ ...prev, avatar: profile?.avatar || null }));
  }, [profile]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        size={{ base: 'full', md: 'lg' }}
      >
        <DrawerOverlay bg="rgba(0, 0, 0, 0.4)" backdropFilter="blur(4px)" />
        <DrawerContent>
          <DrawerHeader>
            <Skeleton height="40px" />
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={6}>
              <SkeletonCircle size="140px" />
              <Skeleton height="60px" />
              <Skeleton height="60px" />
              <Skeleton height="60px" />
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }

  if (isError) {
    return (
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        size={{ base: 'full', md: 'lg' }}
      >
        <DrawerOverlay bg="rgba(0, 0, 0, 0.4)" backdropFilter="blur(4px)" />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody p={6}>
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              Failed to load profile data. Please try again.
            </Alert>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      finalFocusRef={finalFocusRef}
      size={{ base: 'full', md: 'lg' }}
    >
      <DrawerOverlay
        bg="rgba(0, 0, 0, 0.4)"
        backdropFilter="blur(8px)"
        transition="all 0.2s ease"
      />
      <DrawerContent
        bg="linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)"
        borderLeft="1px solid rgba(226, 232, 240, 0.8)"
        position="relative"
        overflow="hidden"
      >
        {particles.map((particle) => (
          <Box
            key={particle.id}
            position="absolute"
            w={`${particle.size}px`}
            h={`${particle.size}px`}
            bg={particle.color}
            borderRadius="full"
            left={`${particle.x}%`}
            top={`${particle.y}%`}
            opacity={particle.opacity}
            animation={`float-modern ${particle.speed}s ease-in-out infinite`}
            filter="blur(0.5px)"
            pointerEvents="none"
          />
        ))}

        <DrawerCloseButton
          mt={4}
          mr={4}
          size="lg"
          bg="white"
          color="gray.600"
          _hover={{
            bg: 'gray.50',
            transform: 'rotate(90deg) scale(1.1)',
          }}
          borderRadius="full"
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          zIndex={10}
          boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
        />

        <DrawerHeader pb={2} pt={6} position="relative" zIndex={5}>
          <VStack spacing={3} align="start">
            <HStack spacing={4}>
              <Box
                p={3}
                borderRadius="2xl"
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                color="white"
                boxShadow="0 8px 25px rgba(102, 126, 234, 0.3)"
              >
                <FiUser size={24} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text
                  fontSize={{ base: '2xl', md: '3xl' }}
                  fontWeight="900"
                  color="gray.900"
                  letterSpacing="tight"
                >
                  Profile Studio
                </Text>
                <Text fontSize="sm" color="gray.500" fontWeight="500">
                  Manage your personal information
                </Text>
              </VStack>
            </HStack>
          </VStack>
        </DrawerHeader>

        <DrawerBody p={{ base: 4, md: 6 }} position="relative" zIndex={5}>
          <VStack spacing={8} align="stretch">
            <Box
              bg="white"
              borderRadius="3xl"
              p={8}
              border="1px solid rgba(226, 232, 240, 0.8)"
              position="relative"
              overflow="hidden"
              boxShadow="0 20px 60px rgba(0, 0, 0, 0.03)"
              _before={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              <VStack spacing={6}>
                <Box position="relative">
                  <Box
                    w="170px"
                    h="170px"
                    position="relative" // This is IMPORTANT for Next.js Image fill to work
                    borderRadius="full"
                    overflow="hidden"
                    border="4px solid"
                    borderColor="gray.100"
                    boxShadow="0 10px 30px rgba(0, 0, 0, 0.05)"
                  >
                    <Image
                      src={form.avatar || profile?.avatar || '/default-avatar.png'}
                      alt="Preview Image"
                      fill
                      style={{
                        objectFit: 'cover',
                        objectPosition: 'top center',
                      }}
                      sizes="100px"
                    />

                    <Box
                      as="label"
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      bg="linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      opacity={0}
                      _hover={{ opacity: 1 }}
                      transition="opacity 0.3s ease"
                      borderRadius="full"
                      cursor="pointer"
                    >
                      <VStack spacing={2}>
                        <FiCamera size={20} color="white" />
                        <Text fontSize="xs" color="white" fontWeight="700">
                          Change Photo
                        </Text>
                      </VStack>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        display="none"
                      />
                    </Box>
                  </Box>

                  <Badge
                    position="absolute"
                    bottom={2}
                    right={2}
                    bg="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    color="white"
                    borderRadius="full"
                    px={3}
                    py={1}
                    fontSize="xs"
                    fontWeight="700"
                    border="3px solid white"
                    boxShadow="0 4px 12px rgba(16, 185, 129, 0.3)"
                  >
                    Online
                  </Badge>
                </Box>

                <VStack spacing={3} textAlign="center">
                  <VStack spacing={1}>
                    <Text
                      fontSize={{ base: 'xl', md: '2xl' }}
                      fontWeight="900"
                      color="gray.900"
                      letterSpacing="tight"
                    >
                      {profile?.name || 'User'}
                    </Text>
                    <Text fontSize="md" color="gray.500" fontWeight="500">
                      @{profile?.username || 'username'}
                    </Text>
                  </VStack>

                  {profile?.createdAt && (
                    <HStack spacing={2} color="gray.400">
                      <FiCalendar size={14} />
                      <Text fontSize="sm" fontWeight="500">
                        Joined {formatDate(profile.createdAt)}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </VStack>
            </Box>

            <VStack spacing={4} align="stretch">
              <ModernFieldContainer
                icon={<FiUser />}
                label="Full Name"
                color="blue"
                isEditing={editField === 'name'}
                onEdit={() => setEditField('name')}
                onSave={handleSave}
                onCancel={handleCancel}
                isUpdating={isUpdating}
              >
                <ModernTextField
                  value={editField === 'name' ? form.name : profile?.name || ''}
                  editable={editField === 'name'}
                  onChange={(val) =>
                    setForm((prev) => ({ ...prev, name: val }))
                  }
                  error={errors.name}
                  placeholder="Enter your full name"
                />
              </ModernFieldContainer>

              <ModernFieldContainer
                icon={<FiMail />}
                label="Email Address"
                color="green"
                isEditing={editField === 'email'}
                onEdit={() => setEditField('email')}
                onSave={handleSave}
                onCancel={handleCancel}
                isUpdating={isUpdating}
              >
                <ModernTextField
                  value={
                    editField === 'email' ? form.email : profile?.email || ''
                  }
                  editable={editField === 'email'}
                  onChange={(val) =>
                    setForm((prev) => ({ ...prev, email: val }))
                  }
                  error={errors.email}
                  placeholder="Enter your email address"
                />
              </ModernFieldContainer>

              <ModernFieldContainer
                icon={<FiHeart />}
                label="Bio"
                color="purple"
                isEditing={editField === 'bio'}
                onEdit={() => setEditField('bio')}
                onSave={handleSave}
                onCancel={handleCancel}
                isUpdating={isUpdating}
              >
                <ModernTextField
                  value={editField === 'bio' ? form.bio : profile?.bio || ''}
                  editable={editField === 'bio'}
                  onChange={(val) => setForm((prev) => ({ ...prev, bio: val }))}
                  textarea
                  error={errors.bio}
                  placeholder="Tell us about yourself..."
                />
              </ModernFieldContainer>
            </VStack>
          </VStack>
        </DrawerBody>
      </DrawerContent>

      <Modal isOpen={isModalOpen} onClose={handleCancelImage} isCentered>
        <ModalOverlay />
        <ModalContent
          borderRadius="2xl"
          maxW="sm"
          bg="white"
          boxShadow="0 20px 60px rgba(0, 0, 0, 0.1)"
        >
          <ModalHeader p={6} borderBottom="1px solid" borderColor="gray.100">
            Confirm Profile Picture
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            p={6}
            display="flex"
            flexDir="column"
            alignItems="center"
            gap={6}
          >
            <Box
              w="200px"
              h="200px"
              borderRadius="full"
              overflow="hidden"
              border="4px solid"
              borderColor="gray.100"
              boxShadow="0 10px 30px rgba(0, 0, 0, 0.05)"
            >
              <Image
                src={file ? URL.createObjectURL(file) : '/default-avatar.png'}
                alt="Preview Image"
                width={400}
                height={400}
                objectFit="cover"
              />
            </Box>
            <Text fontSize="md" color="gray.600" textAlign="center">
              Are you sure you want to use this image?
            </Text>
          </ModalBody>
          <ModalFooter p={6} gap={4}>
            <Button
              leftIcon={<FiXCircle />}
              colorScheme="red"
              variant="outline"
              onClick={handleCancelImage}
              borderRadius="full"
              px={6}
            >
              Cancel
            </Button>
            <Button
              leftIcon={<FiCheck />}
              colorScheme="green"
              onClick={handleConfirmImage}
              borderRadius="full"
              px={6}
              isLoading={isUpdating}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Drawer>
  );
}

function ModernFieldContainer({
  icon,
  label,
  color,
  children,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  isUpdating,
}) {
  const colorMap = {
    blue: {
      bg: 'rgba(59, 130, 246, 0.1)',
      border: 'rgba(59, 130, 246, 0.2)',
      accent: '#3b82f6',
    },
    green: {
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.2)',
      accent: '#10b981',
    },
    purple: {
      bg: 'rgba(139, 92, 246, 0.1)',
      border: 'rgba(139, 92, 246, 0.2)',
      accent: '#8b5cf6',
    },
  };

  return (
    <Box
      p={8}
      borderRadius="2xl"
      border="1px solid"
      borderColor="gray.200"
      bg="white"
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        borderColor: colorMap[color].border,
        transform: 'translateY(-2px)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
      }}
      position="relative"
      overflow="hidden"
      w="100%"
    >
      <VStack spacing={5} align="stretch">
        <HStack spacing={4} align="center" justify="space-between">
          <HStack spacing={4} align="center">
            <Box
              p={3}
              borderRadius="xl"
              bg={colorMap[color].bg}
              color={colorMap[color].accent}
              border={`1px solid ${colorMap[color].border}`}
            >
              {icon}
            </Box>
            <Text
              fontSize="sm"
              color="gray.600"
              fontWeight="700"
              letterSpacing="wider"
              textTransform="uppercase"
            >
              {label}
            </Text>
          </HStack>

          {isEditing ? (
            <HStack spacing={2}>
              <IconButton
                icon={<FiX />}
                size="sm"
                bg="gray.100"
                color="gray.600"
                _hover={{
                  bg: 'gray.200',
                  transform: 'scale(1.1) rotate(90deg)',
                }}
                borderRadius="full"
                onClick={onCancel}
                transition="all 0.2s ease"
              />
              <IconButton
                icon={<FiSave />}
                size="sm"
                bg={colorMap[color].accent}
                color="white"
                _hover={{
                  transform: 'scale(1.1)',
                  boxShadow: `0 8px 25px ${colorMap[color].bg}`,
                }}
                borderRadius="full"
                onClick={onSave}
                isLoading={isUpdating}
                transition="all 0.2s ease"
              />
            </HStack>
          ) : (
            <IconButton
              icon={<FiEdit />}
              size="sm"
              bg={colorMap[color].bg}
              color={colorMap[color].accent}
              _hover={{
                bg: colorMap[color].border,
                transform: 'scale(1.1)',
              }}
              borderRadius="full"
              onClick={onEdit}
              transition="all 0.2s ease"
            />
          )}
        </HStack>

        <Box w="100%">{children}</Box>
      </VStack>
    </Box>
  );
}

function ModernTextField({
  value,
  editable,
  onChange,
  textarea,
  error,
  placeholder,
}) {
  if (editable) {
    const inputProps = {
      value: value || '',
      onChange: (e) => onChange(e.target.value),
      bg: 'gray.50',
      border: '2px solid',
      borderColor: error ? 'red.300' : 'gray.200',
      borderRadius: '16px',
      _focus: {
        borderColor: error ? 'red.400' : 'blue.400',
        boxShadow: error
          ? '0 0 0 3px rgba(239, 68, 68, 0.1)'
          : '0 0 0 3px rgba(59, 130, 246, 0.1)',
        bg: 'white',
      },
      fontSize: '16px',
      fontWeight: '500',
      placeholder,
      _placeholder: { color: 'gray.400' },
      transition: 'all 0.2s ease',
      size: 'lg',
      w: '100%',
    };

    return (
      <VStack align="stretch" spacing={2} w="100%">
        {textarea ? (
          <Textarea
            {...inputProps}
            minH="140px"
            resize="vertical"
            maxLength={500}
          />
        ) : (
          <Input {...inputProps} h="56px" />
        )}
        {error && (
          <Text fontSize="sm" color="red.500" fontWeight="500">
            {error}
          </Text>
        )}
        {textarea && (
          <Text fontSize="xs" color="gray.400" textAlign="right">
            {(value || '').length}/500
          </Text>
        )}
      </VStack>
    );
  }

  return (
    <Box
      p={5}
      bg="gray.50"
      borderRadius="12px"
      minH="56px"
      display="flex"
      alignItems="center"
      fontSize="16px"
      fontWeight="500"
      color={value ? 'gray.800' : 'gray.400'}
      lineHeight="1.6"
      border="1px solid"
      borderColor="gray.100"
      w="100%"
    >
      {value || placeholder}
    </Box>
  );
}
