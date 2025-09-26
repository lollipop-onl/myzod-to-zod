# Basic Date Schema Test

Tests the transformation of `myzod.date()` to `z.coerce.date()`.

## Expected Transformation

- `myzod.date()` → `z.coerce.date()`

## Notes

myzod's date() method automatically coerces strings to dates, so the equivalent in zod is `z.coerce.date()`, not `z.date()`.