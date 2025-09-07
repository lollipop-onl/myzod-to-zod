import { z, ZodNumber } from 'zod';

export const schema = z.number();
export const schemaType: ZodNumber = z.number();
export const validData = 42;
export const invalidData = "hello";