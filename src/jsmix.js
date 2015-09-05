(function(){
	/**
     * JSMix Class
     * @param {Object|string} obj or JSON string data
     */
    function JSMix(data) {
        if(!(this instanceof JSMix)) {
            return new JSMix(data);
        }
		if ( !(data instanceof Object) ) {
			data = JSON.parse(data);
		}
        this.data = data || {};
    }
	
    /**
     * Method to map object prototype with a path in the data object
     * @param {prototype} prototype of the object to be mapped onto the data
     * @param {string} path to where the data objects are. Example: employees/*
     */
	JSMix.prototype.withObject = function(prototype, path) {
        var target = Object.create(prototype);
        for (var property in this.data[path]) {
            if (this.data[path].hasOwnProperty(property)) {
                target[property] = this.data[path][property];
            }
        }        
        this.data[path] = target;
		return this;
	}
	
    /**
     * Returns the mixed object
     */
	JSMix.prototype.build = function() {
		return this.data;
	}
	
    window.JSMix = window.JSMix || JSMix;

})();