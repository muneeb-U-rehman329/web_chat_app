'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  Box,
  InputLeftElement,
  Flex,
  useColorModeValue,
  InputGroup,
  InputRightElement,
  IconButton,
  Text,
  Spinner,
  useToast,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Image,
  VStack,
  HStack,
  useDisclosure,
  Textarea,
  Badge,
  Center,
  Divider,
} from '@chakra-ui/react';
import { FaPaperPlane, FaImage, FaTimes } from 'react-icons/fa';
import { AttachmentIcon } from '@chakra-ui/icons';
import { HiOutlineEmojiHappy } from 'react-icons/hi';
import Picker from '@emoji-mart/react';
import emojiData from '@emoji-mart/data';
import NavBar from '@/modules/NavBars/NavBar';
import io from 'socket.io-client';
import {
  useGetMessagesWithUserQuery,
  useSendMessageMutation,
} from '@/Redux/services/chat';
import { jwtDecode } from 'jwt-decode';
import { useSelector } from 'react-redux';
import { useParams } from 'next/navigation';
import { VariableSizeList } from 'react-window';
import NextImage from 'next/image';

// Extract InputSection as a separate component to isolate re-renders
const InputSection = React.memo(
  ({
    inputText,
    setInputText,
    showEmojiPicker,
    setShowEmojiPicker,
    handleSend,
    handleKeyPress,
    handleEmojiSelect,
    handleImageSelect,
    emojiPickerRef,
    inputRef,
    fileInputRef,
  }) => {
    console.log('InputSection re-rendered');
    const bg = useColorModeValue('white', '#1F2A44');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    return (
      <Flex
        align="center"
        p={3}
        bg={bg}
        boxShadow="0 -2px 10px rgba(0,0,0,0.1)"
        borderTop="1px solid"
        borderColor={borderColor}
        position="relative"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageSelect}
        />
        <Box
          cursor="pointer"
          mr={2}
          onClick={() => fileInputRef.current?.click()}
        >
          <AttachmentIcon boxSize={5} color="gray.500" />
        </Box>
        <InputGroup display="flex" alignItems="center" ml={2}>
          <InputLeftElement>
            <IconButton
              aria-label="emoji"
              color="gray.500"
              bg="transparent"
              _hover={{ bg: 'gray.100' }}
              size="lg"
              fontSize="25px"
              w="fit-content"
              h="fit-content"
              p="3"
              ml="9px"
              mt="10px"
              borderRadius="0.9rem"
              icon={<HiOutlineEmojiHappy />}
              onClick={() => setShowEmojiPicker((prev) => !prev)}
            />
          </InputLeftElement>
          <Input
            ref={inputRef}
            placeholder="Type a message"
            borderRadius="0.9rem"
            bg="white"
            borderColor="gray.300"
            _focus={{
              borderColor: 'purple.500',
              boxShadow: '0 0 0 1px #a78bfa',
            }}
            _placeholder={{ color: 'gray.600' }}
            pr="3.5rem"
            pl="3.2rem"
            py="0.8rem"
            h="auto"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            sx={{
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          />
          <InputRightElement width="3rem">
            <IconButton
              aria-label="Send"
              icon={<FaPaperPlane />}
              color="rgba(124, 57, 230, 0.8)"
              bg="transparent"
              _hover={{ bg: 'gray.100' }}
              size="lg"
              fontSize="22px"
              p="3"
              mr="2px"
              mt="11px"
              borderRadius="0.9rem"
              onClick={handleSend}
            />
          </InputRightElement>
        </InputGroup>

        {showEmojiPicker && (
          <Box
            ref={emojiPickerRef}
            position="absolute"
            bottom="80px"
            left="20px"
            zIndex={1000}
            boxShadow="lg"
            borderRadius="md"
            bg="white"
            sx={{
              '.emoji-mart-search': { display: 'none' },
              '.emoji-mart-preview': { display: 'none' },
            }}
          >
            <Picker
              data={emojiData}
              onEmojiSelect={handleEmojiSelect}
              theme="light"
              previewPosition="none"
            />
          </Box>
        )}
      </Flex>
    );
  }
);

function ChatPage() {
  console.log('ChatPage re-rendered');
  const toast = useToast();
  const bubbleBgMe = useColorModeValue('rgba(124, 57, 230, 0.5)', 'blue.700');
  const bubbleBgOther = useColorModeValue('#EDEEF0', 'gray.600');
  const bubbleColorMe = 'white';
  const bubbleColorOther = useColorModeValue('black', 'white');

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const bottomRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const listRef = useRef(null);
  const itemSizes = useRef({});

  // Image upload modal states
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageCaption, setImageCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Image viewer modal states
  const {
    isOpen: isViewerOpen,
    onOpen: onViewerOpen,
    onClose: onViewerClose,
  } = useDisclosure();
  const [viewerImage, setViewerImage] = useState(null);

  const params = useParams();
  const chatId = params?.chatId;
  const token = useSelector((state) => state.auth.token);
  const decodedToken = token ? jwtDecode(token) : {};
  const myUserId = decodedToken?.id;

  const {
    data: messagesData,
    isLoading,
    isError,
    refetch,
  } = useGetMessagesWithUserQuery(chatId, {
    skip: !chatId,
    pollingInterval: 0,
  });

  const [sendMessage] = useSendMessageMutation();

  const addMessageIfNotExists = useCallback((prev, ...newMsgs) => {
    const uniqueMsgs = newMsgs.filter(
      (msg) => msg._id && !prev.some((m) => m._id === msg._id)
    );
    return [...prev, ...uniqueMsgs].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  }, []);

  // Group messages by sender and timestamp proximity
  const groupedMessages = useMemo(() => {
    console.log('groupedMessages recalculated');
    const groups = [];
    let currentGroup = [];

    messages.forEach((msg, index) => {
      const prevMsg = index > 0 ? messages[index - 1] : null;
      const isSameSender = prevMsg?.sender._id === msg.sender._id;
      const timeDiff = prevMsg
        ? new Date(msg.createdAt) - new Date(prevMsg.createdAt)
        : Infinity;

      if (!isSameSender || timeDiff > 300000 || !prevMsg) {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = [msg];
      } else {
        currentGroup.push(msg);
      }
    });

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }, [messages]);

  useEffect(() => {
    const socketInstance = io(
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
      {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        withCredentials: true,
      }
    );

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      if (chatId) {
        socketInstance.emit('join', chatId);
      }
    });

    socketInstance.on('connect_error', (err) => {
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to chat server',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    });

    socketInstance.on('newMessage', (message) => {
      setMessages((prev) => {
        const updated = addMessageIfNotExists(prev, {
          ...message,
          isMine: message.sender._id === myUserId,
        });
        return updated;
      });
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [chatId, myUserId, toast, addMessageIfNotExists]);

  useEffect(() => {
    if (messagesData?.messages) {
      setMessages((prev) =>
        addMessageIfNotExists(prev, ...messagesData.messages)
      );
    }
  }, [messagesData, addMessageIfNotExists]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        messagesContainerRef.current &&
        messagesContainerRef.current.scrollTop === 0 &&
        !isLoadingMore &&
        messagesData?.hasMore
      ) {
        setIsLoadingMore(true);
        setPage((prev) => prev + 1);
        refetch().then(() => setIsLoadingMore(false));
      }
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [isLoadingMore, messagesData?.hasMore, refetch, page]);

  useEffect(() => {
    if (listRef.current && groupedMessages.length > 0) {
      listRef.current.scrollToItem(groupedMessages.length - 1, 'end');
    }
  }, [groupedMessages]);

  const handleSend = useCallback(async () => {
    const trimmedText = inputText.trim();
    if (!trimmedText || !chatId) {
      toast({
        title: 'Error',
        description: 'Message cannot be empty or chat ID missing',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    setInputText('');
    setShowEmojiPicker(false);

    try {
      await sendMessage({
        chatId,
        text: trimmedText,
      }).unwrap();
    } catch (error) {
      toast({
        title: 'Error sending message',
        description: error?.data?.message || 'Failed to send message',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setInputText(trimmedText);
    }
  }, [inputText, chatId, sendMessage, toast]);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleEmojiSelect = useCallback((emoji) => {
    setInputText((prev) => prev + emoji.native);
    inputRef.current?.focus();
  }, []);

  const handleClickOutside = useCallback((event) => {
    if (
      emojiPickerRef.current &&
      !emojiPickerRef.current.contains(event.target)
    ) {
      setShowEmojiPicker(false);
    }
  }, []);

  const handleImageSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
          onOpen();
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  }, [onOpen, toast]);

  const handleImageSend = useCallback(async () => {
    if (!selectedImage || !chatId) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('chatId', chatId);
      if (imageCaption.trim()) {
        formData.append('text', imageCaption.trim());
      }

      await sendMessage({
        chatId,
        image: formData,
      }).unwrap();

      setSelectedImage(null);
      setImagePreview(null);
      setImageCaption('');
      onClose();

      toast({
        title: 'Image sent successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error sending image',
        description: error?.data?.message || 'Failed to send image',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  }, [selectedImage, chatId, imageCaption, sendMessage, onClose, toast]);

  const handleModalClose = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageCaption('');
    onClose();
  }, [onClose]);

  const handleImageView = useCallback((imageSrc) => {
    setViewerImage(imageSrc);
    onViewerOpen();
  }, [onViewerOpen]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const getItemSize = useCallback(
    (index) => {
      console.log(`Calculating size for group ${index}`);
      const group = groupedMessages[index];
      if (!group || group.length === 0) return 60;

      let totalHeight = 15; // Base padding
      group.forEach((msg) => {
        if (msg.image) {
          totalHeight += 270;
        }
        if (msg.text) {
          const textLines = Math.ceil(msg.text.length / 40);
          totalHeight += Math.max(80, textLines * 20 + 20);
        }
        totalHeight += 8;
      });

      return Math.max(totalHeight, 80);
    },
    [groupedMessages]
  );

  useEffect(() => {
    groupedMessages.forEach((group, index) => {
      if (!itemSizes.current[index]) {
        itemSizes.current[index] = getItemSize(index);
      }
    });
    if (listRef.current) {
      listRef.current.resetAfterIndex(0); // Reset item sizes after update
    }
  }, [groupedMessages, getItemSize]);

  const Row = React.memo(
    useCallback(
      ({ index, style }) => {
        console.log(`Row ${index} re-rendered`);
        const group = groupedMessages[index];
        const isMine = group[0].isMine;
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

        return (
          <Box style={style} w="100%" px={4} py={2}>
            <Flex
              direction="column"
              align={isMine ? 'flex-end' : 'flex-start'}
              w="100%"
              maxW="100%"
            >
              {group.map((msg, i) => (
                <Box
                  key={msg._id || i}
                  mb={i < group.length - 1 ? 2 : 0}
                  maxW={{ base: '85%', md: '70%' }}
                  w="fit-content"
                >
                  {msg.image && (
                    <Box
                      mb={msg.text ? 2 : 0}
                      display="flex"
                      justifyContent={isMine ? 'flex-end' : 'flex-start'}
                      w="100%"
                    >
                      <Box
                        w="250px"
                        h="250px"
                        border={
                          isMine
                            ? '2px solid rgba(124, 57, 230, 0.8)'
                            : '2px solid #E2E8F0'
                        }
                        borderRadius="12px"
                        overflow="hidden"
                        cursor="pointer"
                        onClick={() =>
                          handleImageView(
                            msg.image.includes('http')
                              ? msg.image
                              : `${baseUrl}${msg.image}`
                          )
                        }
                        bg="white"
                        boxShadow="sm"
                        position="relative"
                      >
                        <NextImage
                          src={
                            msg.image.includes('http')
                              ? msg.image
                              : `${baseUrl}${msg.image}`
                          }
                          alt="Sent image"
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="250px"
                          onLoad={() => console.log(`Image loaded for message ${msg._id}`)}
                          onError={(e) => {
                            console.log(`Image failed to load for message ${msg._id}`);
                            e.target.style.display = 'none';
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                  {msg.text && (
                    <Flex
                      textOverflow="ellipsis"
                      wordBreak="break-word"
                      overflowWrap="break-word"
                      bg={isMine ? bubbleBgMe : bubbleBgOther}
                      color={isMine ? bubbleColorMe : bubbleColorOther}
                      p={3}
                      borderRadius={
                        isMine ? '16px 16px 0 16px' : '16px 16px 16px 0'
                      }
                      boxShadow="sm"
                      align="center"
                      w="100%"
                      maxW="400px"
                    >
                      <Text fontSize="md" flex="1">
                        {msg.text}
                      </Text>
                      <Text
                        fontSize="xs"
                        minW="4rem"
                        position="relative"
                        bottom="0px"
                        top="8px"
                        color={isMine ? 'whiteAlpha.800' : 'blackAlpha.600'}
                        textAlign="right"
                        ml={2}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </Flex>
                  )}
                </Box>
              ))}
            </Flex>
          </Box>
        );
      },
      [
        groupedMessages,
        bubbleBgMe,
        bubbleBgOther,
        bubbleColorMe,
        bubbleColorOther,
        handleImageView,
      ]
    )
  );

  return (
    <Box h="100vh" display="flex" flexDirection="column">
      <NavBar />
      <Flex direction="column" flex="1" overflow="hidden">
        <Box
          ref={messagesContainerRef}
          flex="1"
          overflowY="auto"
          px={2}
          py={1}
          css={{
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            msOverflowStyle: 'none',
          }}
        >
          {isLoading ? (
            <Flex justify="center" align="center" h="100%">
              <Spinner size="xl" color="purple.500" />
            </Flex>
          ) : isError ? (
            <Flex justify="center" align="center" h="100%">
              <Text color="red.500">Error loading messages</Text>
            </Flex>
          ) : messages.length === 0 ? (
            <Flex justify="center" align="center" h="100%">
              <Text color="gray.500">No messages found</Text>
            </Flex>
          ) : (
            <>
              {isLoadingMore && (
                <Flex justify="center" align="center" py={2}>
                  <Spinner size="md" color="purple.500" />
                </Flex>
              )}
              <VariableSizeList
                ref={listRef}
                height={messagesContainerRef.current?.clientHeight || window.innerHeight - 150}
                width="100%"
                itemCount={groupedMessages.length}
                itemSize={getItemSize}
                overscanCount={10}
              >
                {Row}
              </VariableSizeList>
              <div ref={bottomRef} />
            </>
          )}
        </Box>

        <InputSection
          inputText={inputText}
          setInputText={setInputText}
          showEmojiPicker={showEmojiPicker}
          setShowEmojiPicker={setShowEmojiPicker}
          handleSend={handleSend}
          handleKeyPress={handleKeyPress}
          handleEmojiSelect={handleEmojiSelect}
          handleImageSelect={handleImageSelect}
          emojiPickerRef={emojiPickerRef}
          inputRef={inputRef}
          fileInputRef={fileInputRef}
        />
      </Flex>

      {/* Image Upload Modal */}
      <Modal isOpen={isOpen} onClose={handleModalClose} size="lg" isCentered>
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent
          bg={useColorModeValue('white', '#1F2A44')}
          borderRadius="0.9rem"
          boxShadow="0 10px 25px rgba(0,0,0,0.1)"
          border="1px solid"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          overflow="hidden"
        >
          <ModalHeader
            bg={useColorModeValue('white', '#1F2A44')}
            color={useColorModeValue('black', 'white')}
            py={4}
            px={6}
            fontSize="lg"
            fontWeight="600"
            borderBottom="1px solid"
            borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
          >
            <HStack spacing={3}>
              <Box
                bg="rgba(124, 57, 230, 0.1)"
                p={2}
                borderRadius="0.9rem"
                color="rgba(124, 57, 230, 0.8)"
              >
                <FaImage size="18px" />
              </Box>
              <Text>Send Image</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton
            color={useColorModeValue('gray.500', 'gray.400')}
            _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
            size="lg"
            borderRadius="0.9rem"
          />
          <ModalBody p={0}>
            <VStack spacing={0} align="stretch">
              <Box
                position="relative"
                bg={useColorModeValue('gray.50', 'gray.800')}
                minH="300px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Selected image"
                    maxH="400px"
                    maxW="100%"
                    objectFit="contain"
                    borderRadius="0.9rem"
                  />
                ) : (
                  <VStack
                    spacing={4}
                    color={useColorModeValue('gray.400', 'gray.500')}
                  >
                    <FaImage size="48px" />
                    <Text fontSize="lg">No image selected</Text>
                  </VStack>
                )}
              </Box>
              <Divider borderColor={useColorModeValue('gray.200', 'gray.700')} />
              <Box p={6}>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="600"
                      color={useColorModeValue('gray.700', 'gray.300')}
                      mb={2}
                    >
                      Add a caption (optional)
                    </Text>
                    <Textarea
                      value={imageCaption}
                      onChange={(e) => setImageCaption(e.target.value)}
                      placeholder="Write a caption for your image..."
                      resize="none"
                      minH="80px"
                      borderRadius="0.9rem"
                      bg={useColorModeValue('white', '#1F2A44')}
                      border="1px solid"
                      borderColor={useColorModeValue('gray.300', 'gray.600')}
                      _focus={{
                        borderColor: 'purple.500',
                        boxShadow: '0 0 0 1px #a78bfa',
                      }}
                      _placeholder={{
                        color: useColorModeValue('gray.600', 'gray.400'),
                      }}
                    />
                  </Box>
                  {selectedImage && (
                    <HStack justify="space-between" align="center">
                      <VStack align="start" spacing={1}>
                        <Text
                          fontSize="sm"
                          color={useColorModeValue('gray.600', 'gray.400')}
                          fontWeight="500"
                        >
                          {selectedImage.name}
                        </Text>
                        <Badge
                          bg="rgba(124, 57, 230, 0.1)"
                          color="rgba(124, 57, 230, 0.8)"
                          fontSize="xs"
                          borderRadius="full"
                          px={2}
                        >
                          {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                        </Badge>
                      </VStack>
                      <IconButton
                        aria-label="Remove image"
                        icon={<FaTimes />}
                        size="sm"
                        variant="ghost"
                        color={useColorModeValue('red.500', 'red.400')}
                        _hover={{ bg: useColorModeValue('red.50', 'red.900') }}
                        borderRadius="0.9rem"
                        onClick={handleModalClose}
                      />
                    </HStack>
                  )}
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter bg={useColorModeValue('gray.50', '#1A202C')} p={6}>
            <HStack spacing={3} w="100%">
              <Button
                variant="outline"
                onClick={handleModalClose}
                borderRadius="0.9rem"
                px={8}
                py={2}
                h="auto"
                borderColor={useColorModeValue('gray.300', 'gray.600')}
                color={useColorModeValue('gray.700', 'gray.300')}
                _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
              >
                Cancel
              </Button>
              <Button
                bg="rgba(124, 57, 230, 0.8)"
                color="white"
                onClick={handleImageSend}
                isLoading={isUploading}
                loadingText="Sending..."
                borderRadius="0.9rem"
                px={8}
                py={2}
                h="auto"
                _hover={{
                  bg: 'rgba(124, 57, 230, 0.9)',
                  transform: 'translateY(-1px)',
                }}
                _active={{
                  bg: 'rgba(124, 57, 230, 1)',
                  transform: 'translateY(0px)',
                }}
                transition="all 0.2s ease"
                flex={1}
              >
                Send Image
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal isOpen={isViewerOpen} onClose={onViewerClose} size="lg" isCentered>
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent
          bg={useColorModeValue('white', '#1F2A44')}
          borderRadius="0.9rem"
          boxShadow="0 10px 25px rgba(0,0,0,0.1)"
          border="1px solid"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          overflow="hidden"
        >
          <ModalHeader
            bg={useColorModeValue('white', '#1F2A44')}
            color={useColorModeValue('black', 'white')}
            py={4}
            px={6}
            fontSize="lg"
            fontWeight="600"
            borderBottom="1px solid"
            borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
          >
            <HStack spacing={3}>
              <Box
                bg="rgba(124, 57, 230, 0.1)"
                p={2}
                borderRadius="0.9rem"
                color="rgba(124, 57, 230, 0.8)"
              >
                <FaImage size="18px" />
              </Box>
              <Text>View Image</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton
            color={useColorModeValue('gray.500', 'gray.400')}
            _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
            size="lg"
            borderRadius="0.9rem"
          />
          <ModalBody p={6}>
            <VStack spacing={4} align="stretch">
              <Box
                position="relative"
                bg={useColorModeValue('gray.50', 'gray.800')}
                minH="300px"
                maxH="500px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="0.9rem"
                overflow="hidden"
              >
                {viewerImage && (
                  <NextImage
                    src={viewerImage}
                    alt="Viewed image"
                    width={500}
                    height={500}
                    style={{ objectFit: 'contain' }}
                    onLoad={() => console.log('Viewer image loaded:', viewerImage)}
                    onError={() => console.log('Viewer image failed to load:', viewerImage)}
                  />
                )}
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter bg={useColorModeValue('gray.50', '#1A202C')} p={6}>
            <Button
              variant="outline"
              onClick={onViewerClose}
              borderRadius="0.9rem"
              px={8}
              py={2}
              h="auto"
              borderColor={useColorModeValue('gray.300', 'gray.600')}
              color={useColorModeValue('gray.700', 'gray.300')}
              _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default ChatPage;