# Project W

A lightweight WhatsApp-based campaign automation platform designed for businesses to send instant, predefined replies to customers using the WhatsApp Cloud API.

## 🚀 Features

- **WhatsApp Cloud API Integration** - Connect your WhatsApp Business account
- **Webhook Handler** - Receive and process incoming messages in real-time
- **Campaign Management** - Create and manage auto-reply campaigns
- **Message Storage** - Store all incoming and outgoing messages
- **Auto-Reply Engine** - Send predefined responses based on campaign rules
- **TypeScript** - Full type safety and modern JavaScript features
- **Drizzle ORM** - Lightweight and performant TypeScript ORM
- **PostgreSQL** - Reliable and powerful relational database

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn
- WhatsApp Business API account (phone number ID and access token)

## 🛠️ Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update with your credentials:
   ```
   # Database Configuration (Local PostgreSQL)
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=project_w

   # Application Configuration
   NODE_ENV=development
   PORT=3000

   # WhatsApp Cloud API Configuration
   WHATSAPP_API_URL=https://graph.facebook.com/v18.0
   WHATSAPP_ACCESS_TOKEN=your_access_token_here
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
   WHATSAPP_BUSINESS_ID=your_business_id_here

   # Webhook Configuration
   WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token_here
   ```

3. **Create the database:**
   ```bash
   # Option A: If PostgreSQL is installed
   psql -U postgres
   CREATE DATABASE project_w;
   \q
   
   # Option B: Using createdb command
   createdb project_w
   ```

4. **Generate and run migrations (FIRST TIME ONLY):**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```
   
   **Note:** If you encounter module errors during `db:generate`, ensure schema imports don't use `.js` extensions.

## 🎯 Usage

### Development Mode
Run the application with hot reload:
```bash
npm run dev
```

### Production Build
Build and run for production:
```bash
npm run build
npm start
```

## 📦 Available Scripts

| Script | Description | When to Run |
|--------|-------------|-------------|
| `npm run dev` | Start development server with hot reload | **Every time** you develop |
| `npm run build` | Build TypeScript to JavaScript | Before production deployment |
| `npm start` | Run production build | In production environment |
| `npm run db:generate` | Generate migrations from schema | **Only when** schema changes |
| `npm run db:migrate` | Run pending migrations | After generating migrations |
| `npm run db:push` | Push schema changes directly (dev only) | Quick schema sync (use carefully) |
| `npm run db:studio` | Open Drizzle Studio (database GUI) | When you want to view/edit database |

## 🔄 Database Migration Workflow

### **First Time Setup:**
```bash
npm install              # Install dependencies
npm run db:generate      # Generate initial migrations
npm run db:migrate       # Create tables in database
npm run dev             # Start development
```

### **Daily Development:**
```bash
npm run dev             # Just start the server - that's it!
```

### **When You Change Database Schema:**
```bash
# 1. Edit your schema files in src/db/schema/
# 2. Generate migration files
npm run db:generate

# 3. Apply migrations to database
npm run db:migrate

# 4. Continue development
npm run dev
```

**Note:** You only need to run migrations when you modify the database structure (add/remove tables, columns, etc.). For normal development, just run `npm run dev`.

## 🗂️ Project Structure

```
project-w/
├── src/
│   ├── routes/                 # API route definitions
│   │   ├── index.ts            # Route aggregator
│   │   ├── health.routes.ts    # Health check routes
│   │   └── user.routes.ts      # User management routes
│   ├── controllers/            # Request handlers (HTTP logic only)
│   │   ├── health.controller.ts
│   │   └── user.controller.ts
│   ├── services/               # Business logic layer
│   │   ├── user.service.ts     # User database operations
│   │   └── wa-credential.service.ts # WhatsApp credentials operations
│   ├── middlewares/            # Express middlewares
│   │   ├── auth.middleware.ts  # Authentication (coming soon)
│   │   ├── validation.middleware.ts (coming soon)
│   │   └── error.middleware.ts (coming soon)
│   ├── utils/                  # Helper functions
│   │   ├── validators.ts       # Input validation utilities
│   │   └── password.ts         # Password hashing utilities
│   ├── db/                     # Database layer
│   │   ├── schema/             # Schema definitions
│   │   │   ├── index.ts        # Schema aggregator
│   │   │   ├── users.schema.ts
│   │   │   └── wa-credentials.schema.ts
│   │   └── index.ts            # Database client setup
│   ├── types/                  # TypeScript type definitions
│   │   ├── env.d.ts            # Environment variable types
│   │   └── database.types.ts   # Database types
│   └── index.ts                # Application entry point
├── drizzle/                    # Database migrations
├── .env.example                # Example environment variables
├── drizzle.config.ts           # Drizzle configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Project dependencies
```

## 🗄️ Database Schema

The project includes the following tables:
- **users** - Admin accounts with authentication
- **wa_credentials** - WhatsApp Business API credentials
- **campaigns** - Auto-reply campaign configurations (coming soon)
- **messages** - All incoming and outgoing WhatsApp messages (coming soon)
- **contacts** - Customer contact information (coming soon)

You can modify the schema files in `src/db/schema/`.

### **Important Schema Guidelines:**
- Schema files are located in `src/db/schema/*.schema.ts`
- When importing schemas in other schema files, **DO NOT** use `.js` extensions (for drizzle-kit compatibility)
- Example: `import { users } from './users.schema';` ✅
- Not: `import { users } from './users.schema.js';` ❌
- Service files and other runtime code should still use `.js` extensions

## 🏗️ Architecture & Best Practices

### **Separation of Concerns:**
```
Request → Routes → Controllers → Services → Database
                        ↓
                    Utilities
```

**Controllers:** Handle HTTP requests/responses only  
**Services:** Business logic and database operations  
**Utilities:** Reusable helper functions  

### **Code Guidelines:**
- ✅ Always validate input using `src/utils/validators.ts`
- ✅ Hash passwords using `src/utils/password.ts`
- ✅ Return consistent JSON responses: `{ success, message, data }`
- ✅ Sanitize user input before processing
- ✅ Use TypeScript strict mode
- ✅ Follow async/await patterns

## 📡 API Endpoints

### **Health Check**
- `GET /api/check` - Check server status

### **User Management**
- `POST /api/users/create` - Create a new user account
- `POST /api/users/login` - Login with email and password

### **WhatsApp Credentials**
- `POST /api/wa-credentials/add` - Add WhatsApp Business API credentials
- `GET /api/wa-credentials/user/:userId` - Get all credentials for a specific user
- `PUT /api/wa-credentials/:id` - Update WhatsApp credentials
- `DELETE /api/wa-credentials/:id` - Delete WhatsApp credentials

## 🔧 Drizzle Studio

Drizzle Studio provides a visual interface for your database:
```bash
npm run db:studio
```

Then open http://localhost:4983 in your browser.

## 📝 License

ISC
