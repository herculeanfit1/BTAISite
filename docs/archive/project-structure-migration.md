# Project Structure Migration Plan

## Current vs. Required Structure

### Current Structure
```
BridgingTrustAI/
├─ app/
│  ├─ components/     # Should move to src/components/
│  ├─ utils/          # Should move to src/lib/
│  └─ ...
├─ types/             # Should move to src/types/
└─ lib/               # Should move to src/lib/
```

### Target Structure (Per Cursor Rules)
```
BridgingTrustAI/
├─ app/               # Next.js 15 App Router pages, server components
├─ src/
│  ├─ components/     # shared UI components
│  ├─ lib/            # utilities, data access
│  └─ types/          # global TypeScript types
├─ docs/
│  └─ adr/            # Architecture Decision Records
└─ .cursorrules
```

## Migration Steps

1. **Create src/ structure**
   ```bash
   mkdir -p src/components src/lib src/types
   ```

2. **Move components**
   ```bash
   mv app/components/* src/components/
   ```

3. **Move utilities**
   ```bash
   mv app/utils/* src/lib/
   mv lib/* src/lib/
   ```

4. **Move types**
   ```bash
   mv types/* src/types/
   ```

5. **Update import paths**
   - Update all imports to use new src/ structure
   - Update tsconfig.json paths

6. **Create ADR structure**
   ```bash
   mkdir -p docs/adr
   ```

## Benefits
- Aligns with cursor rules universal layout
- Better separation of concerns
- Clearer project organization
- Easier navigation for developers 