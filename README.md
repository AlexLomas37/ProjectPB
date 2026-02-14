# ProjectPB

Welcome to the ProjectPB Monorepo. This project is divided into three main parts:

- **`backend/`**: Java Spring Boot Application (API, WebSocket, Auth).
- **`web/`**: Next.js Web Application (Dashboard & User Interface).
- **`mobile/`**: React Native Expo Application (iOS/Android Client).

## Prerequisites

Before starting, ensure you have the following installed:

1.  **Docker Desktop**: Running (Required for MongoDB and Redis).
2.  **Java JDK 21**: Required for the Backend.
3.  **Node.js (LTS)**: Required for the Web and Mobile Apps.

## Quick Start Guide

### 1. Start Infrastructure (Database & Cache)
From the root directory:
```bash
docker compose up -d
```
This starts MongoDB (Port 27017) and Redis (Port 6379).

### 2. Start Backend
Open a terminal in the `backend/` folder:
```bash
cd backend
mvn spring-boot:run
```
API will be available at `http://localhost:8080`.

### 3. Start Web App
Open a terminal in the `web/` folder:
```bash
cd web
npm install
npm run dev
```
Web app will be available at `http://localhost:3000`.

### 4. Start Mobile App
Open a terminal in the `mobile/` folder:
```bash
cd mobile
npm install
npx expo start
```
Scan the QR code with your phone (Expo Go) or press `a` for Android Emulator / `i` for iOS Simulator.

---

For detailed instructions, please check the `README.md` inside each folder.