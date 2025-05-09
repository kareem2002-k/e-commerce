import { NextResponse } from "next/server";
import { getUrl } from '@/utils';
export async function GET(request: Request) {
  try {
    // EXTRACT BEARER TOKEN FROM HEADER 
    const authHeader = request.headers.get("Authorization");
    const token = authHeader ? authHeader.split(" ")[1] : null;
    // Forward authorization header from original request
    const response = await fetch(`${getUrl()}/products`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Forward authorization header from original request
    const authHeader = request.headers.get("Authorization");

    const body = await request.json();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add auth header if it exists
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    // Make sure all the new fields are passed to the API
    // The backend will handle these fields appropriately
    const response = await fetch(`${getUrl()}/products`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });

    console.log(response);

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
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
