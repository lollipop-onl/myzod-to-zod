import { z } from 'zod';

// 基本型
const userSchema = z.object({
  name: z.string().min(1).max(50),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: z.number().min(0).max(150).optional(),
  isActive: z.boolean().default(true),
});

// 複雑な変換パターン
const statusSchema = z.union([z.literal("active"), z.literal("inactive"), z.literal("pending")]);
const coerceSchema = z.coerce.number();

// カスタムバリデーション
const validatedSchema = z.string().refine(
  s => s.length > 0,
  'String must not be empty'
);

// 値変換
const transformSchema = z.string().transform(s => s.toUpperCase());

// TypeScript enum
enum Color {
  Red = 'red',
  Green = 'green',
  Blue = 'blue'
}
const enumSchema = z.nativeEnum(Color);

// 型推論
type User = z.infer<typeof userSchema>;
type Status = z.infer<typeof statusSchema>;