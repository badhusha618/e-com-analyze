# Technical Setup Guide

## Architecture Overview

This application follows a modern full-stack architecture designed for scalability, maintainability, and real-time performance.

### System Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │◄──►│  Express Server  │◄──►│   PostgreSQL    │
│                 │    │                  │    │                 │
│ - Redux Toolkit │    │ - REST API       │    │ - Drizzle ORM   │
│ - React Query   │    │ - SSE Stream     │    │ - Migrations    │
│ - D3.js Charts  │    │ - JWT Auth       │    │ - Seed Data     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Development Environment

### Prerequisites

- **Node.js 18+**: JavaScript runtime
- **PostgreSQL 14+**: Primary database
- **npm 8+**: Package manager
- **Git**: Version control

### Environment Setup

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-dashboard
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Database Configuration**
   ```bash
   # Local PostgreSQL setup
   createdb ecommerce_dashboard
   export DATABASE_URL="postgresql://localhost:5432/ecommerce_dashboard"
   ```

4. **Environment Variables**
   ```bash
   # .env.local
   NODE_ENV=development
   DATABASE_URL=postgresql://localhost:5432/ecommerce_dashboard
   JWT_SECRET=your-super-secure-jwt-secret-here
   SESSION_SECRET=your-session-secret-here
   PORT=5000
   ```

## Database Architecture

### Schema Design

```sql
-- Core entities
Users (id, username, email, password_hash, created_at)
Products (id, name, sku, price, vendor_id, category_id)
Categories (id, name, description)
Vendors (id, name, contact_info)

-- E-commerce flow
Customers (id, name, email, segment, lifetime_value)
Orders (id, customer_id, total, status, created_at)
OrderItems (id, order_id, product_id, quantity, price)

-- Analytics & monitoring
Reviews (id, product_id, customer_id, rating, content, sentiment_score)
Alerts (id, type, title, description, severity, resolved)
SalesMetrics (id, date, revenue, orders_count, avg_order_value)
MarketingCampaigns (id, name, channel, budget, roi)
```

### Migration System

The application uses an environment-aware migration system:

- **Development**: Drop/recreate tables with fresh seed data
- **Staging**: Migration-only approach preserving existing data
- **Production**: Safe migrations with data preservation

```typescript
// Environment-specific configuration
const config = {
  development: {
    dropAndRecreate: true,
    seedData: true,
    autoMigrate: false
  },
  staging: {
    dropAndRecreate: false,
    seedData: true,
    autoMigrate: true
  },
  production: {
    dropAndRecreate: false,
    seedData: false,
    autoMigrate: true
  }
};
```

## Frontend Architecture

### Component Structure

```
client/src/
├── components/
│   ├── ui/                 # shadcn/ui base components
│   ├── layout/             # Layout and navigation
│   ├── dashboard/          # Dashboard specific components
│   ├── sentiment/          # Sentiment analysis components
│   └── charts/             # Data visualization components
├── hooks/                  # Custom React hooks
├── store/                  # Redux store and slices
├── lib/                    # Utility functions
└── pages/                  # Page components
```

### State Management

**Redux Toolkit** for global application state:
```typescript
// store/index.ts
export const store = configureStore({
  reducer: {
    dashboard: dashboardSlice.reducer,
    products: productsSlice.reducer,
    alerts: alertsSlice.reducer,
  },
});
```

**React Query** for server state management:
```typescript
// hooks/useProducts.ts
export function useProducts() {
  return useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      return response.json();
    },
  });
}
```

### Real-time Features

**Server-Sent Events** for live updates:
```typescript
// Real-time sentiment monitoring
const useSentiment = () => {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    const eventSource = new EventSource('/api/sentiment/updates');
    
    eventSource.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      setData(prev => [...prev, newData].slice(-100));
    };
    
    return () => eventSource.close();
  }, []);
  
  return data;
};
```

## Backend Architecture

### API Design

**RESTful endpoints** with consistent response format:
```typescript
// Standardized API response
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}
```

**Server-Sent Events** for real-time streaming:
```typescript
app.get('/api/sentiment/updates', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  
  const sendUpdate = () => {
    const data = generateSentimentData();
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };
  
  const interval = setInterval(sendUpdate, 3000);
  req.on('close', () => clearInterval(interval));
});
```

### Authentication System

**JWT-based authentication** with secure session management:
```typescript
// JWT token generation
const token = jwt.sign(
  { userId: user.id, username: user.username },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// Protected route middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};
```

## Data Visualization

### D3.js Integration

**Animated gauge charts** for real-time metrics:
```typescript
// AnimatedGauge component using D3.js
const AnimatedGauge = ({ value, max = 100 }) => {
  const svgRef = useRef();
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const angleScale = d3.scaleLinear()
      .domain([0, max])
      .range([-Math.PI/2, Math.PI/2]);
    
    // Animated arc transition
    svg.select('.value-arc')
      .transition()
      .duration(1000)
      .ease(d3.easeElastic)
      .attrTween('d', () => {
        const interpolate = d3.interpolate(0, value);
        return (t) => {
          const currentValue = interpolate(t);
          return arcGenerator.endAngle(angleScale(currentValue))();
        };
      });
  }, [value]);
  
  return <svg ref={svgRef} />;
};
```

## Performance Optimizations

### Frontend Optimizations

1. **Code Splitting**: Lazy loading for optimal bundle sizes
   ```typescript
   const Dashboard = lazy(() => import('./components/Dashboard'));
   ```

2. **React Query Caching**: Intelligent data caching
   ```typescript
   const queryClient = new QueryClient({
     defaultOptions: {
       queries: {
         staleTime: 5 * 60 * 1000, // 5 minutes
         cacheTime: 10 * 60 * 1000, // 10 minutes
       },
     },
   });
   ```

3. **Component Memoization**: Prevent unnecessary re-renders
   ```typescript
   const ExpensiveComponent = memo(({ data }) => {
     return <ComplexVisualization data={data} />;
   });
   ```

### Backend Optimizations

1. **Database Indexing**: Optimized queries for large datasets
   ```sql
   CREATE INDEX idx_orders_created_at ON orders(created_at);
   CREATE INDEX idx_reviews_sentiment ON reviews(sentiment_score);
   ```

2. **Connection Pooling**: Efficient database connections
   ```typescript
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     max: 20,
     idleTimeoutMillis: 30000,
   });
   ```

## Security Implementation

### Input Validation

**Zod schemas** for request validation:
```typescript
const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  categoryId: z.number().int().positive(),
});

app.post('/api/products', validateSchema(createProductSchema), (req, res) => {
  // Request body is now validated and type-safe
});
```

### SQL Injection Protection

**Parameterized queries** with Drizzle ORM:
```typescript
// Safe database query
const products = await db
  .select()
  .from(productsTable)
  .where(eq(productsTable.categoryId, categoryId))
  .limit(limit);
```

## Deployment Configuration

### Production Build

```bash
# Build frontend
npm run build

# Build backend
npm run build:server

# Start production server
NODE_ENV=production npm start
```

### Environment Variables

```bash
# Production environment
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=super-secure-secret-key
SESSION_SECRET=session-secret-key
PORT=5000
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000
CMD ["npm", "start"]
```

## Monitoring & Logging

### Application Monitoring

```typescript
// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
  });
  
  next();
});
```

### Error Handling

```typescript
// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
```

## Testing Strategy

### Frontend Testing

```typescript
// Component testing with React Testing Library
import { render, screen } from '@testing-library/react';
import { Dashboard } from './Dashboard';

test('renders dashboard metrics', () => {
  render(<Dashboard />);
  expect(screen.getByText('Total Sales')).toBeInTheDocument();
});
```

### Backend Testing

```typescript
// API integration testing
import request from 'supertest';
import { app } from '../server';

describe('GET /api/products', () => {
  it('should return products list', async () => {
    const response = await request(app)
      .get('/api/products')
      .expect(200);
    
    expect(response.body.data).toBeInstanceOf(Array);
  });
});
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify DATABASE_URL environment variable
   - Check PostgreSQL service status
   - Ensure database exists and is accessible

2. **Build Failures**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility
   - Verify environment variables are set

3. **Real-time Features Not Working**
   - Check browser Developer Tools for SSE connection errors
   - Verify CORS configuration for cross-origin requests
   - Ensure server-side event stream is properly configured

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Database query logging
DEBUG=drizzle:* npm run dev
```

---

This technical setup guide provides comprehensive information for developers working on the e-commerce dashboard. For additional support, refer to the main README.md and API documentation.