# Project W - Copilot Instructions

WhatsApp campaign automation platform with React frontend and Express/TypeScript backend. Auto-replies to incoming WhatsApp messages using WhatsApp Cloud API.

## Monorepo Structure

```
BE-projectW/           # Express.js backend (TypeScript + Drizzle ORM + PostgreSQL)
whatsapp-custom-app-frontend/  # React frontend (Vite + Tailwind CSS v4)
```

## Backend Architecture (`BE-projectW/`)

### Request Flow
Routes → Controllers → Services → Database (`src/db/index.ts`)

- **Routes** (`src/routes/*.routes.ts`): Define endpoints, mount on `/api/*`
- **Controllers** (`src/controllers/`): HTTP handling only, validation, response formatting
- **Services** (`src/services/`): Business logic + Drizzle queries (static class methods)
- **Schemas** (`src/db/schema/*.schema.ts`): Drizzle table definitions

### ESM Import Rules (Critical)
- **Schema files** (`src/db/schema/*.ts`) → import WITHOUT `.js`: `import { users } from './users.schema'`
- **All other files** → import WITH `.js`: `import { db } from '../db/index.js'`
- This is required because drizzle-kit runs in CommonJS mode

### Database Patterns
```typescript
// Type inference from schema (src/types/database.types.ts)
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type SafeUser = Omit<User, 'passwordHash'>; // For API responses

// Standard service pattern
static async findById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}
```

### API Response Format
```typescript
// Success
res.status(200).json({ success: true, message: '...', data: {...} });
// Error
res.status(400).json({ success: false, message: '...' });
```

### Adding New Features
1. Schema: `src/db/schema/[name].schema.ts` → export from `schema/index.ts`
2. Types: Add to `src/types/database.types.ts`
3. Service: `src/services/[name].service.ts` (static class methods)
4. Controller: `src/controllers/[name].controller.ts`
5. Routes: `src/routes/[name].routes.ts` → mount in `routes/index.ts`
6. Generate migration: `npm run db:generate`

## Frontend Architecture (`whatsapp-custom-app-frontend/`)

### Stack
- React 19 + TypeScript + Vite 7
- Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
- react-router-dom v7 for routing
- react-icons for icons (Material Design: `Md*`)

### Layout Pattern
`App.tsx` wraps all routes in `DashboardLayout` (sidebar + header + content area)

### CSS Organization
Each page has matching CSS file: `src/styles/[page-name].css`

## Development Commands

| Backend (`BE-projectW/`) | Frontend (`whatsapp-custom-app-frontend/`) |
|--------------------------|-------------------------------------------|
| `npm run dev` - Hot reload | `npm run dev` - Vite dev server |
| `npm run db:generate` - Generate migrations | `npm run build` - Production build |
| `npm run db:migrate` - Apply migrations | `npm run lint` - ESLint |
| `npm run db:studio` - Drizzle Studio GUI | |

## Key Conventions

- Use `src/utils/validators.ts` for input validation (`isValidEmail`, `isValidPassword`)
- Use `src/utils/password.ts` for hashing (`hashPassword`, `comparePassword`)
- Always return `SafeUser`/`SafeWaCredential` in responses (omit sensitive fields)
- UUID primary keys with `defaultRandom()`
- All tables have `createdAt`/`updatedAt` timestamps
- Webhook configs generate unique verify tokens for WhatsApp verification

## Do NOT
- Create test files unless explicitly requested
- Use `.js` extensions in schema file imports (breaks drizzle-kit)
