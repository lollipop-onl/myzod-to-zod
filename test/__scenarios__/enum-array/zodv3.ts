import { z } from 'zod';

export const schema = z.enum(['red', 'green', 'blue']);
export const validData = 'red';
export const invalidData = 'yellow';