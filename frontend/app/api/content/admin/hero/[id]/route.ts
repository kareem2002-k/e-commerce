import { NextResponse } from "next/server";
import { getUrl } from '@/utils';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("Authorization");
    const { id } = params;
    const body = await request.json();

    const response = await fetch(`${getUrl()}/content/admin/hero/${id}`, {
      method: "PUT",
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
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating hero section:", error);
    return NextResponse.json(
      { error: "Failed to update hero section" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("Authorization");
    const { id } = params;

    const response = await fetch(`${getUrl()}/content/admin/hero/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: authHeader || '',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to delete hero section" },
        { status: response.status }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting hero section:", error);
    return NextResponse.json(
      { error: "Failed to delete hero section" },
      { status: 500 }
    );
  }
} 