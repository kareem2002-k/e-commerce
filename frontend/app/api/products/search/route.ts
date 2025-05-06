import { NextRequest, NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Extract authentication token
    const authHeader = request.headers.get("Authorization");
    const token = authHeader ? authHeader.split(" ")[1] : null;
    
    // Get the URL and search parameters
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Forward these parameters to the backend
    const backendUrl = new URL("http://localhost:3001/products/search");
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });
    
    // Make the request to backend
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