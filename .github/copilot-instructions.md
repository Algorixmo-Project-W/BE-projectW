# Project W - Copilot Instructions

Project W is a lightweight WhatsApp-based campaign automation platform designed for businesses to send instant, predefined replies to customers using the WhatsApp Cloud API.

## Project Purpose
The system enables businesses to:
- Connect their WhatsApp Business API credentials
- Receive incoming messages through a webhook
- Store messages in the database
- Respond automatically with fixed messages defined by campaigns

## Project Structure
- `/src` - Source code
  - `/api` - API endpoints and webhook handlers
  - `/db` - Database schemas and migrations
  - `/services` - Business logic (WhatsApp API, campaign management)
  - `/types` - TypeScript type definitions
- `/drizzle` - Database migrations
- `.env` - Environment variables (not committed)

## Tech Stack
- Node.js with TypeScript
- Drizzle ORM for database operations
- PostgreSQL as the database
- WhatsApp Cloud API for messaging
- Express.js for webhook endpoints
- tsx for running TypeScript directly

## Development Commands
- `npm run dev` - Run the application in development mode
- `npm run db:generate` - Generate migrations
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Drizzle Studio
- `npm run build` - Build for production
- `npm start` - Run production build

## Key Features to Implement
1. **Business Account Management** - Store WhatsApp Business API credentials
2. **Webhook Handler** - Receive and process incoming WhatsApp messages
3. **Campaign Management** - Create and manage auto-reply campaigns
4. **Message Storage** - Store all incoming/outgoing messages
5. **Auto-Reply Engine** - Send predefined responses based on campaign rules

## Coding Guidelines
- Use TypeScript strict mode
- Follow async/await patterns for database and API operations
- Use Drizzle's query builder for type-safe queries
- Keep database schema in `src/db/schema/`
- **Important:** Schema files should import other schemas without `.js` extension for drizzle-kit compatibility
- Service files and other runtime code should use `.js` extensions in imports (ESM requirement)
- Validate webhook signatures from WhatsApp
- Handle rate limits for WhatsApp Cloud API
- Log all message transactions for debugging
- Use environment variables for all API credentials

## Architecture & Best Practices
- **Separation of Concerns:** Routes → Controllers → Services → Database
- **Controllers:** Handle HTTP requests/responses only, no business logic
- **Services:** Contain business logic and database operations
- **Utilities:** Reusable helper functions (validators, password hashing, etc.)
- **Validators:** Use utility functions from `src/utils/validators.ts` for input validation
- **Password Handling:** Use `src/utils/password.ts` for all password operations
- **Error Handling:** Always return consistent JSON responses with success/error status
- **Data Sanitization:** Clean and normalize user input before processing

## Important Files
- `README.md` - Project documentation, setup instructions, and usage guide
- `package.json` - Dependencies, scripts, and project metadata
- `.env.example` - Template for environment variables
- `drizzle.config.ts` - Database configuration for Drizzle ORM
- `src/db/schema/*.schema.ts` - Individual table schemas (no .js extensions in imports)
- `src/utils/validators.ts` - Input validation utilities
- `src/utils/password.ts` - Password hashing and comparison utilities
