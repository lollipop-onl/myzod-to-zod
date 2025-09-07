import myzod, { NumberType } from 'myzod';

export const schema = myzod.number();
export const schemaType: NumberType = myzod.number();
export const validData = 42;
export const invalidData = "hello";