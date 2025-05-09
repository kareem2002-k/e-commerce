# Database Setup Guide

This guide will help you set up the database connection and run migrations properly.

## Quick Start with SQLite (Default)

For convenience, the project is configured to use SQLite by default, which requires no external database setup:

1. **Generate Prisma Client and Run Migration**:
   ```bash
   npx prisma migrate dev --name init
   ```

2. **Start the Server**:
   ```bash
   npm run dev
   ```

This will create a local SQLite database file at `prisma/dev.db`.

## Setting up PostgreSQL (Production)

For production or if you prefer PostgreSQL:

1. **Update the Prisma Schema**:
   - Open `prisma/schema.prisma`
   - Change the datasource section to use PostgreSQL:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
   - Update the numeric fields to use Decimal types:
   ```prisma
   price Decimal @db.Decimal(10,2)
   // Update other decimal fields as well
   ```

2. **Create a Supabase Account and Project**
   - Go to [Supabase](https://supabase.com/) and create an account
   - Create a new project
   - Wait for the database to be provisioned

3. **Get Your Database Connection Details**
   - In your Supabase project dashboard, go to:
     - **Project Settings** → **Database**
   - Look for the **Connection String** section
   - Copy the **URI** format connection string

4. **Create Your .env File**
   - Create a file named `.env` in the `backend` directory
   - Add the following content, replacing placeholders with your actual values:

```
# Database connection
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST].supabase.co:6543/postgres?schema=public"

# JWT Secret for authentication
JWT_SECRET="your-secret-key-change-this-in-production"

# Server port
PORT=3002
```

5. **Run Prisma Migrations**:
   ```bash
   npx prisma migrate dev --name init
   ```

## Troubleshooting Common Issues

- **Database connection errors**: Check your connection string and credentials
- **SQLite vs PostgreSQL type issues**: Make sure your schema uses the right data types for your database
- **Migration errors**: Try resetting your migration history with `npx prisma migrate reset`

## Setting up .env in PowerShell

If you're using PowerShell:

```powershell
# Set environment variables for the current session
$env:DATABASE_URL="postgresql://postgres:your-password@your-host.supabase.co:6543/postgres?schema=public"
$env:JWT_SECRET="your-secret-key"

# Then run migrations
npx prisma migrate dev --name init
```

## Switching Between SQLite and PostgreSQL

When switching database providers:

1. Update the schema.prisma file
2. Delete any existing migration folders in the `prisma/migrations` directory
3. Run `npx prisma migrate dev --name init` to create fresh migrations 