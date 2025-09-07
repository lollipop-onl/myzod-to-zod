import myzod from 'myzod';

// Basic dictionary (non-optional) -> should become record with optional
const stringDictionary = myzod.dictionary(myzod.string());

// Dictionary with already optional -> should remain optional
const optionalStringDictionary = myzod.dictionary(myzod.string().optional());

// Complex dictionary
const complexDictionary = myzod.dictionary(
  myzod.object({
    name: myzod.string(),
    age: myzod.number()
  })
);

export { stringDictionary, optionalStringDictionary, complexDictionary };