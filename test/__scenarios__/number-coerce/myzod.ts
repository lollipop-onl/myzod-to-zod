import myzod from 'myzod';

export const schema = myzod.number().coerce();
export const validData = "42";
export const expectedOutput = 42;
export const invalidData = "not a number";