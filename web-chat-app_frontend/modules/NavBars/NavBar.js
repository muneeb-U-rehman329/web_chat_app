import React from 'react';
import { Box, Flex, Image, Text } from '@chakra-ui/react';
import { IoCall } from 'react-icons/io5';
import AboutSlider from '@/modules/AboutSlider/aboutSlider';
import { useDisclosure } from '@chakra-ui/react';
import { useRef } from 'react';
import { useGetRecieverProfileQuery } from '@/Redux/services/profile';
import { useParams } from 'next/navigation';
import NextImage from 'next/image';
function Menu_bar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef();
  const params = useParams();

  const { data: recieverProfile, isLoading } = useGetRecieverProfileQuery(
    params.chatId
  );

  const data = recieverProfile?.receiver || {};

  const getImageUrl = (avatar) => {
    const isFull =
      avatar?.startsWith('http://') || avatar?.startsWith('https://');
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return isFull ? avatar : `${base}/${avatar?.replace(/^\/+/, '')}`;
  };

  return (
    <Flex
      borderBottom={'1px solid rgba(0, 0, 0, 0.1)'}
      alignItems={'center'}
      pb={2}
      pr={8}
      justifyContent={'space-between'}
      mt={5}
    >
      <Flex
        onClick={onOpen}
        ref={btnRef}
        roundedRight={'0.8rem'}
        transition={'0.1s all ease-in'}
        cursor={'pointer'}
        w={'18rem'}
        py={3}
        px={6}
        _hover={{
          bg: 'rgba(105, 116, 124, 0.1)',
        }}
        gap={4}
        alignItems={'center'}
      >
        <Box
          w="50px"
          h="50px"
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
        <Flex flexDir={'column'}>
          <Text fontSize={'xl'} fontWeight={'bold'}>
            {data?.name}
          </Text>
          <Flex mt={'-1px'} alignItems={'center'} gap={2}>
            {/* <Box
              rounded={'4rem'}
              bg={'green.400'}
              mt={'1px'}
              w={'12px'}
              h={'12px'}
            ></Box> */}
            <Text color={'#737373'} fontSize={'sm'} fontWeight={600}>
              @{data?.username || ''}
            </Text>
          </Flex>
        </Flex>
      </Flex>
      <Flex
        justifyContent={'center'}
        alignItems={'center'}
        _active={{
          transform: 'scale(0.97)',
        }}
        gap={2}
        bg={'purple.100'}
        rounded={'0.8rem'}
        transition={'0.1s all ease-in'}
        cursor={'pointer'}
        h={'3rem'}
        px={3}
        fontSize={'2xl'}
      >
        <IoCall color="rgba(124, 57, 230, 0.8)" />
        <Text
          fontWeight={'500'}
          fontSize={'20px'}
          color={'rgba(124, 57, 230, 1)'}
        >
          Call
        </Text>
      </Flex>

      <AboutSlider isOpen={isOpen} onClose={onClose} finalFocusRef={btnRef} data = {data} />
    </Flex>
  );
}

export default Menu_bar;
