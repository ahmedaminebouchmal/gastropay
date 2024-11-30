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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = yup.object().shape({
  fullName: yup.string().required('Name ist erforderlich'),
  email: yup.string().email('Ungültige E-Mail').required('E-Mail ist erforderlich'),
  phoneNumber: yup
    .string()
    .required('Telefonnummer ist erforderlich')
    .min(7, 'Telefonnummer muss mindestens 7 Zeichen lang sein')
    .matches(/^[0-9+\-\s()]*$/, 'Telefonnummer darf nur Zahlen, +, -, () und Leerzeichen enthalten'),
  address: yup.string().required('Adresse ist erforderlich'),
  company: yup.string(),
});

interface ClientFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  company?: string;
}

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormData) => Promise<void>;
}

export function ClientForm({ isOpen, onClose, onSubmit }: ClientFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const labelColor = useColorModeValue('gray.600', 'gray.300');
  const inputBgColor = useColorModeValue('white', 'gray.700');
  const inputBorderColor = useColorModeValue('gray.300', 'gray.600');
  const errorTextColor = useColorModeValue('red.500', 'red.300');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleFormSubmit = async (data: ClientFormData) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      toast({
        title: 'Kunde erstellt',
        description: 'Der Kunde wurde erfolgreich angelegt.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size="4xl"
      motionPreset="slideInBottom"
    >
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent mx={4} bg={bgColor} color={textColor}>
        <ModalHeader color={textColor}>Neuer Kunde</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <ModalBody pb={6}>
            <VStack spacing={6}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                <FormControl isInvalid={!!errors.fullName}>
                  <FormLabel color={labelColor}>Name</FormLabel>
                  <Input 
                    {...register('fullName')} 
                    bg={inputBgColor}
                    borderColor={inputBorderColor}
                    _placeholder={{ color: useColorModeValue('gray.400', 'gray.500') }}
                  />
                  <FormErrorMessage color={errorTextColor}>{errors.fullName?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.email}>
                  <FormLabel color={labelColor}>E-Mail</FormLabel>
                  <Input 
                    {...register('email')} 
                    type="email" 
                    bg={inputBgColor}
                    borderColor={inputBorderColor}
                    _placeholder={{ color: useColorModeValue('gray.400', 'gray.500') }}
                  />
                  <FormErrorMessage color={errorTextColor}>{errors.email?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.phoneNumber}>
                  <FormLabel color={labelColor}>Telefon</FormLabel>
                  <Input 
                    {...register('phoneNumber')} 
                    bg={inputBgColor}
                    borderColor={inputBorderColor}
                    _placeholder={{ color: useColorModeValue('gray.400', 'gray.500') }}
                  />
                  <FormErrorMessage color={errorTextColor}>{errors.phoneNumber?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.company}>
                  <FormLabel color={labelColor}>Firma (Optional)</FormLabel>
                  <Input 
                    {...register('company')} 
                    bg={inputBgColor}
                    borderColor={inputBorderColor}
                    _placeholder={{ color: useColorModeValue('gray.400', 'gray.500') }}
                  />
                  <FormErrorMessage color={errorTextColor}>{errors.company?.message}</FormErrorMessage>
                </FormControl>
              </SimpleGrid>

              <FormControl isInvalid={!!errors.address}>
                <FormLabel color={labelColor}>Adresse</FormLabel>
                <Input 
                  {...register('address')} 
                  bg={inputBgColor}
                  borderColor={inputBorderColor}
                  _placeholder={{ color: useColorModeValue('gray.400', 'gray.500') }}
                />
                <FormErrorMessage color={errorTextColor}>{errors.address?.message}</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter gap={3} borderTopWidth="1px" borderColor={borderColor}>
            <Button variant="ghost" onClick={onClose}>
              Abbrechen
            </Button>
            <Button
              type="submit"
              colorScheme="purple"
              isLoading={isLoading}
              loadingText="Wird angelegt..."
            >
              Kunde anlegen
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
