import { NextResponse } from "next/server";
import { getUrl } from '@/utils';

export async function GET(request: Request) {
  try {
    // Extract token from authorization header
    const authHeader = request.headers.get("Authorization");
    
    const response = await fetch(`${getUrl()}/content/admin/hero`, {
      headers: {
        Authorization: authHeader || '',
      },
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch hero sections" },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching hero sections:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero sections" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const body = await request.json();
    
    const response = await fetch(`${getUrl()}/content/admin/hero`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader || '',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        return NextResponse.json(
          { error: `Server error: ${response.status}` },
          { status: response.status }
        );
      }
      return NextResponse.json(errorData, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating hero section:", error);
    return NextResponse.json(
      { error: "Failed to create hero section" },
      { status: 500 }
    );
  }
} 