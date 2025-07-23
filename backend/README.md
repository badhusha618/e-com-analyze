# E-commerce Analytics API

A comprehensive Spring Boot REST API for e-commerce sales analysis and optimization dashboard with Redis caching, Kafka messaging, and PostgreSQL database.

## Features

- **Spring Boot 3.2.1** with Java 17
- **PostgreSQL** database with Flyway migrations
- **Redis** caching for improved performance
- **Apache Kafka** for event-driven architecture
- **JWT Authentication** with Spring Security
- **Swagger/OpenAPI** documentation
- **Maven** build system

## Technology Stack

- **Backend**: Spring Boot, Spring Security, Spring Data JPA
- **Database**: PostgreSQL with Flyway migrations
- **Cache**: Redis with Spring Cache
- **Messaging**: Apache Kafka
- **Documentation**: Swagger/OpenAPI 3
- **Build Tool**: Maven
- **Authentication**: JWT (JSON Web Tokens)

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- PostgreSQL 12+
- Redis 6+
- Apache Kafka 2.8+ (optional for local development)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd backend
```

### 2. Configure Database

Update `src/main/resources/application.yml` with your database settings:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/ecommerce_analytics
    username: your_username
    password: your_password
```

### 3. Configure Redis

Update Redis connection in `application.yml`:

```yaml
spring:
  redis:
    host: localhost
    port: 6379
    password: # optional
```

### 4. Configure Kafka (Optional)

Update Kafka settings in `application.yml`:

```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
```

### 5. Build and Run

```bash
# Build the application
mvn clean compile

# Run database migrations
mvn flyway:migrate

# Start the application
mvn spring-boot:run
```

The API will be available at `http://localhost:8080/api/v1`

## API Documentation

Once the application is running, you can access:

- **Swagger UI**: http://localhost:8080/api/v1/swagger-ui.html
- **API Docs**: http://localhost:8080/api/v1/api-docs

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection URL | `jdbc:postgresql://localhost:5432/ecommerce_analytics` |
| `PGUSER` | Database username | `postgres` |
| `PGPASSWORD` | Database password | `password` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `KAFKA_SERVERS` | Kafka bootstrap servers | `localhost:9092` |
| `JWT_SECRET` | JWT secret key | `mySecretKey` |

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration

### Dashboard
- `GET /api/v1/dashboard/metrics` - Get dashboard metrics
- `GET /api/v1/dashboard/sales-chart` - Get sales chart data

### Products
- `GET /api/v1/products` - Get all products (paginated)
- `GET /api/v1/products/top-selling` - Get top selling products
- `GET /api/v1/products/low-stock` - Get low stock products
- `GET /api/v1/products/search` - Search products

### Alerts
- `GET /api/v1/alerts` - Get all alerts (paginated)
- `GET /api/v1/alerts/unread` - Get unread alerts
- `GET /api/v1/alerts/severity/{severity}` - Get alerts by severity
- `POST /api/v1/alerts/{id}/mark-read` - Mark alert as read

## Database Schema

The application uses Flyway for database migrations. Migration files are located in `src/main/resources/db/migration/`.

### Main Tables:
- `users` - User authentication and profile data
- `products` - Product catalog
- `categories` - Product categories
- `vendors` - Vendor information
- `orders` - Order data
- `order_items` - Order line items
- `customers` - Customer information
- `reviews` - Product reviews
- `marketing_campaigns` - Marketing campaign data
- `alerts` - System alerts
- `sales_metrics` - Sales analytics data

## Caching Strategy

Redis is used for caching frequently accessed data:

- **Dashboard Metrics**: 5 minutes TTL
- **Product Metrics**: 10 minutes TTL
- **Sales Data**: 3 minutes TTL

## Kafka Events

The application publishes events to Kafka topics:

- `order-events` - Order lifecycle events
- `product-events` - Product updates and inventory changes
- `alert-events` - Alert creation and updates
- `analytics-events` - Analytics and reporting events

## Security

- JWT-based authentication
- Role-based authorization (USER, ADMIN)
- CORS configured for frontend integration
- Password encryption using BCrypt

## Testing

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=UserServiceTest

# Run integration tests
mvn test -Dtest=*IT
```

## Building for Production

```bash
# Create production JAR
mvn clean package -Pproduction

# Run with production profile
java -jar target/analytics-api-0.0.1-SNAPSHOT.jar --spring.profiles.active=production
```

## Docker Support

```dockerfile
FROM openjdk:17-jre-slim
COPY target/analytics-api-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

## Monitoring

The application includes Spring Boot Actuator endpoints for monitoring:

- Health check: `/actuator/health`
- Metrics: `/actuator/metrics`
- Info: `/actuator/info`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.