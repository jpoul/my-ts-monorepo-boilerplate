import { IFoo } from '@my-ts-monorepo-boilerplate/sample';
export interface IBoo {
  age: number;
}

export class Boo implements IBoo, IFoo {
  public name: string = 'My name';
  public age: number = 18;
}
