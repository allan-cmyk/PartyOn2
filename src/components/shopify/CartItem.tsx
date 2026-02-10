'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useCartContext } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';

interface CartItemProps {
  item: {
    id: string;
    quantity: number;
    merchandise: {
      id: string;
      title: string;
      price: {
        amount: string;
        currencyCode: string;
      };
      product: {
        title: string;
        handle: string;
        images?: {
          edges: Array<{
            node: {
              url: string;
              altText: string | null;
            };
          }>;
        };
      };
    };
  };
}

export default function CartItem({ item }: CartItemProps) {
  const { updateCartItem, removeFromCart, loading } = useCartContext();
  const [isRemoving, setIsRemoving] = React.useState(false);

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemove();
      return;
    }
    await updateCartItem(item.id, newQuantity);
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    await removeFromCart(item.id);
  };

  const imageUrl = item.merchandise.product.images?.edges[0]?.node.url;
  const price = parseFloat(item.merchandise.price.amount) * item.quantity;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={`flex gap-4 ${isRemoving ? 'opacity-50' : ''}`}
    >
      {/* Product Image */}
      <div className="w-20 h-20 bg-gray-100 flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.merchandise.product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1">
        <h3 className="font-medium text-gray-900 text-sm">{item.merchandise.product.title}</h3>
        {item.merchandise.title !== 'Default Title' && (
          <p className="text-gray-500 text-sm">{item.merchandise.title}</p>
        )}
        
        {/* Quantity Controls */}
        <div className="flex items-center mt-2">
          <button
            onClick={() => handleUpdateQuantity(item.quantity - 1)}
            disabled={loading || isRemoving}
            className="w-8 h-8 border border-gray-300 hover:border-brand-yellow transition-colors disabled:opacity-50"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="w-12 text-center text-sm">{item.quantity}</span>
          <button
            onClick={() => handleUpdateQuantity(item.quantity + 1)}
            disabled={loading || isRemoving}
            className="w-8 h-8 border border-gray-300 hover:border-brand-yellow transition-colors disabled:opacity-50"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Price & Remove */}
      <div className="text-right">
        <p className="font-medium text-gray-900">
          {formatPrice(price.toString(), item.merchandise.price.currencyCode)}
        </p>
        <button
          onClick={handleRemove}
          disabled={loading || isRemoving}
          className="text-gray-400 hover:text-red-600 text-sm mt-1 transition-colors disabled:opacity-50"
          aria-label="Remove item"
        >
          Remove
        </button>
      </div>
    </motion.div>
  );
}