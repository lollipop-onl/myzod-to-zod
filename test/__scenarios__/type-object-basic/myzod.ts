import myzod, { ObjectType } from 'myzod';

const shape = { name: myzod.string(), age: myzod.number() };
export const schema = myzod.object(shape);
export const schemaType: ObjectType<typeof shape> = myzod.object(shape);
export const validData = { name: "Alice", age: 30 };
export const invalidData = "not an object";