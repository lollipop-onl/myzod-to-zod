import { z } from 'zod';

export const schema = z.object({
  name: z.string(),
  age: z.number()
}).strict();

export const validData = { name: "John", age: 30 };
export const invalidData = { name: "John", age: "thirty" };