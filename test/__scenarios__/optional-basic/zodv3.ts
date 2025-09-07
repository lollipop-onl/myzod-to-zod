import { z } from 'zod';

export const schema = z.string().optional();
export const validData = "hello";
export const validDataUndefined = undefined;
export const invalidData = 42;