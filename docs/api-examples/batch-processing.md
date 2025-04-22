# Batch Processing Examples

This document provides examples of how to use the BatchClient from the API client package to interact with the batch processing endpoints in the General Ledger service.

## Setting up the API Client

```typescript
import { ApiClient, TokenStorage, BatchClient } from '@qbit/api-client';

// Set up token storage
const tokenStorage = new TokenStorage();
tokenStorage.setAccessToken('your-access-token');

// Create API client
const apiClient = new ApiClient('https://api.example.com', tokenStorage);

// Create batch client
const batchClient = new BatchClient(apiClient);
```

## Creating a Batch of Journal Entries

```typescript
// Prepare batch data
const batchData = {
  description: 'Monthly batch import',
  entries: [
    {
      date: '2023-07-01',
      description: 'Office supplies',
      lines: [
        {
          accountId: '123e4567-e89b-12d3-a456-426614174000',
          description: 'Office supplies expense',
          debit: 500.00
        },
        {
          accountId: '123e4567-e89b-12d3-a456-426614174001',
          description: 'Cash payment',
          credit: 500.00
        }
      ]
    },
    {
      date: '2023-07-02',
      description: 'Client payment',
      lines: [
        {
          accountId: '123e4567-e89b-12d3-a456-426614174001',
          description: 'Cash received',
          debit: 1000.00
        },
        {
          accountId: '123e4567-e89b-12d3-a456-426614174002',
          description: 'Accounts receivable',
          credit: 1000.00
        }
      ]
    }
  ]
};

// Create the batch
async function createBatch() {
  try {
    const result = await batchClient.createBatch(batchData);
    console.log('Batch created:', result);
    return result.id; // Return the batch ID for further processing
  } catch (error) {
    console.error('Error creating batch:', error);
  }
}
```

## Retrieving Batches

```typescript
// Get all batches with pagination
async function getBatches() {
  try {
    const { data, meta } = await batchClient.getBatches(0, 10);
    console.log(`Found ${meta.total} batches`);
    console.log('Batches:', data);
  } catch (error) {
    console.error('Error getting batches:', error);
  }
}

// Get a specific batch by ID
async function getBatch(batchId) {
  try {
    const batch = await batchClient.getBatch(batchId);
    console.log('Batch details:', batch);
    
    // Check batch status
    console.log(`Batch status: ${batch.status}`);
    console.log(`Items: ${batch.itemCount}, Processed: ${batch.processedCount}, Failed: ${batch.failedCount}`);
    
    // Check batch items
    if (batch.items) {
      batch.items.forEach(item => {
        console.log(`Item ${item.id} status: ${item.status}`);
        if (item.errorMessage) {
          console.log(`Error: ${item.errorMessage}`);
        }
      });
    }
  } catch (error) {
    console.error('Error getting batch:', error);
  }
}
```

## Processing a Batch

```typescript
// Process a batch
async function processBatch(batchId) {
  try {
    const result = await batchClient.processBatch(batchId);
    console.log('Processing started:', result);
    
    // Since processing happens asynchronously, you'll need to poll for updates
    await pollBatchStatus(batchId);
  } catch (error) {
    console.error('Error processing batch:', error);
  }
}

// Poll for batch status updates
async function pollBatchStatus(batchId) {
  let completed = false;
  let attempts = 0;
  
  while (!completed && attempts < 30) {
    try {
      const batch = await batchClient.getBatch(batchId);
      console.log(`Current status: ${batch.status}, Processed: ${batch.processedCount}/${batch.itemCount}`);
      
      if (batch.status === 'COMPLETED' || batch.status === 'FAILED') {
        completed = true;
        console.log('Batch processing finished');
        
        if (batch.status === 'FAILED') {
          console.error('Batch processing failed');
        } else {
          console.log('Batch processing succeeded');
        }
      } else {
        // Wait before checking again
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Error polling batch status:', error);
      completed = true;
    }
    
    attempts++;
  }
}
```

## Cancelling a Batch

```typescript
// Cancel a batch
async function cancelBatch(batchId) {
  try {
    const result = await batchClient.cancelBatch(batchId);
    console.log('Batch cancelled:', result);
  } catch (error) {
    console.error('Error cancelling batch:', error);
  }
}
```

## Complete Example Workflow

```typescript
async function batchWorkflow() {
  // Create a batch
  const batchId = await createBatch();
  if (!batchId) return;
  
  // Get batch details
  await getBatch(batchId);
  
  // Process the batch
  await processBatch(batchId);
  
  // Get final batch status after processing
  await getBatch(batchId);
}

// Run the workflow
batchWorkflow();
``` 