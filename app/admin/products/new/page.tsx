import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ProductForm } from '@/components/admin/products/product-form';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Add Product | Admin Dashboard',
  description: 'Add a new product to your inventory',
};

async function getFormData() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }),
    prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return { categories, brands };
}

export default async function NewProductPage() {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const { categories, brands } = await getFormData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Product</h1>
        <p className="text-gray-500">Create a new product in your inventory</p>
      </div>

      <ProductForm categories={categories} brands={brands} />
    </div>
  );
}
