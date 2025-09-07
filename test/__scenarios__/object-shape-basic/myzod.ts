import myzod from 'myzod';

const userSchema = myzod.object({
  name: myzod.string(),
  age: myzod.number(),
  email: myzod.string().optional()
});

// shape()メソッドでスキーマの形状を取得
const userShape = userSchema.shape();

// 別のオブジェクトスキーマ
const postSchema = myzod.object({
  title: myzod.string(),
  content: myzod.string(),
  published: myzod.boolean().default(false)
});

const postShape = postSchema.shape();

export { userSchema, userShape, postSchema, postShape };