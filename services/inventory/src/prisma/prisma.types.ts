// Define Prisma types for warehouse models
export type WarehouseWhereUniqueInput = {
  id?: string
  code?: string
}

export type WarehouseWhereInput = {
  AND?: WarehouseWhereInput[]
  OR?: WarehouseWhereInput[]
  NOT?: WarehouseWhereInput[]
  id?: string | StringFilter
  code?: string | StringFilter
  name?: string | StringFilter
  description?: string | StringNullableFilter
  address?: string | StringNullableFilter
  city?: string | StringNullableFilter
  state?: string | StringNullableFilter
  postalCode?: string | StringNullableFilter
  country?: string | StringNullableFilter
  isActive?: boolean | BoolFilter
  isPrimary?: boolean | BoolFilter
  createdAt?: Date | DateTimeFilter
  updatedAt?: Date | DateTimeFilter
}

export type WarehouseOrderByWithRelationInput = {
  id?: SortOrder
  code?: SortOrder
  name?: SortOrder
  description?: SortOrder
  address?: SortOrder
  city?: SortOrder
  state?: SortOrder
  postalCode?: SortOrder
  country?: SortOrder
  isActive?: SortOrder
  isPrimary?: SortOrder
  createdAt?: SortOrder
  updatedAt?: SortOrder
  locations?: LocationOrderByRelationAggregateInput
}

export type WarehouseLocationWhereUniqueInput = {
  id?: number
  warehouseId_code?: WarehouseLocationWarehouseIdCodeCompoundUniqueInput
}

export type WarehouseLocationWhereInput = {
  AND?: WarehouseLocationWhereInput[]
  OR?: WarehouseLocationWhereInput[]
  NOT?: WarehouseLocationWhereInput[]
  id?: number | IntFilter
  warehouseId?: string | StringFilter
  name?: string | StringFilter
  code?: string | StringFilter
  description?: string | StringNullableFilter
  locationType?: string | StringNullableFilter
  isActive?: boolean | BoolFilter
  parentId?: number | IntNullableFilter
  createdAt?: Date | DateTimeFilter
  updatedAt?: Date | DateTimeFilter
}

export type WarehouseLocationOrderByWithRelationInput = {
  id?: SortOrder
  warehouseId?: SortOrder
  name?: SortOrder
  code?: SortOrder
  description?: SortOrder
  locationType?: SortOrder
  isActive?: SortOrder
  parentId?: SortOrder
  createdAt?: SortOrder
  updatedAt?: SortOrder
  warehouse?: WarehouseOrderByWithRelationInput
  parent?: WarehouseLocationOrderByWithRelationInput
  children?: LocationOrderByRelationAggregateInput
}

export type WarehouseLocationWarehouseIdCodeCompoundUniqueInput = {
  warehouseId: string
  code: string
}

// Helper types
export type StringFilter = {
  equals?: string
  in?: string[]
  notIn?: string[]
  lt?: string
  lte?: string
  gt?: string
  gte?: string
  contains?: string
  startsWith?: string
  endsWith?: string
  mode?: QueryMode
  not?: StringFilter
}

export type StringNullableFilter = {
  equals?: string | null
  in?: string[] | null
  notIn?: string[] | null
  lt?: string
  lte?: string
  gt?: string
  gte?: string
  contains?: string
  startsWith?: string
  endsWith?: string
  mode?: QueryMode
  not?: StringNullableFilter | null
}

export type BoolFilter = {
  equals?: boolean
  not?: BoolFilter
}

export type IntFilter = {
  equals?: number
  in?: number[]
  notIn?: number[]
  lt?: number
  lte?: number
  gt?: number
  gte?: number
  not?: IntFilter
}

export type IntNullableFilter = {
  equals?: number | null
  in?: number[] | null
  notIn?: number[] | null
  lt?: number
  lte?: number
  gt?: number
  gte?: number
  not?: IntNullableFilter | null
}

export type DateTimeFilter = {
  equals?: Date
  in?: Date[]
  notIn?: Date[]
  lt?: Date
  lte?: Date
  gt?: Date
  gte?: Date
  not?: DateTimeFilter
}

export enum SortOrder {
  asc = 'asc',
  desc = 'desc'
}

export enum QueryMode {
  default = 'default',
  insensitive = 'insensitive'
}

export type LocationOrderByRelationAggregateInput = {
  _count?: SortOrder
}

// Inventory Transaction types
export type InventoryTransactionWhereInput = {
  AND?: InventoryTransactionWhereInput[]
  OR?: InventoryTransactionWhereInput[]
  NOT?: InventoryTransactionWhereInput[]
  id?: string | StringFilter
  transactionType?: string | StringFilter
  referenceNumber?: string | StringNullableFilter
  referenceType?: string | StringNullableFilter
  referenceId?: string | StringNullableFilter
  sourceWarehouseId?: string | StringNullableFilter
  targetWarehouseId?: string | StringNullableFilter
  transactionDate?: Date | DateTimeFilter
  status?: string | StringFilter
  notes?: string | StringNullableFilter
  isBackordered?: boolean | BoolFilter
  createdAt?: Date | DateTimeFilter
  updatedAt?: Date | DateTimeFilter
}

export type InventoryTransactionOrderByWithRelationInput = {
  id?: SortOrder
  transactionType?: SortOrder
  referenceNumber?: SortOrder
  referenceType?: SortOrder
  referenceId?: SortOrder
  sourceWarehouseId?: SortOrder
  targetWarehouseId?: SortOrder
  transactionDate?: SortOrder
  status?: SortOrder
  notes?: SortOrder
  isBackordered?: SortOrder
  createdAt?: SortOrder
  updatedAt?: SortOrder
  lines?: TransactionLineOrderByRelationAggregateInput
  sourceWarehouse?: WarehouseOrderByWithRelationInput
  targetWarehouse?: WarehouseOrderByWithRelationInput
}

export type InventoryTransactionUpdateInput = {
  id?: string
  transactionType?: string
  referenceNumber?: string | null
  referenceType?: string | null
  referenceId?: string | null
  transactionDate?: Date | null
  status?: string
  notes?: string | null
  isBackordered?: boolean
  createdBy?: string | null
  completedBy?: string | null
  cancelledBy?: string | null
  completedAt?: Date | null
  cancelledAt?: Date | null
  sourceWarehouse?: WarehouseRelationFilter
  targetWarehouse?: WarehouseRelationFilter
  lines?: TransactionLineListUpdateInput
}

export type WarehouseRelationFilter = {
  connect?: { id: string }
  disconnect?: boolean
}

export type TransactionLineListUpdateInput = {
  create?: any[]
  update?: any[]
  delete?: any[]
}

export type TransactionLineOrderByRelationAggregateInput = {
  _count?: SortOrder
} 