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
import { useMemo } from 'react';
import { translations } from '@/translations/de';
import { PaymentStatus } from '@/types/payment';

interface Transaction {
  id: string;
  client: string;
  amount: string;
  status: PaymentStatus;
  date: string;
}

interface TransactionsTableProps {
  transactions: Transaction[];
}

const getStatusColor = (status: PaymentStatus) => {
  switch (status) {
    case PaymentStatus.PAID:
    case PaymentStatus.CONFIRMED:
      return 'green';
    case PaymentStatus.PENDING:
      return 'yellow';
    case PaymentStatus.DECLINED:
      return 'red';
    default:
      return 'gray';
  }
};

const getStatusText = (status: PaymentStatus) => {
  switch (status) {
    case PaymentStatus.PAID:
    case PaymentStatus.CONFIRMED:
      return translations.dashboard.completed;
    case PaymentStatus.PENDING:
      return translations.dashboard.pending;
    case PaymentStatus.DECLINED:
      return translations.dashboard.failed;
    default:
      return status;
  }
};

export const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions }) => {
  const textColor = useColorModeValue('gray.700', 'white');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headerColor = useColorModeValue('gray.600', 'gray.400');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');

  const transactionRows = useMemo(() => {
    if (!transactions) return [];
    return transactions.map((transaction) => ({
      ...transaction,
      statusColor: getStatusColor(transaction.status),
      statusText: getStatusText(transaction.status)
    }));
  }, [transactions]);

  return (
    <Box
      bg={bgColor}
      px={4}
      py={4}
      rounded="lg"
      shadow="xl"
      border="1px"
      borderColor={borderColor}
      overflowX="auto"
    >
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th width="30%" color={headerColor}>{translations.dashboard.table.user}</Th>
            <Th width="25%" color={headerColor}>{translations.dashboard.table.amount}</Th>
            <Th width="20%" color={headerColor}>{translations.dashboard.table.status}</Th>
            <Th width="25%" color={headerColor}>{translations.dashboard.table.date}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {transactionRows.map((transaction) => (
            <Tr 
              key={transaction.id}
              _hover={{ bg: hoverBgColor }}
              transition="background-color 0.2s"
            >
              <Td width="30%" color={textColor}>{transaction.client}</Td>
              <Td width="25%" color={textColor}>{transaction.amount}</Td>
              <Td width="20%">
                <Badge
                  colorScheme={transaction.statusColor}
                  px={2}
                  py={1}
                  rounded="md"
                  fontSize="sm"
                >
                  {transaction.statusText}
                </Badge>
              </Td>
              <Td width="25%" color={textColor}>{transaction.date}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};
