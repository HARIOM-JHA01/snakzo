import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import CollectionsTable from '@/components/admin/collections/collections-table';
import CollectionsTableSkeleton from '@/components/admin/collections/collections-table-skeleton';

export const metadata = {
  title: 'Collections | Admin Dashboard',
  description: 'Manage product collections',
};

export default async function CollectionsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
          <p className="text-muted-foreground">
            Manage product collections and featured groups
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/collections/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Collection
          </Link>
        </Button>
      </div>

      <Suspense fallback={<CollectionsTableSkeleton />}>
        <CollectionsTable />
      </Suspense>
    </div>
  );
}
