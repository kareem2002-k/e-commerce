import { NextRequest, NextResponse } from "next/server";
import { getUrl } from '@/utils';
export async function GET(request: NextRequest) {
  try {
    // Extract authentication token
    const authHeader = request.headers.get("Authorization");
    const token = authHeader ? authHeader.split(" ")[1] : null;
    
    // Get the URL and search parameters
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Forward these parameters to the backend
    const backendUrl = new URL(`${getUrl()}/products/search`);
    
    // Forward all parameters directly to backend
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });
    
    console.log('Searching with params:', backendUrl.toString());
    
    // Make the request to backend
    const response = await fetch(backendUrl.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error('Search API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: "Failed to search products" },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('Search response data:', data);
    
    // Return the data directly without wrapping it
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error searching products:", error);
    return NextResponse.json(
      { error: "Failed to search products" },
      { status: 500 }
    );
  }
} 