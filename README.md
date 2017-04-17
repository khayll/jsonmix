JsonMix [![Build Status](https://travis-ci.org/khayll/jsonmix.svg?branch=master)](https://travis-ci.org/khayll/jsonmix)
========
JsonMix provides a kind of deserialisation from JSON into JavaScript Objects complete with functions.

## How to use
Start with
```
<script type="text/javascript" src="jsonmix.min.js"></script>
```
or
```
let JsonMix = require('jsonmix');
```

Use your existing model objects, without any modification, for example:
```
var Employee = function() {}

Employee.prototype.getName = function() {
	return this.firstName + ' ' + this.lastName;
}
```

And use your REST services, that go with your model: 
```
let json = {
	"firstName": "John",
	"lastName": "Doe",
	"salary": 100000,
	"age": 33	
}
```

Finally use JsonMix to deserialize the JSON into model objects like this:
```
let mixed = JsonMix(json) // json contains the pure data
	.withObject(Employee) // Employee is your object constructor, and employee is the path within the json
	.build(); // get the json mixed with the object
});
```

With this simple tool you now have your JSON data deserialized into an object constructed from you model.

```
console.log(mixed.employee.getName());
```

## Multiple objects in a JSON
It's not uncommon to have multiple objects in a single JSON file, for example if you have an array of Employees in a JSON:

```
let json = {
	employees: [
		{
			"firstName": "John",
			"lastName": "Doe",
			"salary": 100000,
			"age": 33			
		},
		{
			"firstName": "John",
			"lastName": "Malkowich",
			"salary": 50000,
			"age": 52
		},
	]
}
```

To apply Epmloyee to the entire array:

```
let mixed = JsonMix(json)
	.withObject(Employee, "employees")
	.build();
});
```

## Further examples

A slightly more complex example would look like:
```
var result = JsonMix(data) // start with the data
	.withObject(Employee, "employees") // mix Employee on a path
	.withObject(Pet, "employees.pet") // mix Pet on a different path
	.build(); // and get the result
	
//now you can use the model functions 
console.log(result.epmloyees[1].getName()); 
```

So the parameter to the JsonMix(data) call, data, could be a JSON string, or an object.
The build() just returns the object with all classes mixed.
The withObject(prototype, path) call is the one to define class mappings.
Here "path" can be any chain of nested objects separated with a dot. For example in this case "epmloyees.pet".
JsonMix will find out if an object is an array, and will recursively apply the remaining part of the path to every item in it.
You can also use "*" in the path, and this will apply the remaining path to every item in the object (even if it's not an array).
```
//this recursively applies the same prototype 3 levels deep
JsonMix(data).withObject(Comparable, "*.*.*").build();
```

You can use playground.html as a tutorial, or just to play around with JsonMix.
  
 