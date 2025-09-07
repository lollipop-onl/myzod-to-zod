import { string, literals, type Infer } from 'myzod';

// 基本型のnamed import
const nameSchema = string().min(1).max(50);

// literals のnamed import
const statusSchema = literals("active", "inactive", "pending");

// 型推論のnamed import
type Name = Infer<typeof nameSchema>;
type Status = Infer<typeof statusSchema>;

export { nameSchema, statusSchema, type Name, type Status };