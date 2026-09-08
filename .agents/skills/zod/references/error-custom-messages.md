---
title: Provide Custom Error Messages
impact: HIGH
impactDescription: Default messages like "Expected string, received number" confuse users; custom messages like "Email is required" are actionable
tags: error, messages, user-experience, validation
---

## Provide Custom Error Messages (Zod v4)

Zod's default error messages are technical and confusing for end users. In **Zod v4**, error customization has been standardized under the unified `error` parameter. The legacy `invalid_type_error`, `required_error`, and `message` parameters have been dropped or deprecated.

**Incorrect (Zod 3 legacy parameters):**

```typescript
import { z } from 'zod'

// ❌ invalid_type_error and required_error are DROPPED in Zod 4
// ❌ z.string().email() is DEPRECATED in Zod 4
// ❌ second argument string in .min() is DEPRECATED in Zod 4
const signupSchema = z.object({
  email: z.string({
    required_error: 'Email is required',
    invalid_type_error: 'Email must be text',
  }).email('Please enter a valid email address'),

  password: z.string({
    required_error: 'Password is required',
  }).min(8, 'Password must be at least 8 characters'),

  age: z.number({
    required_error: 'Age is required',
    invalid_type_error: 'Age must be a number',
  }).min(18, 'You must be at least 18 years old'),
})
```

**Correct (Zod v4 unified `{ error }` parameter):**

```typescript
import { z } from 'zod'

const signupSchema = z.object({
  // Custom message using error param on top-level z.email()
  email: z.email({ error: 'Please enter a valid email address' }),

  // Custom string error on z.string() and min()
  password: z.string({
    error: (issue) => issue.input === undefined ? 'Password is required' : 'Invalid password',
  }).min(8, { error: 'Password must be at least 8 characters' }),

  // Custom number error with unified error parameter
  age: z.number({
    error: (issue) => issue.input === undefined ? 'Age is required' : 'Age must be a number',
  }).min(18, { error: 'You must be at least 18 years old' }),
})

signupSchema.safeParse({ email: 'bad', password: '123', age: 15 })
// ZodError issues contain the custom messages:
// - "Please enter a valid email address"
// - "Password must be at least 8 characters"
// - "You must be at least 18 years old"
```

**Zod v4 Error Customization Patterns:**

```typescript
// 1. Simple static message:
z.string({ error: 'This field is required' })
z.email({ error: 'Invalid email' })
z.string().min(5, { error: 'Too short.' })
z.number().min(0, { error: 'Must be positive' })

// 2. Dynamic message based on issue inspection (replaces required_error / invalid_type_error):
const nameSchema = z.string({
  error: (issue) => {
    if (issue.input === undefined) return 'Name is required'
    return 'Name must be text'
  },
})

// 3. In refinements (.refine uses { error } instead of { message }):
const passwordConfirmation = z.object({
  password: z.string(),
  confirm: z.string(),
}).refine((data) => data.password === data.confirm, {
  error: 'Passwords must match',
  path: ['confirm'],
})
```

**Good error message principles:**
- Say what's wrong: "Password too short" not "Invalid password"
- Say how to fix it: "at least 8 characters" not just "too short"
- Use user's language: "Email" not "string field at path .email"
- Be specific: "Must be a positive number" not "Invalid"

**When NOT to use this pattern:**
- Internal development scripts where technical errors are fine
- When you'll map errors to user-facing messages in the UI layer

Reference: [Zod v4 Changelog - Error Customization](https://zod.dev/v4/changelog#error-customization)

