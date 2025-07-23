# Ecommerce Sales Analysis Dashboard

## Overview

This is a fully functional React-based e-commerce analytics dashboard built for sales analysis and optimization. The application provides comprehensive insights into sales performance, customer sentiment, marketing effectiveness, and product analytics through an interactive dashboard interface. The dashboard is currently deployed and running with real-time data visualization and interactive components.

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

## Current Status

**Project Status**: ✅ Complete - Full-Stack Dashboard with Advanced Features
**Migration Status**: ✅ Successfully Migrated to Replit Environment  
**Real-time Features**: ✅ Sentiment Monitoring & Notification System Implemented
**Last Updated**: July 23, 2025

### Recent Achievements

✓ **Migration Complete**: Successfully migrated from Replit Agent to Replit environment (July 23, 2025)
✓ **Full-Stack Implementation Complete**: React frontend with Express.js backend fully integrated
✓ **Redux State Management**: Implemented with TypeScript for dashboard, products, and alerts
✓ **Interactive Dashboard**: All components rendering with real-time data from API endpoints  
✓ **Additional Pages Implemented**: Created Customers, Reviews, Marketing, and Alerts pages (July 23, 2025)
✓ **Complete Navigation**: Full sidebar navigation with all major ecommerce analytics sections
✓ **Code Quality Resolved**: Fixed all TypeScript errors and DOM nesting warnings
✓ **Responsive Design**: Clean layout with sidebar navigation and mobile-friendly interface
✓ **Data Visualization**: Working charts and metrics with proper data flow
✓ **Environment Setup**: All packages installed and workflow running smoothly
✓ **Automatic Database Migration System**: Implemented Flyway-style migration system with environment-specific configurations (July 23, 2025)
✓ **Advanced Real-time Features**: Implemented Server-Sent Events for live sentiment monitoring and alert streaming (July 23, 2025)
✓ **Comprehensive API Endpoints**: Complete REST API with sentiment analysis, product comparison, and notification endpoints (July 23, 2025)
✓ **Migration to Replit**: Successfully migrated full application to Replit environment with all features working (July 23, 2025)
✓ **Bug Fixes Complete**: Resolved all infinite loop issues, TypeScript errors, and missing dependencies (July 23, 2025)

### Dashboard Features Implemented

1. **Sales Performance Metrics**: Real-time KPI cards with trend indicators
2. **Sales Chart**: Interactive line chart showing 7-day sales data  
3. **Product Performance**: Top products ranking with sales and revenue data
4. **Customer Sentiment**: Review distribution analysis with actionable insights
5. **Marketing ROI**: Campaign performance tracking across multiple channels
6. **Alert System**: Real-time notifications with dismissible alerts
7. **Product Analytics Table**: Comprehensive product performance analysis

### Additional Pages Implemented (July 23, 2025)

8. **Customers Page**: Customer segmentation with RFM analysis, filtering, and sorting
9. **Reviews Page**: Product review management with sentiment analysis and low-rating alerts
10. **Marketing Page**: Campaign performance dashboard with channel ROI tracking
11. **Alerts Page**: Real-time alert monitoring with auto-refresh and severity filtering
12. **Advanced Sentiment Analysis**: Live dashboard with real-time monitoring and D3.js visualizations
13. **Product Comparison**: Side-by-side sentiment analysis for competitive insights
14. **Notification Center**: Real-time alert system with browser notifications and SSE streaming

### Technical Implementation

- **API Endpoints**: All REST endpoints functional (/api/dashboard/metrics, /api/products, /api/sales/metrics, /api/alerts)
- **State Management**: Redux slices handling async data fetching with proper error handling
- **Type Safety**: Complete TypeScript implementation with proper type definitions
- **Component Architecture**: Modular, reusable components following React best practices
- **Performance**: Optimized with React.memo and proper state management patterns
- **Database Migration System**: 
  - Development: Automatic drop/recreate with sample data seeding
  - Staging: Migration-only approach preserving data
  - Production: Safe migration-only with maximum data protection
  - Environment-specific configuration in `server/config.ts`
  - Comprehensive seed data including users, products, orders, reviews, and analytics
- **Spring Boot Backend Structure**: 
  - Complete entity model with JPA annotations
  - Repository layer with custom queries
  - Service layer with caching and business logic
  - REST controllers with Swagger documentation
  - JWT security configuration
  - Redis caching with TTL settings
  - Apache Kafka event-driven architecture
  - Flyway database migrations
  - Docker containerization support