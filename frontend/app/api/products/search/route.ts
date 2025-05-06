import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters from URL
    const searchParams = request.nextUrl.searchParams;
    
    // Extract Bearer token from header
    const authHeader = request.headers.get("Authorization");
    
    // Ensure token is available
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - Missing or invalid token" },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(" ")[1];
    
    // Forward the search parameters to the backend
    const backendUrl = new URL("http://localhost:3001/products/search");
    
    // Copy all search parameters
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });
    
    // Forward authorization header from original request
    const response = await fetch(backendUrl.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store" // Prevent caching issues
    });
    
    if (!response.ok) {
      console.error(`Backend search error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: "Failed to search products" },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error searching products:", error);
    return NextResponse.json(
      { error: "Failed to search products" },
      { status: 500 }
    );
  }
} 