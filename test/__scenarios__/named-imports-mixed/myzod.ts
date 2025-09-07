import myzod, { string, literals, type Infer } from 'myzod';

// Default import使用
const userSchema = myzod.object({
  name: string().min(1).max(50),
  status: literals("active", "inactive"),
  age: myzod.number().min(0).max(150),
});

// 型推論
type User = Infer<typeof userSchema>;

export { userSchema, type User };