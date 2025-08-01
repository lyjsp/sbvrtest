import dotenv from "dotenv";
dotenv.config();

type ConfigSchema = Record<string, any>;

export class ConfigService<T extends ConfigSchema = ConfigSchema> {
  private static instance: ConfigService;
  private readonly config: T;

  constructor() {
    this.config = {
      ...process.env,
    } as T;
  }

  static getInstance<
    U extends ConfigSchema = ConfigSchema
  >(): ConfigService<U> {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService<U>();
    }
    return ConfigService.instance as ConfigService<U>;
  }

  get<K extends keyof T>(key: K): T[K] {
    return this.config[key];
  }
}
