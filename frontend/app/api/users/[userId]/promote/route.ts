import { NextResponse } from "next/server";
import { getUrl } from '@/utils';

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    
    // Extract bearer token from header
    const authHeader = request.headers.get("Authorization");
    const token = authHeader ? authHeader.split(" ")[1] : null;
    
    // Forward request to backend with auth token
    const response = await fetch(`${getUrl()}/users/${userId}/promote`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        console.error("Error parsing response:", errorText);
        return NextResponse.json(
          { error: `Server error: ${response.status}` },
          { status: response.status }
        );
      }
      return NextResponse.json(errorData, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error promoting user:", error);
    return NextResponse.json(
      { error: "Failed to promote user" },
      { status: 500 }
    );
  }
} 