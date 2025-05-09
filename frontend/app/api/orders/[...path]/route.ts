import { NextRequest, NextResponse } from 'next/server'

import { revalidatePath } from 'next/cache'
import { getUrl } from '@/utils';

const API_BASE_URL = getUrl()

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Extract authorization header from the request
    const authHeader = request.headers.get("Authorization");
    const token = authHeader ? authHeader.split(" ")[1] : null;
    
    // Construct path for backend request
    const path = params.path.join('/')
    const apiUrl = `${API_BASE_URL}/orders/${path}`
    
    // Forward the request to the backend
    const response = await fetch(apiUrl, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch orders data" },
        { status: response.status }
      );
    }
    
    const data = await response.json()
    
    // Pass through the status code
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Extract authorization header from the request
    const authHeader = request.headers.get("Authorization");
    const token = authHeader ? authHeader.split(" ")[1] : null;
    
    // Get request body
    const body = await request.json()
    
    // Construct path for backend request
    const path = params.path.join('/')
    const apiUrl = `${API_BASE_URL}/orders/${path}`
    
    // Forward the request to the backend
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
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
    
    const data = await response.json()
    
    // Revalidate the orders page to refresh the data
    revalidatePath('/home/admin/orders')
    
    // Pass through the status code
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Extract authorization header from the request
    const authHeader = request.headers.get("Authorization");
    const token = authHeader ? authHeader.split(" ")[1] : null;
    
    // Get request body
    const body = await request.json()
    
    // Construct path for backend request
    const path = params.path.join('/')
    const apiUrl = `${API_BASE_URL}/orders/${path}`
    
    // Forward the request to the backend
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
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
    
    const data = await response.json()
    
    // Revalidate the orders page
    revalidatePath('/home/admin/orders')
    
    // Pass through the status code
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 