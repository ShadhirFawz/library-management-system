# Help Service (Customer Care)

Microservice for:
- Help Articles (public read; admin CRUD)
- Support Tickets (users raise/view; admin lists/responds)

## API Docs (OpenAPI/Swagger)

When running, browse:
- `http://localhost:<PORT>/api/docs`

## Environment variables

Copy `./.env.example` to `./.env` and fill values:
- **PORT**: default `8000`
- **MONGO_URI**: MongoDB connection string
- **USER_SERVICE_URL**: base URL of user-service (required for auth)
- **ALLOW_LOCAL_JWT_VERIFY**: `true/false` (development fallback only)
- **JWT_SECRET**: only needed if local JWT verification is enabled

## Local run

```bash
npm install
npm run dev
```

## Auth / integration with user-service

Help-service expects JWTs in `Authorization: Bearer <token>`.
It validates tokens by calling:
- `GET /api/auth/verify` on **user-service**

## Endpoints (high level)

- **Articles**
  - `GET /api/articles`
  - `GET /api/articles/:id`
  - `POST /api/articles` (admin)
  - `PUT /api/articles/:id` (admin)
  - `DELETE /api/articles/:id` (admin)

- **Tickets**
  - `POST /api/tickets` (user)
  - `GET /api/tickets/my` (user)
  - `GET /api/tickets/all` (admin)
  - `PUT /api/tickets/:id/respond` (admin)

