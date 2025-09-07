import { z } from 'zod';

// Basic allowUnknownKeys usage
export const basicAllowUnknownKeys = z.object({
  name: z.string(),
  age: z.number(),
}).strip();

// Chained with other methods
export const chainedAllowUnknownKeys = z.object({
  id: z.string(),
  email: z.string(),
}).strip().optional();

// Nested object with allowUnknownKeys
export const nestedAllowUnknownKeys = z.object({
  user: z.object({
    name: z.string(),
  }).strip(),
  settings: z.object({
    theme: z.string(),
  }).strict(),
}).strict();

// Complex example with multiple chaining
export const complexAllowUnknownKeys = z.object({
  metadata: z.object({
    version: z.string(),
    tags: z.array(z.string()),
  }).strip(),
}).strip().default({});