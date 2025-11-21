'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Folders,
  Tag,
  Star,
  Settings,
  BarChart3,
  Box,
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: Package,
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    name: 'Customers',
    href: '/admin/customers',
    icon: Users,
  },
  {
    name: 'Categories & Brands',
    href: '/admin/categories',
    icon: Folders,
  },
  {
    name: 'Collections',
    href: '/admin/collections',
    icon: Box,
  },
  {
    name: 'Coupons',
    href: '/admin/coupons',
    icon: Tag,
  },
  {
    name: 'Reviews',
    href: '/admin/reviews',
    icon: Star,
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden w-64 flex-col border-r bg-white md:flex">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-orange-500 to-orange-600 text-white font-bold">
            S
          </div>
          <div>
            <p className="text-sm font-semibold">Snakzo</p>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Store
        </Link>
      </div>
    </div>
  );
}
