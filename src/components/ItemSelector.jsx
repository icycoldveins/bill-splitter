import { useState, useEffect } from 'react';
import { 
  Box, 
  Checkbox, 
  VStack, 
  HStack, 
  Text, 
  Button,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  Select,
} from '@chakra-ui/react';

function ItemSelector({ items, onItemsSelected, people }) {
  const [itemAssignments, setItemAssignments] = useState({});
  const [taxType, setTaxType] = useState('percentage');
  const [tipType, setTipType] = useState('percentage');
  const [tax, setTax] = useState(items.tax || 0);
  const [tip, setTip] = useState(items.tip || 0);
  const [paidBy, setPaidBy] = useState('');
  
  const subtotal = items.items.reduce((sum, item) => sum + item.price, 0);
  
  // Calculate tax amount based on type
  const taxAmount = taxType === 'percentage' 
    ? (tax / 100) * subtotal 
    : parseFloat(tax);

  // Calculate tip amount based on type
  const tipAmount = tipType === 'percentage'
    ? (tip / 100) * subtotal
    : parseFloat(tip);

  const total = subtotal + taxAmount + tipAmount;

  // Update initial values from receipt
  useEffect(() => {
    if (items.taxAmount && items.taxAmount > 0) {
      setTax(items.taxAmount);
      setTaxType('amount');
    } else if (items.tax) {
      setTax(items.tax);
      setTaxType('percentage');
    }

    if (items.tipAmount && items.tipAmount > 0) {
      setTip(items.tipAmount);
      setTipType('amount');
    } else if (items.tip) {
      setTip(items.tip);
      setTipType('percentage');
    }
  }, [items.tax, items.tip, items.taxAmount, items.tipAmount]);

  const assignItemToPerson = (itemIndex, personIndex) => {
    setItemAssignments(prev => ({
      ...prev,
      [itemIndex]: personIndex
    }));
  };

  const handleTaxChange = (_, value) => {
    // Convert empty string or invalid number to 0
    const numValue = value === '' || isNaN(value) ? 0 : parseFloat(value);
    setTax(numValue);
  };

  const handleTipChange = (_, value) => {
    // Convert empty string or invalid number to 0
    const numValue = value === '' || isNaN(value) ? 0 : parseFloat(value);
    setTip(numValue);
  };

  const handleSubmit = () => {
    // Group items by person
    const itemsByPerson = {};
    items.items.forEach((item, index) => {
      const assignedTo = itemAssignments[index] || paidBy;
      if (!itemsByPerson[assignedTo]) {
        itemsByPerson[assignedTo] = [];
      }
      itemsByPerson[assignedTo].push(item);
    });

    const selectedItemsWithTaxAndTip = {
      items: items.items,
      itemAssignments: itemAssignments,
      tax: taxAmount,
      tip: tipAmount,
      total: total,
      paidBy: paidBy,
      taxPercent: taxType === 'percentage' ? tax : (taxAmount / subtotal) * 100,
      tipPercent: tipType === 'percentage' ? tip : (tipAmount / subtotal) * 100
    };
    onItemsSelected(selectedItemsWithTaxAndTip);
  };

  return (
    <VStack align="stretch" spacing={4}>
      <Text fontSize="lg" fontWeight="bold">Assign Items and Adjust Tax/Tip</Text>
      
      {/* Paid By Section */}
      <FormControl>
        <FormLabel>Who Paid the Bill?</FormLabel>
        <Select
          placeholder="Select who paid"
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
        >
          {people.map((person, index) => (
            <option key={index} value={index}>
              {person}
            </option>
          ))}
        </Select>
      </FormControl>

      {/* Items Section */}
      <Box p={4} bg="gray.50" borderRadius="md">
        <Text mb={3} fontWeight="bold">Assign Items</Text>
        {items.items.map((item, index) => (
          <HStack key={index} justify="space-between" p={2} bg="white" mb={2} borderRadius="md">
            <VStack align="start" flex={1}>
              <Text>{item.name}</Text>
              <Text fontSize="sm" color="gray.600">${item.price.toFixed(2)}</Text>
            </VStack>
            <Select
              w="150px"
              value={itemAssignments[index] || ''}
              onChange={(e) => assignItemToPerson(index, e.target.value)}
              placeholder="Assign to"
            >
              {people.map((person, idx) => (
                <option key={idx} value={idx}>
                  {person}
                </option>
              ))}
            </Select>
          </HStack>
        ))}
      </Box>

      {/* Tax Section */}
      <Box p={4} bg="gray.50" borderRadius="md">
        <FormControl>
          <FormLabel>Tax Type</FormLabel>
          <RadioGroup onChange={setTaxType} value={taxType} mb={3}>
            <Stack direction="row">
              <Radio value="percentage">Percentage</Radio>
              <Radio value="amount">Amount</Radio>
            </Stack>
          </RadioGroup>
          
          <NumberInput 
            value={tax} 
            onChange={handleTaxChange}
            min={0}
            precision={2}
          >
            <NumberInputField 
              placeholder={taxType === 'percentage' ? 'Enter %' : 'Enter $'}
              paddingRight="60px"
            />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
            <Text 
              position="absolute" 
              right="40px" 
              top="50%" 
              transform="translateY(-50%)"
              color="gray.500"
              zIndex={2}
            >
              {taxType === 'percentage' ? '%' : '$'}
            </Text>
          </NumberInput>
          <Text mt={1} fontSize="sm" color="gray.600">
            Tax Amount: ${taxAmount.toFixed(2)}
            {taxType === 'amount' && subtotal > 0 && (
              <> ({((taxAmount / subtotal) * 100).toFixed(1)}%)</>
            )}
          </Text>
        </FormControl>
      </Box>

      {/* Tip Section */}
      <Box p={4} bg="gray.50" borderRadius="md">
        <FormControl>
          <FormLabel>Tip Type</FormLabel>
          <RadioGroup onChange={setTipType} value={tipType} mb={3}>
            <Stack direction="row">
              <Radio value="percentage">Percentage</Radio>
              <Radio value="amount">Amount</Radio>
            </Stack>
          </RadioGroup>
          
          <NumberInput 
            value={tip} 
            onChange={handleTipChange}
            min={0}
            precision={2}
          >
            <NumberInputField 
              placeholder={tipType === 'percentage' ? 'Enter %' : 'Enter $'}
              paddingRight="60px"
            />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
            <Text 
              position="absolute" 
              right="40px" 
              top="50%" 
              transform="translateY(-50%)"
              color="gray.500"
              zIndex={2}
            >
              {tipType === 'percentage' ? '%' : '$'}
            </Text>
          </NumberInput>
          <Text mt={1} fontSize="sm" color="gray.600">
            Tip Amount: ${tipAmount.toFixed(2)}
            {tipType === 'amount' && subtotal > 0 && (
              <> ({((tipAmount / subtotal) * 100).toFixed(1)}%)</>
            )}
          </Text>
        </FormControl>
      </Box>

      {/* Summary Section */}
      <Box p={4} bg="gray.50" borderRadius="md">
        <VStack align="stretch" spacing={2}>
          <HStack justify="space-between">
            <Text>Subtotal:</Text>
            <Text>${subtotal.toFixed(2)}</Text>
          </HStack>
          <HStack justify="space-between">
            <Text>Tax:</Text>
            <Text>${taxAmount.toFixed(2)}</Text>
          </HStack>
          <HStack justify="space-between">
            <Text>Tip:</Text>
            <Text>${tipAmount.toFixed(2)}</Text>
          </HStack>
          <HStack justify="space-between" fontWeight="bold">
            <Text>Total:</Text>
            <Text>${total.toFixed(2)}</Text>
          </HStack>
        </VStack>
      </Box>
      
      <Button 
        onClick={handleSubmit}
        colorScheme="blue"
        isDisabled={!paidBy}
      >
        Continue
      </Button>
    </VStack>
  );
}

export default ItemSelector; 