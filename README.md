# Customer Portal — Angular, NestJS and PostgreSQL

This repository contains a small customer management application built with Angular and NestJS. The frontend handles login and customer management, while the backend exposes the API and manages authentication and database access.

The project uses Prisma 7 with PostgreSQL. The database can run locally or be hosted in Supabase.

## Project structure

```text
nestjs-postgresql/
├── ngApp/                 # Angular frontend
├── nodeBE/                 # NestJS backend
│   ├── prisma/
│   │   └── schema.prisma   # Database models
│   ├── prisma7.config.ts   # Prisma CLI configuration
│   └── src/
└── README.md
```

There is no root-level `package.json`. Install dependencies and run commands from the relevant application directory.

## What the application does

- Logs users in and protects customer pages behind authentication.
- Uses JWT authentication for API requests.
- Supports customer management, including listing customers, viewing customer details and creating customers.
- Stores users, authentication sessions and customers in PostgreSQL.
- Uses Prisma to access the database.
- Exposes API documentation through Swagger.

## Prerequisites

Install the following before starting:

- Node.js compatible with the Angular 22 and NestJS
- npm
- PostgreSQL, either locally or through Supabase

You will need a database connection string and a JWT signing secret for the backend.

## Database setup

You can use either a local PostgreSQL instance or a Supabase PostgreSQL database. Choose one connection string for your local backend environment.

### Option 1: Local PostgreSQL

Create a database for the application. For example, using `psql`:

```sql
CREATE DATABASE nestjs-postgresql;
```

Use your local PostgreSQL username, password, host and port to build the connection string.

Example format:

```text
postgresql://postgres:YOUR_PASSWORD@localhost:5432/nestjs-postgresql
```

Replace the username and password with your own local PostgreSQL credentials.

### Option 2: Supabase PostgreSQL

1. Open your project in the Supabase dashboard.
2. Find the database connection details.
3. Choose the connection method suitable for your environment.
4. Copy the connection string and use it as `DATABASE_URL`.

## Backend setup

Open a terminal in the backend directory:

```bash
cd nodeBE
npm install
```

Create a local `.env` file in `nodeBE` and configure the required variables:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
JWT_SECRET="replace-with-a-strong-random-secret"
JWT_EXPIRES_IN="15m"
```

### Generate the Prisma client

The project uses Prisma 7, the `prisma-client` generator and the PostgreSQL driver adapter.

Run the Prisma commands from `nodeBE`:

```bash
npx prisma generate --config prisma7.config.ts
```

### Apply database migrations


```bash
npx prisma migrate deploy --config prisma7.config.ts
```

### Start the backend

```bash
npm run start:dev
```

The backend defaults to port `3000` unless overridden by the `PORT` environment variable.

Swagger API documentation is available at:

http://localhost:3000/api/docs

## Frontend setup

Open a separate terminal:

```bash
cd ngApp
npm install
npm start
```

Make sure the frontend API configuration points to the running NestJS backend. If you change the backend port or host, update the frontend configuration accordingly.

## Typical local workflow

1. Start PostgreSQL or make sure the Supabase database is reachable.
2. Configure the backend environment variables.
3. Generate the Prisma client and apply the required migrations.
4. Start NestJS from `nodeBE`.
5. Start Angular from `ngApp`.
6. Open the frontend, sign in and try the customer management flow.
7. Use Swagger to inspect and exercise the backend API.

## Useful commands

### Backend

```bash
cd nodeBE

npm run start:dev
npm run build
npm test
npm run test:e2e
```

### Frontend

```bash
cd ngApp

npm start
npm run build
npm test
```
