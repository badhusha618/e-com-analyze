# Spring Boot Backend Integration Guide

## Overview

This project now includes a comprehensive Spring Boot backend API alongside the existing Node.js/Express backend. The Spring Boot application provides enterprise-grade features including Redis caching, Apache Kafka messaging, Flyway migrations, JWT authentication, and Swagger documentation.

## Architecture

### Current Setup
- **Frontend**: React with TypeScript (existing)
- **Backend Options**:
  1. **Node.js/Express** (existing) - Port 5000
  2. **Spring Boot** (new) - Port 8080

### Spring Boot Technology Stack
- **Framework**: Spring Boot 3.2.1 with Java 17
- **Database**: PostgreSQL with Flyway migrations
- **Caching**: Redis with Spring Cache
- **Messaging**: Apache Kafka for event-driven architecture
- **Security**: JWT authentication with Spring Security
- **Documentation**: Swagger/OpenAPI 3
- **Build**: Maven with wrapper

## Getting Started with Spring Boot Backend

### Prerequisites
- Java 17+
- Maven (included via wrapper)
- PostgreSQL (shared with Node.js backend)
- Redis (optional for caching)
- Apache Kafka (optional for messaging)

### 1. Build the Spring Boot Application

```bash
cd backend
./mvnw clean compile
```

### 2. Configure Environment Variables

Set the following environment variables for the Spring Boot application:

```bash
export DATABASE_URL=jdbc:postgresql://localhost:5432/ecommerce_analytics
export PGUSER=postgres
export PGPASSWORD=password
export REDIS_HOST=localhost
export REDIS_PORT=6379
export KAFKA_SERVERS=localhost:9092
export JWT_SECRET=mySecretKey123
```

### 3. Run Database Migrations

```bash
./mvnw flyway:migrate
```

### 4. Start the Spring Boot Application

```bash
./mvnw spring-boot:run
```

The Spring Boot API will be available at `http://localhost:8080/api/v1`

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration

### Dashboard
- `GET /api/v1/dashboard/metrics` - Dashboard overview metrics
- `GET /api/v1/dashboard/sales-chart` - Sales chart data

### Products
- `GET /api/v1/products` - All products (paginated)
- `GET /api/v1/products/top-selling` - Top selling products
- `GET /api/v1/products/low-stock` - Low stock products
- `GET /api/v1/products/search` - Search products

### Alerts
- `GET /api/v1/alerts` - All alerts (paginated)
- `GET /api/v1/alerts/unread` - Unread alerts
- `POST /api/v1/alerts/{id}/mark-read` - Mark alert as read

## Frontend Integration

### API Client Configuration

The frontend includes a new API client (`client/src/lib/api.ts`) configured to work with the Spring Boot backend:

```typescript
// Configure API base URL
const API_BASE_URL = 'http://localhost:8080/api/v1';

// Usage example
import { dashboardApi } from '@/lib/api';

const metrics = await dashboardApi.getMetrics();
```

### Authentication Integration

The frontend now includes a new authentication system compatible with Spring Boot JWT:

```typescript
import { useAuth } from '@/hooks/useAuth';

const { login, logout, user, isAuthenticated } = useAuth();
```

### Environment Configuration

Add to your `.env` file:

```
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

## Docker Support

### Single Service
```bash
cd backend
docker build -t ecommerce-analytics-api .
docker run -p 8080:8080 ecommerce-analytics-api
```

### Full Stack with Docker Compose
```bash
cd backend
docker-compose up
```

This starts:
- PostgreSQL database
- Redis cache
- Apache Kafka
- Spring Boot API

## Development Workflow

### Option 1: Node.js Backend (Current)
```bash
npm run dev  # Starts Node.js backend on port 5000
```

### Option 2: Spring Boot Backend (New)
```bash
cd backend
./mvnw spring-boot:run  # Starts Spring Boot on port 8080
```

### Frontend
```bash
# Update .env to point to desired backend
VITE_API_BASE_URL=http://localhost:8080/api/v1  # Spring Boot
# OR
VITE_API_BASE_URL=http://localhost:5000/api    # Node.js
```

## Key Features

### 1. Caching Strategy
- Dashboard metrics cached for 5 minutes
- Product data cached for 10 minutes
- Sales data cached for 3 minutes

### 2. Event-Driven Architecture
Kafka topics:
- `order-events` - Order lifecycle events
- `product-events` - Product updates
- `alert-events` - Alert notifications
- `analytics-events` - Analytics events

### 3. Database Migrations
Flyway handles schema versioning:
- `V1__Create_initial_schema.sql` - Base schema
- `V2__Insert_sample_data.sql` - Sample data

### 4. Security
- JWT-based authentication
- Role-based authorization
- CORS configuration
- BCrypt password encryption

## Monitoring and Documentation

### Swagger UI
Access API documentation at:
`http://localhost:8080/api/v1/swagger-ui.html`

### Health Checks
- Application health: `http://localhost:8080/api/v1/actuator/health`
- Metrics: `http://localhost:8080/api/v1/actuator/metrics`

## Migration Strategy

### Phase 1: Parallel Development ✅
- Spring Boot backend fully implemented
- Frontend API client ready
- Both backends can run simultaneously

### Phase 2: Frontend Integration (Current)
- Update frontend to use Spring Boot APIs
- Test authentication flow
- Validate data consistency

### Phase 3: Production Migration
- Switch environment configuration
- Deploy Spring Boot backend
- Monitor performance and reliability

## Testing

### Unit Tests
```bash
./mvnw test
```

### Integration Tests
```bash
./mvnw test -Dtest=*IT
```

### API Testing
Use the Swagger UI or tools like Postman to test endpoints:
1. Login: `POST /api/v1/auth/login`
2. Get metrics: `GET /api/v1/dashboard/metrics`

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Spring Boot (8080) and Node.js (5000) use different ports
2. **Database Connections**: Both backends share the same PostgreSQL database
3. **Authentication**: Use Spring Boot JWT tokens with the new frontend client

### Logs
Check application logs for debugging:
```bash
./mvnw spring-boot:run | grep -E "(ERROR|WARN|INFO)"
```

## Next Steps

1. Complete frontend integration with Spring Boot APIs
2. Add comprehensive error handling
3. Implement advanced caching strategies
4. Set up monitoring and alerting
5. Configure production deployment

## Benefits of Spring Boot Backend

- **Enterprise-grade**: Production-ready with comprehensive features
- **Scalability**: Better performance with caching and async processing
- **Maintainability**: Well-structured architecture with clear separation of concerns
- **Monitoring**: Built-in actuator endpoints for observability
- **Documentation**: Auto-generated API documentation with Swagger
- **Event-driven**: Kafka integration for real-time data processing