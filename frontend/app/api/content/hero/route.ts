import { NextResponse } from "next/server";
import { getUrl } from '@/utils';

export async function GET(request: Request) {
  try {
    const response = await fetch(`${getUrl()}/content/hero`);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch hero section" },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching hero section:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero section" },
      { status: 500 }
    );
  }
} 