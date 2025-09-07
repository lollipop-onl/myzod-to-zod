import myzod from 'myzod';

// Basic object without unknown key handling (should reject unknown properties)
export const strictObjectSchema = myzod.object({
  name: myzod.string(),
  age: myzod.number(),
});

// Object with unknown key handling (should strip unknown properties)
export const stripObjectSchema = myzod.object({
  name: myzod.string(),
  age: myzod.number(),
}).allowUnknownKeys();

// Nested object with mixed behavior
export const nestedMixedSchema = myzod.object({
  user: myzod.object({
    name: myzod.string(),
  }), // strict by default
  settings: myzod.object({
    theme: myzod.string(),
  }).allowUnknownKeys(), // should strip unknown properties
});

// Complex chaining with unknown key handling
export const complexChainedSchema = myzod.object({
  id: myzod.string(),
  metadata: myzod.object({
    version: myzod.string(),
  }),
}).allowUnknownKeys().optional();

// Main schema for runtime validation (uses strict by default)
export const schema = strictObjectSchema;

// Test data for strict behavior (should fail with unknown properties)
export const validData = { name: "John", age: 30 };
export const invalidData = { name: "John", age: 30, extra: "unknown" };

// Additional test data for strip behavior
export const stripValidData = { name: "John", age: 30 };
export const stripDataWithExtra = { name: "John", age: 30, extra: "unknown" };
export const expectedStripOutput = { name: "John", age: 30 };