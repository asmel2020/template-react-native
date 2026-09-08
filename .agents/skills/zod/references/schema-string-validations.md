---
title: Apply String Validations at Schema Definition
impact: CRITICAL
impactDescription: Unvalidated strings allow SQL injection, XSS, and malformed data; validating at schema level catches issues at the boundary
tags: schema, string, validation, security
---

## Apply String Validations at Schema Definition (Zod v4)

Plain `z.string()` accepts any string including empty strings, extremely long strings, and malicious content. In **Zod v4**, string formats are first-class schemas under the top-level `z` namespace (`z.email()`, `z.url()`, `z.uuid()`, etc.) rather than method chains on `z.string()`. Custom error messages use the unified `{ error: '...' }` parameter.

**Incorrect (deprecated Zod 3 method forms and unvalidated strings):**

```typescript
import { z } from 'zod'

const commentSchema = z.object({
  author: z.string(),  // Empty string passes
  email: z.string().email('Invalid email address'),  // ❌ z.string().email() is deprecated in Zod 4
  content: z.string(),  // 10MB string passes, script tags pass
  website: z.string().url('Invalid URL').optional(),  // ❌ z.string().url() is deprecated in Zod 4
})

// All of these pass validation
commentSchema.parse({
  author: '',  // Empty - who wrote this?
  email: 'invalid',  // Not a real email
  content: '<script>alert("XSS")</script>'.repeat(100000),  // XSS + huge
  website: 'javascript:void(0)',  // Dangerous URL
})
```

**Correct (Zod v4 top-level schemas & { error } parameter):**

```typescript
import { z } from 'zod'

const commentSchema = z.object({
  author: z.string()
    .min(1, { error: 'Author is required' })
    .max(100, { error: 'Author name too long' }),

  email: z.email({ error: 'Invalid email address' }),  // ✅ Top-level schema

  content: z.string()
    .min(1, { error: 'Comment cannot be empty' })
    .max(5000, { error: 'Comment too long' }),

  website: z.url({ error: 'Invalid URL' })  // ✅ Top-level schema
    .refine(
      url => url.startsWith('http://') || url.startsWith('https://'),
      { error: 'Only http/https URLs allowed' }
    )
    .optional(),
})

// Invalid data is rejected
commentSchema.parse({
  author: '',
  email: 'invalid',
  content: '',
})
// ZodError with all violations listed
```

**Zod v4 String Formats (Top-level namespace):**

```typescript
// Common string constraints (methods on z.string())
z.string().min(1, { error: 'Required' })  // Non-empty
z.string().max(255)  // Database varchar limit
z.string().length(36)  // Exact length
z.string().regex(/^[a-z0-9-]+$/)  // Custom pattern (slugs)
z.string().startsWith('https://')  // Prefix check
z.string().endsWith('.pdf')  // Suffix check
z.string().includes('@')  // Contains check
z.string().trim()  // Strips whitespace
z.string().toLowerCase()  // Normalizes case

// Top-level string formats in Zod v4 (replaces z.string().email() etc.):
z.email({ error: 'Invalid email' })  // Email format
z.url({ error: 'Invalid URL' })  // URL format
z.uuid({ error: 'Invalid UUID' })  // UUID format (RFC 4122 v1-v5)
z.cuid()  // CUID format
z.cuid2()  // CUID2 format
z.nanoid()  // Nano ID format
z.ulid()  // ULID format
z.emoji()  // Validates a single emoji character
z.base64()  // Base64 encoded string
z.base64url()  // Base64URL encoded string
z.ipv4()  // IPv4 address (replaces z.string().ip({ version: 'v4' }))
z.ipv6()  // IPv6 address
z.cidrv4()  // IPv4 CIDR range
z.cidrv6()  // IPv6 CIDR range
z.iso.date()  // ISO date (YYYY-MM-DD)
z.iso.time()  // ISO time (HH:mm:ss)
z.iso.datetime()  // ISO 8601 datetime
z.iso.duration()  // ISO 8601 duration
```

**When NOT to use this pattern:**
- When accepting arbitrary user content for display only (sanitize on output instead)
- When building a passthrough/proxy that shouldn't validate content

Reference: [Zod v4 Changelog - Deprecates .email() etc.](https://zod.dev/v4/changelog#deprecates-email-etc)

