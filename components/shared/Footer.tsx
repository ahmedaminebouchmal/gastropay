'use client';

import {
  Box,
  Container,
  Text,
  Button,
  useColorModeValue,
  VStack,
  HStack,
  useToast,
  Icon,
} from '@chakra-ui/react';
import { FiMail, FiCheck } from 'react-icons/fi';

export function Footer() {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const toast = useToast();

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('bouchmalaabesp@gmail.com');
      toast({
        title: 'E-Mail kopiert',
        description: 'Die E-Mail-Adresse wurde in die Zwischenablage kopiert.',
        status: 'success',
        duration: 3000,
        isClosable: true,
        icon: <Icon as={FiCheck} />,
      });
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'E-Mail-Adresse konnte nicht kopiert werden.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      as="footer"
      py={8}
      bg={bgColor}
      borderTop="1px"
      borderColor={borderColor}
      mt="auto"
    >
      <Container maxW="container.xl">
        <VStack spacing={6} align="stretch">
          <Box>
            <Text fontSize="sm" color={textColor} textAlign="center" mb={4}>
              Haftungsausschluss
            </Text>
            <Text fontSize="xs" color={textColor} textAlign="center" maxW="3xl" mx="auto" lineHeight="1.6">
              Dieses Projekt ist ein unabhängiges Entwicklungsprojekt und steht in keinerlei Verbindung 
              zur GastroPay GmbH. Es handelt sich hierbei um eine eigenständige Implementierung, die 
              ausschließlich zu Demonstrationszwecken entwickelt wurde. Alle verwendeten Namen, Marken 
              und Warenzeichen sind Eigentum ihrer jeweiligen Inhaber.
            </Text>
          </Box>

          <HStack justify="center" spacing={4}>
            <Button
              leftIcon={<FiMail />}
              size="sm"
              variant="outline"
              colorScheme="purple"
              onClick={handleCopyEmail}
            >
              Kontakt aufnehmen
            </Button>
          </HStack>

          <Text fontSize="xs" color={textColor} textAlign="center">
            © {new Date().getFullYear()} - Entwickelt als Demonstrationsprojekt
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
