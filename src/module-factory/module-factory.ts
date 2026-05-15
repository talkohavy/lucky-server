export interface ModuleFactory {
  init(): Promise<void> | void;
}
