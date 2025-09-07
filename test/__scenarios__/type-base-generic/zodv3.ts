import { z, ZodType } from 'zod';

export const schema = z.string();
export const genericSchema: ZodType<string> = z.string();
export const validData = "hello world";
export const invalidData = 42;