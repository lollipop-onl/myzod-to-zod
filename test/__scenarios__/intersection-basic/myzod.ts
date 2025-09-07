import myzod from 'myzod';

const schemaA = myzod.object({ name: myzod.string() });
const schemaB = myzod.object({ age: myzod.number() });

export const schema = myzod.intersection(schemaA, schemaB);
export const validData = { name: "John", age: 30 };
export const invalidData = { name: "John" };