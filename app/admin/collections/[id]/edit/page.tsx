import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CollectionForm from '@/components/admin/collections/collection-form';

export const metadata = {
  title: 'Edit Collection | Admin Dashboard',
  description: 'Edit product collection',
};

interface EditCollectionPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCollectionPage({
  params,
}: EditCollectionPageProps) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  const { id } = await params;

  const collection = await prisma.collection.findUnique({
    where: { id },
    include: {
      products: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!collection) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Collection</h1>
        <p className="text-muted-foreground">Update collection information</p>
      </div>

      <CollectionForm collection={collection} />
    </div>
  );
}
