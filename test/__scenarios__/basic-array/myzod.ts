import myzod from 'myzod';

export const schema = myzod.array(myzod.string());
export const validData = ["hello", "world"];
export const invalidData = ["hello", 123];