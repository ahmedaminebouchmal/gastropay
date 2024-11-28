import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
  disableTransitionOnChange: false,
}

const theme = extendTheme({
  config,
  fonts: {
    heading: 'var(--font-geist-sans)',
    body: 'var(--font-geist-sans)',
    mono: 'var(--font-geist-mono)',
  },
  styles: {
    global: (props: { colorMode: string }) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'white',
        color: props.colorMode === 'dark' ? 'white' : 'gray.900',
      },
    }),
  },
  colors: {
    gray: {
      50: '#F7FAFC',
      100: '#EDF2F7',
      200: '#E2E8F0',
      300: '#CBD5E0',
      400: '#A0AEC0',
      500: '#718096',
      600: '#4A5568',
      700: '#2D3748',
      800: '#1A202C',
      900: '#171923',
    },
    brand: {
      50: '#F6E8FF',
      100: '#E3BDFF',
      200: '#D092FF',
      300: '#BD67FF',
      400: '#AA3BFF',
      500: '#971FFF',
      600: '#7B19CC',
      700: '#5F1399',
      800: '#420D66',
      900: '#260733',
    },
    accent: {
      50: '#FFE8F6',
      100: '#FFB8E5',
      200: '#FF88D4',
      300: '#FF58C3',
      400: '#FF29B2',
      500: '#FF00A1',
      600: '#CC0081',
      700: '#990061',
      800: '#660040',
      900: '#330020',
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'lg',
      },
      variants: {
        solid: (props: { colorScheme: string }) => ({
          bg: props.colorScheme === 'brand' ? 'brand.500' : `${props.colorScheme}.500`,
          color: 'white',
          _hover: {
            bg: props.colorScheme === 'brand' ? 'brand.600' : `${props.colorScheme}.600`,
          },
        }),
        ghost: (props: { colorMode: string }) => ({
          color: props.colorMode === 'dark' ? 'white' : 'gray.800',
          _hover: {
            bg: props.colorMode === 'dark' ? 'whiteAlpha.200' : 'blackAlpha.100',
          },
        }),
      },
      defaultProps: {
        colorScheme: 'brand',
      },
    },
    Text: {
      baseStyle: (props: { colorMode: string }) => ({
        color: props.colorMode === 'dark' ? 'white' : 'gray.900',
      }),
    },
    Heading: {
      baseStyle: (props: { colorMode: string }) => ({
        color: props.colorMode === 'dark' ? 'white' : 'gray.900',
      }),
    },
    Table: {
      baseStyle: (props: { colorMode: string }) => ({
        th: {
          color: props.colorMode === 'dark' ? 'gray.300' : 'gray.700',
          fontWeight: 'semibold',
        },
        td: {
          color: props.colorMode === 'dark' ? 'white' : 'gray.900',
        },
      }),
    },
  },
})

export default theme
