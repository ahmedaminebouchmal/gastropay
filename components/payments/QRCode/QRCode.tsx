import { Box, useColorModeValue } from '@chakra-ui/react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeProps {
  value: string;
  size?: number;
}

export function QRCode({ value, size = 256 }: QRCodeProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const fgColor = useColorModeValue('black', 'white');

  return (
    <Box
      bg={bgColor}
      p={4}
      borderRadius="lg"
      display="inline-block"
      boxShadow="lg"
    >
      <QRCodeSVG
        value={value}
        size={size}
        level="H"
        includeMargin={true}
        bgColor={useColorModeValue('#ffffff', '#1A202C')}
        fgColor={fgColor}
      />
    </Box>
  );
}
