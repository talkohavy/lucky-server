# Lucky Server

<p align="center">
  <img src="https://i.ibb.co/b5DKqrrq/lucky-server-min.png" width="250" alt="lucky-server logo" />
</p>

A lightweight, modular server framework for Node.js applications built on top of Express. Lucky Server provides a clean, organized way to structure your server-side applications using a module-based architecture.

<br/>

## 🚀 Features

- **Modular Architecture**: Organize your application into discrete, reusable modules
- **Plugin System**: Register plugins to extend your app's functionality
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

The central orchestrator that manages your Express application. It handles module registration, plugin registration, and error handling setup.

### `ControllerFactory`

An interface for HTTP route controllers. Controllers handle Express.js routes and should implement a `registerRoutes()` method.

### `EventHandlerFactory`

An interface for Socket.IO event handlers. Event handlers manage WebSocket connections and real-time communication.

### `ConnectionFactory`

An interface for managing connections to external services (databases, message queues, etc.). Provides a standardized way to connect, disconnect, and ensure connection status.

<br/>

## 🛠️ Quick Start

### 1. Create the AppFactory

```typescript
import express from 'express';
import { AppFactory } from 'lucky-server';

const app = express();

// Create the AppFactory with your Express app
// The second argument is an optional object to extend your app
const appFactory = new AppFactory(app, { modules: {} });
```

### 2. Create a Module

Modules are classes that receive the app instance in their constructor:

```typescript
// modules/UserModule.ts
import type { Application } from 'express';

export class UserModule {
  constructor(private app: Application) {
    // Initialize your module
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

### 3. Register Modules

```typescript
import express from 'express';
import { AppFactory } from 'lucky-server';
import { UserModule } from './modules/UserModule';
import { AuthModule } from './modules/AuthModule';

async function startServer() {
  const app = express();

  const appFactory = new AppFactory(app, { modules: {} });

  // Register all your modules
  appFactory.registerModules([
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

  // Register plugins (supports both sync and async)
  await appFactory.registerPlugins([
    corsPlugin,
    databasePlugin,
  ]);

  // Register modules after plugins
  appFactory.registerModules([UserModule]);

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

// Register after all modules and plugins
appFactory.registerPathNotFoundHandler(notFoundHandler);
appFactory.registerErrorHandler(errorHandler);
```

<br/>

## 📚 API Reference

### `AppFactory`

```typescript
class AppFactory {
  constructor(app: any, optimizedApp?: object)
  registerModules(modules: ModuleConstructor[]): void
  registerPlugins(plugins: (PluginFn | PluginAsyncFn)[]): Promise<void>
  registerErrorHandler(errorHandler: PluginFn | PluginAsyncFn): void
  registerPathNotFoundHandler(pathNotFoundHandler: PluginFn): void
}
```

**Properties:**

- `app`: The Express application instance (readonly)

**Methods:**

- `registerModules(modules)`: Instantiates and registers all provided module classes. Each module receives the app in its constructor and is stored in `app.modules[ModuleName]`.
- `registerPlugins(plugins)`: Executes all provided plugin functions (supports async). Plugins receive the app instance.
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

### Types

```typescript
type ModuleConstructor = new (app: any) => any;
type PluginFn = (app: any) => void;
type PluginAsyncFn = (app: any) => Promise<void>;
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

<br/>

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

<br/>

## 📄 License

MIT

<br/>

## 🔗 Links

- [GitHub Repository](https://github.com/talkohavy/lucky-server)
- [npm Package](https://www.npmjs.com/package/lucky-server)

---

**Happy coding with Lucky Server! 🍀**
