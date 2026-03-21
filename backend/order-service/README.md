# Order Service - Setup & Documentation

## Overview

The Order Service is a microservice responsible for managing the complete lifecycle of library transactions including:
- **Book Borrowing** - Members can borrow available books
- **Book Returns** - Process returns with automatic overdue detection
- **Reservations** - Queue-based reservation system for books
- **Fines** - Automatic fine calculation for overdue returns

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│  Order Service  │────▶│   MongoDB       │
│   (React)       │     │   (Port 5003)   │     │   (Port 27017)  │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼                         ▼
           ┌─────────────────┐       ┌─────────────────┐
           │  User Service   │       │  Book Service   │
           │  (Port 5001)    │       │  (Port 5002)    │
           └─────────────────┘       └─────────────────┘
```

## Prerequisites

- Node.js 18+
- MongoDB 6+
- Docker & Docker Compose (for containerized deployment)

## Quick Start

### Local Development

1. **Clone and navigate to order-service:**
   ```bash
   cd backend/order-service
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the service:**
   ```bash
   npm run dev  # Development with hot-reload
   npm start    # Production
   ```

### Docker Deployment

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f order-service
   ```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5003` | Server port |
| `MONGO_URI` | `mongodb://localhost:27017/order-service-db` | MongoDB connection string |
| `JWT_SECRET` | - | JWT signing secret (must match User Service) |
| `USER_SERVICE_URL` | `http://localhost:5001` | User Service base URL |
| `BOOK_SERVICE_URL` | `http://localhost:5002` | Book Catalog Service base URL |
| `DEFAULT_BORROW_DAYS` | `14` | Default borrow duration in days |
| `DEFAULT_FINE_PER_DAY` | `0.50` | Default fine rate per overdue day |

## API Documentation

Access the interactive Swagger documentation at:
```
http://localhost:5003/api/docs
```

### API Endpoints Summary

#### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/orders/borrow` | Member | Borrow a book |
| `POST` | `/api/orders/:id/return` | Member/Staff | Return a borrowed book |
| `GET` | `/api/orders/my` | Member | Get user's orders |
| `GET` | `/api/orders` | Staff | Get all orders |
| `GET` | `/api/orders/:id` | Member/Staff | Get order by ID |
| `GET` | `/api/orders/user/:userId` | Staff | Get user's order history |

#### Reservations
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/reservations` | Member | Create reservation |
| `DELETE` | `/api/reservations/:id` | Member/Staff | Cancel reservation |
| `GET` | `/api/reservations/my` | Member | Get user's reservations |
| `GET` | `/api/reservations` | Staff | Get all reservations |
| `GET` | `/api/reservations/book/:bookId` | Staff | Get book's waiting queue |
| `PUT` | `/api/reservations/:id/approve` | Staff | Approve & issue book |
| `PUT` | `/api/reservations/:id/reject` | Staff | Reject reservation |

#### Fines
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/fines/my` | Member | Get user's fines |
| `GET` | `/api/fines` | Staff | Get all fines |
| `GET` | `/api/fines/:id` | Member/Staff | Get fine by ID |
| `GET` | `/api/fines/order/:orderId` | Member/Staff | Get fine by order |
| `POST` | `/api/fines/:id/pay` | Member/Staff | Mark fine as paid |

## Workflow Diagrams

### 1. Reservation Flow
```
Member                      Order Service                    Book Service
  │                              │                                │
  │──POST /reservations─────────▶│                                │
  │  { bookId }                  │──GET /books/:bookId───────────▶│
  │                              │◀─────────book exists───────────│
  │                              │                                │
  │◀─201 { reservation,──────────│                                │
  │       queuePosition }        │                                │
```

### 2. Approval Flow (Staff)
```
Staff                       Order Service                    Book Service
  │                              │                                │
  │──PUT /reservations/:id/───▶ │                                │
  │     approve                  │──GET /books/:bookId/copies────▶│
  │                              │◀────available copies───────────│
  │                              │                                │
  │                              │──PATCH /copies/:id/borrow─────▶│
  │                              │◀────────success─────────────── │
  │                              │                                │
  │◀─200 { reservation,──────────│                                │
  │       order }                │                                │
```

### 3. Borrow Flow
```
Member                      Order Service                    User Service
  │                              │                                │
  │──POST /orders/borrow────────▶│──GET /users/:id───────────────▶│
  │  { bookCopyId }              │◀───user with membership────────│
  │                              │                                │
  │                              │        Book Service            │
  │                              │──GET /copies/:copyId──────────▶│
  │                              │◀───copy availability───────────│
  │                              │                                │
  │                              │──PATCH /copies/:id/borrow─────▶│
  │                              │◀───────success─────────────────│
  │                              │                                │
  │◀─201 { order }───────────────│                                │
```

### 4. Return Flow
```
Member                      Order Service                    Fine Calc
  │                              │                                │
  │──POST /orders/:id/return────▶│                                │
  │                              │──calculateOverdueDays()───────▶│
  │                              │◀─────overdueDays───────────────│
  │                              │                                │
  │                              │    (if overdue > 0)            │
  │                              │──CREATE Fine────────────────── │
  │                              │                                │
  │                              │         Book Service           │
  │                              │──PATCH /copies/:id/return─────▶│
  │                              │                                │
  │◀─200 { order, fine? }────────│                                │
```

### 5. Fine Calculation
```javascript
overdueDays = ceil((returnDate - dueDate) / (24 * 60 * 60 * 1000))
fineAmount = overdueDays * finePerDay  // rounded to 2 decimal places
```

## Testing

### Backend Tests
```bash
cd backend/order-service
npm test                    # Run all tests
npm test -- --coverage      # Run with coverage report
```

### Frontend Tests
```bash
cd frontend
npm test                    # Run Vitest tests
```

## Business Rules

### Borrowing
- Member must have available borrow quota (checked against membership plan)
- Book copy must be available
- Compensating transaction: If Book Service fails to mark copy as borrowed, order is rolled back

### Reservations
- One pending reservation per book per user (enforced by MongoDB partial unique index)
- FIFO queue ordering by `reservationDate`
- When book returned, next person in queue is automatically notified

### Fines
- Calculated on return if `returnDate > dueDate`
- Formula: `ceil(overdueDays) × finePerDay`
- Fine rate from membership plan, falls back to `DEFAULT_FINE_PER_DAY`

### Role-Based Access
| Role | Permissions |
|------|-------------|
| `member` | View own orders/reservations/fines, borrow, return, reserve, pay fines |
| `librarian` | All member permissions + view all, approve/reject reservations |
| `admin` | All librarian permissions |

## Error Codes

| HTTP Code | Meaning |
|-----------|---------|
| `400` | Bad request (validation error, business rule violation) |
| `401` | Missing or invalid authentication token |
| `403` | Insufficient permissions |
| `404` | Resource not found |
| `409` | Conflict (duplicate reservation) |
| `503` | External service unavailable |

## Health Check

```bash
curl http://localhost:5003/health
```

Response:
```json
{
  "status": "OK",
  "service": "order-service",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## CI/CD

The service includes GitHub Actions workflow (`.github/workflows/order-service-ci.yml`) that:
1. Runs syntax checks
2. Executes tests with MongoDB in CI
3. Builds Docker image
4. Pushes to Docker Hub (on master branch)

## Troubleshooting

### Common Issues

1. **Connection refused to User/Book Service**
   - Ensure services are running
   - Check `USER_SERVICE_URL` and `BOOK_SERVICE_URL` environment variables

2. **JWT verification failed**
   - Ensure `JWT_SECRET` matches across all services

3. **MongoDB connection error**
   - Verify `MONGO_URI` is correct
   - Ensure MongoDB is running

4. **Duplicate reservation error (409)**
   - User already has a pending reservation for this book
   - Cancel existing reservation first

## Contributing

1. Create feature branch from `master`
2. Make changes following existing code patterns
3. Add tests for new functionality
4. Run `npm test` and ensure all tests pass
5. Submit pull request
