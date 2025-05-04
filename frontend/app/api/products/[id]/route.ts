import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Await params before accessing its properties
    const id = (await params).id;
    const response = await fetch(`http://localhost:3001/products/${id}`);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Product not found' }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Await params before accessing its properties
    const id = (await params).id;
    // Forward authorization header from original request
    const authHeader = request.headers.get('Authorization');
    
    const body = await request.json();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add auth header if it exists
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(`http://localhost:3001/products/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        console.error('Error parsing response:', errorText);
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
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Await params before accessing its properties
    const id = (await params).id;
    // Forward authorization header from original request
    const authHeader = request.headers.get('Authorization');
    
    const headers: Record<string, string> = {};
    
    // Add auth header if it exists
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(`http://localhost:3001/products/${id}`, {
      method: 'DELETE',
      headers,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        console.error('Error parsing response:', errorText);
        return NextResponse.json(
          { error: `Server error: ${response.status}` }, 
          { status: response.status }
        );
      }
      return NextResponse.json(errorData, { status: response.status });
    }
    
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
} 