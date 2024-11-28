import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Box,
  useColorModeValue,
  Text,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
} from '@chakra-ui/react';
import { FiMoreVertical, FiEdit2, FiTrash2, FiFileText } from 'react-icons/fi';

interface Client {
  id: number;
  name: string;
  email: string;
  company: string;
  phone: string;
}

interface ClientListProps {
  clients: Client[];
  onEdit?: (client: Client) => void;
  onDelete?: (client: Client) => void;
  onViewInvoices?: (client: Client) => void;
}

export function ClientList({ clients, onEdit, onDelete, onViewInvoices }: ClientListProps) {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th borderColor={borderColor}>Name</Th>
            <Th borderColor={borderColor}>Firma</Th>
            <Th borderColor={borderColor}>E-Mail</Th>
            <Th borderColor={borderColor}>Telefon</Th>
            <Th borderColor={borderColor} isNumeric></Th>
          </Tr>
        </Thead>
        <Tbody>
          {clients.map((client) => (
            <Tr
              key={client.id}
              _hover={{ bg: hoverBg }}
              transition="background-color 0.2s"
            >
              <Td borderColor={borderColor}>
                <Text fontWeight="medium">{client.name}</Text>
              </Td>
              <Td borderColor={borderColor}>{client.company}</Td>
              <Td borderColor={borderColor}>{client.email}</Td>
              <Td borderColor={borderColor}>{client.phone}</Td>
              <Td borderColor={borderColor} isNumeric>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    aria-label="Options"
                    icon={<FiMoreVertical />}
                    variant="ghost"
                    size="sm"
                  />
                  <MenuList>
                    <MenuItem
                      icon={<FiEdit2 />}
                      onClick={() => onEdit?.(client)}
                    >
                      Bearbeiten
                    </MenuItem>
                    <MenuItem
                      icon={<FiFileText />}
                      onClick={() => onViewInvoices?.(client)}
                    >
                      Rechnungen anzeigen
                    </MenuItem>
                    <MenuItem
                      icon={<FiTrash2 />}
                      onClick={() => onDelete?.(client)}
                      color="red.500"
                    >
                      Löschen
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {clients.length === 0 && (
        <Box textAlign="center" py={8}>
          <Text color={useColorModeValue('gray.600', 'gray.400')}>
            Keine Kunden gefunden
          </Text>
          <Button
            mt={4}
            size="sm"
            colorScheme="purple"
            onClick={() => {/* TODO: Add new client action */}}
          >
            Neuen Kunden anlegen
          </Button>
        </Box>
      )}
    </Box>
  );
}
