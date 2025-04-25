import React from 'react';
import { Product } from '../../types/product';
import ProductCard from './ProductCard';

interface ProductListProps {
  products: Product[];
  onEditProduct?: (productId: string) => void;
  onDeleteProduct?: (productId: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  onEditProduct,
  onDeleteProduct,
}) => {
  if (!products.length) {
    return (
      <div className="py-8 text-center text-gray-500">
        No products found. Add some products to get started.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEditProduct ? () => onEditProduct(product.id) : undefined}
          onDelete={onDeleteProduct ? () => onDeleteProduct(product.id) : undefined}
        />
      ))}
    </div>
  );
};

export default ProductList; 