import { z } from 'zod';

const schema = z.string().min(3);

// Basic check usage
const isValid = schema.safeParse('hello').success;
const isInvalid = schema.safeParse('ab').success;

// Check in conditional
if (schema.safeParse('test').success) {
  console.log('Valid');
}

// Check with complex schema
const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
}).strict();

const userData = { name: 'John', email: 'john@example.com' };
const userIsValid = userSchema.safeParse(userData).success;