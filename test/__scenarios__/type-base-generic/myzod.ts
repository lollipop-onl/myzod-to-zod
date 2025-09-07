import myzod, { Type } from 'myzod';

export const schema = myzod.string();
export const genericSchema: Type<string> = myzod.string();
export const validData = "hello world";
export const invalidData = 42;