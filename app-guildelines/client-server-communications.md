# Client-Server Communication Guidelines

## Directory Structure

For each API endpoint, follow this structure:

```
/src
  /api
    /<domain>
      /<endpoint>
        /types.ts    - Shared types between client and server
        /server.ts   - Server-side implementation (ALL business logic goes here)
        /client.ts   - Client-side function to call the API
        /index.ts    - Exports everything for easier imports
  /pages
    /api
      /<domain>
        /<endpoint>.ts - Next.js API route handler (minimal routing logic only)
```

## Creating a New API Endpoint

1. **Define Shared Types** (`/src/api/<domain>/<endpoint>/types.ts`):
   - Define request and response types
   - Keep types simple and focused on the specific endpoint
   - **IMPORTANT: These types MUST be used consistently across client.ts, server.ts, and the API route**
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

2. **Implement Server Logic** (`/src/api/<domain>/<endpoint>/server.ts`):
   - Create a pure function that processes the request and returns a response
   - **IMPORTANT: ALL business logic MUST be implemented here, not in the API route handler**
   - Handle all business logic, validation, error cases, and external API calls here
   - Keep the function independent of Next.js API specifics
   - **MUST use the shared types for both input parameters and return values**
   - **NEVER import any client-side code or client.ts functions here**
   - Example:
     ```typescript
     import { ChatRequest, ChatResponse } from "./types";

     // Must use ChatRequest as input type and ChatResponse as return type
     export const processRequest = async (request: ChatRequest): Promise<ChatResponse> => {
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

3. **Create Client Function** (`/src/api/<domain>/<endpoint>/client.ts`):
   - Implement a function that calls the API endpoint
   - Handle fetch errors and provide appropriate fallbacks
   - **IMPORTANT: This is the ONLY place in the codebase that should directly call the API endpoint**
   - **MUST use the exact same types for input parameters and return values as server.ts**
   - **NEVER import any server-side code or server.ts functions here**
   - **ALWAYS use the apiClient utility from clientUtils instead of direct fetch calls**
   - Example:
     ```typescript
     import { ChatRequest, ChatResponse } from "./types";
     import apiClient from "../../../clientUtils/apiClient";

     // Must use ChatRequest as input type and ChatResponse as return type
     // to ensure perfect type consistency with server.ts
     export const callEndpoint = async (request: ChatRequest): Promise<ChatResponse> => {
       try {
         return apiClient.post<ChatResponse, ChatRequest>(
           '/api/<domain>/<endpoint>',
           request
         );
       } catch (error) {
         return {
           result: "",
           cost: { totalCost: 0 },
           error: `Failed to call API: ${error instanceof Error ? error.message : String(error)}`
         };
       }
     };
     ```

4. **Create Index File** (`/src/api/<domain>/<endpoint>/index.ts`):
   - Export all types and functions for easier imports
   - **IMPORTANT: Create separate exports for client and server to prevent accidental cross-imports**
   - Example:
     ```typescript
     // Export types for both client and server
     export * from './types';
     
     // Client-side exports
     export { callEndpoint } from './client';
     
     // Server-side exports
     export { processRequest } from './server';
     ```

5. **Implement Next.js API Route** (`/src/pages/api/<domain>/<endpoint>.ts`):
   - Import the process function from the server implementation
   - **IMPORTANT: The API route handler should ONLY:**
     - Validate the HTTP method
     - Pass the request body to the process function
     - Return the response
   - NO business logic, validation, or data processing should be here
   - **MUST use the same shared types for request body and response**
   - **NEVER import any client-side code or client.ts functions here**
   - Example:
     ```typescript
     import type { NextApiRequest, NextApiResponse } from "next";
     import { processRequest, ChatResponse, ChatRequest } from "../../../api/<domain>/<endpoint>";

     export default async function handler(
       req: NextApiRequest,
       res: NextApiResponse<ChatResponse>
     ) {
       // Only validate HTTP method
       if (req.method !== "POST") {
         return res.status(200).json({
           result: "",
           cost: { totalCost: 0 },
           error: "Method not allowed. Please use POST."
         });
       }

       // All processing happens in the imported function
       // The req.body should match the ChatRequest type
       const response = await processRequest(req.body as ChatRequest);
       
       // Simply return the response - which is of type ChatResponse
       return res.status(200).json(response);
     }
     ```

## Using the API from Client Components

```typescript
import { callEndpoint } from "../api/<domain>/<endpoint>";

// In your component:
const handleSubmit = async () => {
  const response = await callEndpoint({ 
    // request parameters 
  });
  
  if (response.error) {
    // Handle error
  } else {
    // Handle success
  }
};
```

## Important Guidelines

1. **Error Handling**:
   - Never return non-200 status codes from API routes
   - Always return status code 200 with proper error fields in the response
   - Handle all errors gracefully on both server and client

2. **Type Safety**:
   - **CRITICAL: Ensure perfect type consistency across the entire API flow**
   - The client.ts function MUST use the exact same parameter and return types as server.ts
   - The API route handler MUST use the same types for request body and response
   - Never use `any` as a type
   - Never duplicate types - always import from the shared types.ts file
   - Ensure all response types from API routes are used in client-side code

3. **Separation of Concerns**:
   - **ALL business logic MUST be in the server.ts file, NOT in the Next.js API route handler**
   - The API route handler should only handle HTTP method validation and passing the request to the server function
   - Implement business logic in pure functions
   - Never access external APIs from client-side code
   - **NEVER import client.ts functions in server-side code (server.ts or API routes)**
   - **NEVER import server.ts functions in client-side code (React components, pages, etc.)**
   - Only import the shared types across both client and server

4. **Code Organization**:
   - Use named exports, not default exports
   - Keep functions small and focused on a single responsibility
   - Separate data fetching, processing, and response handling

5. **Client-Side API Access**:
   - **NEVER call API endpoints directly from client components or pages**
   - **ALWAYS use the client.ts functions to call API endpoints**
   - **ALWAYS use the apiClient utility from clientUtils for all fetch operations**
   - This ensures consistent error handling, type safety, and maintainability
   - Example of what NOT to do:
     ```typescript
     // DON'T DO THIS in your React components
     const handleSubmit = async () => {
       const response = await fetch('/api/domain/endpoint', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(data),
       });
       const result = await response.json();
       // ...
     };
     ```
   - Example of the correct approach:
     ```typescript
     // DO THIS instead
     import { callEndpoint } from "../api/domain/endpoint";
     
     const handleSubmit = async () => {
       const response = await callEndpoint(data);
       // ...
     };
     ```

6. **Using the apiClient Utility**:
   - **ALWAYS use the apiClient utility in client.ts files for making API requests**
   - Never use direct fetch calls in client.ts files
   - The apiClient utility provides:
     - Type-safe API requests with generic types
     - Consistent error handling
     - Automatic handling of common fetch boilerplate
   - Example:
     ```typescript
     // In client.ts files:
     import apiClient from "../../../clientUtils/apiClient";
     import { RequestType, ResponseType } from "./types";
     
     export const callApi = async (request: RequestType): Promise<ResponseType> => {
       try {
         return await apiClient.post<ResponseType, RequestType>(
           '/api/domain/endpoint',
           request
         );
       } catch (error) {
         // Handle error and return a properly typed response
         return {
           // Default values
           error: `Error: ${error instanceof Error ? error.message : String(error)}`
         } as ResponseType;
       }
     };
     ```