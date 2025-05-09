import prisma from './lib/prisma';

/**
 * Initializes default content for the website if no content exists
 */
export async function setupDefaultContent() {
  try {
    // Check if we have any hero sections
    const heroCount = await prisma.heroSection.count();
    
    // Create default hero section if none exists
    if (heroCount === 0) {
      await prisma.heroSection.create({
        data: {
          title: 'Cutting-Edge Electronics',
          subtitle: 'New Arrivals',
          description: 'Discover the latest in technology with premium devices designed for the modern lifestyle.',
          primaryBtnText: 'Shop Now',
          primaryBtnLink: '/home/products',
          secondaryBtnText: 'View Deals',
          secondaryBtnLink: '/home/deals',
          imageUrl: '/placeholder.svg?height=400&width=400',
          active: true
        }
      });
      console.log('Created default hero section');
    }
    
    // Check if we have any deals banners
    const bannerCount = await prisma.dealsBanner.count();
    
    // Create default deals banner if none exists
    if (bannerCount === 0) {
      await prisma.dealsBanner.create({
        data: {
          title: 'Summer Savings Spectacular',
          subtitle: 'Flash Sale',
          description: 'Up to 40% off on selected electronics. Limited time offer!',
          buttonText: 'Shop Now',
          buttonLink: '/home/products',
          discount: '40%',
          backgroundColor: 'var(--voltBlue-600), var(--voltBlue-400)',
          imageUrl: '/placeholder.svg?height=400&width=1200',
          active: true
        }
      });
      console.log('Created default deals banner');
    }
    
    console.log('Content setup complete');
  } catch (error) {
    console.error('Error setting up default content:', error);
  }
} 