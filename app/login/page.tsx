'use client';

import {
  Box,
  Container,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  useColorModeValue,
  InputGroup,
  InputRightElement,
  IconButton,
  Flex,
  useToast,
  Link,
  HStack,
  Tooltip,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import GastropayLogo from '@/components/animations/GastropayLogo';
import LoadingButton from '@/components/animations/LoadingButton';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { translations } from '@/translations/de';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const { login: t } = translations;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: t.loginSuccess,
          description: t.welcomeMessage,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        router.push('/dashboard');
      } else {
        setError(data.error || t.loginFailed);
        toast({
          title: t.loginFailed,
          description: data.error || t.invalidCredentials,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      setError(t.errorOccurred);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3,
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <MotionFlex
      minH="100vh"
      align="center"
      justify="center"
      bg={useColorModeValue('gray.50', 'gray.900')}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Container
        maxW="lg"
        py={{ base: '12', md: '16' }}
        px={{ base: '0', sm: '8' }}
        position="relative"
      >
        {/* Theme Toggle */}
        <Box 
          position="absolute" 
          top={4} 
          right={4}
          color={useColorModeValue('gray.800', 'white')}
        >
          <Tooltip label={useColorModeValue('Dunkelmodus aktivieren', 'Hellmodus aktivieren')}>
            <Box>
              <ThemeToggle />
            </Box>
          </Tooltip>
        </Box>

        <Stack spacing="8">
          <Stack spacing="6" align="center">
            <GastropayLogo />
            <Stack spacing="3" textAlign="center">
              <Text
                fontSize="xl"
                fontWeight="bold"
                bgGradient="linear(to-r, purple.500, pink.500)"
                bgClip="text"
              >
                {t.title}
              </Text>
              <Text color={useColorModeValue('gray.600', 'gray.400')}>
                {t.subtitle}
              </Text>
            </Stack>
          </Stack>

          <MotionBox
            variants={formVariants}
            py={{ base: '0', sm: '8' }}
            px={{ base: '4', sm: '10' }}
            bg={useColorModeValue('white', 'gray.800')}
            boxShadow="xl"
            borderRadius="xl"
            border="1px"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
          >
            <form onSubmit={handleSubmit}>
              <Stack spacing="6">
                <Stack spacing="5">
                  <FormControl>
                    <FormLabel htmlFor="email" color={useColorModeValue('gray.700', 'gray.200')}>{t.email}</FormLabel>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      size="lg"
                      borderRadius="md"
                      color={useColorModeValue('gray.800', 'white')}
                      borderColor={useColorModeValue('gray.300', 'gray.600')}
                      _focus={{
                        borderColor: 'purple.500',
                        boxShadow: '0 0 0 1px purple.500',
                      }}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel htmlFor="password" color={useColorModeValue('gray.700', 'gray.200')}>{t.password}</FormLabel>
                    <InputGroup size="lg">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        borderRadius="md"
                        color={useColorModeValue('gray.800', 'white')}
                        borderColor={useColorModeValue('gray.300', 'gray.600')}
                        _focus={{
                          borderColor: 'purple.500',
                          boxShadow: '0 0 0 1px purple.500',
                        }}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showPassword ? t.hidePassword : t.showPassword}
                          icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                          onClick={() => setShowPassword(!showPassword)}
                          variant="ghost"
                          color="gray.400"
                          _hover={{ color: 'purple.500' }}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                </Stack>
                {error && (
                  <Text color="red.500" fontSize="sm" textAlign="center">
                    {error}
                  </Text>
                )}
                <LoadingButton
                  type="submit"
                  size="lg"
                  fontSize="md"
                  isLoading={isLoading}
                >
                  {isLoading ? t.signingIn : t.signIn}
                </LoadingButton>
              </Stack>
            </form>
          </MotionBox>

          {/* Disclaimer */}
          <Box textAlign="center" px={4}>
            <Text
              fontSize="sm"
              color={useColorModeValue('gray.600', 'gray.400')}
              mt={4}
            >
              Diese Website wurde von Ahmed Amine Bouchmal entwickelt und steht in keiner Beziehung oder geschäftlichen Verbindung zur Gastropay GmbH.
            </Text>
            <Text
              fontSize="xs"
              color={useColorModeValue('gray.500', 'gray.500')}
              mt={2}
            >
              This website was built by Ahmed Amine Bouchmal and has no relations or business purpose to Gastropay GmbH.
            </Text>
          </Box>
        </Stack>
      </Container>
    </MotionFlex>
  );
}
