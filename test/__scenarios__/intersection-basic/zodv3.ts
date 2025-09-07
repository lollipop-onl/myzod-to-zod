import { z } from 'zod';

const schemaA = z.object({ name: z.string() }).strict();
const schemaB = z.object({ age: z.number() }).strict();

export const schema = z.intersection(schemaA, schemaB);
export const validData = { name: "John", age: 30 };
export const invalidData = { name: "John" };