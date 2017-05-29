/**
 * JsonMix provides a kind of deserializaions from JSON into JavaScript Objects complete with functions.
 * JsonMix does this by taking pure data and prototype(s) of objects(s) that define the functionality.
 * The result is an easy to use tool, that can transform data into model objects without the need to have any
 * extra modifications on the data or the model objects themselves.
 */

declare var exports: any;
declare var define: any;
declare var module: any;

(function (global: any, factory: any) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory :
        typeof define === 'function' && define.amd ? define(factory) :
            global.JsonMix = factory
}(this, class JsonMix {

    private data: any;

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
        this.data = data || {};
    }

    /**
     * @param T used to create object
     * @param path json path from root to object(s) Example: employees.*
     */
    public withObject<T>(T: new () => T, path: string): JsonMix {
        if (this.emptyPath(path)) {
            this.data = this.mix(T, this.data);
        } else {
            this.data = this.mixRecursive(T, this.data, path.split('.'));
        }
        return this;
    }

    public build(): any {
        return this.data;
    }    

    private mixRecursive<T>(T: new () => T, parent: any, parts: Array<string>): any {
        const newParts = Array.from(parts);
        const currentPart = newParts.shift();

        if (parts.length === 0) {
            return this.mix(T, parent);
        }
        if (this.isObject(parent[currentPart]) || currentPart === '*') {
            if (!this.isArray(parent[currentPart]) && currentPart !== '*') {
                parent[currentPart] = this.mixRecursive(T, parent[currentPart], newParts);
            } else {
                if (currentPart === '*' && this.isObject(parent)) {
                    for (let property in parent) {
                        if (parent.hasOwnProperty(property)) {
                            parent[property] = this.mixRecursive(T, parent[property], newParts);
                        }
                    }
                } else if (this.isArray(parent[currentPart])) {
                    if (newParts[0] === '*') {
                        newParts.shift();
                    }
                    parent[currentPart].forEach((value: any, index: number) => {
                        parent[currentPart][index] = this.mixRecursive(T, parent[currentPart][index], newParts);
                    });
                }
            }
        }
        return parent;

    }

    private mix<T>(T: new () => T, data: any): any {
        if (!this.isObject(data)) {
            return data;
        }
        let target: T = new T();
        for (let property in data) {
            if (data.hasOwnProperty(property)) {
                (<any>target)[property] = data[property];
            }
        }
        return target;
    }

    private emptyPath(path: string): boolean {
        if (path === undefined || path === '') {
            return true;
        }
        return false;
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
    ));