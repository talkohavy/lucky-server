# Lucky Server

<p align="center">
  <img src="https://i.ibb.co/b5DKqrrq/lucky-server-min.png" width="250" alt="lvlup logo" />
</p>

A lightweight, modular server framework for Node.js applications built on top of Express. Lucky Server provides a clean, organized way to structure your server-side applications using a module-based architecture.

## 🚀 Features

- **Modular Architecture**: Organize your application into discrete, reusable modules
- **Automatic Registration**: Seamlessly register and attach controllers and event handlers
- **Express Integration**: Built on top of Express.js for familiar, robust HTTP handling
- **Socket.IO Support**: Built-in support for WebSocket event handlers
- **TypeScript First**: Fully typed interfaces for better development experience
- **Lightweight**: Minimal overhead while providing powerful organization patterns

## 📦 Installation

```bash
npm install lucky-server
```

or with pnpm:

```bash
pnpm add lucky-server
```

## 🏗️ Core Concepts

### `ModuleRegistry`

The central orchestrator that manages all your application modules. Use this in your server's entry point (e.g., `initServer.ts`) to register and coordinate all your modules.

### `ModuleFactory`

An interface that your application modules should implement. Modules are the building blocks of your application, each containing related controllers and event handlers.

### `ControllerFactory`

An interface for HTTP route controllers. Controllers handle Express.js routes and middleware.

### `EventHandlerFactory`

An interface for Socket.IO event handlers. Event handlers manage WebSocket connections and real-time communication.

## 🛠️ Quick Start

### 1. Create a Module

```typescript
import { ModuleFactory, ControllerFactory } from 'lucky-server';
import type { Application } from 'express';

class UserController implements ControllerFactory {
  attachRoutes(): void {
    // Define your routes here
  }
}

export class UserModule implements ModuleFactory {
  private userController = new UserController();

  attachController(app: Application): void {
    this.userController.attachRoutes();
    // Attach your routes to Express app
    app.use('/api/users', /* your routes */);
  }

  attachEventHandlers?(io: any): void {
    // Optional: Define Socket.IO event handlers
  }

  static getInstance(): UserModule {
    return new UserModule();
  }
}
```

### 2. Register Modules in Your Server

```typescript
import express from 'express';
import { ModuleRegistry } from 'lucky-server';
import { UserModule } from './modules/UserModule';
import { AuthModule } from './modules/AuthModule';

async function startServer(){
  const app = express();

  // Create module registry with all your modules
  const moduleRegistry = new ModuleRegistry([
    UserModule,
    AuthModule,
    // Add more modules as needed
  ]);

  // Attach all controllers to Express app
  moduleRegistry.attachAllControllers(app);

  // If using Socket.IO, attach all event handlers
  const io = /* your Socket.IO instance */;
  moduleRegistry.attachAllEventHandlers(io);

  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
}
```

## 📚 API Reference

### ModuleRegistry

```typescript
class ModuleRegistry {
  constructor(modules: StaticModule[])
  attachAllControllers(app: Application): void
  attachAllEventHandlers(io: any): void
}
```

**Methods:**

- `attachAllControllers(app)`: Attaches all registered module controllers to the Express application
- `attachAllEventHandlers(io)`: Attaches all registered module event handlers to the Socket.IO instance

### ModuleFactory Interface

```typescript
interface ModuleFactory {
  attachController(app: Application): void;
  attachEventHandlers?(io: any): void; // Optional
}
```

### ControllerFactory Interface

```typescript
interface ControllerFactory {
  attachRoutes(): void;
}
```

### EventHandlerFactory Interface

```typescript
interface EventHandlerFactory {
  attachEventHandlers(): void;
}
```

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
└── eventHandlers/
    └── ChatEventHandler.ts
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT

## 🔗 Links

- [GitHub Repository](https://github.com/talkohavy/lucky-server)
- [npm Package](https://www.npmjs.com/package/lucky-server)

---

**Happy coding with Lucky Server! 🍀**
