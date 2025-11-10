'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ArrowLeft, Package, User, MapPin, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import type {
  Order,
  OrderItem,
  Product,
  ProductImage,
  User as PrismaUser,
  Address,
  OrderStatus,
} from '@prisma/client';

interface OrderWithDetails extends Order {
  user: Pick<PrismaUser, 'id' | 'name' | 'email'>;
  address: Address;
  items: Array<
    OrderItem & {
      product: Product & {
        images: ProductImage[];
      };
    }
  >;
}

interface OrderDetailsViewProps {
  order: OrderWithDetails;
}

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-cyan-100 text-cyan-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

const statusOptions: OrderStatus[] = [
  'PENDING',
  'PROCESSING',
  'CONFIRMED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
];

export function OrderDetailsView({
  order: initialOrder,
}: OrderDetailsViewProps) {
  const router = useRouter();
  const [order, setOrder] = useState(initialOrder);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const updatedOrder = await response.json();
      setOrder(updatedOrder);
      toast.success('Order status updated successfully');
      router.refresh();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Order #{order.orderNumber}</h1>
            <p className="text-gray-500">
              Placed on{' '}
              {format(new Date(order.createdAt), 'MMM dd, yyyy h:mm a')}
            </p>
          </div>
        </div>
        <Badge className={statusColors[order.status]}>{order.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {item.product.images?.[0]?.url ? (
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-gray-400">
                          N/A
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      {item.sku && (
                        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Order Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span>{formatCurrency(order.shippingCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
              <CardDescription>Update the order status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={order.status}
                onValueChange={(value) =>
                  handleStatusChange(value as OrderStatus)
                }
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Status</span>
                  <Badge variant="outline">{order.paymentStatus}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Method</span>
                  <span className="font-medium">{order.paymentMethod}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="font-medium">{order.user.name || 'N/A'}</p>
                <p className="text-gray-500">{order.user.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="font-medium">{order.address.fullName}</p>
              <p>{order.address.street}</p>
              <p>
                {order.address.city}, {order.address.state}{' '}
                {order.address.postalCode}
              </p>
              <p>{order.address.country}</p>
              <p className="text-gray-500 mt-2">Phone: {order.address.phone}</p>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
