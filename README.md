# EliteStore - Premium E-commerce Application

A modern, full-featured e-commerce application built with Next.js, Supabase, and Tailwind CSS.

## Features

- 🛍️ Product catalog with categories
- 🛒 Shopping cart functionality
- 👤 User authentication (sign up/sign in)
- 💝 Wishlist management
- 📱 Responsive design
- 🎨 Modern UI with animations
- 🔒 Secure with Row Level Security (RLS)

## Setup Instructions

### 1. Supabase Setup

1. Go to [Supabase](https://supabase.com) and create a new project
2. Once your project is created, go to Settings > API
3. Copy your Project URL and Anon Key
4. Update the `.env.local` file with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Database Setup

The application includes pre-written migrations that will create all necessary tables and sample data.

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the content from `supabase/migrations/20250617040742_emerald_disk.sql`
4. Run the SQL script
5. Copy and paste the content from `supabase/migrations/20250620035656_mellow_plain.sql`
6. Run the second SQL script

**Option B: Using Supabase CLI (Advanced)**

If you have Supabase CLI installed:

```bash
supabase db reset
```

### 3. Verify Database Setup

After running the migrations, you should see these tables in your Supabase dashboard:

- `profiles` - User profiles
- `categories` - Product categories
- `products` - Product catalog
- `cart_items` - Shopping cart items
- `orders` - Order records
- `order_items` - Order line items
- `wishlists` - User wishlist items

The migrations also include sample data:
- 5 product categories (Electronics, Clothing, Home & Garden, Sports, Books)
- 6 sample products with images and details

### 4. Authentication Setup

The application uses Supabase Auth with email/password authentication:

- Email confirmation is disabled by default
- Users can sign up and sign in immediately
- User profiles are automatically created upon registration

### 5. Running the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Application Structure

### Pages
- `/` - Homepage with featured products and categories
- `/products` - Product listing with filters and search
- `/cart` - Shopping cart management
- `/auth/signin` - User sign in
- `/auth/signup` - User registration

### Key Components
- `Header` - Navigation with cart count and user menu
- `ProductCard` - Product display with add to cart functionality
- `ProductFilters` - Advanced filtering for products
- `AuthForm` - Authentication forms

### Database Schema

The application uses a comprehensive e-commerce schema with:
- User profiles with role-based access
- Product catalog with categories and inventory
- Shopping cart with user sessions
- Order management system
- Wishlist functionality
- Row Level Security (RLS) for data protection

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Ensure `.env.local` has correct Supabase URL and key
   - Restart the development server after updating

2. **Database Connection Issues**
   - Verify your Supabase project is active
   - Check that migrations have been applied
   - Ensure RLS policies are enabled

3. **No Products Showing**
   - Confirm sample data was inserted via migrations
   - Check that products have `is_active = true`
   - Verify the products-categories relationship

4. **Authentication Issues**
   - Ensure email confirmation is disabled in Supabase Auth settings
   - Check that profiles table exists and has proper RLS policies

### Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all migrations have been applied
3. Ensure environment variables are correctly set
4. Check Supabase project status and quotas

## Technologies Used

- **Frontend**: Next.js 13, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Animations**: Framer Motion