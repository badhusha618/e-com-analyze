# Ecommerce Sales Analysis Dashboard

A comprehensive, real-time e-commerce analytics dashboard built with React, Express.js, and PostgreSQL. Features advanced sentiment analysis, AI-powered review monitoring, and real-time data visualization.

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