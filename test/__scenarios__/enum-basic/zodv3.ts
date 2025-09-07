import { z } from 'zod';

enum Color {
  Red = "red",
  Green = "green", 
  Blue = "blue"
}

export const schema = z.nativeEnum(Color);
export const validData = Color.Red;
export const invalidData = "yellow";