import { NextResponse } from "next/server";
import { getUrl } from '@/utils';

export async function GET(request: Request) {
  try {
    // Extract bearer token from header
    const authHeader = request.headers.get("Authorization");
    const token = authHeader ? authHeader.split(" ")[1] : null;
    
    // Forward request to backend with auth token
    const response = await fetch(`${getUrl()}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
} 