'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: Date;
  user: {
    name: string | null;
    email: string | null;
  };
}

interface RecentOrdersProps {
  orders: Order[];
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Orders</CardTitle>
          <p className="text-sm text-gray-500">Latest orders from your store</p>
        </div>
        <Link
          href="/admin/orders"
          className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
        >
          View all <ExternalLink className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-gray-500">
                <th className="pb-3 font-medium">Order</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {orders.map((order) => (
                <tr key={order.id} className="border-b last:border-0">
                  <td className="py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-orange-600 hover:text-orange-700"
                    >
                      #{order.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3">
                    <div>
                      <p className="font-medium">
                        {order.user.name || 'Guest'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.user.email}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 text-gray-600">
                    {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="py-3 font-semibold">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="py-3">
                    <Badge
                      className={
                        statusColors[
                          order.status as keyof typeof statusColors
                        ] || 'bg-gray-100 text-gray-800'
                      }
                      variant="secondary"
                    >
                      {order.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
