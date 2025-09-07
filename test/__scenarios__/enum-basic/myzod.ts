import myzod from 'myzod';

enum Color {
  Red = "red",
  Green = "green",
  Blue = "blue"
}

export const schema = myzod.enum(Color);
export const validData = Color.Red;
export const invalidData = "yellow";