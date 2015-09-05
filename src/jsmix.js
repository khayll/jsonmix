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
	
	JSMix.prototype.build = function() {
		return this.data;
	}
	
    window.JSMix = window.JSMix || JSMix;

})();