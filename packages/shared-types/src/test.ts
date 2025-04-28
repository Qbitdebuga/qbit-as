// Test TypeScript file
export interface TestType {
  id: string;
  name: string;
}

export const testFunction = (): TestType => {
  return {
    id: '123',
    name: 'Test'
  };
};

console.log('Test file loaded'); 