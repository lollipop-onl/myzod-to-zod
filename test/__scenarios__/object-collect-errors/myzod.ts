import myzod from 'myzod';

const schema = myzod.object({
  name: myzod.string().min(1),
  age: myzod.number().min(0),
}).collectErrors();

export { schema };