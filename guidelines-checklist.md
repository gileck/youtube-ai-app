# API Guidelines Compliance Checklist

For each API module (`chat`, `clearCache`, `fileManagement`, etc.), verify:

## 1. File Structure
- [ ] Has `index.ts`, `types.ts`, `server.ts`, and `client.ts`

## 2. Types (`/types.ts`)
- [ ] ALL domain types defined here (no duplicates elsewhere)
- [ ] Clean, focused types for the domain

## 3. API Names (`/index.ts`)
- [ ] Exports ALL API names including base name
- [ ] For multi-endpoint APIs, defines all endpoint names
- [ ] Exports all types from `types.ts`

## 4. Server Implementation (`/server.ts`)
- [ ] Imports API names from `index.ts` (NOT defining them directly)
- [ ] Re-exports API names from `index.ts`
- [ ] Implements process function(s) using types from `types.ts`

## 5. Client Implementation (`/client.ts`)
- [ ] Imports API names from `index.ts` (NEVER from `server.ts`)
- [ ] Uses imported API names in apiClient.call()
- [ ] Returns CacheResult<ResponseType>
- [ ] Uses types from `types.ts` (no redefined types)

## 6. API Registration (`apis.ts`)
- [ ] Imports from `server.ts` to get handlers AND re-exported API names
- [ ] Uses consistent API names in the apiHandlers object

## 7. React Components
- [ ] Import types from domain `types.ts`
- [ ] NEVER redefine API types in component files 