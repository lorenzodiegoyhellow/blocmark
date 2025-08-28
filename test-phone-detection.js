// Test script to verify phone number detection

const patterns = [
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // 555-555-5555
  /\b\d{10}\b/g, // 5555555555
  /\b\(\d{3}\)\s?\d{3}[-.\s]?\d{4}\b/g, // (555) 555-5555
  /\b\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // +1-555-555-5555
  /\b\d{3}\.\d{3}\.\d{4}\b/g, // 555.555.5555
];

const testMessages = [
  { text: "hello 544566545", expected: false, description: "9 digits - should NOT be detected" },
  { text: "hello 5445665456", expected: true, description: "10 digits - should be detected" },
  { text: "call me at 555-123-4567", expected: true, description: "standard format - should be detected" },
  { text: "my number is 555.123.4567", expected: true, description: "dot format - should be detected" },
  { text: "(555) 123-4567", expected: true, description: "parentheses format - should be detected" },
  { text: "123456789", expected: false, description: "9 digits - should NOT be detected" },
  { text: "12345678901", expected: false, description: "11 digits - should NOT be detected as 10-digit phone" },
];

console.log("Testing phone number detection patterns:\n");

testMessages.forEach(test => {
  let detected = false;
  
  patterns.forEach(pattern => {
    const matches = test.text.match(pattern);
    if (matches && matches.length > 0) {
      detected = true;
    }
  });
  
  const passed = detected === test.expected;
  const symbol = passed ? "✓" : "✗";
  
  console.log(`${symbol} "${test.text}"`);
  console.log(`  ${test.description}`);
  console.log(`  Expected: ${test.expected ? "detected" : "not detected"}, Got: ${detected ? "detected" : "not detected"}`);
  console.log("");
});