import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  age: z.number().min(0),
});

export { schema };