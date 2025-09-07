import { z } from 'zod';

export const schema = z.literal('hello');
export const validData = 'hello';
export const invalidData = 'world';