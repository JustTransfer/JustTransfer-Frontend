# JustTransfer Frontend

JustTransfer Frontend is the React single-page app for the JustTransfer file transfer platform. It provides anonymous link-based transfers, authenticated transfer management, account lifecycle flows, and client-side cryptography for secure transfer handling.

## Overview

The application is built with React 19, TypeScript, Vite, React Router, and Material UI. It uses `libsodium-wrappers-sumo` and `@serenity-kit/opaque` for client-side crypto and login flows, and `streamsaver` for large-file downloads when the browser supports streaming writes.

At runtime, the app:

- Loads transfer limits and pricing data from the backend at `/api/config`
- Uses environment variables for the API base URL, frontend base URL, and contact email
- Wraps the route tree with notification, server-config, and auth providers
- Stores only the minimum transfer/account state needed for the current session in the browser

## Main Flows

- Anonymous transfers are created from the home page and retrieved through `/link-transfer/:id`
- Authenticated users can create managed transfers from `/new-transfer`
- Saved transfers are listed at `/transfers`, with details and management actions at `/transfers/:id`
- Account flows include register, verify email, login, logout, account settings, pricing, and password reset

## Repository Layout

```text
src/
	App.tsx          Route definitions and provider wiring
	components/      Reusable UI, forms, dialogs, layout, route guards
	handlers/        API clients, crypto helpers, configuration, utilities
	hooks/           Auth, notifications, and server config context providers
	messages/        UI strings and error text
	pages/           Route-level screens
public/            Static assets copied as-is by Vite
build/             Production build output
```

## Routes

Public routes:

- `/` - landing page and anonymous transfer creation
- `/login`
- `/logout`
- `/register`
- `/verify-email`
- `/verify-email/:id`
- `/reset-password`
- `/reset-password/:id` with the username encoded in the URL fragment
- `/link-transfer/:id`
- `/terms`
- `/privacy-policy`

Protected routes:

- `/new-transfer`
- `/transfers`
- `/transfers/:id`
- `/account`
- `/pricing`

Any unknown path falls back to the error page.

## Configuration

The frontend requires these Vite environment variables:

- `VITE_API_URL` - backend API base URL used by the API clients
- `VITE_FRONTEND_URL` - public frontend URL used to generate shareable links
- `VITE_EMAIL_INFO` - contact email shown in the site footer

The repository includes [.env.sample](.env.sample) with example values.

The app also fetches dynamic limits and pricing from `/api/config`. The current config shape in the code includes:

- `max_lifetime_link`
- `max_file_size_link`
- `max_downloads_link`
- `price_connected`
- `max_lifetime_connected`
- `max_file_size_connected`
- `max_downloads_connected`
- `max_transfer_month_connected`
- `price_premium`
- `max_lifetime_connected_premium`
- `max_file_size_connected_premium`
- `max_downloads_connected_premium`
- `max_transfer_month_connected_premium`

## Prerequisites

- Node.js 20 or newer
- npm
- A running JustTransfer backend API

## Setup

1. Install dependencies.

```bash
npm install
```

2. Create a local environment file from [.env.sample](.env.sample) and set the required values for your backend and frontend URLs.

3. Start the development server.

```bash
npm run dev
```

Vite serves the app on `http://localhost:5173` by default.

## Available Scripts

- `npm run dev` - start the Vite development server
- `npm run build` - type-check and build a production bundle into `build/`
- `npm run lint` - run `oxlint`
- `npm run preview` - serve the production build locally

There is currently no test script in `package.json`.

## Build and Deploy

Production builds are written to `build/`, as configured in [vite.config.ts](vite.config.ts).

The repository also includes a multi-stage [Dockerfile](Dockerfile) that:

1. Builds the app with Node 20
2. Serves the generated `build/` directory with Nginx

Build the image:

```bash
docker build -t justtransfer-frontend .
```

Run it locally:

```bash
docker run --rm -p 8080:80 justtransfer-frontend
```

## Architecture Notes

- `src/App.tsx` wires the providers and defines the route map
- `src/components/layout.tsx` provides the shared header, footer, and navigation
- `src/hooks/useServerConfig.tsx` loads backend transfer limits from `/api/config`
- `src/hooks/useAuth.tsx` keeps the current session identity and decrypted keys in memory
- `src/handlers/crypto.tsx` and `src/handlers/crypto_link.tsx` contain the client-side registration, login, transfer creation, and retrieval flows

## Security Notes

- File transfer cryptography happens client-side
- Private keys are encrypted before they are sent to or stored by the backend
- Anonymous link metadata is authenticated and verified during retrieval
- Password-protected transfer links can include the password in the URL fragment if the sender chooses

## Contributing

Contributions are welcome. Keep changes aligned with the existing route structure, env contract, and backend API shape.
