import myzod from 'myzod';

export const schema = myzod.string().withPredicate(
  s => s.length > 0,
  'String must not be empty'
);

export const validData = "hello";
export const invalidData = "";