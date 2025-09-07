import myzod, { string, literals, type Infer } from 'myzod';

// 基本型
const userSchema = myzod.object({
  name: string().min(1).max(50),
  email: string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: myzod.number().min(0).max(150).optional(),
  isActive: myzod.boolean().default(true),
}).collectErrors();

// 複雑な変換パターン
const statusSchema = literals("active", "inactive", "pending");
const coerceSchema = myzod.number().coerce();

// カスタムバリデーション
const validatedSchema = string().withPredicate(
  s => s.length > 0,
  'String must not be empty'
);

// 値変換
const transformSchema = string().map(s => s.toUpperCase());

// TypeScript enum
enum Color {
  Red = 'red',
  Green = 'green',
  Blue = 'blue'
}
const enumSchema = myzod.enum(Color);

// 型推論
type User = Infer<typeof userSchema>;
type Status = Infer<typeof statusSchema>;