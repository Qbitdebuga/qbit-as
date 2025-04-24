-- CreateTable
CREATE TABLE "inventory_transactions" (
    "id" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "sourceWarehouseId" TEXT,
    "targetWarehouseId" TEXT,
    "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "notes" TEXT,
    "isBackordered" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "completedBy" TEXT,
    "cancelledBy" TEXT,
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_lines" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "productId" INTEGER,
    "variantId" INTEGER,
    "sourceLocationId" INTEGER,
    "targetLocationId" INTEGER,
    "expectedQuantity" DECIMAL(10,2) NOT NULL,
    "processedQuantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "lotNumber" TEXT,
    "serialNumber" TEXT,
    "expirationDate" TIMESTAMP(3),
    "unitCost" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_lines_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_sourceWarehouseId_fkey" FOREIGN KEY ("sourceWarehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_targetWarehouseId_fkey" FOREIGN KEY ("targetWarehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_lines" ADD CONSTRAINT "transaction_lines_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "inventory_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_lines" ADD CONSTRAINT "transaction_lines_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_lines" ADD CONSTRAINT "transaction_lines_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_lines" ADD CONSTRAINT "transaction_lines_sourceLocationId_fkey" FOREIGN KEY ("sourceLocationId") REFERENCES "warehouse_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_lines" ADD CONSTRAINT "transaction_lines_targetLocationId_fkey" FOREIGN KEY ("targetLocationId") REFERENCES "warehouse_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
