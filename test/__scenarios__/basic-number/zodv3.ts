import { z } from 'zod';

export const schema = z.number();
export const validData = 42;
export const invalidData = "not a number";