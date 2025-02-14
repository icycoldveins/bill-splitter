import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  components: {
    Container: {
      baseStyle: {
        maxW: '100%',
        p: 0,
        h: '100vh',
        display: 'flex',
        flexDirection: 'column',
        m: 0
      }
    },
    Box: {
      variants: {
        card: {
          p: { base: 3, md: 4 },
          bg: 'white',
          borderRadius: 'md',
          boxShadow: 'sm',
          w: '100%'
        }
      }
    },
    Button: {
      sizes: {
        md: {
          fontSize: { base: 'sm', md: 'md' }
        }
      }
    },
    Text: {
      variants: {
        heading: {
          fontSize: { base: '2xl', md: '3xl' },
          fontWeight: 'bold',
          color: 'blue.500'
        },
        subheading: {
          fontSize: { base: 'lg', md: 'xl' },
          fontWeight: 'medium'
        }
      }
    },
    Input: {
      defaultProps: {
        size: { base: 'sm', md: 'md' }
      }
    },
    Select: {
      defaultProps: {
        size: { base: 'sm', md: 'md' }
      }
    }
  },
  styles: {
    global: {
      'html, body, #root': {
        margin: 0,
        padding: 0,
        height: '100%',
        width: '100%'
      }
    }
  }
});

export default theme; 