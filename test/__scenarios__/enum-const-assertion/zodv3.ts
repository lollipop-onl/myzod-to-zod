import { z } from 'zod';

const colors = ['red', 'green', 'blue'] as const;

export const schema = z.enum(colors);
export const validData = 'red';
export const invalidData = 'yellow';