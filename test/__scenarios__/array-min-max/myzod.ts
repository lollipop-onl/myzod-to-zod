import myzod from 'myzod';

export const schema = myzod.array(myzod.string()).min(1).max(3);
export const validData = ["hello", "world"];
export const invalidDataEmpty = [];
export const invalidDataTooMany = ["a", "b", "c", "d"];