import { z } from 'zod';

export const schema = z.array(z.string()).min(1).max(3);
export const validData = ["hello", "world"];
export const invalidDataEmpty = [];
export const invalidDataTooMany = ["a", "b", "c", "d"];