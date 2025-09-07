import myzod from 'myzod';

export const schema = myzod.enum(['red', 'green', 'blue']);
export const validData = 'red';
export const invalidData = 'yellow';