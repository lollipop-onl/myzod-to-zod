import myzod from 'myzod';

// Basic allowUnknownKeys usage
export const basicAllowUnknownKeys = myzod.object({
  name: myzod.string(),
  age: myzod.number(),
}).allowUnknownKeys();

// Chained with other methods
export const chainedAllowUnknownKeys = myzod.object({
  id: myzod.string(),
  email: myzod.string(),
}).allowUnknownKeys().optional();

// Nested object with allowUnknownKeys
export const nestedAllowUnknownKeys = myzod.object({
  user: myzod.object({
    name: myzod.string(),
  }).allowUnknownKeys(),
  settings: myzod.object({
    theme: myzod.string(),
  }),
});

// Complex example with multiple chaining
export const complexAllowUnknownKeys = myzod.object({
  metadata: myzod.object({
    version: myzod.string(),
    tags: myzod.array(myzod.string()),
  }).allowUnknownKeys(),
}).allowUnknownKeys().default({});