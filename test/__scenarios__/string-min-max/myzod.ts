import myzod from 'myzod';

export const schema = myzod.string().min(5).max(10);
export const validData = "hello";
export const invalidData = "hi";