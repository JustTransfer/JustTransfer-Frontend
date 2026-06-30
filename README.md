# JustTransfer Frontend

Frontend application for JustTransfer, a secure file transfer platform.

The app is built with React + TypeScript and includes flows for:

- Anonymous encrypted transfer links
- Authenticated user messaging/transfers
- Account lifecycle (register, verify email, login, logout)
- Password reset and account management

## Tech Stack

- React 19 + TypeScript
- React Router
- Material UI
- libsodium + OPAQUE (`@serenity-kit/opaque`) for client-side crypto/auth flows
- Stream-based uploads/downloads (S3-backed via API)

## Features

- Anonymous transfer creation from the home page
- Password-protected anonymous transfer retrieval
- Authenticated inbox and sent transfer views
- End-to-end client cryptography helpers for:
  - key generation and key encryption
  - file chunk encryption/decryption
  - metadata authentication and verification
- Server-config-driven transfer limits loaded from `/api/config`

## Project Structure

```text
src/
	components/   Reusable UI pieces (forms, dialogs, route guards, layout)
	handlers/     API + crypto + utility logic
	hooks/        Shared app state (auth, notifications, server config)
	messages/     UI strings and error text
	pages/        Route-level pages
```

## Routes

Public routes:

- `/`
- `/login`
- `/logout`
- `/register`
- `/verify-email`
- `/verify-email/:id`
- `/reset-password`
- `/reset-password/:id/:encodedUsername`
- `/anonymous-transfer/:id`

Protected routes:

- `/account`
- `/transfers`
- `/inbox`
- `/new-transfer`

## Prerequisites

- Node.js 20+
- npm 9+
- A running JustTransfer backend/API

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Configure frontend/backend base URLs in `src/handlers/config.tsx`:

```ts
export const apiUrl = "https://localhost/api";
export const frontendUrl = "https://localhost";
```

3. Start the dev server:

```bash
npm run dev
```

The app runs on `http://localhost:5173` by default.

## Production Build

```bash
npm run build
```

Build artifacts are emitted to `build/`.

## Docker

This repo includes a multi-stage Docker build:

1. Build React app using Node 20
2. Serve static build with Nginx

Build image:

```bash
docker build -t justtransfer-frontend .
```

Run container:

```bash
docker run --rm -p 8080:80 justtransfer-frontend
```

App will be available at `http://localhost:8080`.

## Testing

Run tests (not implemented yet):

```bash
npm test
```

## Security Notes

- The frontend performs crypto operations client-side using `libsodium-wrappers-sumo`.
- Private keys are encrypted before being sent/stored.
- Anonymous transfer metadata integrity is verified during retrieval.

This README is focused on the frontend app. Deployment hardening, TLS, and backend security policies should be managed at the platform level.

## Useful Scripts

- `npm run start` - start development server
- `npm run build` - create production build
- `npm test` - run test suite

## Contributing

Contributions are welcome.

- Open an issue to discuss bug fixes or feature ideas
- Fork the repository and submit a pull request with your changes
- Ensure code is well-documented and includes tests where appropriate
