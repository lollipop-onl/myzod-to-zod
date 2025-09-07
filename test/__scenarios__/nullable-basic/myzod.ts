import myzod from 'myzod';

export const schema = myzod.string().nullable();
export const validData = "hello";
export const validDataNull = null;
export const invalidData = 42;