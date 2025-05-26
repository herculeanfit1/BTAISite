# Environment Variables Documentation

This file documents the environment variables used in the project. Create a `.env` file in the root of the project with the relevant variables for your environment.

## Required Variables

```env
# Node Environment
NODE_ENV=development

# Server and Build Configuration
PORT=3000

# API Keys and External Services
API_BASE_URL=http://localhost:3000/api
```

## Optional Variables

```env
# Analytics
GA4_MEASUREMENT_ID=G-XXXXXXXXXX

# Auth Related
AUTH_SECRET=your-auth-secret

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/database

# Storage
STORAGE_BUCKET=your-storage-bucket

# Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=username
SMTP_PASSWORD=password
EMAIL_FROM=no-reply@example.com
```

## Environment-Specific Configuration

### Development

For local development, create a `.env.local` file with:

```env
NODE_ENV=development
API_BASE_URL=http://localhost:3000/api
```

### Production

For production environments, ensure you have:

```env
NODE_ENV=production
API_BASE_URL=https://your-domain.com/api
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Using Environment Variables

Environment variables are validated using Zod in `lib/env.ts`. When adding new environment variables, be sure to:

1. Add them to the schema in `lib/env.ts`
2. Update this documentation
3. Update CI/CD pipelines to include the new variables

Usage in code:

```typescript
import { env } from "@/lib/env";

// Access validated environment variables
const apiUrl = env.API_BASE_URL;
```
