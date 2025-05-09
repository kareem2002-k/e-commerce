import { NextResponse } from "next/server";
import { getUrl } from '@/utils';

export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    
    // Extract bearer token from header
    const authHeader = request.headers.get("Authorization");
    const token = authHeader ? authHeader.split(" ")[1] : null;
    
    // Forward request to backend with auth token
    const response = await fetch(`${getUrl()}/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to delete user" },
        { status: response.status }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
} 