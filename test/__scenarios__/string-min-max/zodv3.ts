import { z } from 'zod';

export const schema = z.string().min(5).max(10);
export const validData = "hello";
export const invalidData = "hi";