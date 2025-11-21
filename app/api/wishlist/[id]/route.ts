import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the wishlist item belongs to the user
    const { id } = await context.params;
    const existingItem = await prisma.wishlist.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Wishlist item not found' },
        { status: 404 }
      );
    }

    await prisma.wishlist.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Removed from wishlist successfully',
    });
  } catch (error) {
    console.error('Delete wishlist item error:', error);
    return NextResponse.json(
      { error: 'Failed to remove from wishlist' },
      { status: 500 }
    );
  }
}
