/**
 * Employee class for the tests 
 */
var Employee = function() {
}

Employee.prototype.getName = function() {
	return this.firstName + ' ' + this.lastName;
}
