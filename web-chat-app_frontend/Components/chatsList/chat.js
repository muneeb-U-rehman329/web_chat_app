import NextImage from 'next/image';
import { Box, Flex, Text, Badge } from '@chakra-ui/react';

function Chat({
  chatId,
  name,
  message,
  avatar,
  time,
  activeId,
  unreadCount = 0,
}) {
  const isActive = chatId === activeId;

  const getImageUrl = (avatar) => {
    const isFull = avatar?.startsWith('http://') || avatar?.startsWith('https://');
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return isFull ? avatar : `${base}/${avatar?.replace(/^\/+/, '')}`;
  };

  return (
    <Flex
      overflowX={'hidden'}
      ml={4}
      justifyContent={'space-between'}
      alignItems="center"
      bg={isActive ? 'rgba(105, 116, 124, 0.1)' : 'white'}
      borderRadius={'0.8rem'}
      py={3}
      px={4}
      my={2}
      cursor={'pointer'}
      transition={'all 0.2s ease'}
      _hover={{
        bg: isActive ? 'rgba(105, 116, 124, 0.15)' : 'rgba(105, 116, 124, 0.1)',
      }}
      _active={{
        transform: 'scale(0.98)',
        transition: 'all 0.2s ease',
      }}
    >
      <Flex gap={3}>
        <Box w="50px" h="50px" pos="relative" borderRadius="full" overflow="hidden">
          <NextImage
            src={getImageUrl(avatar) || '/default-avatar.png'}
            alt="Avatar"
            fill
            style={{ objectFit: 'cover' }}
          />
        </Box>
        <Flex flexDir={'column'}>
          <Text fontSize={'xl'} fontWeight={'bold'}>
            {name}
          </Text>
          <Text fontSize={"0.9rem"} color={'gray.500'} maxW="200px" isTruncated>
            Start Chat
          </Text>
        </Flex>
      </Flex>

      <Flex flexDir="column" alignItems="flex-end" ml={3} gap={1}>
        <Text fontSize="sm" color="gray.600">
          {time}
        </Text>
        {/* {unreadCount > 0 && (
          <Badge
            colorScheme="green"
            borderRadius="full"
            fontSize="xs"
            px={2}
            py={0.5}
          >
            {unreadCount}
          </Badge>
        )} */}
      </Flex>
    </Flex>
  );
}

export default Chat;
