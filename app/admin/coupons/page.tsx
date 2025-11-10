import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CouponsTable from '@/components/admin/coupons/coupons-table';
import CouponsTableSkeleton from '@/components/admin/coupons/coupons-table-skeleton';

export const metadata = {
  title: 'Coupons | Admin Dashboard',
  description: 'Manage discount coupons',
};

export default async function CouponsPage() {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
          <p className="text-muted-foreground">
            Manage discount coupons and promotions
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/coupons/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Coupon
          </Link>
        </Button>
      </div>

      <Suspense fallback={<CouponsTableSkeleton />}>
        <CouponsTable />
      </Suspense>
    </div>
  );
}
