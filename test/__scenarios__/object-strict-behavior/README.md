# Object Strict/Strip Behavior Test

This test verifies the correct transformation of myzod object behavior to zod v3:

## Transformation Rules

1. **Default object behavior**: `myzod.object()` → `z.object().strict()`
   - myzod rejects unknown properties by default
   - zod should use `.strict()` to match this behavior

2. **allowUnknownKeys behavior**: `myzod.object().allowUnknownKeys()` → `z.object().strip()`
   - myzod allowUnknownKeys strips unknown properties
   - zod should use `.strip()` to match this behavior

## Test Cases

- `strictObjectSchema`: Basic object without allowUnknownKeys
- `stripObjectSchema`: Object with allowUnknownKeys
- `nestedMixedSchema`: Nested objects with different behaviors
- `complexChainedSchema`: Complex chaining with allowUnknownKeys

## Expected Behavior

```javascript
// Strict behavior (rejects unknown properties)
strictObjectSchema.parse({name: "John", age: 30, extra: "value"}) // throws ZodError

// Strip behavior (removes unknown properties)  
stripObjectSchema.parse({name: "John", age: 30, extra: "value"}) // returns {name: "John", age: 30}
```