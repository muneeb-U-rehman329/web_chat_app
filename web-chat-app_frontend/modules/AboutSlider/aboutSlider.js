'use client';
import React from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  HStack,
  Avatar,
  Text,
  Box,
  Heading,
  Divider,
  Image,
  Grid,
  GridItem,
  Icon,
  Flex,
} from '@chakra-ui/react';
import { FiImage, FiLink, FiFileText } from 'react-icons/fi';
import NextImage from 'next/image';

const ContactInfoDrawer = ({
  isOpen,
  onClose,
  finalFocusRef,
  contactData,
  data,
}) => {
  const getMediaIcon = (type) => {
    switch (type) {
      case 'image':
        return FiImage;
      case 'document':
        return FiFileText;
      case 'link':
        return FiLink;
      default:
        return FiFileText;
    }
  };

  const getImageUrl = (avatar) => {
    const isFull =
      avatar?.startsWith('http://') || avatar?.startsWith('https://');
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return isFull ? avatar : `${base}/${avatar?.replace(/^\/+/, '')}`;
  };

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      finalFocusRef={finalFocusRef}
      size="lg"
    >
      <DrawerOverlay bg="blackAlpha.300" />
      <DrawerContent bg="white" color="black">
        <DrawerCloseButton
          color="black"
          size="lg"
          top={4}
          right={4}
          _hover={{ bg: 'rgba(124, 57, 230, 0.1)' }}
        />

        <DrawerHeader p={0} border="none">
          <Box p={6} pb={4}>
            <Text fontSize="xl" fontWeight="semibold" color="black">
              Contact info
            </Text>
          </Box>
        </DrawerHeader>

        <DrawerBody
          p={0}
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '2px',
            },
          }}
        >
          <VStack spacing={0} align="stretch">
            <Box px={6} pb={6}>
              <VStack spacing={4}>
                <Box
                  w="120px"
                  h="120px"
                  pos="relative"
                  borderRadius="full"
                  overflow="hidden"
                >
                  <NextImage
                    src={getImageUrl(data?.avatar) || '/default-avatar.png'}
                    alt="Avatar"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </Box>

                <VStack spacing={1}>
                  <Heading size="lg" color="black" textAlign="center">
                    {data?.name || ''}
                  </Heading>
                  <Text color="gray.600" fontSize="md">
                    {data?.email || ' '}
                  </Text>
                </VStack>
              </VStack>
            </Box>

            <Box px={6} pb={6}>
              <VStack align="start" spacing={3}>
                <Text fontSize="sm" color="gray.500" fontWeight="medium">
                  Bio
                </Text>
                <Text color="black" fontSize="md" lineHeight="1.5">
                  {data?.bio || 'No bio available'}
                </Text>
              </VStack>
            </Box>

            <Divider borderColor="gray.300" />

            <Box px={6} py={6}>
              <VStack align="start" spacing={4}>
                <HStack justify="space-between" w="full">
                  <HStack spacing={3} align="center">
                    <Icon
                      as={FiImage}
                      color="rgba(124, 57, 230, 1)"
                      boxSize={5}
                    />
                    <Text color="black" fontSize="md" fontWeight="medium">
                      Media, links and docs
                    </Text>
                  </HStack>
                  <Text color="gray.600" fontSize="sm">
                    {data?.mediaItems?.length || 0}
                  </Text>
                </HStack>

                {data?.mediaItems?.length > 0 ? (
                  <Grid templateColumns="repeat(3, 1fr)" gap={2} w="full">
                    {data.mediaItems.map((item) => (
                      <GridItem key={item.id}>
                        <Box
                          position="relative"
                          aspectRatio={1}
                          bg="gray.100"
                          borderRadius="md"
                          overflow="hidden"
                          cursor="pointer"
                          _hover={{ opacity: 0.85 }}
                          transition="opacity 0.2s"
                          border="1px solid rgba(124, 57, 230, 0.2)"
                        >
                          <Image
                            src={item.thumbnail}
                            alt={item.title}
                            w="full"
                            h="full"
                            objectFit="cover"
                            fallback={
                              <Flex
                                w="full"
                                h="full"
                                align="center"
                                justify="center"
                                bg="gray.200"
                              >
                                <Icon
                                  as={getMediaIcon(item.type)}
                                  color="rgba(124, 57, 230, 1)"
                                  boxSize={6}
                                />
                              </Flex>
                            }
                          />

                          {item.duration && (
                            <Box
                              position="absolute"
                              bottom={1}
                              right={1}
                              bg="rgba(0, 0, 0, 0.6)"
                              color="white"
                              fontSize="xs"
                              px={1.5}
                              py={0.5}
                              borderRadius="sm"
                            >
                              {item.duration}
                            </Box>
                          )}
                        </Box>
                      </GridItem>
                    ))}
                  </Grid>
                ) : (
                  <Box
                    w="full"
                    py={4}
                    textAlign="center"
                    bg="gray.50"
                    borderRadius="md"
                  >
                    <Text color="gray.500" fontSize="sm">
                      No media available
                    </Text>
                  </Box>
                )}
              </VStack>
            </Box>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default ContactInfoDrawer;
