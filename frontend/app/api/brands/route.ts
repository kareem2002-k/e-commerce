import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch all products to extract unique brands
    const response = await fetch('http://localhost:3001/products');
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch brands' }, 
        { status: response.status }
      );
    }
    
    const products = await response.json();
    
    // Extract and deduplicate brands
    const brands = Array.from(
      new Set(
        products
          .map((product: any) => product.brand)
          .filter(Boolean) // Remove null/undefined values
      )
    );
    
    return NextResponse.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brands' }, 
      { status: 500 }
    );
  }
} 