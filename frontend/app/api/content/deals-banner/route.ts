import { NextResponse } from "next/server";
import { getUrl } from '@/utils';

export async function GET(request: Request) {
  try {
    const response = await fetch(`${getUrl()}/content/deals-banner`);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch deals banner" },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching deals banner:", error);
    return NextResponse.json(
      { error: "Failed to fetch deals banner" },
      { status: 500 }
    );
  }
} 