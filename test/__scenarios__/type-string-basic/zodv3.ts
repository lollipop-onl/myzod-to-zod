import { z, ZodString } from 'zod';

export const schema = z.string();
export const schemaType: ZodString = z.string();
export const validData = "hello world";
export const invalidData = 42;