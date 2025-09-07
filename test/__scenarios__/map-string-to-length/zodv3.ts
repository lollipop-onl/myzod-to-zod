import { z } from 'zod';

export const schema = z.string().transform(s => s.length);
export const validData = "hello";
export const expectedOutput = 5;