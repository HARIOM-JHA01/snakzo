'use client';

import {
  User,
  Order,
  Address,
  OrderItem,
  Product,
  ProductImage,
} from '@prisma/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, Mail, Calendar, ShoppingBag, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface CustomerWithDetails extends User {
  orders: (Order & {
    items: (OrderItem & {
      product: Pick<Product, 'name'> & {
        images: ProductImage[];
      };
    })[];
  })[];
  addresses: Address[];
}

interface CustomerDetailsViewProps {
  customer: CustomerWithDetails;
  totalSpent: number;
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

export function CustomerDetailsView({
  customer,
  totalSpent,
}: CustomerDetailsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/customers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Customer Details</h1>
            <p className="text-muted-foreground">
              View customer information and order history
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={customer.image || undefined}
                  alt={customer.name || ''}
                />
                <AvatarFallback className="text-2xl">
                  {customer.name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-center space-y-1">
                <h3 className="text-xl font-semibold">
                  {customer.name || 'N/A'}
                </h3>
                <Badge
                  variant={customer.role === 'ADMIN' ? 'default' : 'secondary'}
                >
                  {customer.role}
                </Badge>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Joined:</span>
                <span className="font-medium">
                  {format(new Date(customer.createdAt), 'MMM dd, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Total Orders:</span>
                <span className="font-medium">{customer.orders.length}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-muted-foreground mb-1">
                Total Spent
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(totalSpent)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Last 10 orders from this customer</CardDescription>
          </CardHeader>
          <CardContent>
            {customer.orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No orders yet
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">
                          {order.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex -space-x-2">
                            {order.items.slice(0, 3).map((item, idx) => (
                              <div
                                key={item.id}
                                className="relative h-8 w-8 rounded-full border-2 border-background overflow-hidden"
                              >
                                {item.product.images[0] && (
                                  <Image
                                    src={item.product.images[0].url}
                                    alt={item.product.name}
                                    fill
                                    className="object-cover"
                                  />
                                )}
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <div className="flex items-center justify-center h-8 w-8 rounded-full border-2 border-background bg-muted text-xs font-medium">
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(order.total)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={statusColors[order.status]}
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/orders/${order.id}`}>View</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Addresses
            </CardTitle>
            <CardDescription>Saved shipping addresses</CardDescription>
          </CardHeader>
          <CardContent>
            {customer.addresses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No addresses saved
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {customer.addresses.map((address) => (
                  <div
                    key={address.id}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    {address.isDefault && (
                      <Badge variant="outline" className="mb-2">
                        Default
                      </Badge>
                    )}
                    <div className="font-medium">{address.fullName}</div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>{address.street}</div>
                      <div>
                        {address.city}, {address.state} {address.postalCode}
                      </div>
                      <div>{address.country}</div>
                      <div className="pt-2">{address.phone}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
