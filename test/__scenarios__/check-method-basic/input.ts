import myzod from 'myzod';

const schema = myzod.string().min(3);

// Basic check usage
const isValid = schema.check('hello');
const isInvalid = schema.check('ab');

// Check in conditional
if (schema.check('test')) {
  console.log('Valid');
}

// Check with complex schema
const userSchema = myzod.object({
  name: myzod.string().min(1),
  email: myzod.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
});

const userData = { name: 'John', email: 'john@example.com' };
const userIsValid = userSchema.check(userData);