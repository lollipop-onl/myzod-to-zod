import myzod from 'myzod';

export const schema = myzod.date();
export const validData = new Date('2023-01-01');
export const invalidData = "not a date";