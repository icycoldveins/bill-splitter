import {
  VStack,
  Text,
  Box,
  Divider,
  useColorModeValue,
  Badge
} from '@chakra-ui/react';

function PeopleSplitter({ items, people, onSplitComplete }) {
  const boxBg = useColorModeValue('white', 'gray.700');
  const highlightBg = useColorModeValue('blue.50', 'blue.900');
  
  // Ensure items has the required properties
  const safeItems = {
    items: items?.items || [],
    itemAssignments: items?.itemAssignments || {},
    tax: items?.tax || 0,
    tip: items?.tip || 0,
    paidBy: items?.paidBy
  };
  
  // Calculate totals
  const subtotal = safeItems.items.reduce((sum, item) => sum + (item?.price || 0), 0);
  const total = subtotal + safeItems.tax + safeItems.tip;
  
  // Calculate payer's items and total
  const payerItems = safeItems.items.filter((_, itemIndex) => 
    safeItems.itemAssignments[itemIndex] === safeItems.paidBy
  );
  
  const payerSubtotal = payerItems.reduce((sum, item) => sum + (item?.price || 0), 0);
  const payerTaxShare = (safeItems.tax / safeItems.items.length) * payerItems.length;
  const payerTipShare = (safeItems.tip / safeItems.items.length) * payerItems.length;
  const payerTotal = payerSubtotal + payerTaxShare + payerTipShare;

  return (
    <VStack spacing={6} w="100%">
      <Text fontSize="2xl" fontWeight="bold" color="blue.500">Final Split</Text>

      <Box w="100%" p={6} bg={boxBg} borderRadius="xl" boxShadow="md">
        <Badge colorScheme="green" p={2} mb={4} borderRadius="md">
          {people[parseInt(safeItems.paidBy)]} paid ${total.toFixed(2)}
        </Badge>
        
        {/* Show what the payer spent */}
        <Box p={3} bg={highlightBg} mb={3} borderRadius="md">
          <Text fontWeight="bold">{people[parseInt(safeItems.paidBy)]}'s Items:</Text>
          <VStack align="stretch" pl={4} spacing={1}>
            {payerItems.map((item, idx) => (
              <Text key={idx}>
                {item.name}: ${item.price.toFixed(2)}
              </Text>
            ))}
            <Text>Tax: ${payerTaxShare.toFixed(2)}</Text>
            <Text>Tip: ${payerTipShare.toFixed(2)}</Text>
            <Text fontWeight="bold">Their portion: ${payerTotal.toFixed(2)}</Text>
          </VStack>
        </Box>

        <Divider my={4} />

        {/* Show what others owe */}
        <Text mb={2} fontWeight="bold">Others owe:</Text>
        {people.map((person, index) => {
          if (index.toString() === safeItems.paidBy) return null;
          
          const personItems = safeItems.items.filter((_, itemIndex) => 
            safeItems.itemAssignments[itemIndex] === index.toString()
          );
          
          const subtotal = personItems.reduce((sum, item) => sum + (item?.price || 0), 0);
          const taxShare = (safeItems.tax / safeItems.items.length) * personItems.length;
          const tipShare = (safeItems.tip / safeItems.items.length) * personItems.length;
          const total = subtotal + taxShare + tipShare;

          return (
            <Box key={index} p={3} bg={highlightBg} mb={3} borderRadius="md">
              <Text fontWeight="bold">{person}</Text>
              <VStack align="stretch" pl={4} spacing={1}>
                {personItems.map((item, idx) => (
                  <Text key={idx}>
                    {item.name}: ${item.price.toFixed(2)}
                  </Text>
                ))}
                <Text>Tax: ${taxShare.toFixed(2)}</Text>
                <Text>Tip: ${tipShare.toFixed(2)}</Text>
                <Text fontWeight="bold">Owes: ${total.toFixed(2)}</Text>
              </VStack>
            </Box>
          );
        })}
      </Box>
    </VStack>
  );
}

export default PeopleSplitter; 