import myzod from 'myzod';

export const schema = myzod.object({
  name: myzod.string(),
  age: myzod.number()
});

export const validData = { name: "John", age: 30 };
export const invalidData = { name: "John", age: "thirty" };