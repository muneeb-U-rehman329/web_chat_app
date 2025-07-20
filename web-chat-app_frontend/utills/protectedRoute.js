'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Box, Text, Center, Button } from '@chakra-ui/react';
import Link from 'next/link';

const protectedPatterns = [/^\/messages(?:\/[^\/]+)?$/, /^\/profile$/];

export default function ProtectedRoute({ children }) {
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    const tokenMatch = document.cookie.match(/(^| )token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[2] : null;

    const isProtected = protectedPatterns.some((pattern) =>
      pattern.test(pathname)
    );

    if (!token && isProtected) {
      setAuthorized(false);
    } else {
      setAuthorized(true);
    }
  }, [pathname]);

  if (authorized === null) {
    return null;
  }

  if (!authorized) {
    return (
      <Center minH="100vh" bg="gray.100" px={4}>
        <Box textAlign="center">
          <Text fontSize="3xl" fontWeight="bold" color="red.500">
            404 - Page Not Found
          </Text>
          <Text mt={2} color="gray.600">
            You must be logged in to access this page.
          </Text>
          <Link href="/auth?mode=login">
            <Button mt={4} colorScheme="purple">Login</Button>
          </Link>
        </Box>
      </Center>
    );
  }

  return children;
}
