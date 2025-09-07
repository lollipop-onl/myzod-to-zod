import myzod from 'myzod';

export const schema = myzod.tuple([myzod.string(), myzod.number()]);
export const validData = ["hello", 42];
export const invalidData = ["hello", "world"];