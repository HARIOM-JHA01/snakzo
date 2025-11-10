'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { formatNumber } from '@/lib/utils';

interface TopProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: Array<{ url: string }>;
  orderCount: number;
  totalSold: number;
}

interface TopProductsProps {
  products: TopProduct[];
}

export function TopProducts({ products }: TopProductsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
        <p className="text-sm text-gray-500">
          Best selling products this month
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 rounded-lg border p-3"
            >
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                {product.images?.[0]?.url ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-400">
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{product.name}</p>
                <p className="text-sm text-gray-500">
                  {formatNumber(product.totalSold)} sold
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-orange-600">
                  ${product.price.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatNumber(product.orderCount)} orders
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
