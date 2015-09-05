# jsmix
A simple tool to easily map data onto model objects. In other words this tool helps you with deserializing data into full-fledged model objects with methods. My aim was to have a simple to use tool, that you can use to mix methods with data after you got your JSON back from a REST API.

## How to use
Here's how it works in real life. You still need to define your model on the client side:

	var Employee = function() {
	}
	
	Employee.prototype.getName = function() {
		return this.firstName + ' ' + this.lastName;
	}

Then if you have a REST service "getAnEmployee", that returns a JSON like this:

	{
		"epmloyee": {
			"firstName": "John",
			"lastName": "Doe",
			"salary": 100000,
			"age": 33	
		}
	}

you could say in AngularJS (for example):

	http.get("/getAnEmployee").then( function(result) {
		console.log(
			JSMix(result).withObject(Employee.prototype, "employee").build().getName()
		);
	});

Which will then log "John Doe" for you.


