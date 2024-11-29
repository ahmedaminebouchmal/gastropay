import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Box,
  useColorModeValue,
  Text,
} from '@chakra-ui/react';
import { translations } from '@/translations/de';

interface Transaction {
  id: number;
  user: string;
  amount: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
}

interface TransactionsTableProps {
  transactions: Transaction[];
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions }) => {
  const textColor = useColorModeValue('gray.700', 'white');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const statusBgColor = useColorModeValue('gray.100', 'gray.700');

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Box
      bg={bgColor}
      px={8}
      py={4}
      rounded="lg"
      shadow="base"
      w="full"
      overflowX="auto"
    >
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th borderColor={borderColor} color={textColor}>{translations.dashboard.user}</Th>
            <Th borderColor={borderColor} color={textColor}>{translations.dashboard.amount}</Th>
            <Th borderColor={borderColor} color={textColor}>{translations.dashboard.status}</Th>
            <Th borderColor={borderColor} color={textColor}>{translations.dashboard.date}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {transactions.map((transaction) => (
            <Tr key={transaction.id}>
              <Td borderColor={borderColor} color={textColor}>
                <Text fontWeight="medium">{transaction.user}</Text>
              </Td>
              <Td borderColor={borderColor} color={textColor}>
                <Text>{transaction.amount}</Text>
              </Td>
              <Td borderColor={borderColor}>
                <Badge
                  bg={statusBgColor}
                  color={getStatusColor(transaction.status)}
                  rounded="full"
                  px={2}
                >
                  {translations.dashboard[transaction.status]}
                </Badge>
              </Td>
              <Td borderColor={borderColor} color={textColor}>
                <Text>{transaction.date}</Text>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};
