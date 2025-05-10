import prisma from './lib/prisma';

/**
 * Seeds shipping methods, shipping rates, and tax rates for initial setup
 */
export async function seedShippingData() {
  console.log('Seeding shipping methods, rates, and tax rates...');
  
  try {
    // Check if shipping methods already exist
    const existingMethods = await prisma.shippingMethod.count();
    
    if (existingMethods > 0) {
      console.log('Shipping methods already exist, skipping seed.');
      return;
    }
    
    // Create shipping methods
    const standardShipping = await prisma.shippingMethod.create({
      data: {
        name: 'Standard Shipping',
        description: 'Standard delivery service',
        estimatedDays: '5-7 business days',
        isActive: true,
        defaultCost: 10.0
      }
    });
    
    const expressShipping = await prisma.shippingMethod.create({
      data: {
        name: 'Express Shipping',
        description: 'Faster delivery service',
        estimatedDays: '2-3 business days',
        isActive: true,
        defaultCost: 20.0
      }
    });
    
    const nextDayShipping = await prisma.shippingMethod.create({
      data: {
        name: 'Next Day Delivery',
        description: 'Get it tomorrow!',
        estimatedDays: '1 business day',
        isActive: true,
        defaultCost: 35.0
      }
    });
    
    console.log('Created shipping methods');
    
    // Create shipping rates for different regions
    
    // US rates - Standard shipping
    await prisma.shippingRate.create({
      data: {
        shippingMethodId: standardShipping.id,
        country: 'US',
        state: null, // Applies to all states
        minWeight: 0,
        maxWeight: 5,
        cost: 8.95
      }
    });
    
    await prisma.shippingRate.create({
      data: {
        shippingMethodId: standardShipping.id,
        country: 'US',
        state: null,
        minWeight: 5.01,
        maxWeight: 10,
        cost: 12.95
      }
    });
    
    // California specific rate (higher)
    await prisma.shippingRate.create({
      data: {
        shippingMethodId: standardShipping.id,
        country: 'US',
        state: 'CA',
        minWeight: 0,
        maxWeight: 10,
        cost: 14.95
      }
    });
    
    // US rates - Express shipping
    await prisma.shippingRate.create({
      data: {
        shippingMethodId: expressShipping.id,
        country: 'US',
        state: null,
        minWeight: 0,
        maxWeight: 5,
        cost: 18.95
      }
    });
    
    await prisma.shippingRate.create({
      data: {
        shippingMethodId: expressShipping.id,
        country: 'US',
        state: null,
        minWeight: 5.01,
        maxWeight: 10,
        cost: 24.95
      }
    });
    
    // US rates - Next Day
    await prisma.shippingRate.create({
      data: {
        shippingMethodId: nextDayShipping.id,
        country: 'US',
        state: null,
        minWeight: 0,
        maxWeight: 5,
        cost: 29.95
      }
    });
    
    await prisma.shippingRate.create({
      data: {
        shippingMethodId: nextDayShipping.id,
        country: 'US',
        state: null,
        minWeight: 5.01,
        maxWeight: 10,
        cost: 39.95
      }
    });
    
    // Canada rates - Standard
    await prisma.shippingRate.create({
      data: {
        shippingMethodId: standardShipping.id,
        country: 'CA',
        state: null,
        minWeight: 0,
        maxWeight: 10,
        cost: 15.95
      }
    });
    
    // Canada rates - Express
    await prisma.shippingRate.create({
      data: {
        shippingMethodId: expressShipping.id,
        country: 'CA',
        state: null,
        minWeight: 0,
        maxWeight: 10,
        cost: 28.95
      }
    });
    
    // International rates - Standard
    await prisma.shippingRate.create({
      data: {
        shippingMethodId: standardShipping.id,
        country: '',  // Default for all other countries
        minWeight: 0,
        maxWeight: 10,
        cost: 24.95
      }
    });
    
    console.log('Created shipping rates');
    
    // Create tax rates for different regions
    
    // Default tax rate for US (no sales tax)
    await prisma.taxRate.create({
      data: {
        country: 'US',
        state: null,
        rate: 0.0,
        description: 'No federal sales tax',
        isActive: true
      }
    });
    
    // California tax rate
    await prisma.taxRate.create({
      data: {
        country: 'US',
        state: 'CA',
        rate: 0.0725,
        description: 'California state sales tax',
        isActive: true
      }
    });
    
    // New York tax rate
    await prisma.taxRate.create({
      data: {
        country: 'US',
        state: 'NY',
        rate: 0.045,
        description: 'New York state sales tax',
        isActive: true
      }
    });
    
    // Texas tax rate
    await prisma.taxRate.create({
      data: {
        country: 'US',
        state: 'TX',
        rate: 0.0625,
        description: 'Texas state sales tax',
        isActive: true
      }
    });
    
    // Canada tax rate (GST)
    await prisma.taxRate.create({
      data: {
        country: 'CA',
        state: null,
        rate: 0.05,
        description: 'Canada GST',
        isActive: true
      }
    });
    
    // UK tax rate (VAT)
    await prisma.taxRate.create({
      data: {
        country: 'GB',
        state: null,
        rate: 0.2,
        description: 'UK VAT',
        isActive: true
      }
    });
    
    // Default international tax rate
    await prisma.taxRate.create({
      data: {
        country: '',
        state: null,
        rate: 0.0,
        description: 'Default international tax rate',
        isActive: true
      }
    });
    
    console.log('Created tax rates');
    
    console.log('Successfully seeded shipping data.');
  } catch (error) {
    console.error('Error seeding shipping data:', error);
  }
}

// Run the seed function if called directly
if (require.main === module) {
  seedShippingData()
    .then(() => {
      console.log('Shipping seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Shipping seed failed:', error);
      process.exit(1);
    });
} 