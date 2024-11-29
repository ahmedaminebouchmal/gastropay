'use client';

import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Container,
  useColorMode,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { FiMenu, FiUser, FiMoon, FiSun } from 'react-icons/fi';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const MotionText = motion(Text);

export default function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        router.push('/login');
        toast({
          title: 'Erfolgreich abgemeldet',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Fehler beim Abmelden',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const isActive = (path: string) => pathname === path;
  const bgColor = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textGradient = useColorModeValue(
    'linear(to-r, brand.500, accent.500)',
    'linear(to-r, brand.400, accent.400)'
  );

  return (
    <Box
      bg={bgColor}
      color={useColorModeValue('gray.800', 'white')}
      position="fixed"
      w="full"
      zIndex={100}
      borderBottom="1px"
      borderColor={borderColor}
      shadow="sm"
    >
      <Container maxW="container.xl">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <IconButton
            size="md"
            icon={<FiMenu />}
            aria-label="Open Menu"
            display={{ md: 'none' }}
            variant="ghost"
          />

          <HStack spacing={8} alignItems="center">
            <Box>
              <Link href="/dashboard">
                <MotionText
                  fontSize="2xl"
                  fontWeight="extrabold"
                  bgGradient={textGradient}
                  bgClip="text"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  GastroPay
                </MotionText>
              </Link>
            </Box>
            <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }}>
              <Link href="/dashboard" passHref>
                <Button
                  variant={isActive('/dashboard') ? 'solid' : 'ghost'}
                  colorScheme={isActive('/dashboard') ? 'brand' : undefined}
                >
                  Dashboard
                </Button>
              </Link>
              <Link href="/dashboard/payments" passHref>
                <Button
                  variant={isActive('/dashboard/payments') ? 'solid' : 'ghost'}
                  colorScheme={isActive('/dashboard/payments') ? 'brand' : undefined}
                >
                  Zahlungen
                </Button>
              </Link>
              <Link href="/dashboard/clients" passHref>
                <Button
                  variant={isActive('/dashboard/clients') ? 'solid' : 'ghost'}
                  colorScheme={isActive('/dashboard/clients') ? 'brand' : undefined}
                >
                  Kunden
                </Button>
              </Link>
            </HStack>
          </HStack>

          <HStack spacing={4}>
            <IconButton
              icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
              onClick={toggleColorMode}
              aria-label="Toggle Color Mode"
              variant="ghost"
            />
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FiUser />}
                variant="ghost"
                aria-label="User Menu"
              />
              <MenuList
                bg={bgColor}
                borderColor={borderColor}
                shadow="lg"
              >
                <MenuItem _hover={{ bg: useColorModeValue('gray.100', 'whiteAlpha.200') }}>
                  Profil
                </MenuItem>
                <MenuItem _hover={{ bg: useColorModeValue('gray.100', 'whiteAlpha.200') }}>
                  Einstellungen
                </MenuItem>
                <MenuDivider />
                <MenuItem
                  color="red.500"
                  _hover={{ bg: useColorModeValue('red.50', 'red.900') }}
                  onClick={handleLogout}
                >
                  Abmelden
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
