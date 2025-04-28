// Test TypeScript file
export interface TestType {
  id: string | null;
  name: string | null;
}

export const testFunction = (): TestType => {
  return {
    id: '123',
    name: 'Test',
  };
};

console.log('Test file loaded');
