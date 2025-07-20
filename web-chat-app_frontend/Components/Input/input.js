// InputWithIcon.jsx
import { Box, Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import React from 'react';

function InputWithIcon({ value, onChange }) {
  return (
    <Box>
      <InputGroup mt={3} width="100%">
        <InputLeftElement pointerEvents="none" pl="5" mt="5px" color="#7C39E6">
          <FiSearch fontSize="20px" />
        </InputLeftElement>
        <Input
          placeholder="Search chats..."
          value={value}
          onChange={onChange}
          borderRadius="0.5rem"
          height="50px"
          paddingLeft="3rem"
          paddingRight="5"
          bg="rgba(28, 28, 28, 0.05)"
          _focus={{
            border: '1px solid #7C39E6',
            boxShadow: '0 0 0 1px #7C39E6',
            transition: 'all 0.2s ease',
          }}
        />
      </InputGroup>
    </Box>
  );
}

export default InputWithIcon;
