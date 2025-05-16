export type ApiHandlers = Record<string, {
  process: ((params: unknown) => Promise<unknown>) | ((params: unknown, context: unknown) => Promise<unknown>);
}>

export type ErrorResponse = {
  error: string;
};
