import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters from URL
    const searchParams = request.nextUrl.searchParams;
    
    // Extract Bearer token from header
    const authHeader = request.headers.get("Authorization");
    const token = authHeader ? authHeader.split(" ")[1] : null;
    
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
    });
    
    if (!response.ok) {
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