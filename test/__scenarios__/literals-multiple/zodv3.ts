import { z } from 'zod';

export const schema = z.union([z.literal('red'), z.literal('green'), z.literal('blue')]);
export const validData = 'red';
export const invalidData = 'yellow';