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
        url: z.string().url(),
        altText: z.string().optional(),
        position: z.number().int().min(0),
      })
    )
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = productSchema.parse(body);

    // Generate slug from name
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Create product with images
    const product = await prisma.product.create({
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
        images: validatedData.images
          ? {
              create: validatedData.images,
            }
          : undefined,
      },
      include: {
        images: true,
        category: true,
        brand: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const perPage = Number(searchParams.get('perPage')) || 10;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    const where = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                {
                  description: {
                    contains: search,
                    mode: 'insensitive' as const,
                  },
                },
              ],
            }
          : {},
        category ? { categoryId: category } : {},
      ],
    };

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          brand: true,
          images: { take: 1 },
          _count: { select: { reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      totalCount,
      totalPages: Math.ceil(totalCount / perPage),
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
