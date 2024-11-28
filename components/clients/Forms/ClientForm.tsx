import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  FormErrorMessage,
  SimpleGrid,
  useColorModeValue,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = yup.object().shape({
  name: yup.string().required('Name ist erforderlich'),
  email: yup.string().email('Ungültige E-Mail').required('E-Mail ist erforderlich'),
  address: yup.string().required('Adresse ist erforderlich'),
  phone: yup.string().required('Telefonnummer ist erforderlich'),
  company: yup.string().required('Firma ist erforderlich'),
  vatNumber: yup.string().required('USt-IdNr. ist erforderlich'),
});

interface ClientFormData {
  name: string;
  email: string;
  address: string;
  phone: string;
  company: string;
  vatNumber: string;
}

export function ClientForm() {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ClientFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ClientFormData) => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to save client
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast({
        title: 'Kunde erstellt',
        description: 'Der Kunde wurde erfolgreich angelegt.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      reset();
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Der Kunde konnte nicht angelegt werden.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="xl"
      boxShadow="xl"
      border="1px"
      borderColor={borderColor}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing={6}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
            <FormControl isInvalid={!!errors.name}>
              <FormLabel>Name</FormLabel>
              <Input {...register('name')} />
              <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.email}>
              <FormLabel>E-Mail</FormLabel>
              <Input {...register('email')} type="email" />
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.phone}>
              <FormLabel>Telefon</FormLabel>
              <Input {...register('phone')} />
              <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.company}>
              <FormLabel>Firma</FormLabel>
              <Input {...register('company')} />
              <FormErrorMessage>{errors.company?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.vatNumber}>
              <FormLabel>USt-IdNr.</FormLabel>
              <Input {...register('vatNumber')} />
              <FormErrorMessage>{errors.vatNumber?.message}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>

          <FormControl isInvalid={!!errors.address}>
            <FormLabel>Adresse</FormLabel>
            <Input {...register('address')} />
            <FormErrorMessage>{errors.address?.message}</FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            colorScheme="purple"
            size="lg"
            w="full"
            isLoading={isLoading}
          >
            Kunde anlegen
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
