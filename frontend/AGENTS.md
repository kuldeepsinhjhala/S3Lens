<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# S3Lens Frontend Engineering Rules

## Project Context

S3Lens is a Next.js application for securely working with Amazon S3.

Prioritize:

* Security
* Type safety
* Maintainability
* Clear separation of concerns
* Runtime correctness
* Accessibility and usability
* Performance based on measured needs

## Next.js

* Use the App Router.
* Prefer Server Components by default.
* Use Client Components only when browser APIs, client-side state, or interactivity require them.
* Before using a Next.js API, convention, or rendering pattern, read the relevant version-matched documentation from `node_modules/next/dist/docs/`.
* Do not rely on knowledge from older Next.js versions when implementing framework behavior.
* Follow the installed Next.js version's guidance for routing, rendering, caching, streaming, prefetching, and Server Components.
* Do not introduce framework-level optimizations without understanding their runtime and caching implications.

## Architecture

* Keep UI components focused on presentation and interaction.
* Keep business logic outside presentation components.
* Keep privileged and server-only functionality on the server.
* Never import server-only modules into Client Components.
* Prefer small, cohesive, composable modules.
* Avoid premature abstractions.
* Introduce abstractions only when there is a clear reuse or architectural benefit.
* Preserve existing architecture unless the task requires changing it.
* Do not modify unrelated files or behavior.

## TypeScript

* Use strict TypeScript.
* Avoid `any`. Use it only when technically necessary and document the reason.
* Prefer explicit domain types.
* Prefer discriminated unions for complex state.
* Validate external and untrusted data at system boundaries.
* Do not silence TypeScript errors with unsafe casts.
* Do not weaken compiler settings to make code compile.

## AWS / S3 Security

* Never expose AWS access keys, secret keys, session tokens, or other credentials to browser code.
* Never store AWS credentials in `NEXT_PUBLIC_*` environment variables.
* AWS operations requiring credentials must execute server-side.
* Never trust bucket names, object keys, account IDs, permissions, or other authorization-related values supplied by the client.
* Perform authorization checks server-side.
* Validate and sanitize all user-controlled S3 identifiers before using them.
* Follow least-privilege IAM principles.
* Do not log credentials, session tokens, authorization headers, or sensitive S3 data.
* Never commit secrets, credentials, or sensitive environment files.
* Do not expose internal AWS errors directly to users.
* Treat S3 object names and metadata as untrusted external data.

## Data Access

* Keep privileged data access on the server.
* Validate data received from APIs and external services before using it in application logic.
* Avoid duplicating data-fetching logic across components.
* Follow the installed Next.js documentation when making caching or revalidation decisions.
* Do not add caching without understanding its invalidation and consistency behavior.
* Do not move server-side data access into Client Components merely for convenience.

## UI

* Build accessible interfaces using semantic HTML where appropriate.
* Provide appropriate loading, empty, error, and success states for asynchronous operations.
* Keep Client Components as small as reasonably possible.
* Avoid unnecessary client-side JavaScript.
* Preserve responsive behavior.
* Do not consider a UI task complete merely because TypeScript and lint pass.
* Verify affected UI behavior in a real browser.

## Error Handling

* Do not silently swallow errors.
* Preserve useful diagnostic context in server logs.
* Handle expected application errors explicitly.
* Do not expose stack traces, credentials, internal paths, or sensitive implementation details to users.
* Provide actionable user-facing error states where appropriate.

## Testing

* Add tests for meaningful business logic.
* Test authorization and security boundaries.
* Test important failure and error paths.
* Prefer deterministic tests.
* Do not delete, weaken, or bypass tests merely to make a change pass.
* Update tests when behavior intentionally changes.

## AI Development Workflow

### Before implementing a non-trivial change

1. Inspect the existing implementation and project structure.
2. Identify existing patterns and conventions.
3. Read the relevant Next.js documentation from `node_modules/next/dist/docs/`.
4. Inspect relevant runtime behavior when necessary.
5. Identify security, data, rendering, and performance implications.
6. Make the smallest correct change that satisfies the requirement.

### After implementation

1. Run TypeScript validation.
2. Run ESLint.
3. Verify affected routes using the running Next.js development server.
4. Inspect Next.js runtime and compilation issues through MCP when applicable.
5. Use `next-dev-loop` for runtime verification.
6. Use `agent-browser` to inspect the rendered UI when the change affects UI behavior.
7. Check browser console errors and warnings.
8. Run relevant tests.
9. Review the final diff for unintended changes.
10. Do not claim the task is complete until the appropriate verification has passed.

### Runtime Verification

For UI or runtime changes, compilation is not sufficient evidence of correctness.

Verify:

* The affected route loads.
* Navigation works.
* Interactive behavior works.
* Loading and error states behave correctly.
* Browser console has no unexpected errors.
* The rendered UI matches the requested behavior.
* Existing functionality remains intact.

## Skills

### `next-dev-loop`

Use for normal development workflows involving:

* Code changes
* Runtime verification
* Browser verification
* Compilation/runtime diagnostics
* Inspect → edit → verify loops

### `next-cache-components-adoption`

Use only when explicitly asked to migrate the application to Cache Components.

Do not automatically enable or adopt Cache Components during unrelated feature work.

### `next-cache-components-optimizer`

Use only when explicitly asked to optimize a specific route or navigation flow using Cache Components and instant navigation.

Do not apply it automatically to unrelated performance work.

### `next-partial-prefetching-adoption`

Use only when explicitly asked to migrate the application to Partial Prefetching.

Do not modify prefetching behavior during unrelated feature work.

## Git

* Keep changes focused and logically scoped.
* Do not modify unrelated files.
* Do not overwrite or discard existing user changes.
* Do not remove working functionality without explicit justification.
* Never commit secrets or credentials.
* Review the final diff before considering a task complete.
* Prefer small, reviewable commits when committing changes.
* Do not rewrite Git history unless explicitly requested.

## Decision-Making Rules

When multiple technically valid approaches exist:

1. Prefer the simplest approach that satisfies the requirements.
2. Prefer current Next.js 16.3.1 documented patterns over historical patterns.
3. Prefer server-side execution for privileged operations.
4. Prefer type safety and explicit behavior over clever abstractions.
5. Prefer measured performance improvements over speculative optimization.
6. Preserve existing behavior unless changing it is part of the task.
7. Surface architectural trade-offs when they materially affect security, scalability, maintainability, or correctness.

## Skill Selection

- Use `next-dev-loop` for normal feature development and runtime verification.
- Use `next-cache-components-adoption` only when explicitly asked to migrate to Cache Components.
- Use `next-cache-components-optimizer` only when explicitly asked to optimize instant navigation for a specific route.
- Use `next-partial-prefetching-adoption` only when explicitly asked to migrate to Partial Prefetching.
- Do not apply migration or optimization skills automatically.