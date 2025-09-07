import { z } from 'zod';

export const schema = z.union([z.string(), z.number()]);
export const validDataString = "hello";
export const validDataNumber = 42;
export const invalidData = true;