JsonMix [![Build Status](https://travis-ci.org/khayll/jsmix.svg?branch=master)](https://travis-ci.org/khayll/jsmix)
========
A simple tool to easily map data onto model objects. In other words this tool helps you with deserializing data into full-fledged model objects with methods. My aim was to have a simple to use tool, that you can use to mix methods with data after you got your JSON back from a REST API.

This is a WIP project, but it's already usable. There's no minified version yet, that should be almost the next thing I'll do.  

## How to use
Here's how it works in real life. First of course you need to include JSMix.

    <script type="text/javascript" src="jsmix.js"></script>

Use or create your model on the client side:

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

## Parameter explained

A slightly more complex example would look like:

	var result = JSMix(data)
		.withObject(Employee.prototype, "employees")
		.withObject(Pet.prototype, "employees.pet")
		.build();
		
	//now result has every model class mixed in
	console.log(result.epmloyees[1].getName()); 
 
 So the parameter to the JSMix(data) call, data, could be a JSON string, or an object.
 The build() just returns the object with all classes mixed.
 The withObject(prototype, path) call is the one to define class mappings.
 Here "path" can be any chain of nested objects separated with a dot. For example in this case "epmloyees.pet".
 JSMix will find out if an object is an array, and will recursively apply the remaining part of the path to every item in it.
 You can also use "*" in the path, and this will apply the remaining path to every item in the object (even if it's not an array).
 
     //this recursively applies the same prototype 3 levels deep
     JSMix(data).withObject(Comparable.prototype, "*.*.*").build();
     
 You can use playground.html as a tutorial, or just to play around with jsmix.
  
 