'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';

interface StatsCardsProps {
  revenue: number;
  orders: number;
  customers: number;
  products: number;
}

export function StatsCards({
  revenue,
  orders,
  customers,
  products,
}: StatsCardsProps) {
  const stats = [
    {
      title: 'Total Revenue',
      value: formatCurrency(revenue),
      icon: DollarSign,
      change: '+12.5%',
      changeType: 'increase' as const,
    },
    {
      title: 'Total Orders',
      value: formatNumber(orders),
      icon: ShoppingCart,
      change: '+8.2%',
      changeType: 'increase' as const,
    },
    {
      title: 'Total Customers',
      value: formatNumber(customers),
      icon: Users,
      change: '+15.3%',
      changeType: 'increase' as const,
    },
    {
      title: 'Total Products',
      value: formatNumber(products),
      icon: Package,
      change: '+2',
      changeType: 'neutral' as const,
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-gray-500">
              <span
                className={
                  stat.changeType === 'increase'
                    ? 'text-green-600'
                    : 'text-gray-600'
                }
              >
                {stat.change}
              </span>{' '}
              from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
