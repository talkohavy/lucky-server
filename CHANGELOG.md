# lucky-server

## 2.0.1

### Patch Changes

- Updated readme with last major changes features.

## 2.0.0

### Major Changes

- Created AppFactory - the main class of the package.

## 1.0.3

### Patch Changes

- Added a ConnectionFactory interface. Connections should implement this interface.

## 1.0.2

### Patch Changes

- BUGFIX: exports was defined wrongfully in the package.json. Fixed now.

## 1.0.1

### Patch Changes

- Added a logo to the package.

## 1.0.0

### Major Changes

- First Major Release! 🎉 ✅ ✨
  
- `ModuleRegistry`: Use this in your `initServer.ts` (or however you named your server's entrypoint file) and add all the modules you've created (or at least the ones you want instantiated).
- `ModuleFactory`: Your Modules should implement this interface
- `ControllerFactory`: Controllers should implement this interface
- `EventHandlerFactory`: EventHandlers of SocketIO should implement this interface

Once you've registered all your desired modules, call `moduleRegistry.attachAllControllers()` to have their controllers attached.

### Patch Changes

- added a comprehensive README.md file

## 0.0.1

### Patch Changes

- first
