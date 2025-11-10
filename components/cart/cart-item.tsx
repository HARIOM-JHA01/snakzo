'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { useState } from 'react';

interface CartItemProps {
  item: {
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      slug: string;
      price: number;
      comparePrice: number | null;
      quantity: number;
      images: {
        url: string;
        altText: string | null;
      }[];
      brand: {
        name: string;
      } | null;
    };
  };
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const image = item.product.images[0];
  const hasDiscount =
    item.product.comparePrice && item.product.comparePrice > item.product.price;
  const savings = hasDiscount
    ? (item.product.comparePrice! - item.product.price) * item.quantity
    : 0;

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.product.quantity) return;

    setIsUpdating(true);
    try {
      await updateQuantity(item.id, newQuantity);
    } catch (error) {
      // Error is handled in useCart
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await removeFromCart(item.id);
    } catch (error) {
      setIsRemoving(false);
    }
  };

  return (
    <div className="flex gap-4 py-6 border-b">
      {/* Product Image */}
      <Link href={`/products/${item.product.slug}`} className="shrink-0">
        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted">
          {image ? (
            <Image
              src={image.url}
              alt={image.altText || item.product.name}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              No image
            </div>
          )}
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Link
              href={`/products/${item.product.slug}`}
              className="font-medium hover:text-primary transition-colors line-clamp-2"
            >
              {item.product.name}
            </Link>
            {item.product.brand && (
              <p className="text-sm text-muted-foreground mt-1">
                {item.product.brand.name}
              </p>
            )}
            {item.product.quantity < 10 && (
              <p className="text-sm text-orange-600 mt-1">
                Only {item.product.quantity} left in stock
              </p>
            )}
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="font-semibold">₹{item.product.price.toFixed(2)}</p>
            {hasDiscount && (
              <p className="text-sm text-muted-foreground line-through">
                ₹{item.product.comparePrice!.toFixed(2)}
              </p>
            )}
          </div>
        </div>

        {/* Quantity and Actions */}
        <div className="flex items-center justify-between mt-4">
          {/* Quantity Selector */}
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1 || isUpdating}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={item.quantity >= item.product.quantity || isUpdating}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleRemove}
            disabled={isRemoving}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isRemoving ? 'Removing...' : 'Remove'}
          </Button>
        </div>

        {/* Savings */}
        {savings > 0 && (
          <p className="text-sm text-green-600 mt-2">
            You save ₹{savings.toFixed(2)} on this item
          </p>
        )}

        {/* Subtotal */}
        <p className="text-sm text-muted-foreground mt-2">
          Subtotal: ₹{(item.product.price * item.quantity).toFixed(2)}
        </p>
      </div>
    </div>
  );
}
