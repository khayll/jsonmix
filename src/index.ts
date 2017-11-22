export type Factory<T> = ((data: any) => T | Promise<T>);
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
  constructor(data: any) {
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
      this.promise = this.promise.then(data => this.mix(options, data));
    } else {
      this.promise = this.promise.then(data => this.mixRecursive(options, data, path.split('.')));
    }
    return this;
  }

  public build(): Promise<any> {
    return this.promise;
  }

  private async mixRecursive<T>(options: Options<T>, parent: any, parts: Array<string>): Promise<T> {
    const newParts = Array.from(parts);
    const currentPart = newParts.shift();
    if (!currentPart || parts.length === 0) {
      return await this.mix(options, parent);
    }
    if (this.isObject(parent[currentPart]) || currentPart === '*') {
      if (!this.isArray(parent[currentPart]) && currentPart !== '*') {
        parent[currentPart] = await this.mixRecursive(options, parent[currentPart], newParts);
      } else {
        if (currentPart === '*' && this.isObject(parent)) {
          for (let property in parent) {
            if (parent.hasOwnProperty(property)) {
              parent[property] = await this.mixRecursive(options, parent[property], newParts);
            }
          }
        } else if (this.isArray(parent[currentPart])) {
          if (newParts[0] === '*') {
            newParts.shift();
          }
          const array: any[] = parent[currentPart];
          for (let i = 0; i < array.length; ++i) {
            array[i] = await this.mixRecursive(options, parent[currentPart][i], newParts);
          }
        }
      }
    }
    return parent;
  }

  private async mix<T>(options: Options<T>, data: any): Promise<T> {
    if (!this.isObject(data)) {
      return data;
    }
    let target: T;
    if (options.type) {
      target = new options.type();
    } else if (options.factory) {
      target = await options.factory(data);
    } else {
      return data;
    }
    for (const property in data) {
      if (data.hasOwnProperty(property)) {
        (target as any)[property] = data[property];
      }
    }
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
