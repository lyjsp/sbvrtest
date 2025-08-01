export {};

declare global {
  namespace Express {
    export interface Request {
      user?: User;
    }
    interface User {
      [_: string]: any;
    }
  }
}
