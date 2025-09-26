import { z } from 'zod';

export const schema = z.coerce.date();
export const validData = new Date('2023-01-01');
export const invalidData = "not a date";