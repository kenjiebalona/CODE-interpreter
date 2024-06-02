import OObject, {
  NullableOObject,
  OBoolean,
  OString,
  OInteger,
  ONull,
} from './object';
import Logger from './logger';
import FileLoader from './file-loader';
import process from 'process';

export default class Environment {
  store: Map<string, NullableOObject> = new Map<string, NullableOObject>();
  outer: Environment | null = null;
  Logger: Logger = new Logger();

  FileLoader: FileLoader | undefined = new FileLoader();
  private _files: { [index: string]: string } = {};

  constructor(logger: Logger, fileLoader?: FileLoader) {
    this.Logger = logger;
    this.FileLoader = fileLoader;
  }

  GlobalEnv(): Environment {
    if (this.outer) {
      if (this.outer.outer) return this.outer.GlobalEnv();
      return this.outer;
    }
    return this;
  }

  Get(name: string): NullableOObject {
    let obj = this.store.get(name);
    if (!obj && this.outer !== null) {
      obj = this.outer.Get(name);
    }
    return obj ? obj : null;
  }

  Set(name: string, val: NullableOObject): NullableOObject {
    this.store.set(name, val);
    return val;
  }
}

export function NewEnvironment(): Environment {
  let logger = new Logger();
  let fileLoader = new FileLoader();
  let env = new Environment(logger, fileLoader);
  return env;
}

export function NewEnclosedEnvironment(outer: Environment): Environment {
  let env = new Environment(outer.Logger);
  env.outer = outer;
  return env;
}

export function NewNodeEnvironment(): Environment {
  let logger = new Logger();
  let fileLoader = new FileLoader();
  let env = new Environment(logger, fileLoader);

  env.Set('__arch', new OString(process.arch));
  env.Set('__environment', new OString('node'));
  env.Set('__node', new OBoolean(true));
  env.Set('__pid', new OInteger(process.pid));
  env.Set('__platform', new OString(process.platform));
  env.Set('__version', new OString(process.version));

  return env;
}
