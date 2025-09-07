import myzod from 'myzod';

export const schema = myzod.union([myzod.string(), myzod.number()]);
export const validDataString = "hello";
export const validDataNumber = 42;
export const invalidData = true;