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
