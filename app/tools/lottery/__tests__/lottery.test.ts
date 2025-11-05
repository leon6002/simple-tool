/**
 * Lottery Tools Test Suite
 * 
 * This file contains tests for the lottery tools functionality
 */

describe('Lottery Number Generation', () => {
  test('should generate valid DLT numbers', () => {
    // DLT: 5 numbers from 1-35, 2 numbers from 1-12
    const mainNumbers = generateRandomNumbers(1, 35, 5);
    const specialNumbers = generateRandomNumbers(1, 12, 2);

    expect(mainNumbers).toHaveLength(5);
    expect(specialNumbers).toHaveLength(2);
    
    mainNumbers.forEach(num => {
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(35);
    });

    specialNumbers.forEach(num => {
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(12);
    });
  });

  test('should generate valid SSQ numbers', () => {
    // SSQ: 6 numbers from 1-33, 1 number from 1-16
    const mainNumbers = generateRandomNumbers(1, 33, 6);
    const specialNumbers = generateRandomNumbers(1, 16, 1);

    expect(mainNumbers).toHaveLength(6);
    expect(specialNumbers).toHaveLength(1);
    
    mainNumbers.forEach(num => {
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(33);
    });

    specialNumbers.forEach(num => {
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(16);
    });
  });

  test('should generate valid FC8 numbers', () => {
    // FC8: 8 numbers from 1-80
    const numbers = generateRandomNumbers(1, 80, 8);

    expect(numbers).toHaveLength(8);
    
    numbers.forEach(num => {
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(80);
    });
  });

  test('should generate unique numbers', () => {
    const numbers = generateRandomNumbers(1, 35, 5);
    const uniqueNumbers = new Set(numbers);
    
    expect(uniqueNumbers.size).toBe(numbers.length);
  });
});

describe('Prize Calculation - DLT', () => {
  test('should calculate first prize correctly', () => {
    const prize = calculateDLTPrize(5, 2);
    expect(prize).toBe('一等奖（浮动奖金）');
  });

  test('should calculate second prize correctly', () => {
    const prize = calculateDLTPrize(5, 1);
    expect(prize).toBe('二等奖（浮动奖金）');
  });

  test('should calculate third prize correctly', () => {
    const prize = calculateDLTPrize(5, 0);
    expect(prize).toBe('三等奖（10,000元）');
  });

  test('should return no prize for no match', () => {
    const prize = calculateDLTPrize(0, 0);
    expect(prize).toBe('未中奖');
  });
});

describe('Prize Calculation - SSQ', () => {
  test('should calculate first prize correctly', () => {
    const prize = calculateSSQPrize(6, 1);
    expect(prize).toBe('一等奖（浮动奖金）');
  });

  test('should calculate second prize correctly', () => {
    const prize = calculateSSQPrize(6, 0);
    expect(prize).toBe('二等奖（浮动奖金）');
  });

  test('should calculate third prize correctly', () => {
    const prize = calculateSSQPrize(5, 1);
    expect(prize).toBe('三等奖（3,000元）');
  });

  test('should return no prize for no match', () => {
    const prize = calculateSSQPrize(0, 0);
    expect(prize).toBe('未中奖');
  });
});

// Helper functions for testing
function generateRandomNumbers(min: number, max: number, count: number): number[] {
  const numbers: number[] = [];
  while (numbers.length < count) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  return numbers.sort((a, b) => a - b);
}

function calculateDLTPrize(matchedMain: number, matchedSpecial: number): string {
  if (matchedMain === 5 && matchedSpecial === 2) {
    return '一等奖（浮动奖金）';
  } else if (matchedMain === 5 && matchedSpecial === 1) {
    return '二等奖（浮动奖金）';
  } else if (matchedMain === 5 && matchedSpecial === 0) {
    return '三等奖（10,000元）';
  } else if (matchedMain === 4 && matchedSpecial === 2) {
    return '四等奖（3,000元）';
  } else if (matchedMain === 4 && matchedSpecial === 1) {
    return '五等奖（300元）';
  } else if (
    (matchedMain === 3 && matchedSpecial === 2) ||
    (matchedMain === 4 && matchedSpecial === 0)
  ) {
    return '六等奖（200元）';
  } else if (
    (matchedMain === 3 && matchedSpecial === 1) ||
    (matchedMain === 2 && matchedSpecial === 2)
  ) {
    return '七等奖（100元）';
  } else if (
    (matchedMain === 3 && matchedSpecial === 0) ||
    (matchedMain === 1 && matchedSpecial === 2) ||
    (matchedMain === 2 && matchedSpecial === 1) ||
    (matchedMain === 0 && matchedSpecial === 2)
  ) {
    return '八等奖（15元）';
  } else {
    return '未中奖';
  }
}

function calculateSSQPrize(matchedMain: number, matchedSpecial: number): string {
  if (matchedMain === 6 && matchedSpecial === 1) {
    return '一等奖（浮动奖金）';
  } else if (matchedMain === 6 && matchedSpecial === 0) {
    return '二等奖（浮动奖金）';
  } else if (matchedMain === 5 && matchedSpecial === 1) {
    return '三等奖（3,000元）';
  } else if (
    (matchedMain === 5 && matchedSpecial === 0) ||
    (matchedMain === 4 && matchedSpecial === 1)
  ) {
    return '四等奖（200元）';
  } else if (
    (matchedMain === 4 && matchedSpecial === 0) ||
    (matchedMain === 3 && matchedSpecial === 1)
  ) {
    return '五等奖（10元）';
  } else if (
    (matchedMain === 2 && matchedSpecial === 1) ||
    (matchedMain === 1 && matchedSpecial === 1) ||
    (matchedMain === 0 && matchedSpecial === 1)
  ) {
    return '六等奖（5元）';
  } else {
    return '未中奖';
  }
}

