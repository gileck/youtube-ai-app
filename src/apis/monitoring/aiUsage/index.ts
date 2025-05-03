/**
 * AI Usage Monitoring API
 * 
 * Exports types and API name for both client and server
 */

// Export types for both client and server
export * from './types';

// Base namespace
export const name = "aiUsage";

// All API endpoint names MUST be defined here
export const all = `${name}/all`;
export const summary = `${name}/summary`;
