import { z } from 'zod';

// Basic dictionary (non-optional) -> should become record with optional
const stringDictionary = z.record(z.string().optional());

// Dictionary with already optional -> should remain optional
const optionalStringDictionary = z.record(z.string().optional());

// Complex dictionary
const complexDictionary = z.record(
  z.object({
    name: z.string(),
    age: z.number()
  }).optional()
);

export { stringDictionary, optionalStringDictionary, complexDictionary };