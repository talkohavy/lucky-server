---
"lucky-server": major
---

**Breaking:** `AppFactory.registerModules` is now async and awaits `init()` on each module—modules must implement `init()` (see `ModuleFactory`). The Express `app` passed into `AppFactory` is no longer exposed as a public property.

**Added:** `registerMiddleware` (run after plugins, before modules), `MiddlewareFn` / `MiddlewareAsyncFn`, `NullishFalsy` so plugin/middleware/module arrays can skip `undefined`, `null`, or `false`, and exported `ModuleFactory` / `MiddlewareFactory` interfaces.

**Repo:** Biome config (`biome.json`) for formatting and linting.
