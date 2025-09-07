import myzod from 'myzod';

export const schema = myzod.record(myzod.string());
export const validData = { key1: "value1", key2: "value2" };
export const invalidData = { key1: "value1", key2: 42 };