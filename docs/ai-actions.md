# Task: Implement AI Actions for Books

## Objective

Enable AI-powered actions (e.g., summarization, Q&A, theme extraction) for each book in the app, following the same architecture and flow as the video AI actions feature.

## High-Level Architecture

The feature consists of three main layers:

### Client UI Layer

Book page React component(s) for displaying and triggering AI actions and rendering results.

### Responsibilities

1. Display a list of available AI actions for each book (e.g., Summarize, Generate Quiz, Extract Themes).
2. Provide UI for user input if needed (e.g., prompt fields, action buttons).
3. On action trigger, send a POST request to the relevant API endpoint.
4. Display loading, error, and result states using dedicated renderers for each action type.
5. Ensure responsive design and accessibility; follow UI guidelines (e.g., no horizontal padding for xs screens).

### API Layer

Next.js API route handlers for all book AI actions.

### Service Layer

Pure business logic functions for each AI action, plus a generic action router.

## Requirements & Implementation Steps

### 1. Client UI Layer

#### AI Action Renderer

- Purpose:  
  Render the result of each AI action for a book (e.g., summary, Q&A, themes) in the Book page UI.
- Responsibilities:  
  - Receive the result data from the API call and render it in a user-friendly format.
  - Provide loading and error states while the API call is in progress or if it fails.
  - Use a dedicated renderer component for each action type (e.g., `BookSummaryRenderer`, `BookQARenderer`), similar to how video AI actions are rendered.
  - Ensure the renderer is modular, so new action types can be added easily by creating new renderer components.
  - Follow all UI guidelines (e.g., accessibility, responsive design, no horizontal padding on xs screens).
- Example Structure:  
  ```
  /src/client/routes/Book/components/
    - BookSummaryRenderer.tsx
    - BookQARenderer.tsx
    - BookThemesRenderer.tsx
    - BookAiActionResultRenderer.tsx (generic renderer that delegates to the correct specific renderer)
  ```
- Integration:  
  The main Book page should use the generic `BookAiActionResultRenderer` to display the result of the selected AI action, passing it the action type and result data.

### 2. AI Action Trigger

- Location:  
  `src/client/routes/Book/Book.tsx` (or equivalent Book page/component)
- Responsibilities:  
  - Display a list of available AI actions for each book (e.g., Summarize, Generate Quiz, Extract Themes).
  - Provide UI for user input if needed (e.g., prompt fields, action buttons).
  - On action trigger, send a POST request to the relevant API endpoint.
  - Display loading, error, and result states using dedicated renderers for each action type.
  - Ensure responsive design and accessibility; follow UI guidelines (e.g., no horizontal padding for xs screens).

### 2. API Layer

- Location:  
  `src/apis/aiBookActions/`
- Responsibilities:  
  - Implement API route handlers for each book AI action.
  - Validate incoming requests and extract necessary parameters (e.g., bookId, actionType, user input).
  - Call the generic action handler in the service layer, passing all required data.
  - Format and return the response for the frontend.
  - Follow project conventions for error handling (always return 200 with error fields if needed).

### 3. Service Layer

- Location:  
  - `src/services/AiActions/book-actions/` (book-specific logic)
  - `src/services/AiActions/` (shared logic, types, and generic router)
- Responsibilities:  
  - Implement pure functions for each AI action (e.g., summarizeBook, generateBookQuiz, extractBookThemes).
  - Each function should:
    - Fetch/process the relevant book content.
    - Call the appropriate AI model or service (using a dedicated API wrapper module).
    - Format and return the result in a consistent structure.
  - Implement a generic action handler/router that dispatches requests to the correct action function based on action type.
  - Keep all logic pure and testable (no direct side effects or API calls inside business logic).

## Flow Diagram

```
[BookPage.tsx UI]
     │
     ▼
[aiBookActions API endpoint]
     │
     ▼
[AiActions generic handler (routes to specific action in book-actions)]
     │
     ▼
[Business logic for action]
     │
     ▼
[API response → BookPage.tsx UI update]
    │
    ▼
[AI Action Renderer (e.g., BookSummaryRenderer, BookQARenderer, BookThemesRenderer)]

```

## Developer Notes & Guidelines

- Separation of Concerns:  
  Keep UI, API, and business logic strictly separated. Never import server code into the client or vice versa.
- Pure Functions:  
  All business logic should be pure (no side effects, no direct API calls).
- API Wrappers:  
  If external AI APIs are used, wrap them in a separate module that handles caching, retries, and error handling.
- Error Handling:  
  Never return 500/404 from APIs. Always return status 200 with error fields in the response.
- Extensibility:  
  Structure code so new book AI actions can be added with minimal changes (add new pure function, update router, add UI renderer).
- Type Safety:  
  Use TypeScript for all new code. Define clear types/interfaces for requests and responses.
- Testing:  
  Write unit tests for all business logic functions.
- UI Consistency:  
  Match the look and feel of video AI actions. Reuse existing UI components and patterns where possible.

## Deliverables

- Book page UI with AI action triggers and result renderers
- API endpoints for book AI actions
- Pure business logic functions for each book AI action
- Generic action router in the service layer
- Type definitions for action requests/responses
- Unit tests for service layer logic

If you have questions about the architecture or need example code, refer to the video AI action implementation or ask the tech lead.
