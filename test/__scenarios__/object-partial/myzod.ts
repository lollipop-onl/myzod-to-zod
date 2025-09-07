import myzod from 'myzod';

const baseSchema = myzod.object({
  name: myzod.string(),
  age: myzod.number()
});

export const schema = baseSchema.partial();
export const validData = { name: "John" };
export const validDataEmpty = {};
export const invalidData = { name: "John", age: "thirty" };