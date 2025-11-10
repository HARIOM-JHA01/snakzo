import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { OrderDetailsView } from '@/components/admin/orders/order-details-view';

export const metadata: Metadata = {
  title: 'Order Details | Admin Dashboard',
  description: 'View and manage order details',
};

async function getOrder(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      address: true,
      items: {
        include: {
          product: {
            include: {
              images: { take: 1 },
            },
          },
        },
      },
    },
  });

  return order;
}

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <OrderDetailsView order={order} />
    </div>
  );
}
