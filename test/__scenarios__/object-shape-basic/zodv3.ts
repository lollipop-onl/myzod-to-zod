import { z } from 'zod';

const userSchema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().optional()
}).strict();

// shape()メソッドでスキーマの形状を取得
const userShape = userSchema.shape;

// 別のオブジェクトスキーマ
const postSchema = z.object({
  title: z.string(),
  content: z.string(),
  published: z.boolean().default(false)
}).strict();

const postShape = postSchema.shape;

export { userSchema, userShape, postSchema, postShape };