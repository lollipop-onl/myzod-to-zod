import myzod from 'myzod';

export const schema = myzod.string().optional();
export const validData = "hello";
export const validDataUndefined = undefined;
export const invalidData = 42;