import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  comparePrice: z.number().positive().optional().nullable(),
  costPrice: z.number().positive().optional().nullable(),
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
  categoryId: z.string().optional().nullable(),
  brandId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  images: z
    .array(
      z.object({
        id: z.string().optional(),
        url: z.string().url(),
        altText: z.string().optional(),
        position: z.number().int().min(0),
      })
    )
    .optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { position: 'asc' } },
        category: true,
        brand: true,
        _count: { select: { reviews: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = productSchema.parse(body);

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Generate slug from name if name changed
    const slug =
      validatedData.name !== existingProduct.name
        ? validatedData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        : existingProduct.slug;

    // Handle images - delete removed, update existing, create new
    const imageOperations: any = {};

    if (validatedData.images) {
      const existingImageIds = existingProduct.images.map((img) => img.id);
      const newImageIds = validatedData.images
        .filter((img) => img.id)
        .map((img) => img.id!);

      // Delete images not in the new list
      const imagesToDelete = existingImageIds.filter(
        (id) => !newImageIds.includes(id)
      );
      if (imagesToDelete.length > 0) {
        imageOperations.deleteMany = {
          id: { in: imagesToDelete },
        };
      }

      // Upsert images (update existing or create new)
      imageOperations.upsert = validatedData.images.map((img) => ({
        where: { id: img.id || 'new' },
        update: {
          url: img.url,
          altText: img.altText,
          position: img.position,
        },
        create: {
          url: img.url,
          altText: img.altText,
          position: img.position,
        },
      }));
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: validatedData.name,
        slug,
        description: validatedData.description,
        price: validatedData.price,
        comparePrice: validatedData.comparePrice,
        costPrice: validatedData.costPrice,
        sku: validatedData.sku,
        barcode: validatedData.barcode,
        quantity: validatedData.quantity,
        categoryId: validatedData.categoryId,
        brandId: validatedData.brandId,
        isActive: validatedData.isActive,
        isFeatured: validatedData.isFeatured,
        images:
          Object.keys(imageOperations).length > 0 ? imageOperations : undefined,
      },
      include: {
        images: true,
        category: true,
        brand: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Delete product (cascades to images)
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
