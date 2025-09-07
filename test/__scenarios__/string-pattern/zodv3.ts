import { z } from 'zod';

export const schema = z.string().regex(/^[A-Z]+$/);
export const validData = "HELLO";
export const invalidData = "hello";