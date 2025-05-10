import { NextRequest, NextResponse } from "next/server";
import { getUrl } from '@/utils';

export async function GET(request: NextRequest) {
  try {
    // Extract authentication token
    const authHeader = request.headers.get("Authorization");
    const token = authHeader ? authHeader.split(" ")[1] : null;
    
    // Get the URL and search parameters
    const url = new URL(request.url);
    const searchParams = new URLSearchParams();
    
    // Handle parameter name conversion (searchTerm → q) for text search
    const searchTerm = url.searchParams.get('searchTerm') || url.searchParams.get('q');
    if (searchTerm) {
      searchParams.append('q', searchTerm);
      console.log('Searching for text:', searchTerm);
    }
    
    // Forward other parameters directly, ensuring we capture price range
    ['category', 'minPrice', 'maxPrice', 'sortBy', 'brands'].forEach(param => {
      const value = url.searchParams.get(param);
      if (value) {
        searchParams.append(param, value);
        console.log(`Filter applied: ${param}=${value}`);
      }
    });
    
    // Forward these parameters to the backend
    const backendUrl = new URL(`${getUrl()}/products/search`);
    backendUrl.search = searchParams.toString();
    
    console.log('Searching with params:', backendUrl.toString());
    
    // Make the request to backend with cache control
    const response = await fetch(backendUrl.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store',
      next: { revalidate: 0 } // Prevent caching
    });
    
    if (!response.ok) {
      console.error('Search API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: "Failed to search products" },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Return the data directly without wrapping it
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error("Error searching products:", error);
    return NextResponse.json(
      { error: "Failed to search products" },
      { status: 500 }
    );
  }
} 