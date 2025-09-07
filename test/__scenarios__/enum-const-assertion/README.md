# enum-const-assertion

`myzod.enum()` with const assertion array

## Before (myzod)
```typescript
const colors = ['red', 'green', 'blue'] as const;
myzod.enum(colors)
```

## After (zod v3)
```typescript
const colors = ['red', 'green', 'blue'] as const;
z.enum(colors)
```

## Key Points
- Const assertion arrays should still use `z.enum()`
- Distinguished from enum objects by AST analysis