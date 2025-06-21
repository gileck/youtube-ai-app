# Client-Server Communication Guidelines

## Simplified API Architecture

This project uses a simplified client-server communication pattern with a single API endpoint that handles all server-side operations:

```
/src
  /apis
    /apis.ts           - Registry of all API handlers (imports directly from server.ts files)
    /processApiCall.ts - Central processing logic with caching 
    /types.ts          - Shared API types
    /<domain>
      /types.ts        - Shared types for this domain
      /server.ts       - Server-side implementation (ALL business logic + exports name)
      /client.ts       - Client-side function to call the API
      /index.ts        - Exports name and types ONLY (not process or client functions)
  /pages
    /api
      /process.ts      - Single Next.js API route handler for all requests
```

## Creating a New API Endpoint

1. **Define ALL Domain Types in types.ts** (`/src/apis/<domain>/types.ts`):
   - Define request and response types
   - Keep types simple and focused on the specific domain
   - **IMPORTANT: These types MUST be used consistently across client.ts and server.ts**
   - **CRITICAL: ALL domain-related types MUST be defined in types.ts and imported from there**
   - **NEVER duplicate or redefine types in React components or other files**
   - Example:
     ```typescript
     export type ChatRequest = {
       modelId: string;
       text: string;
     };

     export type ChatResponse = {
       result: string;
       cost: {
         totalCost: number;
       };
       error?: string;
     };
     ```

   ### ✅ CORRECT: Import types from the domain's types.ts file
   ```typescript
   // In a React component
   import { ChatRequest, ChatResponse } from "@/apis/chat/types";
   
   const ChatComponent = () => {
     const [request, setRequest] = useState<ChatRequest>({
       modelId: "gpt-4",
       text: ""
     });
     
     // Use the imported types
     // ...
   };
   ```

   ### ❌ INCORRECT: Redefining types in React components
   ```typescript
   // In a React component - DON'T DO THIS
   
   // DON'T redefine types that should come from the API domain
   type ChatRequestType = { // WRONG: Duplicating the API type
     modelId: string;
     text: string;
   };
   
   const ChatComponent = () => {
     const [request, setRequest] = useState<ChatRequestType>({
       modelId: "gpt-4",
       text: ""
     });
     
     // Using the duplicated type
     // ...
     };
     ```

2. **Implement Server Logic** (`/src/apis/<domain>/server.ts`):
   - Create a `process` function that handles the request and returns a response
   - **IMPORTANT: ALL business logic MUST be implemented here**
   - Handle all business logic, validation, error cases, and external API calls here
   - **MUST use the shared types for both input parameters and return values**
   - **NEVER import any client-side code or client.ts functions here**
   - **IMPORTANT: MUST re-export the API name from index.ts**
   - Example:
     ```typescript
     import { ChatRequest, ChatResponse } from "./types";
     export { name } from './index'; // Re-export the API name from index.ts

     // Must use ChatRequest as input type and ChatResponse as return type
     export const process = async (request: ChatRequest): Promise<ChatResponse> => {
       try {
         // Input validation
         if (!request.modelId || !request.text) {
           return {
             result: "",
             cost: { totalCost: 0 },
             error: "Missing required fields: modelId and text are required."
           };
         }

         // Business logic here
         // External API calls
         // Data processing
         
         return {
           result: "Success",
           cost: { totalCost: 0 }
         };
       } catch (error) {
         return {
           result: "",
           cost: { totalCost: 0 },
           error: `Error: ${error instanceof Error ? error.message : String(error)}`
         };
       }
     };
     ```

3. **Create Client Function** (`/src/apis/<domain>/client.ts`):
   - Implement a function that calls the API using the apiClient.call method
   - **IMPORTANT: This is the ONLY place that should call apiClient.call with this API name**
   - **MUST use the exact same types for input parameters and return values as server.ts**
   - **NEVER import any server-side code or server.ts functions here**
   - **ALWAYS wrap the response type with CacheResult<T> to handle caching metadata**
   - **IMPORTANT: MUST import the API name from index.ts, NEVER from server.ts**
   - Example:
     ```typescript
     import { ChatRequest, ChatResponse } from "./types";
     import apiClient from "../../clientUtils/apiClient";
     import { name } from "./index"; // Always import from index.ts, never from server.ts
     import type { CacheResult } from "@/serverUtils/cache/types";

     // The return type must include CacheResult wrapper since caching is applied automatically
     export const chatWithAI = async (request: ChatRequest): Promise<CacheResult<ChatResponse>> => {
       return apiClient.call<CacheResult<ChatResponse>, ChatRequest>(
         name,
         request
       );
     };
     ```

4. **Create Index File** (`/src/apis/<domain>/index.ts`):
   - Export ONLY the API name and types (not process or client functions)
   - **IMPORTANT: Do NOT export process or client functions to prevent bundling server code with client code**
   - Example:
     ```typescript
     // Export types for both client and server
     export * from './types';
     
     // Export the API name - must be unique across all APIs
     export const name = "chat";
     ```

5. **Register the API in apis.ts** (`/src/apis/apis.ts`):
   - Import the server module directly and add it to the apiHandlers object
   - **IMPORTANT: Import directly from server.ts, NOT from index.ts**
   - **IMPORTANT: The key in the apiHandlers object MUST match the name exported from the server.ts**
   - Example:
     ```typescript
     import { ApiHandlers } from "./types";
     import * as chat from "./chat/server";
     import * as newDomain from "./newDomain/server";

     export const apiHandlers: ApiHandlers = {
       [chat.name]: { process: chat.process as (params: unknown) => Promise<unknown> },
       [newDomain.name]: { process: newDomain.process as (params: unknown) => Promise<unknown> }
     };
     ```

## Multiple API Routes Under the Same Namespace

When a domain needs to expose multiple API routes (e.g., search and details), follow these guidelines:

1. **Define All API Names in index.ts**:
   ```typescript
   // src/apis/books/index.ts
   export * from './types';
   
   // Base namespace
   export const name = "books"; 
   
   // All API endpoint names MUST be defined here
   export const searchApiName = `${name}/search`;
   export const detailsApiName = `${name}/details`;
   ```

2. **Re-export API Names from server.ts**:
   - Re-export the API names from index.ts
   - Create separate handler functions for each endpoint
   - Example:
   ```typescript
   // src/apis/books/server.ts
   import { BookSearchRequest, BookSearchResponse, BookDetailsRequest, BookDetailsResponse } from './types';
   // Import all API names from index.ts
   import { name, searchApiName, detailsApiName } from './index';
   
   // Re-export all API names - this pattern is crucial
   export { name, searchApiName, detailsApiName };
   
   // Search books endpoint
   export const searchBooks = async (request: BookSearchRequest): Promise<BookSearchResponse> => {
     // Implementation...
   };
   
   // Get book by ID endpoint
   export const getBookById = async (request: BookDetailsRequest): Promise<BookDetailsResponse> => {
     // Implementation...
   };
   ```

3. **Import API Names in client.ts FROM INDEX.TS, NOT server.ts**:
   ```typescript
   // src/apis/books/client.ts
   import { BookSearchRequest, BookSearchResponse, BookDetailsRequest, BookDetailsResponse } from './types';
   import apiClient from "../../clientUtils/apiClient";
   // IMPORTANT: Always import API names from index.ts, NEVER from server.ts
   import { searchApiName, detailsApiName } from "./index";
   import type { CacheResult } from "@/serverUtils/cache/types";
   
   // Client function to call the book search API
   export const searchBooks = async (request: BookSearchRequest): Promise<CacheResult<BookSearchResponse>> => {
     return apiClient.call<CacheResult<BookSearchResponse>, BookSearchRequest>(
       searchApiName,
       request
     );
   };
   
   // Client function to call the book details API
   export const getBookById = async (request: BookDetailsRequest): Promise<CacheResult<BookDetailsResponse>> => {
     return apiClient.call<CacheResult<BookDetailsResponse>, BookDetailsRequest>(
       detailsApiName,
       request
     );
   };
   ```

4. **Register Multiple Endpoints in apis.ts**:
   ```typescript
   // src/apis/apis.ts
   import * as books from "./books/server"; // Import from server.ts to get both API names and handlers
   
   export const apiHandlers: ApiHandlers = {
     // Other API handlers...
     [books.searchApiName]: { // API names are re-exported from server.ts
       process: (params: unknown) => books.searchBooks(params as BookSearchRequest) 
     },
     [books.detailsApiName]: { // API names are re-exported from server.ts
       process: (params: unknown) => books.getBookById(params as BookDetailsRequest) 
     },
   };
   ```

This approach provides several benefits:
- Clear organization of related API endpoints under a common namespace
- Explicit and self-documenting API names
- Type safety for each endpoint's request and response
- Separation of concerns with dedicated handler functions
- Consistent client-side access pattern

**CRITICAL: The client code must NEVER import directly from server.ts**
- API names MUST be defined in index.ts
- Server.ts MUST re-export API names from index.ts 
- Client.ts MUST import API names from index.ts
- This pattern ensures client code never imports server code directly
- Importing server code directly in client code will BREAK the application

## Using the API from Client Components

```typescript
import { chatWithAI } from "../api/chat/client";

// In your component:
const handleSubmit = async () => {
  const response = await chatWithAI({ 
    modelId: "gpt-4",
    text: "Hello, AI!"
  });
  
  if (response.data.error) {
    // Handle error
  } else {
    // Handle success
    // Access cache information if needed: response.fromCache, response.timestamp
  }
};
```

## Important Guidelines

1. **Single API Endpoint**:
   - **NEVER add new Next.js API routes to the /src/pages/api folder**
   - All API requests go through the single /api/process endpoint
   - The central processApiCall.ts handles routing to the correct API handler

2. **API Registration and Naming Flow**:
   - **ALWAYS register new APIs in apis.ts by importing directly from server.ts**
   - The API name flow MUST follow this pattern:
     1. DEFINE API names in index.ts
     2. IMPORT and RE-EXPORT API names in server.ts from index.ts
     3. IMPORT API names in apis.ts from server.ts
     4. IMPORT API names in client.ts from index.ts (NEVER from server.ts)
   - This pattern ensures client code never imports server code directly

3. **Client Access**:
   - **NEVER call apiClient directly from components or pages**
   - **ALWAYS use the domain-specific client functions** (e.g., chatWithAI)
   - **ALWAYS import client functions directly from client.ts, not from index.ts**
   - This ensures proper typing and consistent error handling

4. **Caching**:
   - Caching is automatically applied at the processApiCall.ts level
   - **ALWAYS wrap response types with CacheResult<T> in client functions**
   - The CacheResult type includes:
     ```typescript
     type CacheResult<T> = {
       data: T;           // The actual API response
       fromCache: boolean; // Whether the result came from cache
       timestamp: number;  // When the result was generated/cached
     };
     ```

5. **Error Handling**:
   - Never return non-200 status codes from API routes
   - Always return status code 200 with proper error fields in the response
   - Handle all errors gracefully in the process function

6. **Type Safety**:
   - **CRITICAL: Ensure perfect type consistency across the entire API flow**
   - The client.ts function MUST use the exact same parameter types as server.ts
   - The return type in client.ts should be CacheResult<ResponseType>
   - Never use `any` as a type
   - **ALWAYS define domain-related types in types.ts and import them where needed**
   - **NEVER duplicate types in components or other files**
   - **NEVER create similar but slightly different versions of the same type**

7. **Separation of Concerns**:
   - **NEVER import server.ts in client-side code**
   - **NEVER import client.ts in server-side code**
   - **NEVER export process function from index.ts**
   - **NEVER export client functions from index.ts**
   - This prevents bundling server-side code with client-side code
   - Keep business logic in server.ts and API calls in client.ts