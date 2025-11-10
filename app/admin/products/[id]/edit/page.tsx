import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ProductForm } from '@/components/admin/products/product-form';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Edit Product | Admin Dashboard',
  description: 'Edit product details',
};

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: 'asc' } },
      category: true,
      brand: true,
    },
  });

  return product;
}

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

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const { id } = await params;
  const [product, { categories, brands }] = await Promise.all([
    getProduct(id),
    getFormData(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="text-gray-500">Update product details</p>
      </div>

      <ProductForm product={product} categories={categories} brands={brands} />
    </div>
  );
}
