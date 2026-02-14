# ProjectPB Backend

Spring Boot (Java 21) backend for the ProjectPB E-Sport Companion.

## Features
- **Auth**: JWT Authentication (Spring Security).
- **Database**: MongoDB (via Docker).
- **Realtime**: WebSocket (STOMP) with Redis Pub/Sub support.

## Prerequisites
- **Docker**: Must be running for DB dependencies.
- **Java 21**: JDK installed.
- **Maven**: Included via `mvnw` (optional) or system installed.

## Getting Started

### 1. Start Support Services
Run from the project root:
```bash
docker compose up -d
```
Verify containers `bmad-mongo`, `bmad-redis`, and `bmad-mongo-express` are running.

### 2. Run the Application
```bash
mvn spring-boot:run
```
The server will start on port `8080`.

## API Endpoints (Quick Reference)

### Authentication
- `POST /api/v1/auth/register` - payload: `{ "username": "...", "email": "...", "password": "..." }`
- `POST /api/v1/auth/login` - payload: `{ "username": "...", "password": "..." }` -> returns `{ "token": "..." }`

### Realtime (WebSocket)
- **Endpoint**: `ws://localhost:8080/ws-bmad`
- **Topic**: `/topic/game/{gameId}`
- **Send**: `/app/game/{gameId}/tag`

## Configuration
See `src/main/resources/application.yml` for port and DB config.
The JWT Secret is currently hardcoded in `JwtUtils.java` for development. Ideally move to `.env` for production.
