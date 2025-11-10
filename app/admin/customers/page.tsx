import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CustomersTable } from '@/components/admin/customers/customers-table';
import { CustomersTableSkeleton } from '@/components/admin/customers/customers-table-skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface SearchParams {
  page?: string;
  search?: string;
  role?: string;
}

async function getCustomers(searchParams: SearchParams) {
  const page = Number(searchParams.page) || 1;
  const perPage = 10;
  const skip = (page - 1) * perPage;

  const where: any = {
    ...(searchParams.search && {
      OR: [
        {
          name: { contains: searchParams.search, mode: 'insensitive' as const },
        },
        {
          email: {
            contains: searchParams.search,
            mode: 'insensitive' as const,
          },
        },
      ],
    }),
    ...(searchParams.role && {
      role: searchParams.role as 'CUSTOMER' | 'ADMIN',
    }),
  };

  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    customers,
    pagination: {
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    },
  };
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  const params = await searchParams;

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  const { customers, pagination } = await getCustomers(params);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Customers</h1>
        <p className="text-muted-foreground">
          Manage your customers and their accounts
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
          <CardDescription>
            View and manage customer accounts, orders, and information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<CustomersTableSkeleton />}>
            <CustomersTable customers={customers} pagination={pagination} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
