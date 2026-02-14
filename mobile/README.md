# ProjectPB Mobile App

React Native Expo application for the ProjectPB E-Sport Companion.

## Features
- **Stack**: Expo (SDK 50+), Expo Router (v3).
- **Styling**: NativeWind (TailwindCSS v3.x).
- **Core**: Auth (JWT), Realtime Session (WebSockets).

## Prerequisites
- **Node.js**: LTS version.
- **Expo Go**: Installed on your physical device (iOS/Android).

## Setup & Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the App
```bash
npx expo start
```
- Press `a` to open in Android Emulator.
- Press `i` to open in iOS Simulator.
- Scan the QR code to open on a real device.

### 3. Clear Cache (If issues arise)
```bash
npx expo start --clear
```

## Important: Connecting to Localhost Backend

If you are running on a **physical device**, `localhost` will not work. You must update the IP address in:
`src/shared/api/client.ts`
and
`src/shared/api/socket.ts`

Replace `localhost` or `10.0.2.2` with your computer's local LAN IP (e.g., `192.168.1.15`).

**Default Config:**
- **Android Emulator**: Uses `10.0.2.2` (Special alias for host localhost).
- **iOS Simulator**: Uses `localhost`.
