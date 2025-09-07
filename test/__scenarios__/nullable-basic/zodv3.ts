import { z } from 'zod';

export const schema = z.string().nullable();
export const validData = "hello";
export const validDataNull = null;
export const invalidData = 42;