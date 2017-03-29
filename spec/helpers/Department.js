
var Department = function(){}

Department.prototype.getTime = function() {
	return "Time at " + this.location + " is " + new Date().toUTCString();
}
