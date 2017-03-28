(function () {

    /**
     * JsonMix provides a kind of deserializaions from JSON into JavaScript Objects complete with functions.
     * JsonMix does this by taking pure data and prototype(s) of objects(s) that define the functionality.
     * The result is an easy to use tool, that can transform data into model objects without the need to have any
     * extra modifications on the data or the model objects themselves.
     */
    class JsonMix {

        private data: any;

        /**
         * 
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
         * use constructor to create object(s) at a given json path
         * @param constructor used to create object
         * @param path json path from root to object(s) Example: employees.*
         */
        public withObject(constructor: () => any, path: string): JsonMix {
            if (this.emptyPath(path)) {
                this.data = this.mix(constructor, this.data);
            } else {
                this.data = this.mixRecursive(constructor, this.data, path.split('.'));
            }
            return this;
        }

        private mixRecursive(constructor: () => any, parent: any, parts: Array<string>): any {
            var newParts = Array.from(parts);
            var currentPart = newParts.shift();
            if (parts.length === 0) {
                return this.mix(constructor, parent);
            }
            if (this.isObject(parent[currentPart]) || currentPart === '*') {
                if (this.notArray(parent[currentPart]) && currentPart !== '*') {
                    parent[currentPart] = this.mixRecursive(constructor, parent[currentPart], newParts);
                } else {
                    if (currentPart === '*') {
                        for (var property in parent) {
                            if (parent.hasOwnProperty(property)) {
                                parent[property] = this.mixRecursive(constructor, parent[property], newParts);
                            }
                        }
                    } else {
                        if (newParts[0] === '*') {
                            newParts.shift();
                        }
                        parent[currentPart].forEach( (value: any, index: number) => {
                            parent[currentPart][index] = this.mixRecursive(constructor, parent[currentPart][index], newParts);
                        });
                    }
                }
            }
            return parent;

        }

        private mix(constructor: () => any, data: any): any {
            var target = constructor();
            for (var property in data) {
                if (data.hasOwnProperty(property)) {
                    target[property] = data[property];
                }
            }
            return target;
        }

        /**
         * Returns the mixed object
         */
        public build(): any {
            return this.data;
        }

        private emptyPath(path: string): boolean {
            if (path === undefined || path === '') {
                return true;
            }
            return false;
        }

        private notArray(object: any): boolean {
            if (object instanceof Array) {
                return false;
            }
            return true;
        }

        private isObject(input: any): boolean {
            if (input instanceof Object) {
                return true;
            }
            return false;
        }

    }

    (<any>window).JsonMix = (<any>window).JsonMix || JsonMix;

})();