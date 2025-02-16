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
  useToast,
  Input,
} from '@chakra-ui/react';
import { ArrowForwardIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';
import { createWorker } from 'tesseract.js';

function ItemSelector({ items, onItemsSelected, people }) {
  const [itemAssignments, setItemAssignments] = useState({});
  const [taxType, setTaxType] = useState('percentage');
  const [tipType, setTipType] = useState('percentage');
  const [tax, setTax] = useState(items.tax || 0);
  const [tip, setTip] = useState(items.tip || 0);
  const [paidBy, setPaidBy] = useState('');
  const toast = useToast();
  
  const [editableItems, setEditableItems] = useState(items.items.map(item => ({...item})));
  
  const subtotal = editableItems.reduce((sum, item) => sum + item.price, 0);
  
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

  const handleItemChange = (index, field, value) => {
    const newItems = [...editableItems];
    if (field === 'price') {
      // Convert price to number and handle invalid input
      const numValue = value === '' || isNaN(value) ? 0 : parseFloat(value);
      newItems[index] = { ...newItems[index], [field]: numValue };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setEditableItems(newItems);
  };

  const handleDeleteItem = (index) => {
    const newItems = editableItems.filter((_, i) => i !== index);
    setEditableItems(newItems);
    
    // Remove the assignment for this item
    const newAssignments = { ...itemAssignments };
    delete newAssignments[index];
    
    // Adjust the assignments indices for items after the deleted one
    const adjustedAssignments = {};
    Object.entries(newAssignments).forEach(([key, value]) => {
      const keyNum = parseInt(key);
      if (keyNum > index) {
        adjustedAssignments[keyNum - 1] = value;
      } else {
        adjustedAssignments[key] = value;
      }
    });
    
    setItemAssignments(adjustedAssignments);
  };

  const handleAddItem = () => {
    setEditableItems([
      ...editableItems,
      {
        name: '',
        price: 0
      }
    ]);
  };

  const handleSubmit = () => {
    // Check if all items are assigned
    const unassignedItems = editableItems.filter((_, index) => 
      !itemAssignments.hasOwnProperty(index)
    );

    // Check if payer is selected
    if (!paidBy) {
      toast({
        title: "Select who paid",
        description: "Please select who paid the bill",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    // Check if any items are unassigned
    if (unassignedItems.length > 0) {
      toast({
        title: "Unassigned items",
        description: `Please assign ${unassignedItems.length} remaining item${unassignedItems.length > 1 ? 's' : ''}`,
        status: "warning",
        duration: 3000,
      });
      return;
    }

    onItemsSelected({
      items: editableItems,
      itemAssignments,
      tax: taxAmount,
      tip: tipAmount,
      paidBy
    });
  };

  const preprocessImage = async (imageUrl) => {
    // Create canvas and load image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    await new Promise((resolve) => {
      img.onload = resolve;
      img.src = imageUrl;
    });
    
    // Set canvas size to match image
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Draw original image
    ctx.drawImage(img, 0, 0);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Convert to grayscale
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg;     // R
      data[i + 1] = avg; // G
      data[i + 2] = avg; // B
    }
    
    // Apply thresholding
    const threshold = 128;
    for (let i = 0; i < data.length; i += 4) {
      const value = data[i] > threshold ? 255 : 0;
      data[i] = value;     // R
      data[i + 1] = value; // G
      data[i + 2] = value; // B
    }
    
    // Put processed image back on canvas
    ctx.putImageData(imageData, 0, 0);
    
    // Return processed image as data URL
    return canvas.toDataURL();
  };

  const scanReceipt = async () => {
    if (!image) return;
    
    setIsScanning(true);
    const worker = await createWorker();
    
    try {
      // Preprocess the image
      const processedImage = await preprocessImage(image);
      
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      
      // Use processed image for OCR
      const { data: { text } } = await worker.recognize(processedImage);
      
      // Rest of your existing OCR logic...
    } catch (error) {
      toast({
        title: 'Error scanning receipt',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      await worker.terminate();
      setIsScanning(false);
    }
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
        {editableItems.map((item, index) => (
          <HStack key={index} justify="space-between" p={2} bg="white" mb={2} borderRadius="md">
            <VStack align="start" flex={1} spacing={2}>
              <Input
                value={item.name}
                onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                size="sm"
                placeholder="Item name"
              />
              <NumberInput
                value={item.price}
                onChange={(_, value) => handleItemChange(index, 'price', value)}
                min={0}
                precision={2}
                size="sm"
                w="120px"
              >
                <NumberInputField placeholder="Price" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </VStack>
            <Select
              w="150px"
              value={itemAssignments[index] || ''}
              onChange={(e) => assignItemToPerson(index, e.target.value)}
              placeholder="Assign to"
              size="sm"
            >
              {people.map((person, idx) => (
                <option key={idx} value={idx}>
                  {person}
                </option>
              ))}
            </Select>
            <Button
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={() => handleDeleteItem(index)}
              aria-label="Delete item"
            >
              <DeleteIcon />
            </Button>
          </HStack>
        ))}
        
        <Button
          onClick={handleAddItem}
          size="sm"
          leftIcon={<AddIcon />}
          mt={3}
          colorScheme="blue"
          variant="outline"
        >
          Add Item
        </Button>
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
        rightIcon={<ArrowForwardIcon />}
      >
        Continue
      </Button>
    </VStack>
  );
}

export default ItemSelector; 