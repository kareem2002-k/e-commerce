import express from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import prisma from '../lib/prisma';

const router = express.Router();

// Get available shipping methods
router.get('/methods', async (req, res) => {
  try {
    const shippingMethods = await prisma.shippingMethod.findMany({
      where: {
        isActive: true
      }
    });
    
    res.json(shippingMethods);
  } catch (error) {
    console.error('Error fetching shipping methods:', error);
    res.status(500).json({ message: 'Error fetching shipping methods' });
  }
});

// Get shipping estimate for cart (simplified version for cart display)
router.post('/estimate', async (req, res) => {
  try {
    const { 
      cartItems, 
      country, 
      state,
      postalCode,
      subtotal 
    } = req.body;
    
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      res.status(400).json({ message: 'Cart is empty or invalid' });
      return;
    }
    
    // Default to a generic location if not provided
    const userLocation = {
      country: country || 'US',
      state: state || '',
      postalCode: postalCode || ''
    };
    
    // Calculate total weight from cart items
    let totalWeight = 0;
    
    for (const item of cartItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { weight: true }
      });
      
      if (product) {
        totalWeight += (product.weight || 1.0) * item.quantity;
      }
    }
    
    // Only get standard shipping for estimate
    const standardShipping = await prisma.shippingMethod.findFirst({
      where: { 
        isActive: true,
        name: { contains: 'Standard', mode: 'insensitive' }
      },
      include: {
        shippingRates: {
          where: {
            OR: [
              // Exact country and state match
              {
                country: userLocation.country,
                state: userLocation.state,
              },
              // Country match, any state
              {
                country: userLocation.country,
                state: null,
              },
              // Default rate (empty country)
              {
                country: '',
              }
            ]
          }
        }
      }
    });
    
    if (!standardShipping) {
      res.status(404).json({ message: 'No standard shipping method found' });
      return;
    }
    
    // Find the most specific rate for this location
    let applicableRate = null;
    
    // Try to find a rate with postal code prefix match
    if (userLocation.postalCode) {
      const postalCodePrefix = userLocation.postalCode.substring(0, 3);
      
      applicableRate = standardShipping.shippingRates.find(rate => 
        rate.country === userLocation.country && 
        rate.state === userLocation.state &&
        rate.postalCodePrefix === postalCodePrefix &&
        (rate.minOrderAmount === null || subtotal >= rate.minOrderAmount) &&
        (rate.maxOrderAmount === null || subtotal <= rate.maxOrderAmount) &&
        (rate.minWeight === null || totalWeight >= rate.minWeight) &&
        (rate.maxWeight === null || totalWeight <= rate.maxWeight)
      );
    }
    
    // If no postal code specific rate, try state level
    if (!applicableRate) {
      applicableRate = standardShipping.shippingRates.find(rate => 
        rate.country === userLocation.country && 
        rate.state === userLocation.state &&
        rate.postalCodePrefix === null &&
        (rate.minOrderAmount === null || subtotal >= rate.minOrderAmount) &&
        (rate.maxOrderAmount === null || subtotal <= rate.maxOrderAmount) &&
        (rate.minWeight === null || totalWeight >= rate.minWeight) &&
        (rate.maxWeight === null || totalWeight <= rate.maxWeight)
      );
    }
    
    // If no state level, try country level
    if (!applicableRate) {
      applicableRate = standardShipping.shippingRates.find(rate => 
        rate.country === userLocation.country && 
        rate.state === null &&
        (rate.minOrderAmount === null || subtotal >= rate.minOrderAmount) &&
        (rate.maxOrderAmount === null || subtotal <= rate.maxOrderAmount) &&
        (rate.minWeight === null || totalWeight >= rate.minWeight) &&
        (rate.maxWeight === null || totalWeight <= rate.maxWeight)
      );
    }
    
    // If no country level, use default
    if (!applicableRate) {
      applicableRate = standardShipping.shippingRates.find(rate => 
        rate.country === '' ||
        (
          (rate.minOrderAmount === null || subtotal >= rate.minOrderAmount) &&
          (rate.maxOrderAmount === null || subtotal <= rate.maxOrderAmount) &&
          (rate.minWeight === null || totalWeight >= rate.minWeight) &&
          (rate.maxWeight === null || totalWeight <= rate.maxWeight)
        )
      );
    }
    
    // Calculate base cost
    const baseCost = applicableRate ? applicableRate.cost : standardShipping.defaultCost;
    
    // Calculate distance-based fee
    let distanceFee = 0;
    
    // Base distance determination on country and region
    const isInternational = userLocation.country !== 'US';
    const isEgypt = userLocation.country === 'EG' || userLocation.country === 'Egypt';
    const isCoastal = !isInternational && ['CA', 'OR', 'WA', 'NY', 'MA', 'FL'].includes(userLocation.state);
    const isCentral = !isInternational && ['TX', 'CO', 'IL', 'MI', 'OH'].includes(userLocation.state);
    
    if (isEgypt) {
      // Egypt has a special higher distance fee
      distanceFee = 30.00;
    } else if (isInternational) {
      // International shipping has the highest distance fee
      distanceFee = 20.00;
    } else if (isCoastal) {
      // Coastal states have a medium distance fee
      distanceFee = 7.50;
    } else if (isCentral) {
      // Central states have a low distance fee
      distanceFee = 5.00;
    } else {
      // Other states have a standard distance fee
      distanceFee = 10.00;
    }
    
    // Add distance fee to the base cost
    const finalCost = baseCost + distanceFee;
    
    // Calculate tax rate based on location
    const taxRate = await calculateTaxRate({
      country: userLocation.country,
      state: userLocation.state,
      postalCode: userLocation.postalCode
    });
    
    const shippingEstimate = {
      cost: finalCost,
      isFreeShipping: false,
      baseCost: baseCost,
      distanceFee: distanceFee,
      method: standardShipping.name,
      estimatedDays: standardShipping.estimatedDays,
      taxRate: taxRate
    };
    
    res.json(shippingEstimate);
  } catch (error) {
    console.error('Error calculating shipping estimate:', error);
    res.status(500).json({ message: 'Error calculating shipping estimate' });
  }
});

// Calculate shipping options for a cart
router.post('/calculate', async (req, res) => {
  try {
    const { 
      cartItems, 
      addressId, 
      subtotal 
    } = req.body;
    
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
       res.status(400).json({ message: 'Cart is empty or invalid' });
       return;
    }
    
    if (!addressId) {
      res.status(400).json({ message: 'Shipping address is required' });
      return;
    }
    
    // Get the shipping address
    const address = await prisma.address.findUnique({
      where: { id: addressId }
    });
    
    if (!address) {
      res.status(400).json({ message: 'Invalid shipping address' });
      return;
    }
    
    // Calculate total weight from cart items
    let totalWeight = 0;
    
    for (const item of cartItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { weight: true }
      });
      
      if (product) {
        totalWeight += (product.weight || 1.0) * item.quantity;
      }
    }
    
    // Get all active shipping methods
    const shippingMethods = await prisma.shippingMethod.findMany({
      where: { isActive: true },
      include: {
        shippingRates: {
          where: {
            OR: [
              // Exact country and state match
              {
                country: address.country,
                state: address.state,
              },
              // Country match, any state
              {
                country: address.country,
                state: null,
              },
              // Default rate (empty country)
              {
                country: '',
              }
            ]
          }
        }
      }
    });
    
    // Calculate applicable shipping options
    const shippingOptions = shippingMethods.map(method => {
      // Find the most specific rate for this address
      let applicableRate = null;
      
      // Try to find a rate with postal code prefix match
      if (address.postalCode) {
        const postalCodePrefix = address.postalCode.substring(0, 3);
        
        applicableRate = method.shippingRates.find(rate => 
          rate.country === address.country && 
          rate.state === address.state &&
          rate.postalCodePrefix === postalCodePrefix &&
          (rate.minOrderAmount === null || subtotal >= rate.minOrderAmount) &&
          (rate.maxOrderAmount === null || subtotal <= rate.maxOrderAmount) &&
          (rate.minWeight === null || totalWeight >= rate.minWeight) &&
          (rate.maxWeight === null || totalWeight <= rate.maxWeight)
        );
      }
      
      // If no postal code specific rate, try state level
      if (!applicableRate) {
        applicableRate = method.shippingRates.find(rate => 
          rate.country === address.country && 
          rate.state === address.state &&
          rate.postalCodePrefix === null &&
          (rate.minOrderAmount === null || subtotal >= rate.minOrderAmount) &&
          (rate.maxOrderAmount === null || subtotal <= rate.maxOrderAmount) &&
          (rate.minWeight === null || totalWeight >= rate.minWeight) &&
          (rate.maxWeight === null || totalWeight <= rate.maxWeight)
        );
      }
      
      // If no state level, try country level
      if (!applicableRate) {
        applicableRate = method.shippingRates.find(rate => 
          rate.country === address.country && 
          rate.state === null &&
          (rate.minOrderAmount === null || subtotal >= rate.minOrderAmount) &&
          (rate.maxOrderAmount === null || subtotal <= rate.maxOrderAmount) &&
          (rate.minWeight === null || totalWeight >= rate.minWeight) &&
          (rate.maxWeight === null || totalWeight <= rate.maxWeight)
        );
      }
      
      // If no country level, use default
      if (!applicableRate) {
        applicableRate = method.shippingRates.find(rate => 
          rate.country === '' ||
          (
            (rate.minOrderAmount === null || subtotal >= rate.minOrderAmount) &&
            (rate.maxOrderAmount === null || subtotal <= rate.maxOrderAmount) &&
            (rate.minWeight === null || totalWeight >= rate.minWeight) &&
            (rate.maxWeight === null || totalWeight <= rate.maxWeight)
          )
        );
      }
      
      // Calculate base cost
      const baseCost = applicableRate ? applicableRate.cost : method.defaultCost;
      
      // Calculate distance-based fees for all shipping options
      let distanceFee = 0;
      
      // Use a zone-based distance fee calculation
      // Base distance determination on country and region
      const isInternational = address.country !== 'US';
      const isEgypt = address.country === 'EG' || address.country === 'Egypt';
      const isCoastal = !isInternational && ['CA', 'OR', 'WA', 'NY', 'MA', 'FL'].includes(address.state);
      const isCentral = !isInternational && ['TX', 'CO', 'IL', 'MI', 'OH'].includes(address.state);
      
      if (isEgypt) {
        // Egypt has special higher fees
        if (method.name.toLowerCase().includes('next day')) {
          distanceFee = 60.00;
        } else if (method.name.toLowerCase().includes('express')) {
          distanceFee = 40.00;
        } else {
          // Standard shipping
          distanceFee = 30.00;
        }
      } else if (isInternational) {
        // International shipping has the highest distance fee
        if (method.name.toLowerCase().includes('next day')) {
          distanceFee = 45.00;
        } else if (method.name.toLowerCase().includes('express')) {
          distanceFee = 25.00;
        } else {
          // Standard shipping
          distanceFee = 20.00;
        }
      } else if (isCoastal) {
        // Coastal states have a medium distance fee
        if (method.name.toLowerCase().includes('next day')) {
          distanceFee = 20.00;
        } else if (method.name.toLowerCase().includes('express')) {
          distanceFee = 10.00;
        } else {
          // Standard shipping
          distanceFee = 7.50;
        }
      } else if (isCentral) {
        // Central states have a low distance fee
        if (method.name.toLowerCase().includes('next day')) {
          distanceFee = 15.00;
        } else if (method.name.toLowerCase().includes('express')) {
          distanceFee = 5.00;
        } else {
          // Standard shipping
          distanceFee = 5.00;
        }
      } else {
        // Other states have a standard distance fee
        if (method.name.toLowerCase().includes('next day')) {
          distanceFee = 25.00;
        } else if (method.name.toLowerCase().includes('express')) {
          distanceFee = 15.00;
        } else {
          // Standard shipping
          distanceFee = 10.00;
        }
      }
      
      // Always add distance fee to base cost - no free shipping
      const finalCost = baseCost + distanceFee;
      
      return {
        id: method.id,
        name: method.name,
        description: method.description,
        estimatedDays: method.estimatedDays,
        cost: finalCost,
        isFreeShipping: false,
        baseCost: baseCost,
        distanceFee: distanceFee
      };
    });
    
    // Calculate tax rate for this address
    const taxRate = await calculateTaxRate(address);
    
    res.json({
      shippingOptions,
      taxRate
    });
  } catch (error) {
    console.error('Error calculating shipping options:', error);
    res.status(500).json({ message: 'Error calculating shipping options' });
  }
});

// Helper function to calculate tax rate based on address
async function calculateTaxRate(address: { country: string; state: string; postalCode: string }) {
  try {
    // Try to find the most specific tax rate
    let taxRate = null;
    
    // If the country is Egypt, apply a fixed 14% VAT rate (Egypt's standard VAT)
    if (address.country === 'EG' || address.country === 'Egypt') {
      return 0.14; // 14% VAT for Egypt
    }
    
    // Try postal code specific rate first
    if (address.postalCode) {
      const postalCodePrefix = address.postalCode.substring(0, 3);
      
      taxRate = await prisma.taxRate.findFirst({
        where: {
          country: address.country,
          state: address.state,
          postalCodePrefix,
          isActive: true
        }
      });
    }
    
    // If no postal code rate, try state level
    if (!taxRate) {
      taxRate = await prisma.taxRate.findFirst({
        where: {
          country: address.country,
          state: address.state,
          postalCodePrefix: null,
          isActive: true
        }
      });
    }
    
    // If no state level, try country level
    if (!taxRate) {
      taxRate = await prisma.taxRate.findFirst({
        where: {
          country: address.country,
          state: null,
          postalCodePrefix: null,
          isActive: true
        }
      });
    }
    
    // Default tax rate if nothing else found
    return taxRate ? taxRate.rate : 0.0;
  } catch (error) {
    console.error('Error calculating tax rate:', error);
    return 0.0; // Default to 0% if there's an error
  }
}

// Admin-only routes
// All routes below this middleware require admin privileges
router.use(authenticate);
router.use(requireAdmin);

// Get all shipping methods (admin)
router.get('/admin/methods', async (req, res) => {
  try {
    const shippingMethods = await prisma.shippingMethod.findMany({
      include: {
        shippingRates: true
      }
    });
    
    res.json(shippingMethods);
  } catch (error) {
    console.error('Error fetching shipping methods:', error);
    res.status(500).json({ message: 'Error fetching shipping methods' });
  }
});

// Create shipping method (admin)
router.post('/admin/methods', async (req, res) => {
  try {
    const { name, description, estimatedDays, isActive, defaultCost } = req.body;
    
    const shippingMethod = await prisma.shippingMethod.create({
      data: {
        name,
        description,
        estimatedDays,
        isActive: isActive !== undefined ? isActive : true,
        defaultCost: parseFloat(defaultCost)
      }
    });
    
    res.status(201).json(shippingMethod);
  } catch (error) {
    console.error('Error creating shipping method:', error);
    res.status(500).json({ message: 'Error creating shipping method' });
  }
});

// Update shipping method (admin)
router.put('/admin/methods/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, estimatedDays, isActive, defaultCost } = req.body;
    
    const shippingMethod = await prisma.shippingMethod.update({
      where: { id },
      data: {
        name,
        description,
        estimatedDays,
        isActive,
        defaultCost: parseFloat(defaultCost)
      }
    });
    
    res.json(shippingMethod);
  } catch (error) {
    console.error('Error updating shipping method:', error);
    res.status(500).json({ message: 'Error updating shipping method' });
  }
});

// Delete shipping method (admin)
router.delete('/admin/methods/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.shippingMethod.delete({
      where: { id }
    });
    
    res.json({ message: 'Shipping method deleted successfully' });
  } catch (error) {
    console.error('Error deleting shipping method:', error);
    res.status(500).json({ message: 'Error deleting shipping method' });
  }
});

// Create shipping rate (admin)
router.post('/admin/rates', async (req, res) => {
  try {
    const { 
      shippingMethodId,
      country,
      state,
      postalCodePrefix,
      minOrderAmount,
      maxOrderAmount,
      minWeight,
      maxWeight,
      cost
    } = req.body;
    
    const shippingRate = await prisma.shippingRate.create({
      data: {
        shippingMethod: {
          connect: { id: shippingMethodId }
        },
        country: country || '',
        state,
        postalCodePrefix,
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxOrderAmount: maxOrderAmount ? parseFloat(maxOrderAmount) : null,
        minWeight: minWeight ? parseFloat(minWeight) : null,
        maxWeight: maxWeight ? parseFloat(maxWeight) : null,
        cost: parseFloat(cost)
      }
    });
    
    res.status(201).json(shippingRate);
  } catch (error) {
    console.error('Error creating shipping rate:', error);
    res.status(500).json({ message: 'Error creating shipping rate' });
  }
});

// Update shipping rate (admin)
router.put('/admin/rates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      shippingMethodId,
      country,
      state,
      postalCodePrefix,
      minOrderAmount,
      maxOrderAmount,
      minWeight,
      maxWeight,
      cost
    } = req.body;
    
    const shippingRate = await prisma.shippingRate.update({
      where: { id },
      data: {
        shippingMethod: shippingMethodId ? {
          connect: { id: shippingMethodId }
        } : undefined,
        country: country || '',
        state,
        postalCodePrefix,
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxOrderAmount: maxOrderAmount ? parseFloat(maxOrderAmount) : null,
        minWeight: minWeight ? parseFloat(minWeight) : null,
        maxWeight: maxWeight ? parseFloat(maxWeight) : null,
        cost: parseFloat(cost)
      }
    });
    
    res.json(shippingRate);
  } catch (error) {
    console.error('Error updating shipping rate:', error);
    res.status(500).json({ message: 'Error updating shipping rate' });
  }
});

// Delete shipping rate (admin)
router.delete('/admin/rates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.shippingRate.delete({
      where: { id }
    });
    
    res.json({ message: 'Shipping rate deleted successfully' });
  } catch (error) {
    console.error('Error deleting shipping rate:', error);
    res.status(500).json({ message: 'Error deleting shipping rate' });
  }
});

// Get all tax rates (admin)
router.get('/admin/tax-rates', async (req, res) => {
  try {
    const taxRates = await prisma.taxRate.findMany();
    
    res.json(taxRates);
  } catch (error) {
    console.error('Error fetching tax rates:', error);
    res.status(500).json({ message: 'Error fetching tax rates' });
  }
});

// Create tax rate (admin)
router.post('/admin/tax-rates', async (req, res) => {
  try {
    const { country, state, postalCodePrefix, rate, description, isActive } = req.body;
    
    const taxRate = await prisma.taxRate.create({
      data: {
        country,
        state,
        postalCodePrefix,
        rate: parseFloat(rate),
        description,
        isActive: isActive !== undefined ? isActive : true
      }
    });
    
    res.status(201).json(taxRate);
  } catch (error) {
    console.error('Error creating tax rate:', error);
    res.status(500).json({ message: 'Error creating tax rate' });
  }
});

// Update tax rate (admin)
router.put('/admin/tax-rates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { country, state, postalCodePrefix, rate, description, isActive } = req.body;
    
    const taxRate = await prisma.taxRate.update({
      where: { id },
      data: {
        country,
        state,
        postalCodePrefix,
        rate: parseFloat(rate),
        description,
        isActive
      }
    });
    
    res.json(taxRate);
  } catch (error) {
    console.error('Error updating tax rate:', error);
    res.status(500).json({ message: 'Error updating tax rate' });
  }
});

// Delete tax rate (admin)
router.delete('/admin/tax-rates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.taxRate.delete({
      where: { id }
    });
    
    res.json({ message: 'Tax rate deleted successfully' });
  } catch (error) {
    console.error('Error deleting tax rate:', error);
    res.status(500).json({ message: 'Error deleting tax rate' });
  }
});

export default router; 