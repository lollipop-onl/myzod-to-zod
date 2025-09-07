import myzod from 'myzod';

export const schema = myzod.string().map(s => s.length);
export const validData = "hello";
export const expectedOutput = 5;