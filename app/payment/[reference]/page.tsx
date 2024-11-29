'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';

export default function CheckoutPage() {
  const params = useParams();
  const { reference } = params;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        const response = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reference }),
        });

        const { url } = await response.json();
        if (url) {
          window.location.href = url;
        }
      } catch (error) {
        console.error('Error initializing checkout:', error);
      }
    };

    initializeCheckout();
  }, [reference]);

  return (
    <Container maxW="container.sm" py={10}>
      <VStack spacing={6}>
        <Heading size="lg">Initialisiere Zahlung...</Heading>
        <Spinner size="xl" color="brand.500" />
      </VStack>
    </Container>
  );
}
