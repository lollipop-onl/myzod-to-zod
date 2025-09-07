import { z } from 'zod';

export const schema = z.coerce.number();
export const validData = "42";
export const expectedOutput = 42;
export const invalidData = "not a number";