import { z } from 'zod';

// Default import使用
const userSchema = z.object({
  name: z.string().min(1).max(50),
  status: z.union([z.literal("active"), z.literal("inactive")]),
  age: z.number().min(0).max(150),
});

// 型推論
type User = z.infer<typeof userSchema>;

export { userSchema, type User };