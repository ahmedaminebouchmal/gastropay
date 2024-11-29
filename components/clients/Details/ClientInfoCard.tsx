import {
  Box,
  VStack,
  HStack,
  Text,
  useColorModeValue,
  Badge,
  Icon,
} from '@chakra-ui/react';
import { FiMail, FiPhone, FiMapPin, FiUser } from 'react-icons/fi';
import { Client } from '@/types';

interface ClientInfoCardProps {
  client: Client;
}

const InfoItem = ({ icon, value }: { icon: any; value: string }) => {
  const iconColor = useColorModeValue('purple.500', 'purple.300');
  return (
    <HStack spacing={2}>
      <Icon as={icon} w={4} h={4} color={iconColor} />
      <Text fontSize="sm">{value}</Text>
    </HStack>
  );
};

export function ClientInfoCard({ client }: ClientInfoCardProps) {
  const iconColor = useColorModeValue('purple.500', 'purple.300');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <VStack align="start" spacing={3} w="full">
      {/* Header */}
      <HStack spacing={3}>
        <Icon as={FiUser} w={5} h={5} color={iconColor} />
        <Text fontWeight="medium" fontSize="lg">
          {client.fullName}
        </Text>
        {client.company && (
          <Badge colorScheme="purple" variant="subtle">
            {client.company}
          </Badge>
        )}
      </HStack>

      {/* Contact Info */}
      <HStack spacing={6} color={mutedColor}>
        {client.email && (
          <InfoItem icon={FiMail} value={client.email} />
        )}
        {client.phoneNumber && (
          <InfoItem icon={FiPhone} value={client.phoneNumber} />
        )}
      </HStack>

      {/* Address */}
      {client.address && (
        <HStack spacing={2} color={mutedColor}>
          <Icon as={FiMapPin} w={4} h={4} color={iconColor} />
          <Text fontSize="sm">{client.address}</Text>
        </HStack>
      )}
    </VStack>
  );
}
