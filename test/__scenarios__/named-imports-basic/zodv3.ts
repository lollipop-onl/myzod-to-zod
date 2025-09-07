import { z } from 'zod';

// 基本型のnamed import
const nameSchema = z.string().min(1).max(50);

// literals のnamed import
const statusSchema = z.union([z.literal("active"), z.literal("inactive"), z.literal("pending")]);

// 型推論のnamed import
type Name = z.infer<typeof nameSchema>;
type Status = z.infer<typeof statusSchema>;

export { nameSchema, statusSchema, type Name, type Status };