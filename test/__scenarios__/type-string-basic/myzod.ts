import myzod, { StringType } from 'myzod';

export const schema = myzod.string();
export const schemaType: StringType = myzod.string();
export const validData = "hello world";
export const invalidData = 42;