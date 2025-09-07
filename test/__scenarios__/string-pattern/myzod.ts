import myzod from 'myzod';

export const schema = myzod.string().pattern(/^[A-Z]+$/);
export const validData = "HELLO";
export const invalidData = "hello";