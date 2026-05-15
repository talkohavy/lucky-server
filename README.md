# Lucky Server

<p align="center">
  <img src="https://i.ibb.co/b5DKqrrq/lucky-server-min.png" width="250" alt="lucky-server logo" />
</p>

A lightweight, modular server framework for Node.js applications built on top of Express. Lucky Server provides a clean, organized way to structure your server-side applications using a module-based architecture.

<br/>

## 🚀 Features

- **Modular Architecture**: Organize your application into discrete, reusable modules
- **Async module lifecycle**: Each module exposes `init()` so setup can await I/O before routes and handlers run
- **Middleware registration**: Dedicated `registerMiddleware` step between plugins and modules
- **Plugin System**: Register plugins to extend your app's functionality (sync or async)
- **Express Integration**: Built on top of Express.js for familiar, robust HTTP handling
- **Socket.IO Support**: Built-in support for WebSocket event handlers
- **Connection Management**: Interface for managing database and external service connections
- **TypeScript First**: Fully typed interfaces for better development experience
- **Lightweight**: Minimal overhead while providing powerful organization patterns

<br/>

## 📦 Installation

```bash
npm install lucky-server
```

or with pnpm:

```bash
pnpm add lucky-server
```

<br/>

## 🏗️ Core Concepts

### `AppFactory`

The central orchestrator that manages your Express application. It handles plugin registration, middleware registration, module registration (including async `init()` on each module), and error handling setup.

**Recommended registration order:** `registerPlugins` → `registerMiddleware` → `registerModules` → path-not-found and error handlers.

### `ControllerFactory`

An interface for HTTP route controllers. Controllers handle Express.js routes and should implement a `registerRoutes()` method.

### `EventHandlerFactory`

An interface for Socket.IO event handlers. Event handlers manage WebSocket connections and real-time communication.

### `ConnectionFactory`

An interface for managing connections to external services (databases, message queues, etc.). Provides a standardized way to connect, disconnect, and ensure connection status.

### `ModuleFactory`

An interface for application modules used with `AppFactory.registerModules`. Implement `init()` to perform async startup work; `AppFactory` awaits it before the module is considered registered.

### `MiddlewareFactory`

A small interface (`use()`) for typing middleware-style building blocks. Express middleware is still registered on the app inside plugin or middleware functions as usual.

<br/>

## 🛠️ Quick Start

### 1. Create the AppFactory

```typescript
import express from 'express';
import { AppFactory } from 'lucky-server';

const app = express();

// Create the AppFactory with your Express app
// The second argument is an optional object merged onto your app (e.g. { modules: {} })
const appFactory = new AppFactory(app, { modules: {} });
```

Keep a reference to `app` in your own scope when you need the Express instance; it is not exposed as a public property on `AppFactory`.

### 2. Create a Module

Modules are classes that receive the app instance in their constructor and perform async setup in `init()`:

```typescript
// modules/UserModule.ts
import type { Application } from 'express';
import type { ModuleFactory } from 'lucky-server';

export class UserModule implements ModuleFactory {
  constructor(private app: Application) {}

  async init(): Promise<void> {
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.app.get('/api/users', (req, res) => {
      res.json({ users: [] });
    });

    this.app.post('/api/users', (req, res) => {
      // Create user logic
      res.json({ success: true });
    });
  }
}
```

### 3. Register plugins, middleware, and modules

Call registration in order: plugins first, then middleware, then modules. Each step supports async functions. Array entries that are `undefined`, `null`, or `false` are skipped (useful for conditional registration).

```typescript
import express from 'express';
import { AppFactory } from 'lucky-server';
import { UserModule } from './modules/UserModule';
import { AuthModule } from './modules/AuthModule';

async function startServer() {
  const app = express();

  const appFactory = new AppFactory(app, { modules: {} });

  await appFactory.registerPlugins([
    // e.g. cors, database connection
  ]);

  await appFactory.registerMiddleware([
    (application) => {
      application.use(express.json());
    },
  ]);

  await appFactory.registerModules([
    UserModule,
    AuthModule,
    // Add more modules as needed
  ]);

  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
}

startServer();
```

### 4. Using Plugins

Plugins are functions that receive the app and can extend its functionality:

```typescript
import express from 'express';
import cors from 'cors';
import { AppFactory } from 'lucky-server';

// Sync plugin
const corsPlugin = (app: express.Application) => {
  app.use(cors());
};

// Async plugin
const databasePlugin = async (app: express.Application) => {
  await connectToDatabase();
  console.log('Database connected');
};

async function startServer() {
  const app = express();
  const appFactory = new AppFactory(app, { modules: {} });

  await appFactory.registerPlugins([corsPlugin, databasePlugin]);
  await appFactory.registerMiddleware([(application) => application.use(express.json())]);
  await appFactory.registerModules([UserModule]);

  app.listen(3000);
}
```

### 5. Error Handling

```typescript
import { AppFactory } from 'lucky-server';

const errorHandler = (app: express.Application) => {
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  });
};

const notFoundHandler = (app: express.Application) => {
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });
};

// Register after all modules, plugins, and middleware
appFactory.registerPathNotFoundHandler(notFoundHandler);
appFactory.registerErrorHandler(errorHandler);
```

<br/>

## 📚 API Reference

### `AppFactory`

```typescript
class AppFactory {
  constructor(app: any, optimizedApp?: object);
  registerPlugins(plugins: (PluginFn | PluginAsyncFn | NullishFalsy)[]): Promise<void>;
  registerMiddleware(middlewares: (MiddlewareFn | MiddlewareAsyncFn | NullishFalsy)[]): Promise<void>;
  registerModules(modules: (ModuleConstructor | NullishFalsy)[]): Promise<void>;
  registerErrorHandler(errorHandler: PluginFn | PluginAsyncFn): void;
  registerPathNotFoundHandler(pathNotFoundHandler: PluginFn): void;
}
```

**Methods:**

- `registerPlugins(plugins)`: Runs each plugin with the app instance (awaited in order). Intended to run before `registerMiddleware`.
- `registerMiddleware(middlewares)`: Runs each middleware callback with the app (awaited in order). Intended after plugins and before `registerModules`.
- `registerModules(modules)`: Instantiates each module, awaits `module.init()`, then registers it on `app.modules[ModuleName]`.
- `registerErrorHandler(handler)`: Registers an error handling middleware.
- `registerPathNotFoundHandler(handler)`: Registers a 404 handler for unmatched routes.

### `ControllerFactory` Interface

```typescript
interface ControllerFactory {
  registerRoutes(): void;
}
```

### `EventHandlerFactory` Interface

```typescript
interface EventHandlerFactory {
  attachEventHandlers(): void;
}
```

### `ConnectionFactory` Interface

```typescript
interface ConnectionFactory {
  connect(): void;
  disconnect(): void;
  getClient(): any;
  ensureConnected(): void;
}
```

**Methods:**

- `connect()`: Establishes the connection
- `disconnect()`: Closes the connection
- `getClient()`: Returns the underlying client instance
- `ensureConnected()`: Throws an error if not connected. Best practice is to call this in the constructor of services/repositories that use the connection.

### `ModuleFactory` Interface

```typescript
interface ModuleFactory {
  init(): Promise<void>;
}
```

### `MiddlewareFactory` Interface

```typescript
interface MiddlewareFactory {
  use(): void;
}
```

### Types

```typescript
type NullishFalsy = undefined | null | false;
type ModuleConstructor = new (app: any) => any;
type PluginFn = (app: any) => void;
type PluginAsyncFn = (app: any) => Promise<void>;
type MiddlewareFn = (app: any) => void;
type MiddlewareAsyncFn = (app: any) => Promise<void>;
```

<br/>

## 🏛️ Architecture Example

```
src/
├── initServer.ts          # Server entry point
├── modules/
│   ├── UserModule.ts      # User-related functionality
│   ├── AuthModule.ts      # Authentication functionality
│   └── ChatModule.ts      # Chat/WebSocket functionality
├── controllers/
│   ├── UserController.ts
│   ├── AuthController.ts
│   └── ChatController.ts
├── connections/
│   ├── DatabaseConnection.ts
│   └── RedisConnection.ts
├── plugins/
│   ├── corsPlugin.ts
│   └── loggerPlugin.ts
├── middleware/
│   └── bodyParserMiddleware.ts
└── eventHandlers/
    └── ChatEventHandler.ts
```

<br/>

## 🔄 Migration from v1.x

If you're upgrading from v1.x, here are the key changes:

| v1.x                         | v2.x                                            |
| ---------------------------- | ----------------------------------------------- |
| `ModuleRegistry`             | `AppFactory`                                    |
| `ModuleFactory` interface    | Module classes with constructor receiving `app` |
| `attachController(app)`      | Routes registered in module constructor         |
| `attachAllControllers(app)`  | `registerModules(modules)`                      |
| `attachAllEventHandlers(io)` | Handle in module constructor or via plugins     |

### AppFactory lifecycle (current)

- **`registerModules` is async** and awaits `init()` on every module; use `await appFactory.registerModules([...])`.
- **Modules must implement `init()`** (see `ModuleFactory`); put route and handler registration there or call helpers from `init`.
- **Use `registerMiddleware`** for Express `app.use` steps that should run after plugins and before modules.
- **Conditional entries**: plugin, middleware, and module arrays may include `undefined`, `null`, or `false`; those entries are ignored.

<br/>

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

This repository includes a [Biome](https://biomejs.dev/) configuration (`biome.json`) for formatting and linting consistency.

<br/>

## 📄 License

MIT

<br/>

## 🔗 Links

- [GitHub Repository](https://github.com/talkohavy/lucky-server)
- [npm Package](https://www.npmjs.com/package/lucky-server)

---

**Happy coding with Lucky Server! 🍀**
