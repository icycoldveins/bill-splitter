import { useState } from 'react';
import { 
  VStack, 
  Text, 
  Input, 
  Button, 
  HStack,
  Box,
  Container,
  useColorModeValue
} from '@chakra-ui/react';
import ReceiptScanner from './ReceiptScanner';
import ItemSelector from './ItemSelector';
import PeopleSplitter from './PeopleSplitter';
import { ArrowBackIcon } from '@chakra-ui/icons';

function BillSplitter() {
  const [step, setStep] = useState(1);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [splits, setSplits] = useState([]);
  const [people, setPeople] = useState(['']);
  const [hasScannedReceipt, setHasScannedReceipt] = useState(false);

  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const boxBg = useColorModeValue('white', 'gray.600');
  const borderColor = useColorModeValue('gray.200', 'gray.500');

  const addPerson = () => {
    setPeople([...people, '']);
  };

  const removePerson = (index) => {
    if (people.length > 1) {
      setPeople(people.filter((_, i) => i !== index));
    }
  };

  const updatePerson = (index, value) => {
    const newPeople = [...people];
    newPeople[index] = value;
    setPeople(newPeople);
  };

  const handleScanComplete = (scannedItems) => {
    setItems(scannedItems);
    setHasScannedReceipt(true);
    setStep(2);
  };

  const handleItemsSelected = (selected) => {
    setSelectedItems(selected);
    setStep(3);
  };

  const handleSplitComplete = (calculatedSplits) => {
    setSplits(calculatedSplits);
  };

  const goBack = () => {
    setStep(prev => prev - 1);
  };

  return (
    <Container>
      <VStack 
        spacing={4} 
        w="100%"
        h="100%"
        bg={bgColor} 
        p={0}
        borderRadius={{ base: 0, md: 'xl' }}
        boxShadow={{ base: 'none', md: 'lg' }}
        overflow="auto"
        pb={{ base: 20, md: 24 }}
      >
        <HStack 
          w="100%" 
          justify="space-between" 
          pb={2} 
          borderBottom="2px" 
          borderColor={borderColor}
          position="sticky"
          top={0}
          bg={bgColor}
          zIndex={1}
          px={4}
          py={4}
          boxShadow="sm"
          backgroundColor={bgColor}
          mt={0}
        >
          <Text variant="heading">Bill Splitter</Text>
          {step > 1 && (
            <Button onClick={goBack} size="sm" variant="ghost" leftIcon={<ArrowBackIcon />}>
              Back
            </Button>
          )}
        </HStack>

        <VStack px={{ base: 2, md: 4 }} w="100%" spacing={4}>
          <HStack w="100%" justify="center" spacing={4}>
            {[1, 2, 3].map((stepNumber) => (
              <Box
                key={stepNumber}
                w="8px"
                h="8px"
                borderRadius="full"
                bg={step >= stepNumber ? 'blue.500' : 'gray.300'}
              />
            ))}
          </HStack>

          {step === 1 && (
            <VStack spacing={4} w="100%">
              <Box w="100%" p={4} bg={boxBg} borderRadius="md">
                <Text fontSize="lg" mb={4}>Add People</Text>
                {people.map((person, index) => (
                  <HStack key={index} mb={2}>
                    <Input
                      placeholder="Person's name"
                      value={person}
                      onChange={(e) => updatePerson(index, e.target.value)}
                    />
                    <Button
                      onClick={() => removePerson(index)}
                      isDisabled={people.length === 1}
                      size="sm"
                    >
                      ✕
                    </Button>
                  </HStack>
                ))}
                <Button onClick={addPerson} size="sm" mt={2}>
                  + Add Person
                </Button>
              </Box>

              <ReceiptScanner 
                onScanComplete={handleScanComplete}
                people={people}
                hasScannedReceipt={hasScannedReceipt}
                existingItems={items}
              />
            </VStack>
          )}

          {step === 2 && (
            <ItemSelector 
              items={items} 
              onItemsSelected={handleItemsSelected} 
              people={people}
            />
          )}

          {step === 3 && (
            <PeopleSplitter 
              items={selectedItems} 
              people={people}
              onSplitComplete={handleSplitComplete}
            />
          )}
        </VStack>
      </VStack>
    </Container>
  );
}

export default BillSplitter; 