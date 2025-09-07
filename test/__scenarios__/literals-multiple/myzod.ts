import myzod from 'myzod';

export const schema = myzod.literals('red', 'green', 'blue');
export const validData = 'red';
export const invalidData = 'yellow';