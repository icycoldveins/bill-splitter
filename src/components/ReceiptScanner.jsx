import { useState, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import { Box, Button, Image, VStack, useToast, HStack, Text } from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { 
  AttachmentIcon, 
  RepeatIcon, 
  CheckIcon, 
  ArrowForwardIcon 
} from '@chakra-ui/icons';

function ReceiptScanner({ onScanComplete, hasScannedReceipt, existingItems, onReset }) {
  const [image, setImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const toast = useToast();

  const resetState = () => {
    setImage(null);
    setIsScanning(false);
    onReset();
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.heic', '.HEIC'],
    },
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      
      // Check if file is HEIC format
      if (file.name.toLowerCase().endsWith('.heic')) {
        try {
          // Convert HEIC to JPEG using heic2any
          const heic2any = await import('heic2any');
          const convertedBlob = await heic2any.default({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.8
          });
          setImage(URL.createObjectURL(convertedBlob));
        } catch (error) {
          toast({
            title: 'Error converting HEIC image',
            description: 'Could not convert the HEIC image to JPEG',
            status: 'error',
            duration: 3000,
          });
        }
      } else {
        setImage(URL.createObjectURL(file));
      }
    }
  });

  const findAmountInLine = (line) => {
    // Look for dollar amounts with optional dollar sign
    const priceMatch = line.match(/\$?\s*(\d+\.\d{2})/);
    return priceMatch ? parseFloat(priceMatch[1]) : null;
  };

  const scanReceipt = async () => {
    if (!image) return;
    
    setIsScanning(true);
    const worker = await createWorker();
    
    try {
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const { data: { text } } = await worker.recognize(image);
      
      // Split into lines and clean them
      const lines = text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      // Initialize receipt data structure
      const receiptData = {
        subtotal: 0,
        tax: 0,
        tip: 0,
        total: 0,
        items: []
      };

      // First pass: Find the key totals from bottom up
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].toLowerCase();
        const amount = findAmountInLine(lines[i]);

        if (amount) {
          if (line.includes('total') && !line.includes('sub')) {
            receiptData.total = amount;
          }
          else if (line.includes('tip') || line.includes('gratuity')) {
            receiptData.tip = amount;
          }
          else if (line.includes('tax') || line.includes('gst') || line.includes('hst')) {
            receiptData.tax = amount;
          }
          else if (line.includes('subtotal') || line.includes('sub-total')) {
            receiptData.subtotal = amount;
          }
        }
      }

      // Second pass: Find items (going from top to bottom)
      const skipWords = ['total', 'tax', 'tip', 'gratuity', 'change', 'balance', 'card', 'cash'];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const amount = findAmountInLine(line);
        const lowerLine = line.toLowerCase();

        // Skip if line contains any of the skip words
        if (skipWords.some(word => lowerLine.includes(word))) {
          continue;
        }

        if (amount) {
          // Check if amount makes sense as an item price
          if (amount > 0 && 
              amount < (receiptData.total || Infinity) && 
              amount !== receiptData.tax && 
              amount !== receiptData.tip) {
            
            // Get item name by removing the price and cleaning
            let name = line
              .replace(/\$?\s*\d+\.\d{2}/, '')  // Remove price
              .replace(/[^a-zA-Z0-9\s]/g, ' ')   // Replace special chars with space
              .trim();

            // If name is empty, try to look at the line above
            if (!name && i > 0) {
              name = lines[i - 1].trim();
            }

            if (name) {
              receiptData.items.push({ name, price: amount });
            }
          }
        }
      }

      // If we didn't find a subtotal, calculate it from items
      if (!receiptData.subtotal && receiptData.items.length > 0) {
        receiptData.subtotal = receiptData.items.reduce((sum, item) => sum + item.price, 0);
      }

      // Check if we found any items or totals
      if (receiptData.items.length === 0 && !receiptData.total && !receiptData.subtotal) {
        toast({
          title: "No items detected",
          description: "Please try scanning the receipt again or make sure the image is clear and well-lit",
          status: "warning",
          duration: 5000,
          isClosable: true
        });
        return;
      }

      // Calculate percentages
      const taxPercent = receiptData.subtotal ? (receiptData.tax / receiptData.subtotal) * 100 : 0;
      const tipPercent = receiptData.subtotal ? (receiptData.tip / receiptData.subtotal) * 100 : 0;

      onScanComplete({
        items: receiptData.items,
        tax: taxPercent,
        tip: tipPercent,
        subtotal: receiptData.subtotal,
        taxAmount: receiptData.tax,
        tipAmount: receiptData.tip,
        total: receiptData.total
      });

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
    <VStack spacing={4} w="100%">
      {hasScannedReceipt ? (
        <Box w="100%" p={4} bg="green.50" borderRadius="md">
          <VStack spacing={3}>
            <Text color="green.600">
              <CheckIcon mr={2} />
              Receipt scanned successfully!
            </Text>
            <HStack spacing={4}>
              <Button
                colorScheme="blue"
                onClick={() => onScanComplete(existingItems)}
                rightIcon={<ArrowForwardIcon />}
              >
                Continue with Receipt
              </Button>
              <Button
                variant="outline"
                onClick={resetState}
                leftIcon={<RepeatIcon />}
              >
                Scan Different Receipt
              </Button>
            </HStack>
          </VStack>
        </Box>
      ) : (
        <VStack spacing={4} w="100%">
          {!image && (
            <Box 
              {...getRootProps()} 
              p={8}
              border="3px dashed"
              borderColor="blue.200"
              borderRadius="xl"
              bg="blue.50"
              w={{ base: "100%", md: "400px" }}
              mx="auto"
              textAlign="center"
              transition="all 0.2s"
              cursor="pointer"
              _hover={{
                borderColor: "blue.400",
                bg: "blue.100",
                transform: "scale(1.02)"
              }}
            >
              <input {...getInputProps()} />
              <VStack spacing={3}>
                <AttachmentIcon 
                  boxSize={8} 
                  color="blue.500"
                />
                <Text fontWeight="medium" color="blue.600">
                  Drop your receipt here
                </Text>
                <Text fontSize="sm" color="blue.400">
                  or click to select an image
                </Text>
              </VStack>
            </Box>
          )}

          {image && (
            <VStack spacing={4} w="100%">
              <Image src={image} maxH="300px" />
              <HStack spacing={4}>
                <Button
                  onClick={scanReceipt}
                  isLoading={isScanning}
                  loadingText="Scanning..."
                  colorScheme="blue"
                  leftIcon={<CheckIcon />}
                >
                  Scan Receipt
                </Button>
                <Button
                  onClick={() => {
                    setImage(null);
                  }}
                  variant="outline"
                  leftIcon={<RepeatIcon />}
                >
                  Choose Different Image
                </Button>
              </HStack>
            </VStack>
          )}
        </VStack>
      )}
    </VStack>
  );
}

export default ReceiptScanner; 