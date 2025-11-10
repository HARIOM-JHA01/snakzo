import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import CouponForm from '@/components/admin/coupons/coupon-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface EditCouponPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditCouponPageProps) {
  const { id } = await params;
  return {
    title: `Edit Coupon ${id} | Admin Dashboard`,
    description: 'Edit coupon details',
  };
}

export default async function EditCouponPage({ params }: EditCouponPageProps) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  const { id } = await params;

  const coupon = await prisma.coupon.findUnique({
    where: { id },
  });

  if (!coupon) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/coupons">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Coupon</h1>
          <p className="text-muted-foreground">Update coupon: {coupon.code}</p>
        </div>
      </div>

      <CouponForm coupon={coupon} />
    </div>
  );
}
