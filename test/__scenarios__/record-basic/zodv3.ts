import { z } from 'zod';

export const schema = z.record(z.string());
export const validData = { key1: "value1", key2: "value2" };
export const invalidData = { key1: "value1", key2: 42 };