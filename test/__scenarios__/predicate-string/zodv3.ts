import { z } from 'zod';

export const schema = z.string().refine(
  s => s.length > 0,
  'String must not be empty'
);

export const validData = "hello";
export const invalidData = "";