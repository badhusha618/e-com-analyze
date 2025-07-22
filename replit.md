# Ecommerce Sales Analysis Dashboard

## Overview

This is a modern React-based e-commerce analytics dashboard built for sales analysis and optimization. The application provides comprehensive insights into sales performance, customer sentiment, marketing effectiveness, and product analytics through an interactive dashboard interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a full-stack architecture with a clear separation between frontend and backend components:

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and better developer experience
- **State Management**: Redux Toolkit for global application state, with React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with shadcn/ui components for consistent design system
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js for the REST API server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: PostgreSQL-based sessions with connect-pg-simple

## Key Components

### Database Schema
The application uses a comprehensive e-commerce schema including:
- Users, Products, Categories, Vendors
- Orders and Order Items for transaction tracking
- Customers for customer relationship management
- Reviews for sentiment analysis
- Marketing Campaigns for ROI tracking
- Alerts for real-time notifications
- Sales Metrics for performance analytics

### Frontend Components
- **Dashboard**: Main analytics interface with metrics grid, charts, and tables
- **Layout Components**: Sidebar navigation and top bar with search and notifications
- **Chart Components**: Sales visualization using Recharts library
- **Data Tables**: Product performance analysis with sortable columns
- **Alert System**: Real-time notification display
- **UI Components**: Complete shadcn/ui component library integration

### API Structure
RESTful API endpoints following standard conventions:
- `/api/dashboard/metrics` - Dashboard overview data
- `/api/products/*` - Product management and analytics
- `/api/sales/metrics` - Sales performance data
- Error handling with standardized JSON responses
- Request/response logging middleware

## Data Flow

1. **Client Requests**: React components dispatch Redux actions or use React Query hooks
2. **State Management**: Redux manages UI state while React Query handles server state caching
3. **API Communication**: HTTP requests to Express.js REST endpoints
4. **Database Operations**: Drizzle ORM handles PostgreSQL queries with type safety
5. **Response Processing**: Data flows back through the same path with proper error handling

## External Dependencies

### Core Dependencies
- **Database**: PostgreSQL via Neon Database (serverless)
- **UI Components**: Radix UI primitives for accessible components
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation
- **Date Handling**: date-fns for date manipulation

### Development Tools
- **TypeScript**: Full type safety across the application
- **ESLint & Prettier**: Code quality and formatting (configured via components.json)
- **Vite Plugins**: Runtime error overlay and development enhancements

## Deployment Strategy

### Build Process
- Frontend: Vite builds optimized static assets to `dist/public`
- Backend: esbuild bundles Node.js server code to `dist/index.js`
- Database: Drizzle migrations in `migrations/` directory

### Environment Configuration
- Development: `NODE_ENV=development tsx server/index.ts`
- Production: `NODE_ENV=production node dist/index.js`
- Database: Requires `DATABASE_URL` environment variable for PostgreSQL connection

### Key Architectural Decisions

1. **Monorepo Structure**: Client, server, and shared code in single repository for easier development
2. **Type-Safe Database**: Drizzle ORM chosen over Prisma for better TypeScript integration and performance
3. **Redux + React Query**: Hybrid state management separating UI state from server state
4. **Component Architecture**: Shadcn/ui provides consistent, accessible components with Tailwind CSS
5. **File-Based Organization**: Clear separation of concerns with dedicated folders for components, hooks, and utilities
6. **Real-Time Features**: Polling-based updates for dashboard metrics and alerts (WebSockets can be added later)

The architecture prioritizes developer experience, type safety, and scalability while maintaining a clean separation of concerns between frontend and backend components.