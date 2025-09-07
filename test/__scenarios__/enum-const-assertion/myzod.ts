import myzod from 'myzod';

const colors = ['red', 'green', 'blue'] as const;

export const schema = myzod.enum(colors);
export const validData = 'red';
export const invalidData = 'yellow';