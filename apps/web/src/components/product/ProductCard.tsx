import React from 'react';
import { Product } from '@/hooks/useProducts';
import { EditIcon, DeleteIcon } from '@/icons';

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-medium text-gray-900 truncate">{product.name}</h3>
        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(product)}
              className="text-blue-600 hover:text-blue-800"
              aria-label="Edit product"
            >
              <EditIcon size={18} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(product.id)}
              className="text-red-600 hover:text-red-800"
              aria-label="Delete product"
            >
              <DeleteIcon size={18} />
            </button>
          )}
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
      
      <div className="flex flex-col space-y-1 mt-4">
        <div className="flex justify-between">
          <span className="text-gray-500 text-sm">Price:</span>
          <span className="text-gray-900 font-medium">${product.price.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 text-sm">SKU:</span>
          <span className="text-gray-900">{product.sku}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 text-sm">Category:</span>
          <span className="text-gray-900">{product.category}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 text-sm">Quantity:</span>
          <span className={`font-medium ${product.quantity > 10 ? 'text-green-600' : product.quantity > 0 ? 'text-orange-500' : 'text-red-600'}`}>
            {product.quantity} in stock
          </span>
        </div>
      </div>
    </div>
  );
}; 