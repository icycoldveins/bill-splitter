import { ChakraProvider } from '@chakra-ui/react';
import BillSplitter from './components/BillSplitter';
import theme from './theme';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <BillSplitter />
    </ChakraProvider>
  );
}

export default App;
