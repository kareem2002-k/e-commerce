# E-commerce Backend

## Setup Instructions

1. Install dependencies:
```
npm install
```

2. Configure environment variables:
Create a `.env` file in the backend directory with the following variables:

```env
# Database
DATABASE_URL="postgres://..."

# JWT Secret
JWT_SECRET="your-secret-key"

# Server Port
PORT=3002

# Supabase Configuration
SUPABASE_URL="https://yourproject.supabase.co"
SUPABASE_SERVICE_KEY="your-supabase-service-key"
```

3. Start the development server:
```
npm run dev
```

## Image Upload Feature

The backend now supports image uploads to Supabase Storage. To use this feature:

1. Set up a Supabase account and project at https://supabase.com
2. Create a storage bucket named `product-images` (or update the BUCKET_NAME in the code)
3. Set the bucket to public if you want the images to be publicly accessible
4. Configure CORS settings in Supabase as needed

The API endpoint `/api/uploads/image` accepts:
- A `fileData` field (base64 encoded image)
- A `fileName` field (original file name with extension)

The endpoint returns a `imageUrl` which can be used to display the image. 