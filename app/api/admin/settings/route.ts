import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/settings - Get all settings
export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get settings from database or return defaults
    const settings = await prisma.setting.findMany();

    // Convert array to object for easier access
    const settingsObj = settings.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      },
      {} as Record<string, string>
    );

    return NextResponse.json({
      general: {
        storeName: settingsObj.storeName || 'Snakzo',
        storeEmail: settingsObj.storeEmail || 'support@snakzo.com',
        storePhone: settingsObj.storePhone || '+1 (555) 123-4567',
        storeAddress:
          settingsObj.storeAddress || '123 Main St, City, State 12345',
        storeDescription:
          settingsObj.storeDescription ||
          'Your one-stop shop for quality products',
        currency: settingsObj.currency || 'USD',
        timezone: settingsObj.timezone || 'America/New_York',
      },
      shipping: {
        freeShippingThreshold: parseFloat(
          settingsObj.freeShippingThreshold || '50'
        ),
        flatRate: parseFloat(settingsObj.flatRate || '5.99'),
        enableFlatRate: settingsObj.enableFlatRate === 'true',
        enableFreeShipping: settingsObj.enableFreeShipping === 'true',
        processingTime: settingsObj.processingTime || '1-2 business days',
      },
      notifications: {
        orderConfirmation: settingsObj.orderConfirmation !== 'false',
        orderShipped: settingsObj.orderShipped !== 'false',
        orderDelivered: settingsObj.orderDelivered !== 'false',
        lowStockAlert: settingsObj.lowStockAlert !== 'false',
        newReview: settingsObj.newReview === 'true',
        newCustomer: settingsObj.newCustomer === 'true',
      },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// POST /api/admin/settings - Update settings
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { type, settings: settingsData } = data;

    // Prepare settings for database
    const settingsToUpdate: Array<{ key: string; value: string }> = [];

    if (type === 'general') {
      Object.entries(settingsData).forEach(([key, value]) => {
        settingsToUpdate.push({ key, value: String(value) });
      });
    } else if (type === 'shipping') {
      Object.entries(settingsData).forEach(([key, value]) => {
        settingsToUpdate.push({ key, value: String(value) });
      });
    } else if (type === 'notifications') {
      Object.entries(settingsData).forEach(([key, value]) => {
        settingsToUpdate.push({ key, value: String(value) });
      });
    }

    // Update or create settings in database
    await Promise.all(
      settingsToUpdate.map((setting) =>
        prisma.setting.upsert({
          where: { key: setting.key },
          update: { value: setting.value },
          create: {
            key: setting.key,
            value: setting.value,
          },
        })
      )
    );

    return NextResponse.json({ message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
