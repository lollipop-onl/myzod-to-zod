import { z } from 'zod';

export const schema = z.tuple([z.string(), z.number()]);
export const validData = ["hello", 42];
export const invalidData = ["hello", "world"];