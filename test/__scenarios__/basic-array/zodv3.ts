import { z } from 'zod';

export const schema = z.array(z.string());
export const validData = ["hello", "world"];
export const invalidData = ["hello", 123];