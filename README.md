# E-Commerce Application with Authentication

This is a full-stack e-commerce application with user authentication and protected routes.

## Project Structure

- **Backend**: Node.js + Express + Prisma
- **Frontend**: Next.js + React + Tailwind CSS + Framer Motion + Shadcn UI

## Features

- **Authentication System**
  - User registration and login
  - JWT-based authentication
  - Protected routes

- **User Interface**
  - Modern, responsive design with Tailwind CSS
  - Smooth animations with Framer Motion
  - Consistent UI components with Shadcn

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd e-commerce
   ```

2. Set up the backend:
   ```bash
   cd backend
   npm install
   npx prisma migrate dev --name init
   npm start
   ```

3. Set up the frontend:
   ```bash
   cd ../e-frontend
   npm install
   npm run dev
   ```

4. Open your browser and navigate to:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:3001`

## Authentication Flow

1. User registers or logs in
2. Server validates credentials and returns a JWT token
3. Frontend stores the token in localStorage
4. Protected routes check for valid token
5. Unauthorized access redirects to login

## Database Setup

By default, the project uses SQLite for simplicity and ease of setup. For production, you can switch to PostgreSQL.

See `backend/SETUP_DATABASE.md` for detailed instructions.

## UI Components

The frontend uses Shadcn UI components with Tailwind CSS and Framer Motion for animations:

- Modern form components with validation
- Toast notifications with Sonner
- Responsive cards and layouts
- Animated transitions between pages

## Project Structure

```
e-commerce/
├── backend/                # Backend API server
│   ├── prisma/             # Database schema and migrations
│   ├── src/                # Source code
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   └── index.ts        # Entry point
│
├── e-frontend/             # Next.js frontend
│   ├── app/                # Next.js app router
│   │   ├── login/          # Login page
│   │   ├── register/       # Registration page
│   │   ├── home/           # Protected dashboard
│   ├── components/         # React components
│   │   ├── auth/           # Authentication components
│   │   ├── ui/             # UI components
│   ├── context/            # React context
│   ├── hooks/              # Custom React hooks
│   └── lib/                # Utility functions
```

## License

This project is licensed under the MIT License.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/)
- [Express](https://expressjs.com/)

# E-commerce Application with Supabase Image Upload

This application uses Supabase for efficient image storage and retrieval. The implementation follows best practices for secure and optimized image handling.

## Setup Instructions

### 1. Supabase Configuration

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new Supabase project
3. Get your API credentials from the Supabase dashboard:
   - Supabase URL
   - Supabase Service Key (for server-side operations)
   - Supabase Anon Key (for client-side operations)

### 2. Environment Variables

Add the following to your `.env` file in the backend directory:

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### 3. Storage Bucket Setup

The application will automatically create a bucket named 'product-images' if it doesn't exist. If you want to create it manually:

1. Go to your Supabase dashboard
2. Navigate to Storage
3. Create a new bucket named 'product-images'
4. Set the bucket permissions to public or configure more granular access controls

## Features

### Image Upload

- Efficient upload to Supabase storage
- Automatic unique filename generation
- Base64 encoding support
- Public URL generation for easy access
- Support for multiple file uploads
- Size and type validation
- Proper error handling

### Admin Product Management

The admin product creation form now uses a modern image uploader with these features:

- Drag and drop support
- Preview of images before upload
- Direct upload to Supabase
- Image management (add/remove)
- Alt text support for accessibility
- Progress indicators during upload

## Implementation Details

- Images are stored in Supabase Storage
- Database records only store the URLs
- Alt text is stored with the image for accessibility
- The first image is used as the main product image
- The ImageUploader component can be reused throughout the application

## Troubleshooting

If you encounter issues with image uploads:

1. Check your CORS settings in Supabase
2. Verify your API keys and permissions
3. Check the network tab in your browser for request errors
4. Ensure your bucket has the correct public/private settings
