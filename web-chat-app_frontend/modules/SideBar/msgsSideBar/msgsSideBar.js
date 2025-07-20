'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Spinner,
  Center,
  Button,
  HStack,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { MdAddBox, MdRefresh } from 'react-icons/md';
import Input from '@/Components/Input/input';
import Chat from '@/Components/chatsList/chat';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import StartChatDrawer from '../../../modules/Drawer/StartChart/startChart';
import { useChatListQuery } from '@/Redux/services/chatList';
import io from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

const TabSelector = ({ activeTab, setActiveTab }) => {
  const tabs = ['All', 'Unread', 'Groups', 'Contacts', 'Favorites'];

  return (
    <Box bg="purple.100" p="0.4rem" rounded="full" display="inline-block">
      <HStack spacing="2">
        {tabs.map((tab) => (
          <Button
            key={tab}
            onClick={() => setActiveTab(tab)}
            borderRadius="full"
            fontWeight="500"
            fontSize="sm"
            bg={activeTab === tab ? 'white' : 'transparent'}
            color={activeTab === tab ? 'purple.600' : 'purple.700'}
            px="4"
            py="2"
            height="auto"
            border="none"
            boxShadow={
              activeTab === tab
                ? 'inset 1px 1px 4px rgba(0,0,0,0.1), inset -1px -1px 4px rgba(255,255,255,0.4), sm'
                : 'none'
            }
            _hover={{ bg: activeTab === tab ? 'white' : 'purple.200' }}
            _active={{ bg: activeTab === tab ? 'white' : 'purple.300' }}
            transition="all 0.2s ease"
          >
            {tab}
          </Button>
        ))}
      </HStack>
    </Box>
  );
};

const PAGE_SIZE = 20;

function MsgsSideBar() {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [chats, setChats] = useState([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [socket, setSocket] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const containerRef = useRef();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const params = useParams();
  const activeId = params?.id;
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: chatData, isLoading: isFetching, refetch } = useChatListQuery();

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
      if (socketInstance.userId) {
        socketInstance.emit('joinUserRoom', socketInstance.userId);
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

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const updateChatList = useCallback((updatedChat) => {
    setChats(prev => {
      const existingIndex = prev.findIndex(c => c.id === updatedChat.chatId);
      const newChat = {
        id: updatedChat.chatId,
        name: updatedChat.participant?.name || 'Unknown',
        message: updatedChat.lastMessage || 'No messages yet',
        time: updatedChat.lastMessageTime
          ? new Date(updatedChat.lastMessageTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })
          : '',
        image: updatedChat.participant?.avatar || '',
        unreadCount: updatedChat.unreadCount || 0
      };

      let newChats;
      if (existingIndex >= 0) {
        newChats = [...prev];
        newChats[existingIndex] = newChat;
      } else {
        newChats = [newChat, ...prev];
      }

      return [...newChats].sort((a, b) => {
        const timeA = a.time ? new Date(a.time) : new Date(0);
        const timeB = b.time ? new Date(b.time) : new Date(0);
        return timeB - timeA;
      });
    });
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleUpdateChatList = (data) => {
      updateChatList(data);
      setForceUpdate(prev => prev + 1);
    };

    const handleNewMessage = (message) => {
      setChats(prev => {
        const updated = prev.map(chat => {
          if (chat.id === message.chatId) {
            return {
              ...chat,
              message: message.text,
              time: new Date(message.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              }),
              unreadCount: activeId === message.chatId ? 0 : chat.unreadCount + 1
            };
          }
          return chat;
        });
        return [...updated].sort((a, b) => new Date(b.time) - new Date(a.time));
      });
      setForceUpdate(prev => prev + 1);
    };

    socket.on('updateChatList', handleUpdateChatList);
    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('updateChatList', handleUpdateChatList);
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, activeId, updateChatList]);

  useEffect(() => {
    if (forceUpdate > 0) {
      setChats(prev => [...prev]);
    }
  }, [forceUpdate]);

  useEffect(() => {
    if (chatData?.chats) {
      const formatted = chatData.chats.map(chat => ({
        id: chat.chatId,
        name: chat.participant?.name || chat.user?.name || 'Unknown',
        message: chat.lastMessage || 'No messages yet',
        time: chat.lastMessageTime
          ? new Date(chat.lastMessageTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })
          : '',
        image: chat.participant?.avatar || chat.user?.avatar,
        unreadCount: chat.unreadCount || 0,
      }));
      setChats(formatted);
    }
  }, [chatData]);

  return (
    <Box
      borderRight="1.5px solid rgba(28, 28, 28, 0.2)"
      height="100vh"
      width="30rem"
      display="flex"
      flexDirection="column"
      overflowX="hidden"
    >
      <Box position="sticky" top="0" zIndex="10" pt={9} pb={4} px={8} bg="white">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading>Messages</Heading>
          <HStack spacing={4}>
            <Button 
              leftIcon={<MdRefresh />} 
              size="sm" 
              onClick={() => {
                refetch();
                setForceUpdate(prev => prev + 1);
                toast({
                  title: 'Refreshed',
                  status: 'success',
                  duration: 1000,
                  isClosable: true,
                  description: 'Chat list refreshed successfully',
                  position: 'top-right',
                });
              }}
            >
              Refresh
            </Button>
            <Box fontSize="35px" cursor="pointer" color="#7C39E6" onClick={onOpen}>
              <MdAddBox />
            </Box>
          </HStack>
        </Flex>

        <Box mt={5}>
          <Input
            placeholder="Search chats..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Box>

        <Flex mt={5} mb={2}>
          <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} />
        </Flex>
      </Box>

      <Box overflowY="auto" flexGrow={1} mt={2} px={4} ref={containerRef}>
        {chats.length > 0 ? (
          chats.map((chat) => (
            <Link key={`${chat.id}-${forceUpdate}`} href={`/messages/${chat.id}`} passHref>
              <Chat
                chatId={chat.id}
                activeId={activeId}
                name={chat.name}
                message={chat.message}
                time={chat.time}
                image={chat.image}
                unreadCount={chat.unreadCount}
                avatar={chat.image}
              />
            </Link>
          ))
        ) : (
          <Center mt={10}>
            <Text color="gray.500">No chats found</Text>
          </Center>
        )}
      </Box>

      <StartChatDrawer isOpen={isOpen} onClose={onClose} />
    </Box>
  );
}

export default MsgsSideBar;