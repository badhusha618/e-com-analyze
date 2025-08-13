# Ecommerce Sales Analysis Dashboard

A comprehensive, real-time e-commerce analytics dashboard built with React, Express.js, and PostgreSQL. Successfully migrated from Replit Agent to standard Replit environment with full functionality, user management, and a complete database with sample data.

## 🌟 Current Status: **FULLY OPERATIONAL**

✅ **Migration Complete**: Successfully migrated from Replit Agent to Replit  
✅ **Database Ready**: PostgreSQL database with comprehensive schema and sample data  
✅ **User Management**: Role-based access control with admin/user permissions  
✅ **API Functional**: All endpoints working with real data  
✅ **Frontend Working**: Full React dashboard with multiple pages  
✅ **Authentication**: Passport.js with JWT token authentication  

🚀 **Ready for**: Custom feature development, UI customization, and business logic expansion

## 🚀 Features

### Core Analytics
- **Real-time Dashboard**: Live sales metrics, KPIs, and performance indicators
- **Product Analytics**: Deep dive into product performance, sales trends, and inventory insights
- **Customer Segmentation**: RFM analysis, customer lifetime value, and behavioral patterns
- **Sales Forecasting**: Predictive analytics for revenue and trend projections

### Advanced AI Features
- **Real-time Sentiment Monitoring**: Live analysis of customer reviews with sentiment scoring
- **Animated Data Visualization**: D3.js powered gauges, charts, and interactive displays
- **Alert System**: Real-time notifications for sentiment spikes, sales drops, and anomalies
- **Keyword Extraction**: AI-powered analysis of review content and customer feedback

### Technical Highlights
- **Server-Sent Events (SSE)**: Real-time data streaming without WebSocket complexity
- **Type-Safe Database**: Drizzle ORM with full TypeScript integration
- **Responsive Design**: Mobile-first UI with dark/light mode support
- **Performance Optimized**: React Query for efficient data caching and state management

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript for type safety
- **Redux Toolkit** for global state management
- **React Query** for server state and caching
- **Tailwind CSS** + **shadcn/ui** for consistent design
- **D3.js** for advanced data visualizations
- **Wouter** for lightweight routing

### Backend Stack
- **Node.js** + **Express.js** REST API
- **PostgreSQL** with **Drizzle ORM**
- **JWT Authentication** with session management
- **Server-Sent Events** for real-time updates
- **Comprehensive API** with error handling and logging

### Database Design
```
Users ← Orders → OrderItems → Products
  ↓        ↓         ↓          ↓
Auth   Customers  Reviews  Categories
  ↓        ↓         ↓          ↓
Sessions Alerts  Sentiment  Vendors
```

## 📦 Quick Start

### Local Development

1. **Clone and Install**
   ```bash
   git clone <repository>
   cd ecommerce-dashboard
   npm install
   ```

2. **Database Setup**
   ```bash
   # Set up PostgreSQL database
   export DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce"
   
   # Run migrations and seed data
   npm run db:push
   ```

3. **Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## 🎯 What's Already Built & Working

### ✅ Complete Backend Infrastructure
- **PostgreSQL Database**: Fully configured with comprehensive schema
- **User Management System**: Role-based access control (SUPER_ADMIN, USER_ADMIN, READER, EXTERNAL_USER)
- **Authentication**: JWT-based auth with Passport.js and session management
- **Database Models**: Complete e-commerce schema with relationships
  - Users, Roles, Permissions
  - Vendors, Categories, Products
  - Customers, Orders, Order Items
  - Reviews, Marketing Campaigns
  - Sales Metrics, Alerts, Audit Logs
- **API Endpoints**: Full REST API with proper error handling
- **Data Seeding**: Sample data for testing and development

### ✅ Frontend Application
- **Dashboard**: Real-time analytics with charts and KPIs
- **Product Management**: Product listing, categories, vendor management
- **Customer Analytics**: Customer segmentation and metrics
- **Review System**: Review analytics with sentiment analysis
- **Marketing Tools**: Campaign management and tracking
- **Alert System**: Real-time notifications and alerts
- **User Interface**: Modern UI with shadcn/ui components
- **Responsive Design**: Mobile-first approach with dark/light modes

### ✅ Technical Features
- **Real-time Updates**: Server-sent events for live data
- **TypeScript**: Full type safety across frontend and backend
- **Database ORM**: Drizzle ORM with migration system
- **State Management**: Redux Toolkit + React Query
- **Authentication Flow**: Login/register with protected routes
- **Error Handling**: Comprehensive error boundaries and API responses

## 🚀 What You Can Build Next

### 🎨 UI/UX Enhancements
- **Custom Branding**: Add your company logo, colors, and theme
- **Advanced Charts**: Implement more D3.js visualizations
- **Data Export**: Add CSV/PDF export functionality
- **Advanced Filters**: Build complex filtering and search features
- **Mobile App**: Create React Native companion app

### 📊 Analytics & AI Features
- **Predictive Analytics**: Sales forecasting with ML models
- **Customer Insights**: Advanced RFM analysis and segmentation
- **Inventory Optimization**: Smart reordering and stock management
- **A/B Testing**: Campaign testing and optimization tools
- **Business Intelligence**: Custom report builder and dashboards

### 🔧 Business Logic
- **Order Processing**: Complete order management workflow
- **Payment Integration**: Stripe, PayPal, or other payment gateways
- **Shipping Integration**: Real-time shipping rates and tracking
- **Multi-tenant**: Support for multiple stores/businesses
- **API Gateway**: External API integrations and webhooks

### 🔐 Advanced Security
- **Two-Factor Authentication**: Enhanced security with 2FA
- **OAuth Integration**: Google, GitHub, Microsoft login
- **Rate Limiting**: API protection and abuse prevention
- **Audit Logging**: Detailed activity tracking and compliance
- **Data Encryption**: Enhanced data protection measures

### 📱 Integrations
- **Email System**: Automated email campaigns and notifications
- **SMS Alerts**: Real-time SMS notifications
- **Social Media**: Instagram, Facebook shop integrations
- **CRM Systems**: Salesforce, HubSpot connectivity
- **Analytics Tools**: Google Analytics, Mixpanel integration

### Production Deployment

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Start Production Server**
   ```bash
   npm start
   ```

3. **Environment Configuration**
   ```bash
   NODE_ENV=production
   DATABASE_URL=<production_database_url>
   JWT_SECRET=<secure_jwt_secret>
   PORT=5000
   ```

## 🔧 API Documentation

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dashboard/metrics` | GET | Dashboard overview statistics |
| `/api/products` | GET | Product catalog with analytics |
| `/api/customers` | GET | Customer data with segmentation |
| `/api/sales/metrics` | GET | Sales performance data |
| `/api/alerts` | GET | Real-time system alerts |

### Real-time Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sentiment/updates` | SSE | Live sentiment score stream |
| `/api/reviews/sentiment` | GET | Historical sentiment data |
| `/api/reviews/analytics` | GET | Review analytics summary |

### Authentication

```bash
# Login
POST /api/auth/login
{
  "username": "admin",
  "password": "password"
}

# Protected routes require JWT token
Authorization: Bearer <jwt_token>
```

## 🎨 UI Components

### Interactive Components
- **AnimatedGauge**: D3.js powered gauge charts with smooth animations
- **SentimentDashboard**: Real-time sentiment monitoring with live updates
- **DataTables**: Sortable, filterable product and customer tables
- **AlertCenter**: Real-time notification system with priority levels

### Design System
- **shadcn/ui** components for consistency
- **Tailwind CSS** for utility-first styling
- **Dark/Light Mode** with system preference detection
- **Responsive Grid** layouts for all screen sizes

## 📊 Data Features

### Real-time Sentiment Analysis
```typescript
// Live sentiment monitoring
const { sentimentData, metrics, isConnected } = useSentiment();

// Real-time gauge display
<AnimatedGauge 
  value={metrics.averageScore} 
  label="Sentiment Score"
  size={200} 
/>
```

### Advanced Analytics
- **RFM Analysis**: Customer segmentation based on Recency, Frequency, Monetary value
- **Trend Detection**: Automatic identification of sentiment and sales trends
- **Anomaly Detection**: Real-time alerts for unusual patterns
- **Predictive Scoring**: AI-powered insights for business decisions

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **SQL Injection Protection**: Parameterized queries with Drizzle ORM
- **CORS Configuration**: Proper cross-origin resource sharing
- **Input Validation**: Zod schema validation for all API endpoints
- **Session Management**: Secure session handling with PostgreSQL store

## 🚀 Performance Optimizations

- **React Query Caching**: Intelligent data caching and background updates
- **Code Splitting**: Lazy loading for optimal bundle sizes
- **Database Indexing**: Optimized queries for large datasets
- **Compression**: Gzip compression for all static assets
- **CDN Ready**: Static asset optimization for content delivery

## 🧪 Testing

### Frontend Testing
```bash
# Unit tests with React Testing Library
npm run test

# E2E tests with Cypress
npm run test:e2e
```

### Backend Testing
```bash
# API integration tests
npm run test:api

# Database migration tests
npm run test:db
```

## 📈 Monitoring & Analytics

### Application Metrics
- Real-time performance monitoring
- Database query performance tracking
- API response time analytics
- Error rate monitoring and alerting

### Business Metrics
- Sales performance dashboards
- Customer behavior analytics
- Product performance insights
- Revenue forecasting and trends

## 📋 Development Workflow

### Getting Started with Development
1. **Access the Running App**: Your application is already running at the provided Replit URL
2. **Database Access**: PostgreSQL database is set up with sample data
3. **API Testing**: Use the browser or tools like curl to test API endpoints
4. **Frontend Development**: Modify React components in `client/src/`
5. **Backend Development**: Update Express routes in `server/`

### Development Commands
```bash
# Start development server (already running)
npm run dev

# Push database schema changes
npm run db:push

# Type checking
npm run check

# Build for production
npm run build
```

### Current Database Sample Data
- **3 Users**: Admin user and sample customers
- **5 Vendors**: Apple, Samsung, Nike, Adidas, Amazon
- **4 Categories**: Electronics, Fashion, Books, Home
- **12 Products**: iPhones, Galaxy phones, shoes, books
- **15+ Orders**: Sample order history
- **Reviews & Ratings**: Product reviews with sentiment scores
- **Marketing Campaigns**: Sample marketing data
- **Sales Metrics**: Historical sales data

## 🛠️ Customization Guide

### Adding New Features
1. **Database Changes**:
   - Update `shared/schema.ts` with new tables/columns
   - Run `npm run db:push` to apply changes

2. **API Endpoints**:
   - Add routes in `server/routes.ts`
   - Update storage interface in `server/storage.ts`

3. **Frontend Pages**:
   - Create components in `client/src/pages/`
   - Add routes in `client/src/App.tsx`
   - Use React Query for data fetching

4. **UI Components**:
   - Leverage shadcn/ui components
   - Follow the existing design patterns
   - Use Tailwind CSS for styling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the [documentation](./docs/) for detailed guides
- Review the [API documentation](./docs/api.md) for integration help

---

**Built with ❤️ using React, Express.js, and PostgreSQL**