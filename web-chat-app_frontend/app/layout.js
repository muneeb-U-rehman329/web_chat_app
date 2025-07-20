import { Inter } from 'next/font/google';
import { ChakraProvider, Flex, Box } from '@chakra-ui/react';
import theme from '../theme';
import ClientWrapper from '@/app/clientWrapper';
import PageLoader from '@/Components/Loader/PageLoader';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata = {
  title: 'Chat App',
  description: 'A simple chat app using Next.js and Chakra UI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
        <body className="antialiased bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-white transition-colors duration-300">
      <ChakraProvider theme={theme}>
          <PageLoader />
          <Flex
            minH="100vh"
            overflow="hidden"
            flexDir={{ base: 'column', md: 'row' }}
          >
            <ClientWrapper>
              <Box flex="1" overflowY="auto" maxH="100vh" overflowX="hidden">
                {children}
              </Box>
            </ClientWrapper>
          </Flex>
      </ChakraProvider>
        </body>
    </html>
  );
}
