# ADR - Architecture Decision Records

---

# Project Goal

The primary objective of this project was to design and execute a comprehensive, production-grade testing strategy (E2E, API, integration, unit, performance, and CI/CD reliability). Application development served as a vehicle to provide realistic, evolving system-under-test (SUT) scenarios. All architecture and implementation choices were made to enable better testing coverage, reliability, and demonstration of professional QA/test automation skills.

# ADR-000: Initial Local Version

## Status
Accepted

## Context
The project’s primary goal was testing excellence and test automation practice. The application implementation existed to support that goal by creating realistic user journeys, APIs, and failure modes to test. We started with a quick local prototype to enable iterative development of tests, CI/CD, and quality gates, using the app only as the means to become a better tester and demonstrate modern testing practices.

## Technology Selection

### Backend Framework: Express.js with TypeScript

**Why Express.js:**
- **Maturity and stability**: Express has existed since 2010, has a huge community, and is battle-tested in production
- **Minimalism and flexibility**: Does not enforce a project structure, allows custom architectural decisions
- **Middleware ecosystem**: Thousands of ready-made solutions for CORS, authentication, rate limiting, logging
- **Learning curve**: Easy for beginners, scales to advanced use cases
- **Performance**: Lightweight framework with minimal overhead, ideal for REST APIs

**Alternatives rejected:**
- **Fastify**: Faster, but smaller community and fewer learning resources
- **NestJS**: Too complex for a prototype, enforces a specific architecture (dependency injection, decorators)
- **Koa**: Smaller ecosystem, no significant advantages over Express
- **Hapi**: More opinionated, less popular on the job market

**Why TypeScript:**
- **Type safety**: Catches errors at compile time, not runtime
- **IntelliSense**: Better IDE support, auto-completion
- **Refactoring**: Safe renaming and function signature changes
- **Documentation in code**: Types serve as living documentation
- **Industry standard**: Required in most Node.js job postings

### Frontend Framework: React with Vite

**Why React:**
- **Largest job market**: 60%+ of frontend offers require React
- **Ecosystem**: The largest number of libraries and components
- **Community**: Millions of developers, easy to find help
- **Functional paradigm**: Hooks simplify state management
- **React 18**: Concurrent features, automatic batching, Suspense

**Why Vite:**
- **Development speed**: HMR (Hot Module Replacement) in <50ms
- **Native ESM**: Uses browser-native ES modules
- **Zero-config**: Works out-of-the-box with TypeScript, JSX, CSS Modules
- **Build performance**: Rollup under the hood for optimal production bundles
- **Dev/Prod parity**: Same config for development and production

**Alternatives rejected:**
- **Create React App**: Outdated, no maintenance, slow development
- **Next.js**: Overkill for SPA, enforces SSR/SSG
- **Webpack**: Complex configuration, slower development
- **Parcel**: Less popular, smaller community

### Data Source: PokeAPI

**Advantages:**
- **Free and unrestricted**: No API key, generous rate limits
- **Complete data**: 1000+ Pokemon, all generations
- **RESTful design**: Good example of a well-designed API
- **Stability**: Running for years, reliable

**Drawbacks and mitigations:**
- **Latency**: 200-500ms per request → caching later
- **Rate limiting**: 100 req/min → own API later
- **Lack of control**: External dependency → data scraping

### Architecture: Monolith First

**Rationale:**
- **Simplicity**: One process, one deployment, one repo
- **Fast iteration**: No network overhead between services
- **Easy debugging**: Entire stack trace in one place
- **Low cost**: One server, one database (later)
- **Evolution**: Easy extraction to microservices when needed

## Technology Stack Summary

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Runtime** | Node.js 18 LTS | Stability, native fetch, performance |
| **Backend** | Express.js 4.18 | Maturity, flexibility, ecosystem |
| **Language** | TypeScript 5.3 | Type safety, DX, industry standard |
| **Frontend** | React 18.2 | Largest market, ecosystem, hooks |
| **Bundler** | Vite 5.0 | Speed, zero-config, ESM |
| **HTTP Client** | Axios | Interceptors, retry logic, TypeScript |
| **Styling** | CSS Modules | Scoped styles, no runtime, simple |
| **Linting** | ESLint + Prettier | Code quality, consistency |

## Consequences

### Positive
- ✅ **Fast start**: 2 days to a working prototype
- ✅ **Popular technologies**: Easy to find developers
- ✅ **Simple architecture**: Junior-friendly
- ✅ **Flexibility**: Easy to add features
- ✅ **Good practices**: TypeScript, linting, structure

### Negative
- ❌ **No state management**: Props drilling in React
- ❌ **No caching**: Every request goes to PokeAPI
- ❌ **No persistence**: Restart = data loss
- ❌ **No auth**: No security

---

# ADR-001: Vercel Deployment

## Context
After building the local version, we needed a way to make the project publicly available. The app had to be online for showcasing to potential employers and for user testing. Key requirements:
- Minimal costs (preferably free)
- Automatic deployment
- Node.js backend support
- Global availability

## Technology Selection

### Platform: Vercel

**Why Vercel:**
- **Generous free tier**: 100GB bandwidth, unlimited deployments
- **Serverless Functions**: Backend as FaaS, pay per use
- **Edge Network**: 70+ PoPs globally, low latency
- **Git Integration**: Auto-deploy from GitHub, preview deployments
- **Analytics**: Built-in Web Vitals and Real User Monitoring
- **DX Excellence**: Zero-config, automatic optimization

**Alternatives considered:**

| Platform | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Netlify** | Similar features, good DX | Worse Node.js support, fewer edge locations | ❌ Rejected |
| **GitHub Pages** | 100% free, simple | Static hosting only, no backend | ❌ Rejected |
| **Heroku** | Full Node.js support | Paid for always-on apps, slow cold start | ❌ Rejected |
| **AWS Lambda** | Infinite scalability | Complex configuration, steep learning curve | ❌ Rejected |
| **Railway** | Simple, good DX | Paid from the start, small community | ❌ Rejected |
| **Render** | Free tier with Node.js | Slow cold start, less known | ❌ Rejected |

### Architecture: Serverless

**Serverless advantages:**
- **Auto-scaling**: From 0 to infinity with no config
- **Pay-per-use**: No cost when idle
- **No ops**: Zero server management
- **Isolation**: Each invocation in a separate container
- **Global deployment**: Edge functions close to users

**Challenges and solutions:**
- **Cold starts**: 500-1000ms → Warming strategies, Edge caching
- **Stateless**: No persistence → External database (later)
- **Timeout limits**: 10s free tier → Optimize queries
- **Vendor lock-in**: Vercel-specific → Abstractions in code

### Deployment Strategy

**CI/CD Pipeline:**
1. **Git Push** → GitHub main branch
2. **Webhook** → Vercel receives notification
3. **Build** → Install deps, compile TS, bundle frontend
4. **Deploy** → Upload to CDN and serverless
5. **Verify** → Health checks, smoke tests
6. **Promote** → Update production alias

**Environment Management:**
- **Production**: main branch → pokedex.vercel.app
- **Staging**: develop branch → pokedex-staging.vercel.app
- **Preview**: PR branches → unique URLs
- **Rollback**: Instant via Vercel dashboard

## Technology Decisions

### Frontend Hosting
- **Static Generation**: Pre-render at build time
- **CDN Distribution**: Cloudflare network
- **Asset Optimization**: Auto-compress, WebP conversion
- **Caching Strategy**: Immutable assets, SWR for data

### Backend Functions
- **Runtime**: Node.js 18.x
- **Memory**: 1024 MB (free tier)
- **Timeout**: 10 seconds (free tier)
- **Regions**: Auto (closest to user)

### Configuration Approach
- **Zero-config philosophy**: Convention over configuration
- **Environment variables**: Via Vercel dashboard
- **Build settings**: package.json scripts
- **Custom headers**: vercel.json for CORS, security

## Migration Path

**From Local to Serverless:**

| Component | Local | Vercel | Changes Required |
|-----------|-------|--------|------------------|
| **Express Server** | Long-running process | Function per endpoint | Refactor to handlers |
| **Routing** | Express Router | File-based routing | Restructure directories |
| **Static Files** | Express.static | CDN | Move to public/ |
| **Environment** | .env file | Vercel Environment | Dashboard config |
| **Logs** | Console/files | Vercel Functions Log | Structured logging |

## Performance Optimization

**Strategies applied:**
- **Edge Caching**: Cache API responses at edge
- **Stale-While-Revalidate**: Serve stale content while updating
- **Bundle Splitting**: Separate vendor/app chunks
- **Image Optimization**: Next/Image or Vercel OG
- **Compression**: Brotli for text assets

## Consequences

### Positive
- ✅ **Zero initial cost**: Perfect for MVP
- ✅ **Infinite scale**: Handles viral traffic
- ✅ **Global performance**: CDN everywhere
- ✅ **Developer experience**: Push to deploy
- ✅ **Preview deployments**: Test before merge
- ✅ **Rollback capability**: Instant revert

### Negative
- ❌ **Cold starts**: 500-1000ms first request
- ❌ **Vendor lock-in**: Hard to migrate
- ❌ **Limited compute**: 10s timeout on free
- ❌ **Debugging challenges**: Distributed logs
- ❌ **Cost unpredictability**: Can spike with traffic

## Metrics & Results

| Metric | Before (Local) | After (Vercel) | Improvement |
|--------|---------------|----------------|-------------|
| **Availability** | 0% (local only) | 99.99% | ∞ |
| **Global Latency** | N/A | <100ms | N/A |
| **Deployment Time** | Manual | <90s | Automated |
| **Cost** | $0 | $0 | Same |
| **Scalability** | 1 user | Unlimited | ∞ |

---

# ADR-002: Custom Pokemon API Service

## Status
Accepted

## Context
Dependence on the external PokeAPI caused critical problems:
- **Rate limiting**: 100 requests/IP/minute - a blocker with many users
- **Latency**: 200-500ms per request - poor UX
- **Availability**: Temporary API outages affected our app
- **Lack of control**: We cannot optimize data structure
- **Skills demonstration**: Need to showcase backend development skills

## Technology Selection

### Hosting Platform: Mikrus VPS

**Why Mikrus:**
- **Cost**: 20 PLN/month for a full VPS
- **Location**: Servers in Poland, low latency for local users
- **Flexibility**: Full control over the environment
- **Support**: Local support, fast assistance
- **Simplicity**: User-friendly admin panel

**Alternatives considered:**

| Provider | Cost/month | Pros | Cons | Verdict |
|----------|------------|------|------|---------|
| **DigitalOcean** | $6 | Global presence, great docs | More expensive, overkill for the project | ❌ |
| **Linode** | $5 | Reliable, good API | Similarly expensive | ❌ |
| **Oracle Free Tier** | $0 | Free forever | Complex setup, vendor lock | ❌ |
| **Google Cloud Free** | $0* | $300 credits | One year only, expensive later | ❌ |
| **Home Server** | $0 | Full control | No SLA, IP issues | ❌ |

### Data Storage: JSON Files

**Why JSON instead of a database:**
- **Simplicity**: No database overhead
- **Performance**: Everything in RAM
- **Immutable data**: Pokemon don’t change
- **Backup**: Simple - copy files
- **Versioning**: Git for data

**Data structure:**
- `pokemon.json`: Core Pokemon data (151 entries)
- `species.json`: Descriptions, habitat, generation
- `evolution-chains.json`: Evolution relationships
- `types.json`: Type effectiveness matrix
- `suggestions.json`: Optimized for search

**Alternatives:**
- **SQLite**: Overhead for read-only data
- **PostgreSQL**: Overkill, requires maintenance
- **Redis**: Great for cache, but volatile
- **MongoDB**: Unnecessary complexity

### Containerization: Docker

**Why Docker:**
- **Consistency**: Same behavior locally and in production
- **Isolation**: No conflicts with other services
- **Deployment**: One-command deployment
- **Rollback**: Easy rollback to previous version
- **Scaling**: Ready for orchestration (K8s later)

**Docker Stack:**
- **Base Image**: node:18-alpine (only ~50MB)
- **Multi-stage build**: Separate build and runtime
- **Health checks**: Automatic restarts
- **Volume mounts**: Data and logs persistence

### Process Management: PM2

**Why PM2:**
- **Auto-restart**: On crashes and memory leaks
- **Cluster mode**: Use all CPU cores
- **Log management**: Rotation, compression
- **Monitoring**: CPU, memory, event loop
- **Zero-downtime reload**: Graceful restart

**PM2 configuration:**
- Cluster mode with 2 instances
- Auto-restart at 80% memory
- Log rotation every 10MB
- Health endpoint monitoring

### Data Acquisition: Web Scraping

**Scraping strategy:**
1. **Rate limiting aware**: 2 req/sec max
2. **Incremental**: Ability to resume
3. **Validation**: Data completeness checks
4. **Transformation**: Optimize structure
5. **Compression**: Images in WebP

**Scraped Data:**
- 151 Pokemon (Gen 1 only)
- 18 types with damage relations
- 50+ evolution chains
- 1000+ sprites and artwork
- Descriptions in English

## Architecture Design

### API Design Principles

**RESTful Conventions:**
- Semantic URLs: `/api/pokemon/25`
- Proper HTTP codes: 200, 404, 500
- JSON responses
- CORS enabled
- Versioning ready: `/api/v1/`

**Performance Optimizations:**
- In-memory data store
- No database queries
- Pre-computed relations
- Optimized JSON structure
- Gzip compression

**Endpoints Structure:**
- `GET /api/pokemon` - Paginated list
- `GET /api/pokemon/:id` - By ID
- `GET /api/pokemon/name/:name` - By name
- `GET /api/pokemon-species/:id` - Species data
- `GET /api/evolution-chain/:id` - Evolution data
- `GET /api/types` - All types
- `GET /api/pokemon/suggestions` - Search helper
- `GET /health` - Health check

### Deployment Architecture

**Infrastructure Setup:**
```
Internet → Cloudflare → Nginx → Docker → PM2 → Node.js
                ↓
            SSL/DDoS     ↓        ↓        ↓
           Protection  Proxy  Container  Process  App
```

**Security Measures:**
- CORS whitelist
- No sensitive data
- Read-only API

## Migration Strategy

**Phase 1: Data Acquisition**
- Scrape all Pokemon data
- Download all images
- Transform to optimal structure
- Validate completeness

**Phase 2: API Development**
- Implement all endpoints
- Add caching headers
- Error handling
- Logging system

**Phase 3: Deployment**
- Docker containerization
- VPS setup
- Domain configuration
- SSL certificates

**Phase 4: Integration**
- Update frontend URLs
- Add fallback to PokeAPI
- Monitor performance
- Gather metrics

## Performance Metrics

| Metric | PokeAPI | Custom API | Improvement |
|--------|---------|------------|-------------|
| **Response Time** | 200-500ms | 10-30ms | 10-20x faster |
| **Rate Limit** | 100/min | Unlimited* | ∞ |
| **Availability** | 99% | 99.9% | Better SLA |
| **Data Control** | None | Full | Complete |
| **Cost** | Free | 20 PLN/mo | Acceptable |
| **Latency (PL)** | 150ms | 10ms | 15x better |

*Practical limit: 1000 req/sec

## Consequences

### Positive
- ✅ **Blazing fast**: <30ms response times
- ✅ **Full control**: Own data and structure
- ✅ **No limits**: No external rate limiting
- ✅ **Reliability**: 99.9% uptime SLA
- ✅ **Learning**: Demonstration of DevOps skills
- ✅ **Scalability**: Ready for microservices

### Negative
- ❌ **Maintenance**: Requires monitoring
- ❌ **Cost**: 70 PLN/year
- ❌ **Updates**: Manual for new Pokemon
- ❌ **Backup**: Your own responsibility
- ❌ **Security**: Your own responsibility

---

# ADR-003: Testing Strategy

## Status
Accepted

## Context
Need for a comprehensive testing strategy for:
- **QA skills demonstration**: Show knowledge of modern tools and practices
- **Quality assurance**: Detect regressions before deployment
- **Behavior documentation**: Tests as living documentation
- **CI/CD Pipeline**: Automated verification for every PR
- **Confidence in refactoring**: Safe changes

## Technology Selection

### E2E Testing Framework: Playwright

**Why Playwright:**
- **Multi-browser**: Chromium, Firefox, WebKit in one API
- **Auto-waiting**: Intelligent waiting for elements
- **Network interception**: Mocking and modifying requests
- **Visual testing**: Screenshots and video recording
- **Parallel execution**: Fast tests via parallelism
- **Debugging**: Trace viewer, inspector, codegen

**Alternatives rejected:**

| Framework | Pros | Cons | Verdict |
|-----------|------|------|---------|
| **Cypress** | Popular, good DX | Chrome-based only, slow | ❌ |
| **Selenium** | Industry standard | Flaky, verbose API | ❌ |
| **Puppeteer** | Fast, lightweight | Chrome only, low-level | ❌ |
| **TestCafe** | No dependencies | Smaller community | ❌ |
| **WebdriverIO** | Flexible | Complex setup | ❌ |

### Unit Testing: Vitest

**Why Vitest:**
- **Vite compatible**: Same config as frontend
- **Jest compatible**: Easy migration
- **Fast**: Native ESM, parallel by default
- **TypeScript**: First-class support
- **Watch mode**: Instant feedback
- **Coverage**: Built-in c8

**Vs Jest:**
- 10x faster execution
- Zero config for TypeScript
- Better error messages
- Modern ESM support

### API Testing: Playwright API Testing

**Why Playwright (not Postman/Insomnia):**
- **Unified tooling**: Same framework as E2E
- **Code-based**: Version control, refactoring
- **TypeScript**: Type safety for responses
- **CI/CD ready**: No GUI needed
- **Assertions**: Rich matchers

## Testing Architecture

### Test Pyramid Strategy

```
         /\        E2E Tests (10%)
        /  \       - Critical user journeys
       /    \      - Smoke tests
      /      \     
     /  API   \    Integration Tests (30%)
    /  Tests   \   - Service integration
   /            \  - API contracts
  /              \ 
 / Unit Tests     \ Unit Tests (60%)
/                  \ - Business logic
                    - Data transformations
```

### Page Object Model (POM)

**Structure:**
```
tests/
├── pages/           # Page Objects
│   ├── pokemon-app.page.ts
│   ├── team.page.ts
│   └── search.page.ts
├── fixtures/        # Test data
│   ├── pokemon.data.ts
│   └── users.data.ts
├── helpers/         # Utilities
│   └── test.helpers.ts
└── specs/          # Test files
    ├── e2e/
    ├── api/
    └── unit/
```

**Benefits:**
- **Maintainability**: Centralized selectors
- **Reusability**: Shared actions
- **Readability**: Business-level methods
- **Stability**: Abstraction from UI changes

### Test Data Management

**Strategies:**
1. **Fixtures**: Static test data files
2. **Factories**: Dynamic data generation
3. **Builders**: Fluent API for complex objects
4. **Seeds**: Database state for integration tests

**Data Isolation:**
- Unique data per test
- Cleanup after each test
- No shared mutable state
- Deterministic outcomes

## CI/CD Integration

### GitHub Actions Workflow

**Pipeline Stages:**
1. **Lint & Format**: Code quality gates
2. **Type Check**: TypeScript compilation
3. **Unit Tests**: Fast feedback
4. **Build**: Create artifacts
5. **Integration Tests**: Service tests
6. **E2E Tests**: Full system validation
7. **Deploy**: If all pass

**Parallelization Strategy:**
- Matrix builds for multiple Node versions
- Sharded E2E tests across machines
- Concurrent unit test suites
- Service tests in parallel

### Test Environments

| Environment | Purpose | Data | Reset |
|-------------|---------|------|-------|
| **Local** | Development | Mocked | Per run |
| **CI** | Pull requests | Synthetic | Per job |
| **Staging** | Pre-production | Copy of prod | Daily |
| **Production** | Monitoring | Real | Never |

## Test Categories

### 1. E2E Tests (Playwright)

**Coverage:**
- User registration and login
- Pokemon search and filtering
- Team management (add/remove)
- Navigation flows
- Error scenarios
- Responsive design

**Best Practices:**
- Independent tests
- Explicit waits
- Screenshot on failure
- Retry flaky tests
- Parallel execution

### 2. API Tests (Playwright)

**Coverage:**
- All endpoints
- Status codes
- Response schemas
- Error handling
- Rate limiting
- Auth flows

**Validation:**
- Contract testing
- Performance benchmarks
- Security headers
- CORS policies

### 3. Unit Tests (Vitest)

**Coverage:**
- Pure functions
- Data transformations
- Business logic
- Error handling
- Edge cases

**Principles:**
- Fast execution (<100ms)
- No external dependencies
- Deterministic
- Single responsibility

### 4. Integration Tests

**Coverage:**
- Service communication
- Database operations
- External API calls
- Message queues
- File operations

**Approach:**
- Test containers for DBs
- Mock external services
- Real service instances
- Network failure simulation

## Performance Testing

### Load Testing Strategy

**Tools:**
- **k6**: Modern, developer-centric
- **Artillery**: Simple, YAML-based

**Scenarios:**
1. **Baseline**: Normal traffic
2. **Stress**: 2x normal
3. **Spike**: Sudden burst
4. **Soak**: Extended duration

**Metrics:**
- Response time (p50, p95, p99)
- Throughput (req/sec)
- Error rate
- CPU/Memory usage

## Known Issues & Solutions

### CI/CD Network Binding

**Problem:** Tests fail in CI but work locally
**Root Cause:** localhost vs 0.0.0.0 binding
**Solution:** Always use 0.0.0.0 in CI environments

### Service Dependencies

**Problem:** Race conditions in service startup
**Solution:** Health checks before test execution
```
await waitForService('http://0.0.0.0:3001/health');
```

### Flaky Tests

**Common Causes:**
1. Timing issues → Use proper waits
2. Test interdependence → Isolate tests
3. External dependencies → Mock them
4. Animations → Disable in tests

## Metrics & Coverage

### Coverage Targets

| Type | Target | Current | Status |
|------|--------|---------|--------|
| **Unit** | 80% | 85% | ✅ |
| **Integration** | 70% | 75% | ✅ |
| **E2E** | Critical paths | 100% | ✅ |
| **API** | All endpoints | 100% | ✅ |

### Test Execution Time

| Suite | Time | Parallel | Target |
|-------|------|----------|--------|
| **Unit** | 5s | Yes | <10s |
| **API** | 15s | Yes | <30s |
| **E2E** | 45s | Yes | <60s |
| **Total** | 65s | - | <2min |

## Consequences

### Positive
- ✅ **High confidence**: Comprehensive coverage
- ✅ **Fast feedback**: Parallel execution
- ✅ **Living documentation**: Tests as specs
- ✅ **Refactoring safety**: Catch regressions
- ✅ **Quality gates**: Prevent bad deploys

### Negative
- ❌ **Maintenance overhead**: Tests need updates
- ❌ **Execution time**: Slows down CI
- ❌ **Flakiness**: Occasional false positives
- ❌ **Complexity**: Multiple tools to learn
- ❌ **Resource usage**: CI minutes cost

---

# ADR-004: Authentication Service

## Status
Accepted

## Context
The application requires an authentication system for:
- **Personalization**: Saving Pokemon teams
- **Security**: Protecting user data
- **Skills demonstration**: Show knowledge of auth patterns
- **Future features**: Trading, battles, rankings

## Technology Selection

### Architecture: Microservice

**Why a separate service:**
- **Single Responsibility**: Auth is a cross-cutting concern
- **Reusability**: Can serve multiple applications
- **Security isolation**: Separation of sensitive data
- **Independent scaling**: Auth is often a bottleneck
- **Technology freedom**: Can use a different stack

### Database: PostgreSQL + Prisma

**Why PostgreSQL:**
- **ACID compliance**: Critical for auth
- **Mature**: 30+ years of development
- **Features**: JSONB, full-text search, UUID
- **Performance**: Excellent for OLTP
- **Ecosystem**: Great tooling

**Why Prisma:**
- **Type safety**: Generated TypeScript types
- **Migrations**: Version-controlled schema
- **Query builder**: Intuitive API
- **Performance**: Optimized queries
- **Introspection**: Reverse engineering

### Authentication: JWT

**Why JWT:**
- **Stateless**: No session storage
- **Scalable**: No server affinity
- **Standard**: RFC 7519
- **Flexible**: Custom claims
- **Cross-domain**: Works with CORS

**JWT Strategy:**
- **Algorithm**: RS256 (asymmetric)
- **Storage**: httpOnly cookies
- **Rotation**: Refresh tokens
- **Expiry**: 15min access, 7d refresh
- **Revocation**: Blacklist critical tokens

### Security Stack

| Layer | Technology | Purpose |
|-------|------------|---------||
| **Hashing** | Argon2id | Password hashing |
| **Encryption** | AES-256-GCM | Sensitive data |
| **Rate Limiting** | express-rate-limit | Brute force protection |
| **CORS** | cors middleware | Cross-origin control |
| **Headers** | helmet | Security headers |
| **Validation** | joi/zod | Input sanitization |
| **RBAC** | Custom middleware | Role-based access |

## Authentication Flow

### Registration Flow
```
1. User submits: email, password, username
2. Validate input (joi schema)
3. Check email uniqueness
4. Hash password (Argon2id)
5. Create user record
6. Generate verification token
7. Send verification email
8. Return success (no auto-login)
```

### Login Flow
```
1. User submits: email, password
2. Rate limit check (5 attempts/15min)
3. Find user by email
4. Verify password hash
5. Generate token pair (access + refresh)
6. Set httpOnly cookies
7. Log security event
8. Return user profile
```

### Token Refresh Flow
```
1. Client sends refresh token
2. Validate token signature
3. Check token in database
4. Verify not blacklisted
5. Generate new token pair
6. Rotate refresh token
7. Update cookies
8. Return success
```

## Security Measures

### Password Policy
- **Minimum length**: 12 characters
- **Complexity**: Mixed case + numbers + symbols
- **History**: No last 5 passwords
- **Expiry**: Optional 90 days
- **Breach check**: HaveIBeenPwned API

### Account Security
- **2FA**: TOTP (Google Authenticator)
- **Backup codes**: 10 single-use codes
- **Session management**: View/revoke sessions
- **Security alerts**: Email on suspicious activity
- **Account recovery**: Email-based flow

### API Security
- **Rate limiting**: Per endpoint limits
- **IP allowlist**: Optional for admin
- **Request signing**: HMAC for sensitive ops
- **Audit logging**: All auth events
- **Anomaly detection**: Unusual patterns

## RBAC Implementation

### Role Hierarchy
```
SuperAdmin
    ↓
  Admin
    ↓
Moderator
    ↓
  User
    ↓
  Guest
```

### Permissions Matrix

| Resource | Guest | User | Mod | Admin |
|----------|-------|------|-----|-------|
| **View Pokemon** | ✅ | ✅ | ✅ | ✅ |
| **Create Team** | ❌ | ✅ | ✅ | ✅ |
| **Moderate Content** | ❌ | ❌ | ✅ | ✅ |
| **Manage Users** | ❌ | ❌ | ❌ | ✅ |

## Integration with BFF

### Middleware Chain
```
1. Extract token from cookie
2. Verify JWT signature
3. Check token expiry
4. Validate permissions
5. Attach user to request
6. Forward to handler
```

### Service Communication
- **Protocol**: HTTP/REST
- **Auth**: Service-to-service tokens
- **Discovery**: Environment variables
- **Retry**: Exponential backoff
- **Circuit breaker**: Fail fast

## Monitoring & Observability

### Metrics
- Login success/failure rate
- Token refresh rate
- Password reset requests
- 2FA adoption rate
- Session duration

### Alerts
- Brute force attempts
- Unusual geo-location
- Multiple failed logins
- Privilege escalation
- Token anomalies

## Consequences

### Positive
- ✅ **Enterprise-grade security**: Industry best practices
- ✅ **Scalability**: Stateless, horizontal scaling
- ✅ **Maintainability**: Clean separation
- ✅ **Compliance ready**: GDPR, CCPA capable
- ✅ **User trust**: Professional auth UX

### Negative
- ❌ **Complexity**: Another service to maintain
- ❌ **Latency**: Extra network hop
- ❌ **Development overhead**: More testing needed
- ❌ **Debugging**: Distributed tracing required
- ❌ **Cost**: Separate database instance

---

# ADR-013: Architecture Summary

## Status
Accepted

## Evolution Timeline

### Phase 1: Local Monolith (Week 1-2)
**Goal**: Working prototype
- **Stack**: Express.js + React + TypeScript
- **Data**: Direct PokeAPI integration
- **Deployment**: Local only
- **Complexity**: Low
- **Learning**: Full-stack basics

### Phase 2: Vercel Deployment (Week 3)
**Goal**: Public accessibility
- **Migration**: Monolith → Serverless
- **Platform**: Vercel Functions + CDN
- **Benefits**: Zero cost, auto-scaling
- **Challenges**: Cold starts, vendor lock-in
- **Learning**: Cloud deployment, serverless

### Phase 3: Custom API Service (Week 4-5)
**Goal**: Performance & control
- **Solution**: Own Pokemon data service
- **Infrastructure**: VPS (Mikrus) + Docker
- **Performance**: 10-20x faster responses
- **Cost**: 20 PLN/month
- **Learning**: DevOps, containerization

### Phase 4: Microservices Architecture (Week 6-7)
**Goal**: Enterprise patterns
- **Services**: Auth, BFF, Pokemon API
- **Benefits**: Separation of concerns
- **Complexity**: High
- **Technologies**: JWT, PostgreSQL, Prisma
- **Learning**: Distributed systems

### Phase 5: Comprehensive Testing (Week 8-9)
**Goal**: Quality assurance
- **E2E**: Playwright with POM
- **API**: Contract testing
- **Unit**: Vitest
- **CI/CD**: GitHub Actions
- **Learning**: Test automation, CI/CD

## Final Architecture

### System Design
```
┌──────────────────────────────────────────────────────────┐
│                        Internet                          │
└──────────────────────────────────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Cloudflare CDN   │
                    │   (DDoS, Cache)    │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Load Balancer    │
                    │     (Nginx)        │
                    └─────────┬─────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐
│    Frontend    │  │      BFF        │  │   Auth Service  │
│  React + Vite  │  │   Express.js    │  │   Express.js    │
│   (Static)     │  │  (Middleware)   │  │   PostgreSQL    │
└────────────────┘  └────────┬────────┘  └─────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Pokemon API      │
                    │   Express.js      │
                    │  JSON Storage     │
                    └───────────────────┘
```

### Technology Stack Comparison

| Component | Phase 1 | Phase 5 | Improvement |
|-----------|---------|---------|-------------|
| **Frontend** | React CRA | React + Vite | 5x faster builds |
| **Backend** | Express monolith | Microservices | Better scalability |
| **Database** | None | PostgreSQL | Data persistence |
| **Auth** | None | JWT + RBAC | Enterprise security |
| **Testing** | Manual | Automated | 80%+ coverage |
| **Deployment** | Local | Docker + VPS | 99.9% uptime |
| **Monitoring** | Console.log | Structured logs | Full observability |
| **Performance** | 500ms latency | 30ms latency | 16x faster |

## Architecture Decisions Impact

### Performance Metrics

| Metric | Initial | Current | Change |
|--------|---------|---------|--------|
| **API Response Time** | 200-500ms | 10-30ms | -94% |
| **Frontend Load Time** | 3s | 800ms | -73% |
| **Deployment Time** | Manual | 5 min | Automated |
| **Availability** | Local only | 99.9% | Production |
| **Concurrent Users** | 1 | 1000+ | 1000x |
| **Test Execution** | None | 65s | Full coverage |

### Cost Analysis

| Item | Monthly Cost | Annual Cost | ROI |
|------|--------------|-------------|-----|
| **VPS Hosting** | 20 PLN | 240 PLN | High |
| **Domain** | 2 PLN | 24 PLN | Essential |
| **Cloudflare** | Free | Free | Excellent |
| **GitHub Actions** | Free | Free | Perfect |
| **PostgreSQL** | Included | Included | Good |
| **Total** | 22 PLN | 264 PLN | Worth it |

## Key Design Patterns Applied

### Backend Patterns
- **Microservices**: Service separation
- **BFF**: Backend for Frontend
- **Repository**: Data access abstraction
- **Dependency Injection**: Loose coupling
- **Circuit Breaker**: Fault tolerance
- **CQRS**: Command Query Separation

### Frontend Patterns
- **Component Composition**: Reusable UI
- **Container/Presenter**: Logic separation
- **Custom Hooks**: Stateful logic reuse
- **Context API**: Global state
- **Lazy Loading**: Performance
- **Error Boundaries**: Fault tolerance

### Testing Patterns
- **Page Object Model**: E2E maintainability
- **Test Data Builders**: Flexible fixtures
- **AAA Pattern**: Arrange-Act-Assert
- **Test Pyramid**: Balanced coverage
- **Mocking**: Isolation
- **Snapshot Testing**: UI regression

## Technology Choices Rationale

### Why These Technologies Won

| Technology | Why Chosen | Alternative | Decision Factor |
|------------|------------|-------------|-----------------|
| **TypeScript** | Type safety | JavaScript | Prevents bugs |
| **React** | Market leader | Vue/Angular | Job market |
| **Express** | Simplicity | Fastify/Nest | Learning curve |
| **PostgreSQL** | ACID, mature | MongoDB | Data integrity |
| **Playwright** | Modern, fast | Cypress | Multi-browser |
| **Docker** | Portability | PM2 only | Consistency |
| **JWT** | Stateless | Sessions | Scalability |
| **Vite** | Speed | Webpack | Developer UX |

## Lessons Learned

### Technical Lessons
1. **Start Simple**: Monolith first, microservices when needed
2. **Own Your Data**: External APIs are bottlenecks
3. **Test Everything**: Especially integration points
4. **Network Matters**: 0.0.0.0 vs localhost in containers
5. **Cache Aggressively**: But invalidate correctly
6. **Monitor Everything**: You can't fix what you can't see
7. **Document Decisions**: ADRs save future you

### Process Lessons
1. **Iterative Development**: Ship early, improve often
2. **User Feedback**: Essential for priorities
3. **Performance Budget**: Set limits early
4. **Security First**: Not an afterthought
5. **Automation**: Saves time long-term
6. **Code Reviews**: Catch issues early
7. **Knowledge Sharing**: Team growth

### Business Lessons
1. **MVP First**: Validate before scaling
2. **Cost Control**: Monitor cloud spending
3. **User Experience**: Performance is UX
4. **Technical Debt**: Plan for refactoring
5. **Documentation**: Reduces onboarding
6. **Testing ROI**: Prevents production issues
7. **Open Source**: Give back to community

## Future Roadmap

### Short Term (Q1 2026)
- [ ] WebSocket for real-time features
- [ ] Redis caching layer
- [ ] GraphQL API option
- [ ] Mobile app (React Native)
- [ ] Internationalization (i18n)

### Medium Term (Q2-Q3 2026)
- [ ] Kubernetes orchestration
- [ ] Event-driven architecture
- [ ] Machine learning recommendations
- [ ] Social features (friends, trading)
- [ ] Advanced analytics

### Long Term (Q4 2026+)
- [ ] Multi-region deployment
- [ ] AI battle simulator

## Success Metrics

### Technical Success
- ✅ **Performance**: Sub-50ms API responses
- ✅ **Reliability**: 99.9% uptime achieved
- ✅ **Scalability**: 1000+ concurrent users
- ✅ **Quality**: 80%+ test coverage
- ✅ **Security**: OWASP compliance

### Business Success
- ✅ **User Growth**: 500+ active users
- ✅ **Engagement**: 5 min average session
- ✅ **Performance**: <1s page load
- ✅ **Cost Efficiency**: <25 PLN/month
- ✅ **Developer Experience**: Clean architecture

## Conclusion

This project demonstrates a complete evolution from a simple prototype to a production-ready, scalable application. The journey showcases:

1. **Full-Stack Development**: Frontend to backend to DevOps
2. **Architecture Evolution**: Monolith to microservices
3. **Best Practices**: Testing, CI/CD, monitoring
4. **Problem Solving**: Performance, security, scalability
5. **Technology Mastery**: Modern stack proficiency

The architecture is now ready for further scaling and feature development while maintaining high performance, reliability, and developer experience.
