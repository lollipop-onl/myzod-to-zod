# enum-array

`myzod.enum()` with array argument transformation

## Before (myzod)
```typescript
myzod.enum(['red', 'green', 'blue'])
```

## After (zod v3)
```typescript
z.enum(['red', 'green', 'blue'])
```

## Key Points
- Array literals as arguments should use `z.enum()`
- Enum objects as arguments should use `z.nativeEnum()`