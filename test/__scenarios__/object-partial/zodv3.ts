import { z } from 'zod';

const baseSchema = z.object({
  name: z.string(),
  age: z.number()
});

export const schema = baseSchema.partial();
export const validData = { name: "John" };
export const validDataEmpty = {};
export const invalidData = { name: "John", age: "thirty" };