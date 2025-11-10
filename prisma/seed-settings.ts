import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSettings() {
  console.log('Seeding default settings...');

  const defaultSettings = [
    // General Settings
    { key: 'storeName', value: 'Quickhaat' },
    { key: 'storeEmail', value: 'support@quickhaat.com' },
    { key: 'storePhone', value: '+1 (555) 123-4567' },
    { key: 'storeAddress', value: '123 Main St, City, State 12345' },
    {
      key: 'storeDescription',
      value: 'Your one-stop shop for quality products',
    },
    { key: 'currency', value: 'USD' },
    { key: 'timezone', value: 'America/New_York' },

    // Shipping Settings
    { key: 'freeShippingThreshold', value: '50' },
    { key: 'flatRate', value: '5.99' },
    { key: 'enableFlatRate', value: 'true' },
    { key: 'enableFreeShipping', value: 'true' },
    { key: 'processingTime', value: '1-2 business days' },

    // Notification Settings
    { key: 'orderConfirmation', value: 'true' },
    { key: 'orderShipped', value: 'true' },
    { key: 'orderDelivered', value: 'true' },
    { key: 'lowStockAlert', value: 'true' },
    { key: 'newReview', value: 'false' },
    { key: 'newCustomer', value: 'false' },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log('✅ Default settings seeded successfully!');
}

seedSettings()
  .catch((e) => {
    console.error('Error seeding settings:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
