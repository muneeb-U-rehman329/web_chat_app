// components/StartChatDrawer.jsx
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Input,
  Button,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useAddChartMutation } from '@/Redux/services/chatList';

const StartChatDrawer = ({ isOpen, onClose, onAddChat }) => {
  const [email, setEmail] = useState('');
  const toast = useToast();

  const [addChat] = useAddChartMutation();

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Enter a valid email to start chatting.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const result = await addChat(email).unwrap();

      toast({
        title: 'Chat Added',
        description: `Chat with ${email} has been added successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onAddChat(result);
      setEmail('');
      onClose();
    } catch (error) {
      toast({
        title: 'Error Adding Chat',
        description:
          error?.data?.message ||
          error.message ||
          'Something went wrong while adding the chat.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Drawer size={'sm'} isOpen={isOpen} placement="left" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader borderBottomWidth="1px">
          Start a New Conversation
        </DrawerHeader>

        <DrawerBody mt={4}>
          <Text mb={2}>Enter user's email:</Text>
          <Input
            _focus={{
              border: '1px solid #7C39E6',
              boxShadow: '0 0 0 1px #7C39E6',
              transition: 'all 0.2s ease',
            }}
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </DrawerBody>

        <DrawerFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="purple" onClick={handleSubmit}>
            Add Chat
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default StartChatDrawer;
