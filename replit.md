# Inwista Fintech MVP

## Overview

Inwista is a comprehensive financial services application built as an MVP, demonstrating a complete BTG-style fintech experience. It features PIX transfers, StableCOIN trading, and investment products, all presented with Inwista's distinct turquoise/cyan branding and dark/light mode theming. The application is localized in Brazilian Portuguese and showcases a fully integrated frontend and backend, with a focus on delivering a production-ready MVP.

The project's ambition is to provide a robust foundation for a full-fledged fintech platform, covering core banking operations and investment services with a strong emphasis on user experience and security.

## User Preferences

I want iterative development.
Ask before making major changes.
Do not make changes to the folder `Z`.
Do not make changes to the file `Y`.

## System Architecture

The Inwista application is built with a modern web stack, featuring a clear separation of concerns between the frontend and backend.

### UI/UX Decisions
- **Branding**: Inwista's primary color is `hsl(195, 85%, 42%)` (Inwista Turquoise), complemented by cyan accents and neutral grays.
- **Theming**: Supports dark/light mode with automatic system detection and manual toggling, persisting user preferences.
- **Typography**: Uses Inter for UI text and JetBrains Mono for financial numbers (`tabular-nums`), ensuring readability and clarity.
- **Design System**: Adheres to comprehensive guidelines, including Material Design 3 elevation, a 4px base grid for spacing, responsive breakpoints (mobile-first), and WCAG AA compliant color contrast.
- **Interaction**: Features banking-style randomized keypads for secure PIN entry, dynamic product cards, and consistent password authorization for all sensitive transactions.

### Technical Implementations
- **Frontend**: React, TypeScript, Vite, Wouter (routing), Tailwind CSS, shadcn/ui components, React Hook Form with Zod for validation, and TanStack Query (React Query v5) for state management.
- **Backend**: Express.js with TypeScript, providing RESTful APIs for all core functionalities.
- **Authentication**: CPF-based login with randomized keypad, simulated 2FA, and secure PIN handling. Password authorization is required for all transactional operations.
- **Data Fetching**: TanStack Query is used for efficient data management, including loading states with Skeleton components, error handling with retry CTAs, and cache invalidation post-mutation.
- **Defensive Programming**: Utilizes a `safeNumber` helper to prevent `NaN` propagation in financial calculations.

### Feature Specifications
- **Authentication & Security**: CPF-based login, randomized keypad, simulated 2FA, secure PIN handling, and password authorization for all transactions (PIX, StableCOIN, Investments, Câmbio, Card management).
- **Home Dashboard**: Displays net worth, real-time balances, dynamic product cards, and quick actions.
- **PIX Module**: Supports sending and receiving PIX transfers with key validation, QR code generation, and transaction history.
- **StableCOIN Module**: Enables BRL ↔ StableCOIN conversion with live rates, wallet tracking, and transaction history.
- **Investments Module**: Provides a product catalog, risk-based filtering, investment simulation, and portfolio tracking.
- **Câmbio (Currency Exchange) Module**: Facilitates USD/BRL conversion and international transfers with real-time rates and fee calculations.
- **Cartões (Cards) Module**: Offers card management, including lock/unlock functionality and transaction history.
- **Settings**: Includes theme toggling, language preferences, and security settings.
- **Support**: Provides an FAQ section and contact options.

### System Design Choices
- **Project Structure**: Organized into `client/`, `server/`, `shared/`, and `catalog/` directories for modularity and clear separation of concerns.
- **Data Models**: Defined using Drizzle ORM table definitions, Zod validation schemas, and TypeScript types in `shared/schema.ts` for type-safe interactions.
- **Storage**: Currently uses in-memory storage (MemStorage) for the MVP, with a planned migration path to PostgreSQL for production.
- **Scalability**: Designed with a modular architecture to allow for future expansion of features and integration of additional modules.

## External Dependencies

- **Vite**: Frontend build tool.
- **Wouter**: Lightweight React router.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **shadcn/ui**: Component library built on Tailwind CSS.
- **React Hook Form**: Library for form management.
- **Zod**: Schema declaration and validation library.
- **TanStack Query (React Query v5)**: Data fetching and state management library.
- **Express.js**: Backend web application framework.
- **Drizzle ORM**: Type-safe ORM for database interactions (planned for PostgreSQL migration).
- **Inter**: UI font.
- **JetBrains Mono**: Monospace font for financial numbers.