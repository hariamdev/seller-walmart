# Seller Portal

A comprehensive seller portal application built with React + TypeScript and Supabase, with Blazor reference components for .NET development.

## Features

### 🔐 Authentication System
- **Login/Register**: Secure user authentication with email and password
- **Forgot Password**: Password reset functionality
- **Session Management**: JWT-based authentication with Supabase

### 📦 Product Management
- **Product Listing**: View all products in a responsive data table
- **Search & Filter**: Real-time search and status filtering
- **CRUD Operations**: Create, read, update, and delete products
- **Pagination**: Efficient handling of large product catalogs

### 🛒 Walmart Integration
- **API Connection**: Connect to Walmart Marketplace API
- **Token Management**: Automatic token refresh and expiration handling
- **Secure Storage**: Encrypted token storage in database

### 🔍 API Explorer
- **Interactive Testing**: Test Walmart API endpoints directly from the UI
- **Parameter Input**: Dynamic form generation for endpoint parameters
- **Response Viewer**: Formatted JSON response display with syntax highlighting
- **Request History**: Track API calls and responses

### 📱 Responsive Design
- **Mobile-First**: Optimized for all screen sizes
- **Modern UI**: Clean, professional interface with Tailwind CSS
- **Accessibility**: WCAG compliant components

## Tech Stack

### Frontend (React)
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **date-fns** for date formatting

### Backend & Database
- **Supabase** for authentication and database
- **PostgreSQL** with Row Level Security (RLS)
- **Real-time subscriptions** for live updates

### Blazor Reference
- **ASP.NET Core Blazor Server** components
- **MudBlazor** UI framework
- **Entity Framework Core** for data access
- **ASP.NET Core Identity** for authentication

## Getting Started

### Prerequisites
- Node.js 18+ 
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd seller-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Copy your project URL and anon key
   - Create `.env` file from `.env.example`
   ```bash
   cp .env.example .env
   ```
   - Update `.env` with your Supabase credentials

4. **Set up database**
   - Click "Connect to Supabase" button in the app
   - Database tables will be created automatically

5. **Start development server**
   ```bash
   npm run dev
   ```

## Database Schema

### Users Table (Supabase Auth)
- Managed by Supabase Authentication
- Extended with user metadata (first_name, last_name)

### Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  seller_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Walmart Tokens Table
```sql
CREATE TABLE walmart_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES auth.users(id),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  token_type TEXT DEFAULT 'Bearer',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API Integration

### Walmart Marketplace API
The application integrates with Walmart's Marketplace API for:
- Product management
- Order processing
- Inventory updates
- Performance analytics

### Supported Endpoints
- `GET /v3/items` - Retrieve seller items
- `POST /v3/items` - Create/update items
- `GET /v3/orders` - Retrieve orders
- `POST /v3/orders/{id}/acknowledge` - Acknowledge orders
- `GET /v3/inventory` - Get inventory
- `PUT /v3/inventory` - Update inventory

## Security Features

### Row Level Security (RLS)
All database tables implement RLS policies:
```sql
-- Products can only be accessed by their owner
CREATE POLICY "Users can manage own products"
  ON products
  FOR ALL
  TO authenticated
  USING (auth.uid() = seller_id);
```

### Token Security
- Walmart API tokens are encrypted at rest
- Automatic token refresh before expiration
- Secure token transmission over HTTPS

## Deployment

### Frontend Deployment
The React application can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

### Database
- Supabase handles database hosting and scaling
- Automatic backups and point-in-time recovery
- Global CDN for optimal performance

## Blazor Reference Components

The `blazor-reference/` directory contains equivalent Blazor Server components for .NET developers:

### Key Components
- `Login.razor` - Authentication form
- `Register.razor` - User registration
- `ProductList.razor` - Product management with MudDataGrid
- `WalmartConnection.razor` - API connection management
- `ApiExplorer.razor` - Interactive API testing
- `Dashboard.razor` - Overview dashboard

### Usage
These components demonstrate how to implement the same functionality using:
- **MudBlazor** for UI components
- **Entity Framework Core** for data access
- **ASP.NET Core Identity** for authentication
- **Dependency Injection** for services

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the Blazor reference components for .NET implementation examples