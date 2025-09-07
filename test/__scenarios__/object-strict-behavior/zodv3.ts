import { z } from 'zod';

// Basic object without unknown key handling (should reject unknown properties)
export const strictObjectSchema = z.object({
  name: z.string(),
  age: z.number(),
}).strict();

// Object with unknown key handling (should strip unknown properties)
export const stripObjectSchema = z.object({
  name: z.string(),
  age: z.number(),
}).strip();

// Nested object with mixed behavior
export const nestedMixedSchema = z.object({
  user: z.object({
    name: z.string(),
  }).strict(), // strict by default
  settings: z.object({
    theme: z.string(),
  }).strip(), // should strip unknown properties
}).strict();

// Complex chaining with unknown key handling
export const complexChainedSchema = z.object({
  id: z.string(),
  metadata: z.object({
    version: z.string(),
  }).strict(),
}).strip().optional();

// Main schema for runtime validation (uses strict by default)
export const schema = strictObjectSchema;

// Test data for strict behavior (should fail with unknown properties)
export const validData = { name: "John", age: 30 };
export const invalidData = { name: "John", age: 30, extra: "unknown" };

// Additional test data for strip behavior
export const stripValidData = { name: "John", age: 30 };
export const stripDataWithExtra = { name: "John", age: 30, extra: "unknown" };
export const expectedStripOutput = { name: "John", age: 30 };