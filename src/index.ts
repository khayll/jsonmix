import * as isPromise from 'is-promise';
import * as isObservable from 'is-observable';
import * as mergeWith from 'lodash.mergewith';
import { Observable } from 'rxjs';

export interface IObservable<T> {
  subscribe: (next: (val: T) => any, error: (err: any) => any, complete: () => any) => any;
}

export type Factory<T> = ((data: any) => T | Promise<T> | IObservable<T>);
export type Constructor<T> = new () => T;

export type Options<T> = {
  type?: Constructor<T>;
  factory?: Factory<T>;
};

export class JsonMix {
  private promise: Promise<any>;

  /**
   * @param data either a JSON string or an object
   */
  constructor(data: any, private object?: any) {
    if (!(this instanceof JsonMix)) {
      return new JsonMix(data);
    }
    if (!(data instanceof Object)) {
      data = JSON.parse(data);
    }
    this.promise = Promise.resolve(data || {});
  }

  /**
   * @param type type of factory used to create the object
   * @param path json path from root to object(s) Example: employees.*
   */
  public withObject<T>(typeOrOptions: Constructor<T> | Options<T>, path?: string): JsonMix {
    let options: Options<T>;
    if (typeof typeOrOptions === 'function') {
      options = { type: typeOrOptions };
    } else {
      options = typeOrOptions;
    }
    if (!path) {
      this.promise = this.promise.then(data => this.mix(options, data, this.object));
    } else {
      this.promise = this.promise.then(data => this.mixRecursive(options, data, path.split('.'), this.object));
    }
    return this;
  }

  public build(): Promise<any> {
    return this.promise;
  }

  private async mixRecursive<T>(options: Options<T>, parent: any, parts: Array<string>, obj: any): Promise<T> {
    const newParts = Array.from(parts);
    const currentPart = newParts.shift();
    if (!currentPart || parts.length === 0) {
      return await this.mix(options, parent, obj);
    }
    if (this.isObject(parent[currentPart]) || currentPart === '*') {
      if (!this.isArray(parent[currentPart]) && currentPart !== '*') {
        parent[currentPart] = await this.mixRecursive(
          options,
          parent[currentPart],
          newParts,
          obj ? obj[currentPart] : null
        );
        if (obj) {
          obj[currentPart] = parent[currentPart];
        }
      } else {
        if (currentPart === '*' && this.isObject(parent)) {
          for (let property in parent) {
            if (parent.hasOwnProperty(property)) {
              parent[property] = await this.mixRecursive(
                options,
                parent[property],
                newParts,
                obj ? obj[property] : null
              );
              if (obj) {
                obj[property] = parent[property];
              }
            }
          }
        } else if (this.isArray(parent[currentPart])) {
          if (newParts[0] === '*') {
            newParts.shift();
          }

          const array: any[] = parent[currentPart];
          for (let i = 0; i < array.length; ++i) {
            array[i] = await this.mixRecursive(
              options,
              parent[currentPart][i],
              newParts,
              obj && obj[currentPart] ? obj[currentPart][i] : null
            );
          }
          if (obj && !obj[currentPart]) {
            obj[currentPart] = parent[currentPart];
          }
        }
      }
    }
    return parent;
  }

  private async mix<T>(options: Options<T>, data: any, obj: any): Promise<T> {
    if (!this.isObject(data)) {
      return data;
    }
    let target: T;
    if (!obj || obj.constructor.name === 'Object') {
      if (options.type) {
        target = new options.type();
      } else if (options.factory) {
        const result = options.factory(data);
        if (isObservable(result) || result instanceof Observable) {
          target = await new Promise<T>((resolve, reject) => {
            let currentValue: T;
            (result as IObservable<T>).subscribe(
              val => (currentValue = val),
              err => reject(err),
              () => resolve(currentValue)
            );
          });
        } else if (isPromise(result)) {
          target = await (result as Promise<T>);
        } else {
          target = result as T;
        }
      } else {
        return data;
      }
    } else {
      target = obj;
    }
    mergeWith(target, data, (_obj: any, src: any) => {
      if (Array.isArray(src)) {
        return src;
      }
      return undefined;
    });
    return target;
  }

  private isArray(object: any): boolean {
    if (object instanceof Array) {
      return true;
    }
    return false;
  }

  private isObject(input: any): boolean {
    return input !== null && typeof input === 'object';
  }
}
