import { z, ZodObject } from 'zod';

const shape = { name: z.string(), age: z.number() };
export const schema = z.object(shape);
export const schemaType: ZodObject<typeof shape> = z.object(shape);
export const validData = { name: "Alice", age: 30 };
export const invalidData = "not an object";