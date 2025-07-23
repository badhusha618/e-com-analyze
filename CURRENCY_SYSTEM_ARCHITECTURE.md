# Multi-Currency System Architecture

## 1. Backend Currency Service (Spring Boot 3.2)

### Service Requirements
- **Framework**: Spring Boot 3.2 with Spring WebFlux for reactive programming
- **Database**: PostgreSQL with R2DBC for reactive database access
- **Cache**: Redis with Spring Data Redis Reactive
- **External API**: CurrencyFreaks API integration with circuit breaker pattern
- **Documentation**: OpenAPI 3.0 with Swagger UI
- **Deployment**: Docker containerization with Kubernetes manifests

### REST API Endpoints

#### Currency Management
```
GET /api/v1/currencies
- Returns all supported currencies with metadata
- Response: List<CurrencyDTO> with code, name, symbol, decimal_places, flag_url

GET /api/v1/currencies/{code}
- Returns specific currency details
- Response: CurrencyDTO with current rate and metadata

GET /api/v1/currencies/search?query={term}
- Search currencies by code or name
- Response: Filtered List<CurrencyDTO>
```

#### Exchange Rate Operations
```
GET /api/v1/rates/latest?base={code}&symbols={codes}
- Real-time exchange rates from cache/API
- Response: ExchangeRateDTO with rates, timestamp, source

GET /api/v1/rates/historical?date={date}&base={code}
- Historical rates for specific date
- Response: HistoricalRateDTO with date-specific rates

GET /api/v1/rates/convert?from={code}&to={code}&amount={value}
- Currency conversion with real-time rates
- Response: ConversionDTO with converted amount, rate, timestamp
```

#### User Preferences
```
GET /api/v1/users/{userId}/currency-preferences
- User's currency settings and favorites
- Response: UserCurrencyPreferencesDTO

PUT /api/v1/users/{userId}/currency-preferences
- Update user currency preferences
- Request: UserCurrencyPreferencesDTO
```

#### Health & Monitoring
```
GET /api/v1/currencies/health
- Service health with cache status and API connectivity
- Response: HealthStatusDTO with component statuses

GET /api/v1/currencies/metrics
- Performance metrics and cache hit rates
- Response: ServiceMetricsDTO
```

### Architecture Components

#### Service Layer Structure
```
CurrencyService (Interface)
├── CurrencyServiceImpl
├── ExchangeRateService
├── UserPreferenceService
└── CacheManagementService

External Integration
├── CurrencyFreaksApiClient (Reactive WebClient)
├── CircuitBreakerConfiguration
└── RetryConfiguration

Data Layer
├── CurrencyRepository (R2DBC)
├── ExchangeRateRepository
└── UserPreferenceRepository
```

#### Resilience Patterns
- **Circuit Breaker**: Hystrix/Resilience4j for API failures
- **Retry Logic**: Exponential backoff for transient failures
- **Fallback Strategy**: Cached rates when external API unavailable
- **Rate Limiting**: Token bucket for API request throttling
- **Timeout Configuration**: Request/connection timeouts

#### Caching Strategy
- **Redis Keys**: `currency:rates:{base}:{timestamp}`, `currency:metadata:{code}`
- **TTL Configuration**: 5 minutes for rates, 24 hours for metadata
- **Cache Warming**: Scheduled jobs for popular currency pairs
- **Invalidation**: Event-driven cache updates via Kafka

#### Security & Audit
- **Authentication**: JWT token validation
- **Authorization**: Role-based access control
- **Audit Logging**: All rate fetches and conversions logged
- **API Keys**: Secure external API key management
- **Rate Limiting**: Per-user and global API limits

#### Monitoring & Observability
- **Metrics**: Micrometer with Prometheus integration
- **Tracing**: Spring Cloud Sleuth with Zipkin
- **Logging**: Structured JSON logging with correlation IDs
- **Health Checks**: Actuator endpoints for Kubernetes probes

## 2. Frontend Currency Module (React + TypeScript)

### Component Hierarchy
```
CurrencyProvider (Context)
├── CurrencySelector
│   ├── CurrencyDropdown
│   │   ├── CurrencyOption (with flag and rate)
│   │   └── CurrencySearch
│   └── FavoriteCurrencies
├── CurrencyConverter
│   ├── AmountInput (with real-time formatting)
│   ├── CurrencySwap (animated swap button)
│   └── ConversionResult
├── CurrencyDisplay
│   ├── FormattedAmount
│   └── CurrencySymbol
└── CurrencySettings
    ├── DefaultCurrency
    ├── FavoritesList
    └── DecimalPrecision
```

### State Management Architecture

#### Context Structure
```typescript
interface CurrencyContextState {
  // Current currency settings
  selectedCurrency: Currency;
  baseCurrency: Currency;
  favorites: Currency[];
  
  // Exchange rate data
  rates: Map<string, ExchangeRate>;
  lastUpdated: Date;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // User preferences
  preferences: UserCurrencyPreferences;
}

interface CurrencyContextActions {
  // Currency selection
  selectCurrency: (currency: Currency) => void;
  setBaseCurrency: (currency: Currency) => void;
  toggleFavorite: (currency: Currency) => void;
  
  // Rate management
  refreshRates: () => Promise<void>;
  getRateForPair: (from: string, to: string) => number;
  
  // Conversion utilities
  convertAmount: (amount: number, from: string, to: string) => number;
  formatAmount: (amount: number, currency: string) => string;
  
  // Preferences
  updatePreferences: (prefs: Partial<UserCurrencyPreferences>) => void;
  resetToDefaults: () => void;
}
```

#### Data Flow Patterns

**Initialization Flow**:
1. CurrencyProvider loads from localStorage
2. Fetches latest rates from API
3. Subscribes to WebSocket for real-time updates
4. Populates context state

**Selection Flow**:
1. User selects currency from dropdown
2. Context updates selectedCurrency
3. Triggers localStorage persistence
4. Notifies all consuming components
5. Fetches new rates if needed

**Conversion Flow**:
1. User inputs amount in CurrencyConverter
2. Real-time formatting using Intl.NumberFormat
3. Automatic conversion calculation
4. Animated result display
5. Optional conversion history tracking

### UI/UX Features

#### Accessibility
- **ARIA Labels**: Comprehensive labeling for screen readers
- **Keyboard Navigation**: Full keyboard support for dropdowns
- **Focus Management**: Logical tab order and focus indicators
- **High Contrast**: Support for high contrast color schemes
- **Screen Reader**: Announcements for rate changes and conversions

#### Animations
- **Smooth Transitions**: CSS transitions for rate updates
- **Loading States**: Skeleton screens during data fetching
- **Swap Animation**: 180-degree rotation for currency swap
- **Flag Animations**: Subtle hover effects for currency flags
- **Number Formatting**: Animated counting for large conversions

#### Responsive Design
- **Mobile First**: Touch-friendly controls and spacing
- **Breakpoint Strategy**: Tailored layouts for mobile/tablet/desktop
- **Typography Scale**: Responsive font sizes for amount displays
- **Touch Targets**: Minimum 44px touch targets for mobile

### Performance Optimizations

#### Memoization Strategy
- **React.memo**: Prevent unnecessary re-renders
- **useMemo**: Cache expensive calculations
- **useCallback**: Stable function references
- **Virtual Scrolling**: For large currency lists

#### Data Management
- **SWR/React Query**: Stale-while-revalidate for rate data
- **Background Sync**: Service worker for offline updates
- **Compression**: Gzip compression for API responses
- **Debouncing**: Input debouncing for search and conversion

## 3. Database Schema (PostgreSQL)

### Core Tables

#### currencies
```sql
CREATE TABLE currencies (
    id SERIAL PRIMARY KEY,
    code VARCHAR(3) UNIQUE NOT NULL,           -- ISO 4217 code (USD, EUR)
    name VARCHAR(100) NOT NULL,               -- Full name (US Dollar)
    symbol VARCHAR(10) NOT NULL,              -- Symbol ($, €)
    decimal_places SMALLINT DEFAULT 2,        -- Decimal precision
    flag_url VARCHAR(255),                    -- Flag image URL
    is_crypto BOOLEAN DEFAULT FALSE,          -- Cryptocurrency flag
    is_active BOOLEAN DEFAULT TRUE,           -- Active status
    display_order INTEGER DEFAULT 999,       -- Sort order
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_currencies_code ON currencies(code);
CREATE INDEX idx_currencies_active ON currencies(is_active);
CREATE INDEX idx_currencies_display_order ON currencies(display_order);
```

#### exchange_rates
```sql
CREATE TABLE exchange_rates (
    id BIGSERIAL PRIMARY KEY,
    base_currency_id INTEGER REFERENCES currencies(id),
    target_currency_id INTEGER REFERENCES currencies(id),
    rate DECIMAL(20,8) NOT NULL,              -- Exchange rate
    rate_date DATE NOT NULL,                  -- Rate date
    source VARCHAR(50) NOT NULL,              -- Data source
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(base_currency_id, target_currency_id, rate_date, source)
);

CREATE INDEX idx_exchange_rates_lookup ON exchange_rates(base_currency_id, target_currency_id, rate_date);
CREATE INDEX idx_exchange_rates_date ON exchange_rates(rate_date DESC);
CREATE INDEX idx_exchange_rates_source ON exchange_rates(source);
```

#### user_currency_preferences
```sql
CREATE TABLE user_currency_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,                  -- Reference to users table
    default_currency_id INTEGER REFERENCES currencies(id),
    favorite_currencies INTEGER[],            -- Array of currency IDs
    decimal_precision SMALLINT DEFAULT 2,     -- User preferred precision
    show_currency_code BOOLEAN DEFAULT TRUE,  -- Display preferences
    auto_update_rates BOOLEAN DEFAULT TRUE,   -- Auto-refresh setting
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id)
);

CREATE INDEX idx_user_currency_prefs_user ON user_currency_preferences(user_id);
```

#### rate_cache
```sql
CREATE TABLE rate_cache (
    id BIGSERIAL PRIMARY KEY,
    cache_key VARCHAR(255) UNIQUE NOT NULL,   -- Redis-style key
    base_currency VARCHAR(3) NOT NULL,
    target_currencies TEXT[],                 -- Array of target currencies
    rates JSONB NOT NULL,                     -- Cached rate data
    expires_at TIMESTAMP NOT NULL,            -- Expiration time
    created_at TIMESTAMP DEFAULT NOW(),
    
    CHECK (expires_at > created_at)
);

CREATE INDEX idx_rate_cache_key ON rate_cache(cache_key);
CREATE INDEX idx_rate_cache_expires ON rate_cache(expires_at);
CREATE INDEX idx_rate_cache_base ON rate_cache(base_currency);
```

### Indexing Strategy

#### Performance Indexes
```sql
-- Composite index for common lookup patterns
CREATE INDEX idx_exchange_rates_composite 
ON exchange_rates(base_currency_id, rate_date DESC, target_currency_id);

-- Partial index for active currencies only
CREATE INDEX idx_currencies_active_code 
ON currencies(code) WHERE is_active = TRUE;

-- Index for time-series queries
CREATE INDEX idx_exchange_rates_time_series 
ON exchange_rates(target_currency_id, rate_date DESC) 
WHERE rate_date >= CURRENT_DATE - INTERVAL '1 year';

-- Functional index for case-insensitive search
CREATE INDEX idx_currencies_name_lower 
ON currencies(LOWER(name));
```

#### Constraint Indexes
```sql
-- Ensure rate consistency
ALTER TABLE exchange_rates 
ADD CONSTRAINT chk_positive_rate 
CHECK (rate > 0);

-- Validate currency codes
ALTER TABLE currencies 
ADD CONSTRAINT chk_currency_code_format 
CHECK (code ~ '^[A-Z]{3}$');

-- Ensure reasonable decimal places
ALTER TABLE currencies 
ADD CONSTRAINT chk_decimal_places_range 
CHECK (decimal_places BETWEEN 0 AND 8);
```

### Sample Seed Data

#### Major Currencies
```sql
INSERT INTO currencies (code, name, symbol, decimal_places, display_order) VALUES
('USD', 'US Dollar', '$', 2, 1),
('EUR', 'Euro', '€', 2, 2),
('GBP', 'British Pound Sterling', '£', 2, 3),
('JPY', 'Japanese Yen', '¥', 0, 4),
('CHF', 'Swiss Franc', 'Fr', 2, 5),
('CAD', 'Canadian Dollar', 'C$', 2, 6),
('AUD', 'Australian Dollar', 'A$', 2, 7),
('CNY', 'Chinese Yuan', '¥', 2, 8),
('INR', 'Indian Rupee', '₹', 2, 9),
('BRL', 'Brazilian Real', 'R$', 2, 10);
```

#### Sample Exchange Rates
```sql
INSERT INTO exchange_rates (base_currency_id, target_currency_id, rate, rate_date, source)
SELECT 
    (SELECT id FROM currencies WHERE code = 'USD'),
    c.id,
    CASE c.code
        WHEN 'EUR' THEN 0.85
        WHEN 'GBP' THEN 0.73
        WHEN 'JPY' THEN 110.00
        WHEN 'CHF' THEN 0.92
        WHEN 'CAD' THEN 1.25
        WHEN 'AUD' THEN 1.35
        WHEN 'CNY' THEN 6.45
        WHEN 'INR' THEN 74.50
        WHEN 'BRL' THEN 5.20
        ELSE 1.00
    END,
    CURRENT_DATE,
    'initial_seed'
FROM currencies c;
```

## 4. Kafka Rate Updates System

### Topic Schema Design

#### currency.updates Topic
```json
{
  "name": "currency.updates",
  "type": "record",
  "fields": [
    {
      "name": "messageId",
      "type": "string",
      "doc": "Unique message identifier for deduplication"
    },
    {
      "name": "timestamp",
      "type": "long",
      "logicalType": "timestamp-millis",
      "doc": "Event timestamp"
    },
    {
      "name": "source",
      "type": "string",
      "doc": "Data source identifier (currencyfreaks, ecb, etc.)"
    },
    {
      "name": "baseCurrency",
      "type": "string",
      "doc": "Base currency code (ISO 4217)"
    },
    {
      "name": "rates",
      "type": {
        "type": "array",
        "items": {
          "type": "record",
          "name": "ExchangeRate",
          "fields": [
            {"name": "currency", "type": "string"},
            {"name": "rate", "type": "double"},
            {"name": "change", "type": ["null", "double"], "default": null},
            {"name": "changePercent", "type": ["null", "double"], "default": null}
          ]
        }
      }
    },
    {
      "name": "metadata",
      "type": {
        "type": "record",
        "name": "UpdateMetadata",
        "fields": [
          {"name": "provider", "type": "string"},
          {"name": "confidence", "type": "double"},
          {"name": "latency", "type": "long"},
          {"name": "version", "type": "string"}
        ]
      }
    }
  ]
}
```

### Stream Processing Topology

#### Input Streams
```
currency.raw.updates (from external APIs)
    ↓ [Validation & Transformation]
currency.validated.updates
    ↓ [Deduplication]
currency.deduplicated.updates
    ↓ [Rate Change Detection]
currency.change.events
    ↓ [Cache Update & Notification]
currency.processed.updates
```

#### Processing Nodes

**Validation Node**:
- Schema validation against Avro schema
- Currency code format validation (ISO 4217)
- Rate value bounds checking (positive, reasonable ranges)
- Timestamp validation (not future, not too old)
- Source authentication verification

**Transformation Node**:
- Rate normalization (handle different decimal precisions)
- Currency code standardization (uppercase, trimming)
- Metadata enrichment (add processing timestamp, version)
- Cross-rate calculation for major pairs

**Deduplication Node**:
- Message ID-based deduplication (24-hour window)
- Rate change threshold filtering (ignore minimal changes < 0.01%)
- Source priority handling (prefer higher confidence sources)
- Time-based windowing for duplicate detection

**Change Detection Node**:
- Compare with previous rates from state store
- Calculate percentage change and absolute change
- Generate rate alerts for significant movements (>5%)
- Maintain rolling averages and volatility metrics

### Cache Invalidation Mechanism

#### Redis Integration
```
Kafka Consumer → Redis Cache Manager
    ↓
Pattern-based Key Invalidation
    ↓ 
Cache Warming for Popular Pairs
    ↓
WebSocket Notifications to Connected Clients
```

#### Invalidation Strategies
- **Targeted Invalidation**: Remove specific currency pair keys
- **Pattern Invalidation**: Remove all keys matching `rates:USD:*`
- **Time-based Invalidation**: Reduce TTL for affected keys
- **Preemptive Warming**: Refresh popular currency combinations

#### State Management
- **Local State Store**: Recent rates for change detection
- **Global State Store**: Historical rate trends
- **Windowed State**: Aggregated statistics per currency
- **Punctuation**: Periodic state cleanup and compaction

### Error Handling & Dead Letter Queues

#### Error Categories
```
currency.updates.errors.schema (Schema validation failures)
currency.updates.errors.business (Business rule violations)
currency.updates.errors.external (External service failures)
currency.updates.errors.poison (Unparseable messages)
```

#### Dead Letter Queue Strategy

**Retry Logic**:
- Exponential backoff: 1s, 2s, 4s, 8s, 16s
- Maximum retry attempts: 5
- Circuit breaker on consecutive failures
- Manual retry capability through admin interface

**DLQ Processing**:
- Separate consumer group for DLQ monitoring
- Alert generation for DLQ message accumulation
- Manual inspection and reprocessing capabilities
- Metrics collection for error analysis

**Recovery Mechanisms**:
- Fallback to cached rates during processing errors
- Alternative data source switching
- Manual rate entry for critical currency pairs
- Service degradation alerts for stakeholders

## 5. Full-Stack Integration Specifications

### API Specification (OpenAPI 3.0)

#### Rate Synchronization Endpoints
```yaml
/api/v1/currencies/sync:
  post:
    summary: Trigger manual rate synchronization
    security:
      - bearerAuth: []
    responses:
      202:
        description: Sync initiated
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SyncResponse'

/api/v1/currencies/websocket:
  get:
    summary: WebSocket endpoint for real-time rate updates
    parameters:
      - name: currencies
        in: query
        description: Comma-separated currency codes to subscribe
        schema:
          type: string
          example: "USD,EUR,GBP"
```

#### Frontend State Synchronization

**Initial Load Sequence**:
1. Load user preferences from localStorage
2. Fetch available currencies from `/api/v1/currencies`
3. Fetch latest rates for user's favorite currencies
4. Establish WebSocket connection for real-time updates
5. Initialize context state and notify components

**Real-time Update Flow**:
1. WebSocket receives rate update message
2. Context validates message and updates state
3. Components re-render with new rates
4. localStorage is updated with latest rates
5. UI animations highlight changed rates

### State Synchronization Patterns

#### Optimistic Updates
```typescript
// Frontend immediately updates UI
updateExchangeRate(newRate);

// Sync with backend asynchronously
syncRateWithBackend(newRate)
  .catch(() => {
    // Rollback on failure
    revertExchangeRate(previousRate);
    showErrorMessage();
  });
```

#### Conflict Resolution
- **Last Writer Wins**: Use timestamps to resolve conflicts
- **Version Vectors**: Track update sources and ordering
- **User Intent Preservation**: Prioritize user-initiated changes
- **Background Sync**: Sync during idle periods

#### Offline Support
- **Service Worker**: Cache API responses and static assets
- **Background Sync**: Queue updates when offline
- **Stale Data Indicators**: Show data age in UI
- **Conflict Resolution**: Handle conflicts when reconnecting

### Failover Scenarios

#### External API Failures

**Primary Failover Chain**:
```
CurrencyFreaks API → Fixer.io API → ExchangeRate-API → Cached Rates → Manual Override
```

**Failover Logic**:
1. Circuit breaker detects API failure
2. Switch to secondary data source
3. Update service health status
4. Notify monitoring systems
5. Fall back to cached rates if all APIs fail

#### Database Failures

**Read Failures**:
- Serve from Redis cache
- Enable read-only mode
- Show degraded service notice
- Queue write operations

**Write Failures**:
- Continue serving reads from cache
- Queue writes for replay
- Enable manual data entry
- Alert database administrators

#### Cache Failures

**Redis Unavailable**:
- Direct database reads for rates
- Increase API call frequency
- Reduce rate update intervals
- Show performance warning

**Cache Corruption**:
- Automatic cache invalidation
- Rebuild from database
- Validate data integrity
- Monitor for recurring issues

### Performance Requirements

#### Response Time Targets
- **Currency List**: < 100ms (cached)
- **Rate Conversion**: < 50ms (cached)
- **Real-time Updates**: < 500ms end-to-end
- **Historical Data**: < 2s for 1-year range

#### Throughput Requirements
- **Concurrent Users**: 10,000 simultaneous connections
- **API Requests**: 1,000 RPS sustained, 5,000 RPS peak
- **WebSocket Messages**: 50,000 messages/second
- **Database Queries**: 5,000 QPS with < 10ms avg latency

#### Scalability Metrics
- **Horizontal Scaling**: Auto-scale based on CPU/memory
- **Database Connections**: Connection pooling with max 100 per instance
- **Cache Hit Ratio**: > 95% for rate lookups
- **Error Rate**: < 0.1% for all operations

## 6. Localization Extensions

### RTL Language Support

#### Currency Display Adaptations
- **Number Formatting**: Respect locale-specific number formats
- **Symbol Placement**: Currency symbols before/after based on locale
- **Decimal Separators**: Handle comma vs. dot decimal separators
- **Thousands Separators**: Space, comma, or period based on locale
- **Directionality**: Right-to-left text flow for Arabic, Hebrew

#### UI Layout Considerations
- **Flex Direction**: Reverse for RTL layouts
- **Icon Orientation**: Mirror directional icons
- **Animation Direction**: Reverse slide animations
- **Input Alignment**: Right-align numeric inputs in RTL

### Cryptocurrency Integration

#### Extended Currency Support
- **Major Cryptocurrencies**: BTC, ETH, LTC, XRP, ADA
- **Stablecoin Integration**: USDC, USDT, DAI
- **DeFi Tokens**: UNI, SUSHI, COMP
- **Exchange Integration**: Binance, Coinbase, Kraken APIs
- **Real-time Rates**: WebSocket streams for crypto rates

#### Crypto-Specific Features
- **Wallet Address Validation**: Format and checksum validation
- **Gas Fee Estimation**: Network fee calculations
- **Volatility Indicators**: High volatility warnings
- **24h Change Tracking**: Price movement indicators
- **Market Cap Display**: Additional metadata for cryptocurrencies

### Tax Calculation Hooks

#### Integration Points
- **Conversion Events**: Track all currency conversions for tax reporting
- **Rate Snapshots**: Store rates at transaction time
- **Jurisdiction Rules**: Country-specific tax calculation rules
- **Reporting Periods**: Monthly, quarterly, annual tax periods
- **Export Functionality**: CSV/PDF export for tax filing

#### Tax Calculation Framework
```typescript
interface TaxCalculationHook {
  calculateTax(conversion: CurrencyConversion): TaxLiability;
  getApplicableRates(jurisdiction: string): TaxRates;
  generateReport(period: TaxPeriod): TaxReport;
  validateCompliance(transaction: Transaction): ComplianceResult;
}
```

### Historical Rate Analytics

#### Analytics Capabilities
- **Trend Analysis**: Moving averages, trend lines, volatility bands
- **Correlation Analysis**: Currency pair correlations
- **Volatility Metrics**: Standard deviation, VaR calculations
- **Predictive Models**: ARIMA, LSTM for rate forecasting
- **Seasonal Patterns**: Holiday and event impact analysis

#### Data Visualization
- **Candlestick Charts**: OHLC data for currency pairs
- **Heat Maps**: Correlation matrices between currencies
- **Trend Lines**: Support and resistance levels
- **Volume Analysis**: Trading volume indicators
- **News Integration**: Economic event annotations

#### Advanced Features
- **Rate Alerts**: Threshold-based notifications
- **Portfolio Tracking**: Multi-currency portfolio analysis
- **Risk Assessment**: VaR and stress testing
- **Benchmarking**: Performance against indices
- **API Integration**: Financial data providers (Bloomberg, Reuters)

---

**Architecture Status**: Complete Specification Ready for Implementation
**Estimated Implementation Time**: 12-16 weeks for full system
**Technology Dependencies**: Spring Boot 3.2, React 18, PostgreSQL 14+, Redis 7+, Kafka 3+
**External Integrations**: CurrencyFreaks API, cryptocurrency exchanges, tax calculation services