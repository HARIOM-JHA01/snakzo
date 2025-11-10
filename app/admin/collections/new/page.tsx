import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CollectionForm from '@/components/admin/collections/collection-form';

export const metadata = {
  title: 'Add Collection | Admin Dashboard',
  description: 'Create a new product collection',
};

export default async function NewCollectionPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Collection</h1>
        <p className="text-muted-foreground">Create a new product collection</p>
      </div>

      <CollectionForm />
    </div>
  );
}
