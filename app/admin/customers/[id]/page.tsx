import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CustomerDetailsView } from '@/components/admin/customers/customer-details-view';

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  const customer = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  images: {
                    take: 1,
                    orderBy: { position: 'asc' },
                  },
                },
              },
            },
          },
        },
      },
      addresses: true,
    },
  });

  if (!customer) {
    notFound();
  }

  // Calculate total spent
  const totalSpent = customer.orders.reduce(
    (sum: number, order: any) => sum + order.total,
    0
  );

  return (
    <div className="space-y-6">
      <CustomerDetailsView customer={customer} totalSpent={totalSpent} />
    </div>
  );
}
