import { z } from 'zod';

export const schema = z.string().default('default value');
export const validData = "hello";
export const undefinedData = undefined;