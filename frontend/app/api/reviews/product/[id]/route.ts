import { NextResponse } from "next/server";
import { getUrl } from '@/utils';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    
    // Extract authorization header
    const authHeader = request.headers.get("Authorization");
    const token = authHeader ? authHeader.split(" ")[1] : null;
    
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Forward to backend
    const response = await fetch(`${getUrl()}/reviews/product/${productId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        data,
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return NextResponse.json(
      { message: "Failed to fetch product reviews" },
      { status: 500 }
    );
  }
} 